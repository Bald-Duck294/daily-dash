/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
    useGetAllShiftAssignments,
    useGetShiftAssignmentsByShift,
    useDeleteShiftAssignment,
    useToggleShiftAssignmentStatus
} from "@/features/shifts/assignment/shiftAssign.queries.js";
import { useCompanyId } from "@/providers/CompanyProvider";
import { format } from "date-fns";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

export default function ShiftAssignmentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { companyId } = useCompanyId(); // ✅ FIXED
    const [deletingId, setDeletingId] = useState(null);
    const shiftId = searchParams.get("shiftId");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);


    // 🔥 Use correct query depending on mode
    const {
        data,
        isLoading
    } = shiftId
            ? useGetShiftAssignmentsByShift(shiftId, companyId)
            : useGetAllShiftAssignments(companyId);

    const { mutateAsync: deleteAssignment } = useDeleteShiftAssignment();


    const { mutate: toggleStatus, isPending: isToggling } =
        useToggleShiftAssignmentStatus();


    const assignments = data?.data || [];


    const handleDeleteClick = async (id) => {
        if (deletingId === id) return;

        try {
            setDeletingId(id);
            await deleteAssignment(id);  // directly await
        } catch (error) {
            console.error(error);
        } finally {
            setDeletingId(null);
        }
    };


    const confirmDelete = async () => {
        if (!selectedAssignment) return;

        try {
            setDeletingId(selectedAssignment.id);
            await deleteAssignment(selectedAssignment.id);
        } catch (error) {
            console.error(error);
        } finally {
            setDeletingId(null);
            setDeleteModalOpen(false);
            setSelectedAssignment(null);
        }
    };

    const confirmToggleStatus = () => {
        if (!selectedAssignment) return;

        toggleStatus(selectedAssignment.id, {
            onSuccess: () => {
                setStatusModalOpen(false);
                setSelectedAssignment(null);
            }
        });
    };


    const formatTo12Hour = (timeStr) => {
        if (!timeStr) return "";

        const [hours, minutes] = timeStr.split(":").map(Number);

        const period = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;

        return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
    };




    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading shift assignments...
            </div>
        );
    }



    return (

        <>
            <div className="min-h-screen bg-gradient-to-br 
      from-slate-50 to-slate-100 
      dark:from-slate-950 dark:to-slate-900 
      py-10 px-4 sm:px-6 lg:px-8">

                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">

                        {/* Title Section */}
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white leading-tight">
                                Shift Assignments
                            </h1>

                            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
                                Cleaner ↔ Shift mapping registry
                            </p>
                        </div>

                        {/* Button */}
                        <button
                            onClick={() => router.push("/shifts/assignment/add")}
                            className="w-full sm:w-auto px-5 py-3 sm:py-2.5 
      rounded-xl 
      bg-gradient-to-r from-indigo-600 to-purple-600 
      text-white font-medium shadow-lg 
      hover:scale-105 transition"
                        >
                            + Assign Shift
                        </button>

                    </div>


                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                        <StatCard
                            label="Total Assignments"
                            value={assignments.length}
                        />
                        <StatCard
                            label="Assigned"
                            value={assignments.filter(a => a.status === "active").length}
                            color="emerald"
                        />
                        <StatCard
                            label="UnAssigned"
                            value={assignments.filter(a => a.status !== "active").length}
                            color="amber"
                        />
                    </div>

                    {/* Table */}
                    <div className="bg-white dark:bg-slate-800 
          border border-slate-200 dark:border-slate-700 
          rounded-2xl overflow-hidden shadow-md">

                        <div className="hidden md:block">
                            <table className="min-w-full">
                                <thead className="bg-slate-100 dark:bg-slate-700/40 
                text-slate-500 dark:text-slate-400 text-xs uppercase">
                                    <tr>
                                        <th className="px-6 py-4 text-left">User</th>
                                        <th className="px-6 py-4 text-left">Shift</th>
                                        <th className="px-6 py-4 text-left">Assigned On</th>
                                        <th className="px-6 py-4 text-left">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {assignments.map((item) => (
                                        <tr key={item.id}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">

                                            <td className="px-6 py-5">
                                                <div className="font-semibold text-slate-800 dark:text-white">
                                                    {item.user?.name}
                                                </div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                                    {item.user?.email}
                                                </div>
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="text-slate-800 dark:text-white font-medium">
                                                    {item.shift?.name}
                                                </div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                                    {formatTo12Hour(item.shift?.startTime)} –{" "}
                                                    {formatTo12Hour(item.shift?.endTime)}

                                                </div>
                                            </td>

                                            <td className="px-6 py-5 text-slate-600 dark:text-slate-300">
                                                {format(new Date(item.startDate), "dd MMM yyyy")}
                                            </td>

                                            <td className="px-6 py-5">
                                                <button
                                                    onClick={() => {
                                                        setSelectedAssignment(item);
                                                        setStatusModalOpen(true);
                                                    }}

                                                    disabled={isToggling}
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold transition
      ${item.status === "active"
                                                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400"
                                                            : "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-400"
                                                        }
    `}
                                                >
                                                    {item.status === "active" ? "Assigned" : "Unassigned"}
                                                </button>
                                            </td>


                                            <td className="px-6 py-5 text-right">
                                                <button
                                                    onClick={() => {
                                                        setSelectedAssignment(item);
                                                        setDeleteModalOpen(true);
                                                    }}

                                                    disabled={deletingId === item.id}
                                                    className={`p-2 rounded-lg text-rose-600 dark:text-rose-400 
    hover:bg-rose-100 dark:hover:bg-rose-500/10 
    transition
    ${deletingId === item.id ? "opacity-70 cursor-not-allowed" : ""}
  `}
                                                >
                                                    {deletingId === item.id ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={18} />
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {assignments.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="text-center py-10 text-slate-500">
                                                No assignments found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </div>


                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4 p-4">
                        {assignments.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white dark:bg-slate-800 
        border border-slate-200 dark:border-slate-700 
        rounded-xl p-4 shadow-sm space-y-3"
                            >
                                {/* User */}
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-white">
                                        {item.user?.name}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {item.user?.email}
                                    </p>
                                </div>

                                {/* Shift */}
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-white">
                                        {item.shift?.name}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {formatTo12Hour(item.shift?.startTime)} –{" "}
                                        {formatTo12Hour(item.shift?.endTime)}


                                    </p>

                                </div>

                                {/* Assigned Date */}
                                <div className="text-sm text-slate-600 dark:text-slate-300">
                                    Assigned on: {format(new Date(item.startDate), "dd MMM yyyy")}
                                </div>

                                {/* Actions */}
                                <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">

                                    <button
                                        onClick={() => {
                                            setSelectedAssignment(item);
                                            setStatusModalOpen(true);
                                        }}

                                        disabled={isToggling}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold transition
            ${item.status === "active"
                                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                                                : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                                            }
          `}
                                    >
                                        {item.status === "active" ? "Assigned" : "Unassigned"}
                                    </button>

                                    <button
                                        onClick={() => {
                                            setSelectedAssignment(item);
                                            setDeleteModalOpen(true);
                                        }}

                                        disabled={deletingId === item.id}
                                        className={`p-2 rounded-lg text-rose-600 dark:text-rose-400 
    hover:bg-rose-100 dark:hover:bg-rose-500/10 
    transition
    ${deletingId === item.id ? "opacity-70 cursor-not-allowed" : ""}
  `}
                                    >
                                        {deletingId === item.id ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <Trash2 size={18} />
                                        )}
                                    </button>


                                </div>
                            </div>
                        ))}

                        {assignments.length === 0 && (
                            <div className="text-center py-10 text-slate-500">
                                No assignments found.
                            </div>
                        )}
                    </div>
                </div>
            </div>


            {deleteModalOpen && selectedAssignment && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">

                    <div className="w-full sm:max-w-md bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-xl p-6">

                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                            Delete Assignment
                        </h2>

                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                            Are you sure you want to delete assignment for{" "}
                            <span className="font-semibold">
                                {selectedAssignment.user?.name}
                            </span>?
                            This action cannot be undone.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={confirmDelete}
                                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {statusModalOpen && selectedAssignment && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">

                    <div className="w-full sm:max-w-md bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-xl p-6">

                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                            {selectedAssignment.status === "active"
                                ? "Unassign Shift"
                                : "Assign Shift"}
                        </h2>

                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                            Are you sure you want to{" "}
                            <span className="font-semibold">
                                {selectedAssignment.status === "active"
                                    ? "unassign"
                                    : "assign"}
                            </span>{" "}
                            this shift for{" "}
                            <span className="font-semibold">
                                {selectedAssignment.user?.name}
                            </span>?
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                            <button
                                onClick={() => setStatusModalOpen(false)}
                                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={confirmToggleStatus}
                                className={`w-full sm:w-auto px-4 py-2 rounded-lg text-white ${selectedAssignment.status === "active"
                                    ? "bg-amber-600 hover:bg-amber-700"
                                    : "bg-emerald-600 hover:bg-emerald-700"
                                    }`}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </>

    );
}

function StatCard({ label, value, color }) {
    const colorMap = {
        emerald: "text-emerald-600 dark:text-emerald-400",
        amber: "text-amber-600 dark:text-amber-400"
    };

    return (
        <div className="bg-white dark:bg-slate-800 
      border border-slate-200 dark:border-slate-700 
      rounded-2xl p-6 shadow-sm">

            <p className="text-slate-500 dark:text-slate-400 text-sm">
                {label}
            </p>

            <p className={`text-3xl font-bold mt-2 ${color ? colorMap[color] : "text-slate-800 dark:text-white"
                }`}>
                {value}
            </p>
        </div>
    );
}
