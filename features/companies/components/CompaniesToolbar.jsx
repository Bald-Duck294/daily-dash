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
        className="border rounded-lg px-3 py-2 w-64"
      />

      <div className="flex gap-2">
        <button
          onClick={() => exportCompaniesCSV(companies)}
          className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg"
        >
          <Download size={16} /> Export
        </button>

        <Link
          href="/companies/add"
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg"
        >
          <Plus size={16} /> Add
        </Link>
      </div>
    </div>
  );
}
