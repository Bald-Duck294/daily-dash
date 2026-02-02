import { Shield, Plus } from "lucide-react";

const RoleHeader = ({ canAdd, onAdd }) => {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex justify-between">
      <div className="flex items-center gap-3">
        <Shield className="text-primary" />
        <div>
          <h1 className="text-xl font-bold text-foreground">Role Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage user roles and permissions
          </p>
        </div>
      </div>

      {canAdd && (
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg"
        >
          <Plus size={16} /> New
        </button>
      )}
    </div>
  );
};

export default RoleHeader;
