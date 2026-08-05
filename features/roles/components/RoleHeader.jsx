import Link from "next/link";
import { ArrowLeft, Plus, Search, Building2, Shield, UserCog, HardHat, Users, X } from "lucide-react";

const ROLE_CONFIG = {
  superadmin: { label: "Super Admin", icon: Shield, badgeClass: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800" },
  admin: { label: "Admin", icon: Shield, badgeClass: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
  supervisor: { label: "Supervisor", icon: UserCog, badgeClass: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
  cleaner: { label: "Cleaner", icon: HardHat, badgeClass: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
  user: { label: "User", icon: Users, badgeClass: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700" },
};

export default function RoleHeader({
  role,
  search,
  onSearch,
  canAdd,
  companies = [],
  selectedCompany,
  onCompanyChange,
  isCompaniesLoading,
}) {
  const config = ROLE_CONFIG[role] || { label: role.charAt(0).toUpperCase() + role.slice(1), icon: Users, badgeClass: "bg-blue-100 text-blue-700 border-blue-200" };
  const RoleIcon = config.icon;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm mb-6 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left Title & Icon */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-xs">
            <RoleIcon className="w-6 h-6 text-slate-800 dark:text-slate-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {config.label} Management
              </h1>
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${config.badgeClass}`}>
                {role}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage and assign registered {config.label.toLowerCase()} accounts
            </p>
          </div>
        </div>

        {/* Right Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          {/* Company Filter Dropdown */}
          {role !== "superadmin" && (
            <div className="relative flex-1 sm:flex-initial min-w-[170px]">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Building2 className="w-4 h-4" />
              </div>
              <select
                value={selectedCompany}
                onChange={(e) => onCompanyChange(e.target.value)}
                disabled={isCompaniesLoading}
                className="w-full pl-9 pr-8 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50 appearance-none"
              >
                <option value="">All Companies</option>
                {companies?.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                ▼
              </div>
            </div>
          )}

          {/* Search Input */}
          <div className="relative flex-1 sm:flex-initial min-w-[200px] sm:min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={`Search ${config.label.toLowerCase()}s...`}
              className="w-full pl-9 pr-8 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Add Button */}
          {canAdd && (
            <Link
              href={`/roles/${role}/add`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xs transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" /> Add {config.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}