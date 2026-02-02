import Link from "next/link";
import { Eye, Edit, Trash2, Mail, Phone, User } from "lucide-react";

export default function RoleTable({ users, role, permissions, onDelete }) {
  return (
    <div className="mt-4 rounded-xl border bg-[var(--background)] overflow-hidden">
      <table className="w-full text-sm">
        {/* Header (hidden on mobile) */}
        <thead className="hidden sm:table-header-group bg-[var(--muted)] text-[var(--muted-foreground)]">
          <tr>
            <th className="px-5 py-4 text-left font-semibold">ID</th>
            <th className="px-5 py-4 text-left font-semibold">Name</th>
            <th className="px-5 py-4 text-left font-semibold">Email</th>
            <th className="px-5 py-4 text-left font-semibold">Phone</th>
            <th className="px-5 py-4 text-left font-semibold">Status</th>
            <th className="px-5 py-4 text-left font-semibold">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {users.map((user, index) => (
            <tr
              key={user.id}
              className="
                block sm:table-row
                p-4 sm:p-0
                hover:bg-[var(--muted)]
                transition
              "
            >
              {/* ID (hidden on mobile) */}
              <td className="hidden sm:table-cell px-5 py-4 text-[var(--muted-foreground)]">
                {index + 1}
              </td>

              {/* Name */}
              <td
                className="block sm:table-cell px-5 py-2 sm:py-4"
                data-label="Name"
              >
                <div className="flex items-center gap-2 font-medium">
                  <User size={16} className="text-[var(--muted-foreground)]" />
                  {user.name}
                </div>
              </td>

              {/* Email */}
              <td
                className="block sm:table-cell px-5 py-2 sm:py-4"
                data-label="Email"
              >
                <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                  <Mail size={16} />
                  {user.email || "N/A"}
                </div>
              </td>

              {/* Phone */}
              <td
                className="block sm:table-cell px-5 py-2 sm:py-4"
                data-label="Phone"
              >
                <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                  <Phone size={16} />
                  {user.phone || "—"}
                </div>
              </td>

              {/* Status */}
              <td
                className="block sm:table-cell px-5 py-2 sm:py-4"
                data-label="Status"
              >
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Active
                </span>
              </td>

              {/* Actions */}
              <td
                className="block sm:table-cell px-5 py-3 sm:py-4"
                data-label="Actions"
              >
                <div className="flex flex-wrap gap-2">
                  {permissions.canView && (
                    <ActionLink
                      href={`/roles/${role}/${user.id}`}
                      icon={<Eye size={14} />}
                      label="View"
                    />
                  )}

                  {permissions.canEdit && (
                    <ActionLink
                      href={`/roles/${role}/${user.id}/edit`}
                      icon={<Edit size={14} />}
                      label="Edit"
                    />
                  )}

                  {permissions.canDelete && (
                    <button
                      onClick={() => onDelete(user.id, user.name)}
                      className="action danger"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div className="px-5 py-3 text-xs text-[var(--muted-foreground)] bg-[var(--muted)]">
        Showing {users.length} of {users.length} {role}s
      </div>
    </div>
  );
}

/* ---------- Action Button ---------- */

function ActionLink({ href, icon, label }) {
  return (
    <Link href={href} className="action">
      {icon}
      {label}
    </Link>
  );
}
