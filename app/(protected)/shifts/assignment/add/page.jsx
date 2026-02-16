"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCompanyId } from "@/providers/CompanyProvider";
import { useGetAllShifts } from "@/features/shifts/shift.queries";
import {
    useGetShiftAssignableUsers,
    useCreateShiftAssignment,
} from "@/features/shifts/assignment/shiftAssign.queries";

export default function CreateShiftAssignmentPage() {
    const router = useRouter();
    const { companyId } = useCompanyId();

    const [assignmentMode, setAssignmentMode] = useState("multi");
    const [selectedRoleFilter, setSelectedRoleFilter] = useState("all");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [shiftId, setShiftId] = useState("");
    const [errors, setErrors] = useState({});

    const { data: shiftsData, isLoading: shiftsLoading } =
        useGetAllShifts({ company_id: companyId });


    const { data: usersData, isLoading: usersLoading } =
        useGetShiftAssignableUsers(companyId);

    const { mutateAsync: createAssignment, isPending } =
        useCreateShiftAssignment();

    const shifts = shiftsData?.shifts || [];
    const users = usersData?.data || [];

    // ✅ Filter users by role
    const filteredUsers = users.filter((u) => {
        if (selectedRoleFilter === "all") return true;
        return u.role?.name?.toLowerCase() === selectedRoleFilter;
    });

    // ✅ User selection logic
    const handleUserSelect = (user) => {
        if (assignmentMode === "single") {
            setSelectedUsers([user]); // only one allowed
            return;
        }

        // multi mode
        setSelectedUsers((prev) =>
            prev.some((u) => u.id === user.id)
                ? prev.filter((u) => u.id !== user.id)
                : [...prev, user]
        );
    };

    // ✅ Validation
    const validate = () => {
        const newErrors = {};

        if (!shiftId) newErrors.shiftId = "Please select a shift";
        if (selectedUsers.length === 0)
            newErrors.users = "Select at least one user";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!shiftId) {
            setErrors({ shiftId: "Please select a shift" });
            return;
        }

        if (selectedUsers.length === 0) {
            setErrors({ users: "Select at least one user" });
            return;
        }

        try {
            await createAssignment({
                shiftId: Number(shiftId),
                user_ids: selectedUsers.map((u) => Number(u.id)),
                company_id: companyId,
                startDate: new Date().toISOString(),
                role_id: selectedUsers[0]?.role?.id,
            });

            router.push(`/shifts/assignment`);
        } catch (err) {
            console.error("Assignment error:", err.response?.data || err);
            console.log("FULL ERROR:", err);
            console.log("RESPONSE:", err.response);
            console.log("DATA:", err.response?.data);
            console.log("STATUS:", err.response?.status);
        }
    };


    if (!companyId) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br 
      from-slate-50 to-slate-100 
      dark:from-slate-950 dark:to-slate-900 
      py-10 px-4">

            <div className="max-w-3xl mx-auto">

                {/* HEADER */}
                <div className="mb-10">
                    <button
                        onClick={() => router.back()}
                        className="text-indigo-600 dark:text-indigo-400 
              hover:opacity-80 mb-4 font-medium transition"
                    >
                        ← Back
                    </button>

                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                        Create Shift Assignments
                    </h1>

                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Assign cleaner / supervisor to shift
                    </p>
                </div>

                {/* FORM CARD */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-white dark:bg-slate-800 
            border border-slate-200 dark:border-slate-700 
            rounded-2xl shadow-xl p-8 space-y-8"
                >

                    {/* MODE TOGGLE */}
                    <div className="flex items-center justify-between 
            bg-slate-100 dark:bg-slate-900 
            border border-slate-200 dark:border-slate-700 
            rounded-xl p-4">

                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800 dark:text-white">
                                {assignmentMode === "multi" ? "Multiple Mode" : "Single Mode"}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {assignmentMode === "multi"
                                    ? "Bulk mapping active"
                                    : "One-to-one mapping active"}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setAssignmentMode(
                                    assignmentMode === "multi" ? "single" : "multi"
                                )
                            }
                            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 ${assignmentMode === "multi"
                                ? "bg-indigo-600"
                                : "bg-slate-300 dark:bg-slate-600"
                                }`}
                        >
                            <span
                                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${assignmentMode === "multi"
                                    ? "translate-x-9"
                                    : "translate-x-1"
                                    }`}
                            />
                        </button>
                    </div>

                    {/* SHIFT SELECT */}
                    <div>
                        <label className="block text-sm font-semibold 
              text-slate-700 dark:text-slate-300 mb-2">
                            Select Shift *
                        </label>

                        <select
                            disabled={shiftsLoading}
                            value={shiftId}
                            onChange={(e) => setShiftId(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border 
                bg-white dark:bg-slate-900 
                text-slate-800 dark:text-white 
                border-slate-300 dark:border-slate-600 
                focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        >
                            <option value="">
                                {shiftsLoading ? "Loading shifts..." : "Choose Shift"}
                            </option>

                            {shifts.map((shift) => (
                                <option key={shift.id} value={shift.id}>
                                    {shift.name} — {shift.startTime} - {shift.endTime}
                                </option>
                            ))}
                        </select>

                        {errors.shiftId && (
                            <p className="text-rose-600 text-sm mt-2">
                                {errors.shiftId}
                            </p>
                        )}
                    </div>

                    {/* ROLE FILTER */}
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide mb-3 text-slate-600 dark:text-slate-400">
                            Filter by Role
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {["all", "supervisor", "cleaner"].map((role) => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => setSelectedRoleFilter(role)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition
                    ${selectedRoleFilter === role
                                            ? "bg-indigo-600 text-white"
                                            : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                                        }`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* USERS */}
                    <div>
                        <label className="block text-sm font-semibold 
              text-slate-700 dark:text-slate-300 mb-2">
                            {assignmentMode === "multi"
                                ? `Select Users (${selectedUsers.length} selected)`
                                : "Select User"}
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">

                            {usersLoading ? (
                                <p>Loading users...</p>
                            ) : (
                                filteredUsers.map((user) => {
                                    const selected = selectedUsers.some(
                                        (u) => u.id === user.id
                                    );

                                    return (
                                        <div
                                            key={user.id}
                                            onClick={() => handleUserSelect(user)}
                                            className={`p-3 rounded-xl border cursor-pointer transition
                        ${selected
                                                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                                                    : "border-slate-300 dark:border-slate-600"
                                                }`}
                                        >
                                            <p className="font-semibold text-slate-800 dark:text-white">
                                                {user.name}
                                            </p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {user.email}
                                            </p>
                                            <span className="text-xs font-medium text-indigo-600">
                                                {user.role?.name}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {errors.users && (
                            <p className="text-rose-600 text-sm mt-2">
                                {errors.users}
                            </p>
                        )}
                    </div>

                    {/* SUBMIT */}
                    <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full py-3 rounded-xl 
                bg-gradient-to-r from-indigo-600 to-purple-600 
                text-white font-medium shadow-md 
                hover:scale-105 transition flex items-center justify-center gap-2"
                        >
                            {isPending && (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            )}

                            {assignmentMode === "multi"
                                ? `Assign to ${selectedUsers.length} Users`
                                : "Assign Shift"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
