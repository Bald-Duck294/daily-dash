/* eslint-disable react-hooks/preserve-manual-memoization */
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    useGetAllShifts,
    useDeleteShift,
    useToggleShiftStatus
} from "@/features/shifts/shift.queries.js";
import Loader from "@/components/ui/Loader";
import toast, { Toaster } from "react-hot-toast";
import { useCompanyId } from "@/providers/CompanyProvider";
import {
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Trash
} from "lucide-react";

export default function ShiftList() {
    const router = useRouter();
    const { companyId } = useCompanyId();

    const [searchTerm, setSearchTerm] = useState("");
    const [includeUnavailable, setIncludeUnavailable] = useState(true);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [toggleStatusModalOpen, setToggleStatusModalOpen] = useState(false);
    const [selectedShift, setSelectedShift] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // ✅ TanStack Query
    const { data, isLoading, isError } = useGetAllShifts({
        company_id: companyId,
        include_unavailable: includeUnavailable,
    });

    const deleteMutation = useDeleteShift();
    const toggleMutation = useToggleShiftStatus();

    const isDeleting = deleteMutation.isPending;
    const isToggling = toggleMutation.isPending;

    // Filter
    const filteredShifts = useMemo(() => {
        if (!data?.shifts) return [];

        return data.shifts.filter((shift) =>
            shift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shift.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [data?.shifts, searchTerm]);

    // Pagination
    const totalPages = Math.ceil(filteredShifts.length / itemsPerPage);

    const paginatedShifts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredShifts.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredShifts, currentPage]);

    // Toggle Status
    const handleToggleStatus = async () => {
        try {
            await toggleMutation.mutateAsync(selectedShift.id);

            const action = selectedShift.status ? "deactivated" : "activated";

            toast.success(
                `Shift "${selectedShift.name}" has been ${action} successfully! 🎉`
            );

            setToggleStatusModalOpen(false);
            setSelectedShift(null);
        } catch (error) {
            toast.error("Failed to toggle shift status");
        }
    };

    // Delete
    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(selectedShift.id);

            toast.success(
                `Shift "${selectedShift.name}" has been deleted successfully! 🗑️`
            );

            setDeleteModalOpen(false);
            setSelectedShift(null);
        } catch (error) {
            toast.error("Failed to delete shift");
        }
    };

    const formatTo12Hour = (timeStr) => {
        if (!timeStr) return "";
        const [hours, minutes] = timeStr.split(":").map(Number);
        const period = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
    };

    if (isError) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        Error loading shifts
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-right" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-800 dark:text-white">
                                Shifts
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">
                                Manage company work schedules
                            </p>
                        </div>

                        <button
                            onClick={() =>
                                router.push(`/shifts/add?companyId=${companyId}`)
                            }
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                        >
                            + Create Shift
                        </button>
                    </div>

                    {/* Loading */}
                    {isLoading ? (
                        <div className="flex justify-center py-16">
                            <Loader />
                        </div>
                    ) : filteredShifts.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-12 text-center">
                            <p className="text-slate-500 dark:text-slate-400">
                                No shifts found
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-md overflow-hidden">

                            {/* Desktop Table */}
                            <div className="hidden md:block">
                                <table className="min-w-full">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                                        <tr className="text-left text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            <th className="px-6 py-4">Shift</th>
                                            <th className="px-6 py-4">Time</th>
                                            <th className="px-6 py-4">Duration</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {paginatedShifts.map((shift) => (
                                            <tr
                                                key={shift.id}
                                                onClick={() =>
                                                    router.push(`/shifts/${shift.id}?companyId=${companyId}`)
                                                }
                                                className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/40 transition"
                                            >

                                                <td className="px-6 py-5 font-medium text-slate-800 dark:text-white">
                                                    {shift.name}
                                                </td>

                                                <td className="px-6 py-5 text-slate-600 dark:text-slate-300">
                                                    {formatTo12Hour(shift.startTime)} –{" "}
                                                    {formatTo12Hour(shift.endTime)}
                                                </td>

                                                <td className="px-6 py-5 text-indigo-600 dark:text-indigo-400 font-semibold">
                                                    {shift.durationHours}h
                                                </td>

                                                <td className="px-6 py-5">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedShift(shift);
                                                            setToggleStatusModalOpen(true);
                                                        }}
                                                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${shift.status
                                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 hover:bg-emerald-200"
                                                            : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 hover:bg-rose-200"
                                                            }`}
                                                    >
                                                        {shift.status ? "Activated" : "Inactive"}
                                                    </button>


                                                </td>

                                                <td className="px-6 py-5 flex gap-3">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.push(`/shifts/${shift.id}/edit?companyId=${companyId}`);
                                                        }}
                                                        className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:scale-110 transition"
                                                    >
                                                        <Edit size={16} />
                                                    </button>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedShift(shift);
                                                            setDeleteModalOpen(true);
                                                        }}
                                                        className="p-2 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:scale-110 transition"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-700">
                                {paginatedShifts.map((shift) => (
                                    <div
                                        key={shift.id}
                                        onClick={() =>
                                            router.push(`/shifts/${shift.id}?companyId=${companyId}`)
                                        }
                                        className="p-5 space-y-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/40 transition"
                                    >

                                        <div className="flex justify-between items-start">
                                            <h3 className="font-semibold text-slate-800 dark:text-white">
                                                {shift.name}
                                            </h3>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedShift(shift);
                                                    setToggleStatusModalOpen(true);
                                                }}
                                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${shift.status
                                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 hover:bg-emerald-200"
                                                    : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 hover:bg-rose-200"
                                                    }`}
                                            >
                                                {shift.status ? "Activated" : "Inactive"}
                                            </button>
                                        </div>

                                        <div className="text-sm text-slate-600 dark:text-slate-300">
                                            {formatTo12Hour(shift.startTime)} –{" "}
                                            {formatTo12Hour(shift.endTime)}
                                        </div>

                                        <div className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                            {shift.durationHours} hours
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/shifts/${shift.id}/edit?companyId=${companyId}`);
                                                }}
                                                className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:scale-110 transition"
                                            >
                                                <Edit size={14} />
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedShift(shift);
                                                    setDeleteModalOpen(true);
                                                }}
                                                className="p-2 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:scale-110 transition"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {deleteModalOpen && selectedShift && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">

                    <div className="w-full sm:max-w-md bg-white dark:bg-slate-800 rounded-2xl sm:rounded-2xl rounded-t-2xl shadow-xl p-6 animate-slideUp">

                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                                <Trash size={20} />
                            </div>
                            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                                Delete Shift
                            </h2>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold">
                                &apos;{selectedShift.name}&apos;
                            </span>
                            ? This will{" "}
                            <b className="text-rose-700">permanently delete</b> the shift and all
                            related shift assignments. This action cannot be undone.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition disabled:opacity-50"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {toggleStatusModalOpen && selectedShift && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">

                    <div className="w-full sm:max-w-md bg-white dark:bg-slate-800 rounded-2xl sm:rounded-2xl rounded-t-2xl shadow-xl p-6">

                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 rounded-full ${selectedShift.status
                                    ? "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                                    : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                                }`}>
                                {selectedShift.status ? (
                                    <XCircle size={20} />
                                ) : (
                                    <CheckCircle size={20} />
                                )}
                            </div>

                            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                                {selectedShift.status ? "Deactivate Shift" : "Activate Shift"}
                            </h2>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                            Are you sure you want to{" "}
                            <span className="font-semibold">
                                {selectedShift.status ? "deactivate" : "activate"}
                            </span>{" "}
                            &apos;{selectedShift.name}&apos;?
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                            <button
                                onClick={() => setToggleStatusModalOpen(false)}
                                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleToggleStatus}
                                disabled={isToggling}
                                className={`w-full sm:w-auto px-4 py-2 rounded-lg text-white transition ${selectedShift.status
                                        ? "bg-rose-600 hover:bg-rose-700"
                                        : "bg-emerald-600 hover:bg-emerald-700"
                                    } disabled:opacity-50`}
                            >
                                {isToggling
                                    ? "Processing..."
                                    : selectedShift.status
                                        ? "Deactivate"
                                        : "Activate"}
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </>
    );
}
