import { Edit, Trash2, RotateCcw, Shield } from "lucide-react";
import { formatDate } from "../utils/formatDate";
import { useRouter } from "next/navigation";

// Sort indicator component
function SortIndicator({ field, sortField, sortOrder }) {
  if (sortField !== field) {
    return (
      <svg className="w-3 h-3 ml-1 opacity-30 inline-block" viewBox="0 0 10 14" fill="currentColor">
        <path d="M5 0L10 5H0L5 0Z" />
        <path d="M5 14L0 9H10L5 14Z" />
      </svg>
    );
  }
  return (
    <svg className="w-3 h-3 ml-1 inline-block" viewBox="0 0 10 7" fill="currentColor">
      {sortOrder === "asc" ? <path d="M5 0L10 7H0L5 0Z" /> : <path d="M5 7L0 0H10L5 7Z" />}
    </svg>
  );
}

export default function CompaniesTable({
  companies,
  onDelete,
  onView,
  onReset,
  onSlaConfig,
  slaStatuses = [],
  sortField,
  sortOrder,
  onSortChange,
  currentPage = 1,
  pageSize = 6,
}) {
  const router = useRouter();

  const getSlaStatus = (companyId) => {
    if (!Array.isArray(slaStatuses)) return false;
    const status = slaStatuses.find(s => String(s.company_id) === String(companyId));
    return status?.enabled ? true : false;
  };

  const handleHeaderClick = (field) => {
    if (!onSortChange) return;
    if (sortField === field) {
      onSortChange(field, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSortChange(field, "desc");
    }
  };

  const sortableHeaders = [
    { key: "name", label: "Name" },
    { key: "contact_email", label: "Email" },
    { key: "status", label: "Status" },
    { key: "created_at", label: "Created" },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-all">
      <table className="w-full text-sm text-left border-collapse">
        {/* ===== TABLE HEADER ===== */}
        <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
          <tr>
            <th className="px-4 py-3.5 w-12">#</th>
            {sortableHeaders.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3.5 cursor-pointer select-none hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={() => handleHeaderClick(col.key)}
              >
                {col.label}
                <SortIndicator field={col.key} sortField={sortField} sortOrder={sortOrder} />
              </th>
            ))}
            <th className="px-4 py-3.5">SLA</th>
            <th className="px-4 py-3.5 text-right">Actions</th>
          </tr>
        </thead>

        {/* ===== TABLE BODY ===== */}
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium text-slate-700 dark:text-slate-300">
          {companies.map((c, i) => (
            <tr
              key={c.id}
              onClick={() => onView(c.id)}
              className="
                group bg-white dark:bg-slate-900
                hover:bg-blue-50/70 dark:hover:bg-blue-950/40
                hover:shadow-sm
                hover:-translate-y-0.5
                cursor-pointer
                transition-all duration-200 ease-out
              "
            >
              <td className="px-4 py-3.5 font-mono text-xs text-slate-400 font-bold group-hover:text-blue-600 transition-colors">
                {(currentPage - 1) * pageSize + i + 1}
              </td>

              <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                {c.name}
              </td>

              <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs">
                {c.contact_email || "N/A"}
              </td>

              <td className="px-4 py-3.5">
                <span
                  className={`
                    inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border
                    ${c.status
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                      : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                    }
                  `}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${c.status ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                  {c.status ? "Active" : "Inactive"}
                </span>
              </td>

              <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs font-mono">
                {formatDate(c.created_at)}
              </td>

              <td className="px-4 py-3.5">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${getSlaStatus(c.id) ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' : 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {getSlaStatus(c.id) ? "🟢 Enabled" : "🔴 Disabled"}
                </span>
              </td>

              {/* ===== ACTIONS ===== */}
              <td className="px-4 py-3.5 text-right">
                <div className="flex items-center justify-end gap-2.5">
                  <Edit
                    size={16}
                    className="cursor-pointer text-slate-400 hover:text-blue-600 transition-all hover:scale-125"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/companies/${c.id}`);
                    }}
                  />

                  <Shield
                    size={16}
                    className="cursor-pointer text-indigo-500 hover:text-indigo-600 transition-all hover:scale-125"
                    title="SLA Configuration"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSlaConfig?.(c);
                    }}
                  />

                  <RotateCcw
                    size={16}
                    className="cursor-pointer text-amber-500 hover:text-amber-600 transition-all hover:scale-125"
                    title="Reset Workspace"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReset?.(c.id);
                    }}
                  />

                  <Trash2
                    size={16}
                    className="cursor-pointer text-rose-500 hover:text-rose-600 transition-all hover:scale-125"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(c.id);
                    }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
