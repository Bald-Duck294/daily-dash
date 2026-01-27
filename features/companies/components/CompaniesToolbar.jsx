import { Download, Plus } from "lucide-react";
import Link from "next/link";
import { exportCompaniesCSV } from "../utils/exportCompanies";

export default function CompaniesToolbar({
  search,
  onSearch,
  companies,
}) {
  return (
    <div className="flex flex-wrap gap-3 mb-4 justify-between">
      <input
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search organizations..."
        className="
          w-64 rounded-lg px-3 py-2
          bg-[var(--background)]
          border border-[var(--sidebar-border)]
          text-[var(--foreground)]
          placeholder:text-[var(--sidebar-muted)]
          focus:outline-none focus:ring-2 focus:ring-[var(--sidebar-active)]
        "
      />

      <div className="flex gap-2">
        <button
          onClick={() => exportCompaniesCSV(companies)}
          className="
            flex items-center gap-2 px-4 py-2 rounded-lg
            border border-[var(--sidebar-border)]
            text-[var(--foreground)]
            hover:bg-[var(--sidebar-hover)]
            transition
          "
        >
          <Download size={16} />
          Export
        </button>

        <Link
          href="/companies/add"
          className="
            flex items-center gap-2 px-4 py-2 rounded-lg
            bg-[var(--sidebar-active)]
            text-white
            hover:opacity-90
            transition
          "
        >
          <Plus size={16} />
          Add
        </Link>
      </div>
    </div>
  );
}
