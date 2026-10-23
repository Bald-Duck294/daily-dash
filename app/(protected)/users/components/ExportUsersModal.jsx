"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import {
  FileSpreadsheet,
  X,
  Download,
  Users,
  CheckCircle2,
  Shield,
  Loader2,
} from "lucide-react";
import { UsersApi } from "@/features/users/users.api";

export default function ExportUsersModal({
  isOpen,
  onClose,
  companyId,
  roles = [],
  roleCounts = {},
  totalCount = 0,
}) {
  const [selectedRole, setSelectedRole] = useState("all");
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    if (!companyId) {
      toast.error("Company ID is missing.");
      return;
    }

    setIsExporting(true);
    const toastId = toast.loading("Preparing users export...");

    try {
      // Fetch users for export with a high limit to get all matching users
      const response = await UsersApi.getAllclientUsers({
        companyId,
        roleId: selectedRole !== "all" ? selectedRole : null,
        page: 1,
        limit: 10000,
      });

      const usersList = response?.data || [];

      if (!usersList || usersList.length === 0) {
        toast.error("No users found to export for the selected role.", {
          id: toastId,
        });
        setIsExporting(false);
        return;
      }

      // Format data according to user request:
      // Name, Phone Number, Role, Assigned Locations
      // "don't include id just provide proper serial numbers"
      const excelRows = usersList.map((user, index) => {
        // Collect assigned locations
        const rawAssignments =
          user.assignments || user.cleaner_assignments_as_cleaner || [];

        const assignedLocations =
          rawAssignments.length > 0
            ? rawAssignments
                .map(
                  (a) =>
                    a.name ||
                    a.locations?.name ||
                    (a.location_id ? `Location #${a.location_id}` : null),
                )
                .filter(Boolean)
                .join(", ")
            : "No Locations Assigned";

        return {
          "S.No.": index + 1,
          "Name": user.name || "N/A",
          "Phone Number": user.phone || "N/A",
          "Email": user.email || "N/A",
          "Role": user.role?.name || "N/A",
          "Assigned Locations": assignedLocations,
        };
      });

      // Create sheet and workbook
      const worksheet = XLSX.utils.json_to_sheet(excelRows);

      // Auto-fit column widths
      worksheet["!cols"] = [
        { wch: 8 },  // S.No.
        { wch: 28 }, // Name
        { wch: 18 }, // Phone Number
        { wch: 30 }, // Email
        { wch: 22 }, // Role
        { wch: 45 }, // Assigned Locations
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

      // File name formatting
      const roleName =
        selectedRole === "all"
          ? "All_Roles"
          : (
              roles.find((r) => String(r.id) === String(selectedRole))?.name ||
              "Role"
            ).replace(/\s+/g, "_");

      const dateStr = new Date().toISOString().split("T")[0];
      const fileName = `Users_Export_${roleName}_${dateStr}.xlsx`;

      // Trigger download
      XLSX.writeFile(workbook, fileName);

      toast.success(
        `Successfully exported ${excelRows.length} users to Excel!`,
        { id: toastId },
      );
      onClose();
    } catch (error) {
      console.error("Export error:", error);
      toast.error(error.message || "Failed to export users.", {
        id: toastId,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getRoleCount = (roleId) => {
    return roleCounts[roleId] ?? 0;
  };

  const selectedCount =
    selectedRole === "all"
      ? totalCount
      : getRoleCount(selectedRole);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Export Users
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  Excel (.xlsx)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Select a specific role or export all registered staff
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Role Filter Options */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Select Role Filter
            </label>

            <div className="space-y-2">
              {/* All Users Option */}
              <label
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedRole === "all"
                    ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="exportRole"
                    value="all"
                    checked={selectedRole === "all"}
                    onChange={() => setSelectedRole("all")}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-slate-500 dark:text-slate-400" />
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      All Roles (All Users)
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {totalCount} users
                </span>
              </label>

              {/* Individual Roles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {roles.map((role) => {
                  const roleIdStr = String(role.id);
                  const isChecked = selectedRole === roleIdStr;
                  const count = getRoleCount(roleIdStr);

                  return (
                    <label
                      key={role.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 shadow-xs"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="radio"
                          name="exportRole"
                          value={roleIdStr}
                          checked={isChecked}
                          onChange={() => setSelectedRole(roleIdStr)}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                          {role.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0 ml-1">
                        {count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Export Fields Information Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>Included Fields in Excel:</span>
            </div>
            <p className="leading-relaxed pl-5 text-[11px]">
              • <strong>S.No.</strong> (Proper sequential serial number, IDs excluded)
              <br />
              • <strong>Name</strong>
              <br />
              • <strong>Phone Number</strong>
              <br />
              • <strong>Email</strong>
              <br />
              • <strong>Role</strong>
              <br />
              • <strong>Assigned Locations</strong> (Comma-separated)
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-75"
          >
            {isExporting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Download Excel ({selectedCount})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
