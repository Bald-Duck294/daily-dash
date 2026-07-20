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
      // cycle: asc → desc → clear
      if (sortOrder === "asc") {
        onSortChange(field, "desc");
      } else {
        onSortChange("", "");
      }
    } else {
      onSortChange(field, "asc");
    }
  };

  const sortableHeaders = [
    { key: "name", label: "Name" },
    { key: "contact_email", label: "Email" },
    { key: "status", label: "Status" },
    { key: "created_at", label: "Created" },
  ];

  return (
    <div
      className="
        overflow-hidden rounded-xl
        border border-[var(--sidebar-border)]
        bg-[var(--background)]
      "
    >
      <table className="w-full text-sm">
        {/* ===== TABLE HEADER ===== */}
        <thead className="border-b border-[var(--sidebar-border)]">
          <tr className="text-left text-[var(--sidebar-muted)]">
            <th className="p-3">#</th>
            {sortableHeaders.map((col) => (
              <th
                key={col.key}
                className="p-3 cursor-pointer select-none hover:text-[var(--foreground)] transition-colors"
                onClick={() => handleHeaderClick(col.key)}
              >
                {col.label}
                <SortIndicator field={col.key} sortField={sortField} sortOrder={sortOrder} />
              </th>
            ))}
            <th className="p-3">Actions</th>
          </tr>
        </thead>

        {/* ===== TABLE BODY ===== */}
        <tbody>
          {companies.map((c, i) => (
            <tr
              key={c.id}
              onClick={() => onView(c.id)}
              className="
                border-t border-[var(--sidebar-border)]
                hover:bg-[var(--sidebar-hover)]
                cursor-pointer
                transition
              "
            >
              <td className="p-3">{(currentPage - 1) * pageSize + i + 1}</td>

              <td className="p-3 font-medium text-[var(--foreground)]">
                {c.name}
              </td>

              <td className="p-3 text-[var(--sidebar-muted)]">
                {c.contact_email || "N/A"}
              </td>

              <td className="p-3">
                <span
                  className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${c.status
                      ? "bg-emerald-500/15 text-emerald-500"
                      : "bg-red-500/15 text-red-500"
                    }
                  `}
                >
                  {c.status ? "Active" : "Inactive"}
                </span>
              </td>

              <td className="p-3 text-[var(--sidebar-muted)]">
                {formatDate(c.created_at)}
              </td>

              {/* ===== ACTIONS ===== */}
              <td className="p-3">
                <div className="flex items-center gap-3">
                  <Edit
                    size={16}
                    className="cursor-pointer text-[var(--sidebar-muted)] hover:text-[var(--foreground)]"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/companies/${c.id}`);
                    }}
                  />

                  <RotateCcw
                    size={16}
                    className="cursor-pointer text-amber-500 hover:text-amber-600"
                    title="Reset Workspace"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReset?.(c.id);
                    }}
                  />

                  <Trash2
                    size={16}
                    className="cursor-pointer text-red-500"
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
