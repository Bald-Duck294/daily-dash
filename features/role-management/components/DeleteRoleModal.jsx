// src/components/DeleteRoleModal.jsx
export default function DeleteRoleModal({ open, role, deleting, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-2 text-foreground">
          Delete Role
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Are you sure you want to delete <b>{role?.name}</b>?
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-border rounded-lg py-2"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 bg-destructive text-destructive-foreground rounded-lg py-2"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
