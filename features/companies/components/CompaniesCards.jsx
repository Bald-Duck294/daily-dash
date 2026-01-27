import { formatDate } from "../utils/formatDate";

export default function CompaniesCards({ companies }) {
  return (
    <div className="space-y-3">
      {companies.map((c) => (
        <div
          key={c.id}
          className="
            rounded-xl p-4
            border border-[var(--sidebar-border)]
            bg-[var(--background)]
          "
        >
          <h3 className="font-semibold text-[var(--foreground)]">
            {c.name}
          </h3>

          <p className="text-sm text-[var(--sidebar-muted)]">
            {c.contact_email}
          </p>

          <p className="text-xs mt-2 text-[var(--sidebar-muted)]">
            Created: {formatDate(c.created_at)}
          </p>
        </div>
      ))}
    </div>
  );
}
