/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    useGetShiftById,
    useUpdateShift,
} from "@/features/shifts/shift.queries.js";
import Loader from "@/components/ui/Loader";
import toast, { Toaster } from "react-hot-toast";
import { useCompanyId } from "@/providers/CompanyProvider";

export default function EditShift() {
    const router = useRouter();
    const { id: shiftId } = useParams();
    const { companyId } = useCompanyId();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        startTime: "09:00",
        endTime: "17:00",
    });

    const [durationHours, setDurationHours] = useState(0);
    const [errors, setErrors] = useState({});

    // -----------------------------
    // Fetch Shift
    // -----------------------------
    const {
        data: shiftData,
        isLoading: isFetching,
        isError,
        error,
    } = useGetShiftById({
        id: shiftId,
        company_id: companyId,
        include_unavailable: true,
    });


    // -----------------------------
    // Mutation
    // -----------------------------
    const {
        mutateAsync: updateShift,
        isPending: isUpdating,
    } = useUpdateShift();

    // -----------------------------
    // Populate form
    // -----------------------------
    useEffect(() => {
        if (shiftData) {
            const shift = shiftData;

            const startTime = shift.startTime || "09:00";
            const endTime = shift.endTime || "17:00";

            setFormData({
                name: shift.name || "",
                description: shift.description || "",
                startTime,
                endTime,
            });

            setDurationHours(shift.durationHours || 0);
        }
    }, [shiftData]);


    console.log("shiftData:", shiftData);

    // -----------------------------
    // Duration Logic
    // -----------------------------
    const calculateDuration = (startTime, endTime) => {
        const parseTime = (timeStr) => {
            const [hours, minutes] = timeStr.split(":").map(Number);
            return hours * 3600 + minutes * 60;
        };

        let startSec = parseTime(startTime);
        let endSec = parseTime(endTime);

        if (endSec <= startSec) {
            endSec += 24 * 3600;
        }

        const duration = (endSec - startSec) / 3600;
        setDurationHours(parseFloat(duration.toFixed(2)));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    // ✅ THIS WAS MISSING
    const handleTimeSelectChange = (field, part, value) => {
        const parseTime12Hour = (timeStr) => {
            const [hours, minutes] = timeStr.split(":").map(Number);
            const period = hours >= 12 ? "PM" : "AM";
            const displayHours = hours % 12 || 12;

            return {
                hours: String(displayHours).padStart(2, "0"),
                minutes: String(minutes).padStart(2, "0"),
                period,
            };
        };

        const current = parseTime12Hour(formData[field]);

        let hours = current.hours;
        let minutes = current.minutes;
        let period = current.period;

        if (part === "hours") hours = value;
        if (part === "minutes") minutes = value;
        if (part === "period") period = value;

        let hours24 = parseInt(hours, 10);

        if (period === "PM" && hours24 !== 12) hours24 += 12;
        if (period === "AM" && hours24 === 12) hours24 = 0;

        const newTime = `${String(hours24).padStart(2, "0")}:${minutes}`;

        setFormData((prev) => ({
            ...prev,
            [field]: newTime,
        }));

        if (field === "startTime") {
            calculateDuration(newTime, formData.endTime);
        } else {
            calculateDuration(formData.startTime, newTime);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Shift name is required";
        }
        if (!formData.startTime) {
            newErrors.startTime = "Start time is required";
        }
        if (!formData.endTime) {
            newErrors.endTime = "End time is required";
        }
        if (formData.startTime === formData.endTime) {
            newErrors.endTime =
                "End time must be different from start time";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fix the errors in the form");
            return;
        }

        try {
            await updateShift({
                id: shiftId,
                data: {
                    name: formData.name.trim(),
                    description: formData.description.trim(),
                    startTime: formData.startTime,
                    endTime: formData.endTime,
                    company_id: companyId,
                },
            });

            toast.success("Shift updated successfully 🎉");
            router.push(`/shifts?companyId=${companyId}`);
        } catch (err) {
            toast.error(
                err?.response?.data?.message ||
                "Failed to update shift"
            );
        }
    };

    if (!companyId) return <Loader />;
    if (isFetching) return <Loader />;

    if (isError) {
        return (
            <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        <p className="font-bold">Error loading shift</p>
                        <p>
                            {error?.response?.data?.message ||
                                "Could not fetch shift details"}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ✅ Show error if companyId is not available
    if (!companyId) {
        return (
            <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
                        <p>Loading company information...</p>
                    </div>
                </div>
            </div>
        );
    }

    const parseTime12Hour = (timeStr) => {
        if (!timeStr) return { hours: "09", minutes: "00", period: "AM" };

        const [hours, minutes] = timeStr.split(":").map(Number);
        const period = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;

        return {
            hours: String(displayHours).padStart(2, "0"),
            minutes: String(minutes).padStart(2, "0"),
            period,
        };
    };

    const startTimeParts = parseTime12Hour(formData.startTime);
    const endTimeParts = parseTime12Hour(formData.endTime);


    const getHoursArray = () => {
        return Array.from({ length: 12 }, (_, i) =>
            String(i + 1).padStart(2, "0")
        );
    };
    const getMinutesArray = () => {
        return Array.from({ length: 60 }, (_, i) =>
            String(i).padStart(2, "0")
        );
    };

    const formatTo12Hour = (timeStr) => {
        if (!timeStr) return "";

        const [hours, minutes] = timeStr.split(":").map(Number);
        const period = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;

        return `${String(displayHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
    };



    return (
        <>
            <Toaster />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">

                    {/* Header */}
                    <div className="mb-10">
                        <button
                            onClick={() => router.back()}
                            className="text-indigo-600 hover:text-indigo-800 font-medium transition mb-4"
                        >
                            ← Back
                        </button>

                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white tracking-tight">
                            Edit Shift
                        </h1>

                        <p className="mt-2 text-slate-500 dark:text-slate-400">
                            Update shift details
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-8">

                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Shift Name */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Shift Name *
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Morning Shift"
                                    className={`w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white
              focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition
              ${errors.name ? "border-rose-500" : "border-slate-300 dark:border-slate-600"}
            `}
                                />

                                {errors.name && (
                                    <p className="text-rose-500 text-sm mt-2">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Timing Section */}
                            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">
                                    Shift Timing
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* Start Time */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                            Start Time *
                                        </label>

                                        <div className="flex gap-2">
                                            <select
                                                value={startTimeParts.hours}
                                                onChange={(e) =>
                                                    handleTimeSelectChange("startTime", "hours", e.target.value)
                                                }
                                                className="flex-1 px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            >
                                                {getHoursArray().map((hour) => (
                                                    <option key={hour}>{hour}</option>
                                                ))}
                                            </select>

                                            <select
                                                value={startTimeParts.minutes}
                                                onChange={(e) =>
                                                    handleTimeSelectChange("startTime", "minutes", e.target.value)
                                                }
                                                className="flex-1 px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            >
                                                {getMinutesArray().map((min) => (
                                                    <option key={min}>{min}</option>
                                                ))}
                                            </select>

                                            <select
                                                value={startTimeParts.period}
                                                onChange={(e) =>
                                                    handleTimeSelectChange("startTime", "period", e.target.value)
                                                }
                                                className="flex-1 px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            >
                                                <option>AM</option>
                                                <option>PM</option>
                                            </select>
                                        </div>

                                        {errors.startTime && (
                                            <p className="text-rose-500 text-sm mt-2">
                                                {errors.startTime}
                                            </p>
                                        )}
                                    </div>

                                    {/* End Time */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                            End Time *
                                        </label>

                                        <div className="flex gap-2">
                                            <select
                                                value={endTimeParts.hours}
                                                onChange={(e) =>
                                                    handleTimeSelectChange("endTime", "hours", e.target.value)
                                                }
                                                className="flex-1 px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            >
                                                {getHoursArray().map((hour) => (
                                                    <option key={hour}>{hour}</option>
                                                ))}
                                            </select>

                                            <select
                                                value={endTimeParts.minutes}
                                                onChange={(e) =>
                                                    handleTimeSelectChange("endTime", "minutes", e.target.value)
                                                }
                                                className="flex-1 px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            >
                                                {getMinutesArray().map((min) => (
                                                    <option key={min}>{min}</option>
                                                ))}
                                            </select>

                                            <select
                                                value={endTimeParts.period}
                                                onChange={(e) =>
                                                    handleTimeSelectChange("endTime", "period", e.target.value)
                                                }
                                                className="flex-1 px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            >
                                                <option>AM</option>
                                                <option>PM</option>
                                            </select>
                                        </div>

                                        {errors.endTime && (
                                            <p className="text-rose-500 text-sm mt-2">
                                                {errors.endTime}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Duration Display */}
                                <div className="mt-8 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-xl p-5">
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                                        <span className="font-semibold text-slate-800 dark:text-white">
                                            Shift Timing:
                                        </span>{" "}
                                        {formatTo12Hour(formData.startTime)} –{" "}
                                        {formatTo12Hour(formData.endTime)}
                                    </p>

                                    <p className="text-sm">
                                        Duration:{" "}
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400 text-base">
                                            {durationHours} hours
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUpdating ? "Updating..." : "Update Shift"}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}