import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function RoleEmptyState({ role, canAdd }) {
  return (
    <div className="text-center py-20">
      <UserPlus className="mx-auto mb-4 text-[var(--text-secondary)]" size={48} />
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">
        No users found
      </h3>
      <p className="text-sm text-[var(--text-secondary)] mb-4">
        There are no {role}s yet.
      </p>

      {canAdd && (
        <Link
          href={`/roles/${role}/add`}
          className="inline-flex items-center gap-2 px-4 py-2
            bg-[var(--primary)] text-white rounded-md text-sm"
        >
          Add first user
        </Link>
      )}
    </div>
  );
}
