"use client";

import { useRouter, useParams } from "next/navigation";
import {
    useGetShiftById,
    useDeleteShift,
} from "@/features/shifts/shift.queries.js";
import Loader from "@/components/ui/Loader";
import toast from "react-hot-toast";
import { useState } from "react";
import { useCompanyId } from "@/providers/CompanyProvider";

export default function ShiftDetail() {
    const router = useRouter();
    const { id: shiftId } = useParams();
    const { companyId } = useCompanyId();

    // ✅ TanStack Query
    const {
        data: shift,
        isLoading,
        isError,
    } = useGetShiftById({
        id: shiftId,
        company_id: companyId,
        include_unavailable: true,
    });


    // Extract actual shift


    console.log("shiftData:", shift);


    // ✅ TanStack Mutation
    const {
        mutateAsync: deleteShift,
        isPending: isDeleting,
    } = useDeleteShift();

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const handleDelete = async () => {
        try {
            await deleteShift(shiftId);
            toast.success("Shift deleted successfully");
            setDeleteModalOpen(false);
            router.push(`/shifts?companyId=${companyId}`);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to delete shift");
        }
    };

    if (!companyId || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader />
                    <p className="text-sm text-muted-foreground">
                        Loading shift details...
                    </p>
                </div>
            </div>

        );
    }

    if (isError || !shift) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        Error loading shift
                    </div>
                </div>
            </div>
        );
    }

    const formatTime = (timeStr) => {
        if (!timeStr) return "";
        const [h, m] = timeStr.split(":");
        const date = new Date();
        date.setHours(h);
        date.setMinutes(m);
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "No limit";
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 dark:from-slate-950 dark:to-slate-900 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
                    <div>
                        <button
                            onClick={() => router.back()}
                            className="text-primary hover:opacity-80 mb-3 font-medium transition"
                        >
                            ← Back
                        </button>

                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                            {shift.name}
                        </h1>

                        <div className="mt-3">
                            <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${shift.status
                                    ? "bg-emerald-500/15 text-emerald-500"
                                    : "bg-rose-500/15 text-rose-500"
                                    }`}
                            >
                                {shift.status ? "Active Shift" : "Inactive Shift"}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() =>
                                router.push(`/shifts/${shiftId}/edit?companyId=${companyId}`)
                            }
                            className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-medium shadow-md hover:scale-105 transition"
                        >
                            Edit
                        </button>

                        <button
                            onClick={() => setDeleteModalOpen(true)}
                            className="px-5 py-2 rounded-xl bg-destructive text-destructive-foreground font-medium shadow-md hover:scale-105 transition"
                        >
                            Delete
                        </button>
                    </div>
                </div>

                {/* Grid Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Basic Info */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                        <h2 className="text-lg font-semibold text-foreground mb-6">
                            Basic Information
                        </h2>

                        <div className="space-y-5">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Shift Name
                                </p>
                                <p className="text-lg font-medium text-foreground mt-1">
                                    {shift.name}
                                </p>
                            </div>

                            {shift.description && (
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                        Description
                                    </p>
                                    <p className="text-foreground mt-1 whitespace-pre-wrap">
                                        {shift.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timing */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                        <h2 className="text-lg font-semibold text-foreground mb-6">
                            Shift Timing
                        </h2>

                        <div className="space-y-5">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Start Time
                                </p>
                                <p className="text-xl font-semibold text-foreground mt-1">
                                    {formatTime(shift.startTime)}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    End Time
                                </p>
                                <p className="text-xl font-semibold text-foreground mt-1">
                                    {formatTime(shift.endTime)}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Duration
                                </p>
                                <p className="text-xl font-semibold text-primary mt-1">
                                    {shift.durationHours} hours
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Validity */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                        <h2 className="text-lg font-semibold text-foreground mb-6">
                            Validity Period
                        </h2>

                        <div className="space-y-5">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Effective From
                                </p>
                                <p className="text-foreground mt-1">
                                    {formatDate(shift.effectiveFrom)}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Effective Until
                                </p>
                                <p className="text-foreground mt-1">
                                    {formatDate(shift.effectiveUntil)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Company */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                        <h2 className="text-lg font-semibold text-foreground mb-6">
                            Company Details
                        </h2>

                        <div className="space-y-5">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Company Name
                                </p>
                                <p className="text-foreground mt-1">
                                    {shift.company?.name}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Assigned Employees
                                </p>
                                <p className="text-foreground mt-1">
                                    {shift.assignments?.length || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Metadata */}
                <div className="mt-10 bg-card border border-border rounded-2xl p-6 text-sm text-muted-foreground shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <p className="text-xs uppercase tracking-wide">Created</p>
                            <p className="text-foreground mt-1">
                                {new Date(shift.createdAt).toLocaleString()}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wide">Last Updated</p>
                            <p className="text-foreground mt-1">
                                {new Date(shift.updatedAt).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-8">
                        <h2 className="text-xl font-bold text-foreground mb-4">
                            Delete Shift
                        </h2>

                        <p className="text-muted-foreground mb-8">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-foreground">
                                {shift.name}
                            </span>
                            ? This action cannot be undone.
                        </p>

                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                className="px-5 py-2 rounded-xl border border-border text-foreground hover:bg-muted transition"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-5 py-2 rounded-xl bg-destructive text-destructive-foreground hover:scale-105 transition disabled:opacity-50"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
