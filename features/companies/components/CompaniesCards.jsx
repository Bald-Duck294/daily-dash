import { Edit, Trash2 } from "lucide-react";
import { formatDate } from "../utils/formatDate";
import { useRouter } from "next/navigation";

export default function CompaniesCards({ companies, onDelete, onView }) {
  const router = useRouter();

  return (
    <div className="space-y-3">
      {companies.map((c) => (
        <div
          key={c.id}
          onClick={() => onView(c.id)}
          className="
            rounded-xl p-4
            border border-[var(--sidebar-border)]
            bg-[var(--background)]
            cursor-pointer
            transition
            hover:bg-[var(--sidebar-hover)]
          "
        >
          {/* ===== HEADER ===== */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-[var(--foreground)]">
                {c.name}
              </h3>

              <p className="text-sm text-[var(--sidebar-muted)]">
                {c.contact_email}
              </p>
            </div>

            {/* STATUS */}
            <span
              className={`
                px-2 py-1 rounded-full text-xs font-medium
                ${
                  c.status
                    ? "bg-emerald-500/15 text-emerald-500"
                    : "bg-red-500/15 text-red-500"
                }
              `}
            >
              {c.status ? "Active" : "Inactive"}
            </span>
          </div>

          {/* ===== META ===== */}
          <p className="text-xs mt-3 text-[var(--sidebar-muted)]">
            Created: {formatDate(c.created_at)}
          </p>

          {/* ===== ACTIONS ===== */}
          <div className="flex gap-4 mt-4">
            <Edit
              size={16}
              className="
                cursor-pointer
                text-[var(--sidebar-muted)]
                hover:text-[var(--foreground)]
              "
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/companies/${c.id}`);
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
        </div>
      ))}
    </div>
  );
}
