import Link from "next/link";
import { ArrowLeft, Plus, Search } from "lucide-react";

export default function RoleHeader({ 
  role, 
  search, 
  onSearch, 
  canAdd,
  companies = [],
  selectedCompany,
  onCompanyChange,
  isCompaniesLoading
}) {
  const title = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="bg-[var(--bg-surface)] border rounded-lg p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">
          {title} Management
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Manage all {title.toLowerCase()} users
        </p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {/* Company Filter */}
        {role !== 'superadmin' && (
          <select
            value={selectedCompany}
            onChange={(e) => onCompanyChange(e.target.value)}
            disabled={isCompaniesLoading}
            className="px-3 py-2 border rounded-md bg-[var(--bg-muted)] text-[var(--text-primary)] text-sm outline-none min-w-[150px]"
          >
            <option value="">All Companies</option>
            {companies?.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        )}

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder="Search users..."
            className="pl-9 pr-3 py-2 border rounded-md bg-[var(--bg-muted)] text-sm outline-none"
          />
        </div>

        {/* Add Button */}
        {canAdd && (
          <Link
            href={`/roles/${role}/add`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md
              bg-[var(--primary)] text-white text-sm"
          >
            <Plus size={16} /> Add
          </Link>
        )}
      </div>
    </div>
  );
}