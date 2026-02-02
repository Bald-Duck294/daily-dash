// src/components/RoleTable.jsx
import { Pencil, Trash2, Users } from "lucide-react";

export default function RoleTable({ roles, canUpdate, canDelete, onEdit, onDelete }) {
  return (
    <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold">#</th>
            <th className="px-4 py-3 text-left text-xs font-semibold">Name</th>
            <th className="px-4 py-3 text-center text-xs font-semibold">Users</th>
            <th className="px-4 py-3 text-center text-xs font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {roles.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center py-6 text-muted-foreground">
                No roles found
              </td>
            </tr>
          ) : (
            roles.map((role, i) => (
              <tr key={role.id} className="hover:bg-muted/50">
                <td className="px-4 py-3">{i + 1}</td>
                <td className="px-4 py-3 capitalize">{role.name}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded">
                    <Users size={14} />
                    {role._count?.users || 0}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-2">
                    {canUpdate && (
                      <button onClick={() => onEdit(role.id)}>
                        <Pencil size={16} />
                      </button>
                    )}
                    {canDelete && role.id > 4 && (
                      <button onClick={() => onDelete(role)}>
                        <Trash2 size={16} className="text-destructive" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
