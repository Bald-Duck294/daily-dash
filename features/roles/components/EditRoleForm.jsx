import { Save, X, Loader2 } from "lucide-react";

export default function EditRoleForm({
  title,
  formData,
  setFormData,
  companies,
  saving,
  onSubmit,
  onCancel,
}) {
  const onChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="rounded-lg border p-6 space-y-6"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      {/* ================= Header ================= */}
      <div>
        <h1 className="text-xl font-semibold">Edit {title}</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Update {title.toLowerCase()} information
        </p>
      </div>

      {/* ================= Basic Info ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            className="input"
            name="name"
            value={formData.name}
            onChange={onChange}
            placeholder="Enter full name"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Email Address
          </label>
          <input
            className="input"
            name="email"
            value={formData.email}
            onChange={onChange}
            placeholder="Enter email address"
            disabled
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            className="input"
            name="phone"
            value={formData.phone}
            onChange={onChange}
            placeholder="Enter phone number"
            required
          />
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Company
          </label>
          <select
            className="input"
            name="company_id"
            value={formData.company_id}
            onChange={onChange}
          >
            <option value="">Select Company</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Age
          </label>
          <input
            className="input"
            type="number"
            name="age"
            value={formData.age}
            onChange={onChange}
            placeholder="Enter age"
          />
        </div>
      </div>

      {/* ================= Divider ================= */}
      <hr style={{ borderColor: "var(--border)" }} />

      {/* ================= Password ================= */}
      <div className="space-y-3">
        <h2 className="font-semibold">Change Password (Optional)</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              New Password
            </label>
            <input
              className="input"
              type="password"
              name="password"
              value={formData.password}
              onChange={onChange}
              placeholder="Enter new password"
            />
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Leave blank to keep current password
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Confirm New Password
            </label>
            <input
              className="input"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={onChange}
              placeholder="Confirm new password"
            />
          </div>
        </div>
      </div>

      {/* ================= Role (Read Only) ================= */}
      <div>
        <label className="block text-sm font-medium mb-1">Role</label>
        <div
          className="rounded-md border px-3 py-2"
          style={{
            background: "var(--muted)",
            borderColor: "var(--border)",
          }}
        >
          <div className="font-medium">{title}</div>
          <div className="text-xs text-[var(--muted-foreground)]">
            Role cannot be changed
          </div>
        </div>
      </div>

      {/* ================= Actions ================= */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="action"
          style={{
            background: "var(--primary)",
            color: "var(--primary-foreground)",
          }}
          disabled={saving}
        >
          {saving ? <Loader2 className="animate-spin" /> : <Save />}
          Update {title}
        </button>

        <button
          type="button"
          className="action"
          onClick={onCancel}
        >
          <X /> Cancel
        </button>
      </div>
    </form>
  );
}
