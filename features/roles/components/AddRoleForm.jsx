"use client";

import { Save, X } from "lucide-react";

export default function AddRoleForm({
    title,
    formData,
    setFormData,
    companies,
    loading,
    onSubmit,
    onCancel,
}) {
    return (
        <div
            className="
        rounded-lg border p-6
       bg-[var(--surface)]
        border-[var(--border)]
        shadow-sm
      "
        >
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit();
                }}
                className="space-y-6"
            >
                {/* ================= Basic Info ================= */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Full Name *">
                        <input
                            className="input"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData((p) => ({ ...p, name: e.target.value }))
                            }
                            placeholder="Enter full name"
                            required
                        />
                    </Field>

                    <Field label="Email">
                        <input
                            type="email"
                            className="input"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData((p) => ({ ...p, email: e.target.value }))
                            }
                            placeholder="Enter email"
                        />
                    </Field>

                    <Field label="Phone *">
                        <input
                            className="input"
                            value={formData.phone}
                            onChange={(e) =>
                                setFormData((p) => ({
                                    ...p,
                                    phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                                }))
                            }
                            placeholder="10 digit phone"
                            required
                        />
                    </Field>

                    <Field label="Company *">
                        <select
                            className="input"
                            value={formData.company_id}
                            onChange={(e) =>
                                setFormData((p) => ({ ...p, company_id: e.target.value }))
                            }
                            required
                        >
                            <option value="">Select company</option>
                            {companies.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </Field>
                </div>

                {/* ================= Password ================= */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Password *">
                        <input
                            type="password"
                            className="input"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData((p) => ({ ...p, password: e.target.value }))
                            }
                            placeholder="Min 6 characters"
                            required
                        />
                    </Field>

                    <Field label="Confirm Password *">
                        <input
                            type="password"
                            className="input"
                            value={formData.confirm_password}
                            onChange={(e) =>
                                setFormData((p) => ({
                                    ...p,
                                    confirm_password: e.target.value,
                                }))
                            }
                            placeholder="Re-enter password"
                            required
                        />
                    </Field>
                </div>

                {/* ================= Meta ================= */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Age">
                        <input
                            type="number"
                            min="16"
                            max="99"
                            className="input"
                            value={formData.age}
                            onChange={(e) =>
                                setFormData((p) => ({ ...p, age: e.target.value }))
                            }
                            placeholder="Optional"
                        />
                    </Field>

                    <Field label="Role">
                        <div
                            className="
                px-3 py-2 rounded-md border font-medium
                bg-[var(--muted)]
                border-[var(--border)]
                text-[var(--foreground)]
              "
                        >
                            {title}
                        </div>
                    </Field>
                </div>

                {/* ================= Actions ================= */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="
              flex-1 py-3 rounded-md font-medium
              flex items-center justify-center gap-2
              bg-[var(--primary)]
              text-[var(--primary-foreground)]
              hover:opacity-90
              disabled:opacity-60
              transition
            "
                    >
                        <Save size={16} />
                        {loading ? "Creating..." : `Create ${title}`}
                    </button>

                    <button
                        type="button"
                        onClick={onCancel}
                        className="
              px-6 py-3 rounded-md border
              border-[var(--border)]
              hover:bg-[var(--muted)]
              text-[var(--foreground)]
              flex items-center justify-center gap-2
              transition
            "
                    >
                        <X size={16} />
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

/* ================= Helper ================= */

function Field({ label, children }) {
    return (
        <div>
            <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
                {label}
            </label>
            {children}
        </div>
    );
}
