"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCreateShift } from "@/features/shifts/shift.queries.js";
import toast, { Toaster } from "react-hot-toast";
import { useCompanyId } from "@/providers/CompanyProvider";

export default function CreateShift() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { companyId } = useCompanyId();

    const companyIdFromUrl = searchParams.get("companyId");

    const finalCompanyId =
        companyId ??
        (companyIdFromUrl && companyIdFromUrl !== "null"
            ? Number(companyIdFromUrl)
            : null);


    const { mutateAsync: createShift, isPending: isLoading } =
        useCreateShift();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        startTime: "09:00",
        endTime: "17:00",
        effectiveFrom: new Date().toISOString().split("T")[0],
        effectiveUntil: "",
    });

    const [durationHours, setDurationHours] = useState(8);
    const [errors, setErrors] = useState({});

    // ---------- Time Helpers ----------

    const formatTo12Hour = (timeStr) => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        const period = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        return `${String(displayHours).padStart(2, "0")}:${String(
            minutes
        ).padStart(2, "0")} ${period}`;
    };

    const convertTo24Hour = (hours, minutes, period) => {
        let h = parseInt(hours);
        if (period === "PM" && h !== 12) h += 12;
        if (period === "AM" && h === 12) h = 0;
        return `${String(h).padStart(2, "0")}:${String(minutes).padStart(
            2,
            "0"
        )}`;
    };

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

    const getHoursArray = () =>
        Array.from({ length: 12 }, (_, i) =>
            String(i + 1).padStart(2, "0")
        );

    const getMinutesArray = () =>
        Array.from({ length: 60 }, (_, i) =>
            String(i).padStart(2, "0")
        );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleTimeSelectChange = (field, type, value) => {
        const currentTime = formData[field];
        const [currentHours, currentMinutes] =
            currentTime.split(":").map(Number);

        const currentPeriod = currentHours >= 12 ? "PM" : "AM";
        const currentDisplayHours = currentHours % 12 || 12;

        let newHours = currentDisplayHours;
        let newMinutes = currentMinutes;
        let newPeriod = currentPeriod;

        if (type === "hours") newHours = parseInt(value);
        if (type === "minutes") newMinutes = parseInt(value);
        if (type === "period") newPeriod = value;

        const time24Hour = convertTo24Hour(
            newHours,
            newMinutes,
            newPeriod
        );

        const parseTime = (timeStr) => {
            const [h, m] = timeStr.split(":").map(Number);
            return h * 3600 + m * 60;
        };

        const startTime =
            field === "startTime" ? time24Hour : formData.startTime;
        const endTime =
            field === "endTime" ? time24Hour : formData.endTime;

        let startSec = parseTime(startTime);
        let endSec = parseTime(endTime);

        if (endSec <= startSec) endSec += 24 * 3600;

        const duration = (endSec - startSec) / 3600;

        setFormData((prev) => ({ ...prev, [field]: time24Hour }));
        setDurationHours(parseFloat(duration.toFixed(2)));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim())
            newErrors.name = "Shift name is required";

        if (!formData.startTime)
            newErrors.startTime = "Start time is required";

        if (!formData.endTime)
            newErrors.endTime = "End time is required";

        if (formData.startTime === formData.endTime)
            newErrors.endTime =
                "End time must be different from start time";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fix the errors in the form");
            return;
        }

        if (!finalCompanyId) {
            toast.error("Company ID missing");
            return;
        }

        try {
            await createShift({
                name: formData.name.trim(),
                description: formData.description.trim(),
                startTime: formData.startTime,
                endTime: formData.endTime,
                effectiveFrom: formData.effectiveFrom,
                effectiveUntil: formData.effectiveUntil || null,
                company_id: finalCompanyId,
            });

            toast.success("Shift created successfully 🎉");
            router.push(`/shifts?companyId=${finalCompanyId}`);
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Failed to create shift"
            );
        }
    };

    const startTimeParts = parseTime12Hour(formData.startTime);
    const endTimeParts = parseTime12Hour(formData.endTime);


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
                            Create New Shift
                        </h1>
                        <p className="mt-2 text-slate-500 dark:text-slate-400">
                            Add a new shift to your company
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
                                    className={`w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${errors.name ? "border-rose-500" : "border-slate-300 dark:border-slate-600"
                                        }`}
                                />

                                {errors.name && (
                                    <p className="text-rose-500 text-sm mt-2">{errors.name}</p>
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
                                            {[startTimeParts.hours, startTimeParts.minutes, startTimeParts.period].map((_, index) => null)}
                                            <select
                                                value={startTimeParts.hours}
                                                onChange={(e) =>
                                                    handleTimeSelectChange("startTime", "hours", e.target.value)
                                                }
                                                className="flex-1 px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            >
                                                {getHoursArray(true).map((hour) => (
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
                                                {getHoursArray(false).map((hour) => (
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
                                    </div>
                                </div>

                                {/* Duration Card */}
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
                                    disabled={isLoading}
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? "Creating..." : "Create Shift"}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>

        </>
    );
}