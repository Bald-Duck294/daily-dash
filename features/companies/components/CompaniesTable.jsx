import { Edit, Trash2, RotateCcw } from "lucide-react";
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
  onToggleStepper,
  sortField,
  sortOrder,
  onSortChange,
  currentPage = 1,
  pageSize = 6,
}) {
  const router = useRouter();

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
            <th className="px-4 py-3.5 text-center">Stepper</th>
            <th className="px-4 py-3.5 text-right">Actions</th>
          </tr>
        </thead>

        {/* ===== TABLE BODY ===== */}
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium text-slate-700 dark:text-slate-300">
          {companies.map((c, i) => {
            const hasData = (c._count?.locations ?? 0) > 0;
            const isStepperEnabled = !c.is_onboarding_completed;

            return (
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

                {/* ===== STEPPER TOGGLE ===== */}
                <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                  {hasData ? (
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed select-none"
                      title="Stepper locked: Company already has locations/data deployed"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      Data Present
                    </span>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleStepper?.(c.id)}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                          isStepperEnabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                        }`}
                        role="switch"
                        aria-checked={isStepperEnabled}
                        title={
                          isStepperEnabled
                            ? "Stepper Active: New user will see onboarding"
                            : "Stepper Skipped: User will bypass to dashboard directly"
                        }
                      >
                        <span className="sr-only">Toggle Stepper</span>
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            isStepperEnabled ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                      <span
                        className={`text-[11px] font-bold ${
                          isStepperEnabled
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-slate-400"
                        }`}
                      >
                        {isStepperEnabled ? "Visible" : "Hidden"}
                      </span>
                    </div>
                  )}
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
          );
        })}
      </tbody>
      </table>
    </div>
  );
}
