import { ArrowLeft, Save, Loader2, Shield } from "lucide-react";

export default function RoleForm({
  formData,
  setFormData,
  errors = {},
  submitting = false,
  onCancel,
  onSubmit,

  // ✅ NEW (for reuse)
  title = "Add New Role",
  subtitle = "Create a role with permissions",
  submitLabel = "Create Role",
}) {
  return (
    <div className="bg-card border border-border rounded-xl">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-lg hover:bg-muted"
        >
          <ArrowLeft />
        </button>

        <Shield className="text-primary" />

        <div>
          <h1 className="text-xl font-bold text-foreground">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Form body */}
      <div className="p-4 space-y-4">
        {/* Role Name */}
        <div>
          <label className="text-sm font-medium text-foreground">
            Role Name <span className="text-destructive">*</span>
          </label>

          <input
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {errors.name && (
            <p className="text-destructive text-xs mt-1">
              {errors.name}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-foreground">
            Description
          </label>

          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 border border-border rounded-lg py-2 hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="flex-1 bg-primary text-primary-foreground rounded-lg py-2 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save />
                {submitLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
