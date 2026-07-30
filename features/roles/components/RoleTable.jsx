import Link from "next/link";
import { Eye, Edit2, Trash2, Mail, Phone, User, Building2 } from "lucide-react";

export default function RoleTable({
  users,
  role,
  permissions,
  onDelete,
  currentPage = 1,
  pageSize = 10,
}) {
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          {/* Header */}
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-5 py-3.5 w-14">#</th>
              <th className="px-5 py-3.5">User Details</th>
              <th className="px-5 py-3.5">Contact Info</th>
              {role !== "superadmin" && <th className="px-5 py-3.5">Company</th>}
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
            {users.map((user, index) => {
              const serialNum = (currentPage - 1) * pageSize + index + 1;
              const initials = getInitials(user.name);

              return (
                <tr
                  key={user.id}
                  className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  {/* Serial Number */}
                  <td className="px-5 py-4 font-mono font-bold text-slate-400">
                    #{serialNum}
                  </td>

                  {/* User Name & Avatar */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs shrink-0">
                        {initials}
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 dark:text-white text-xs group-hover:text-blue-600 transition-colors">
                          {user.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          ID: #{user.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Email & Phone */}
                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-xs">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px] font-semibold">
                          {user.email || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono">{user.phone || "—"}</span>
                      </div>
                    </div>
                  </td>

                  {/* Company Badge */}
                  {role !== "superadmin" && (
                    <td className="px-5 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{user.companies?.name || user.company?.name || "All Companies"}</span>
                      </div>
                    </td>
                  )}

                  {/* Status */}
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {permissions.canView && (
                        <Link
                          href={`/roles/${role}/${user.id}`}
                          title="View Profile"
                          className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 border border-blue-200 dark:border-blue-800 transition-all flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      )}

                      {permissions.canEdit && (
                        <Link
                          href={`/roles/${role}/${user.id}/edit`}
                          title="Edit User"
                          className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 border border-indigo-200 dark:border-indigo-800 transition-all flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                      )}

                      {permissions.canDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(user.id, user.name)}
                          title="Delete User"
                          className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 border border-rose-200 dark:border-rose-800 transition-all flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
