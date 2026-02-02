// src/components/RoleMobileList.jsx
import { Pencil, Trash2, Users } from "lucide-react";

export default function RoleMobileList({ roles, canUpdate, canDelete, onEdit, onDelete }) {
  return (
    <div className="md:hidden space-y-3">
      {roles.map((role, i) => (
        <div key={role.id} className="bg-card border border-border rounded-xl p-4">
          <div className="flex justify-between">
            <div>
              <h3 className="font-semibold capitalize">{role.name}</h3>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Users size={14} /> {role._count?.users || 0}
              </div>
            </div>
            <div className="flex gap-2">
              {canUpdate && <Pencil size={16} onClick={() => onEdit(role.id)} />}
              {canDelete && role.id > 4 && (
                <Trash2 size={16} className="text-destructive" onClick={() => onDelete(role)} />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
