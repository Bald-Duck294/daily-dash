"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CompanyApi } from "@/features/companies/api/companies.api.js";
import toast, { Toaster } from "react-hot-toast";
import { Building, Mail, FileText, ArrowLeft } from "lucide-react";

export default function AddCompanyPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      return toast.error("Organization name is required.");
    }

    setIsLoading(true);

    const response = await CompanyApi.createCompany({
      name,
      description,
      contact_email: contactEmail,
    });

    if (response.success) {
      toast.success("Organization created successfully!");
      router.push("/companies");
    } else {
      toast.error(response.error || "Failed to create organization.");
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />

      <div className="min-h-screen bg-[var(--background)] p-4 sm:p-6 md:p-8">
        <div
          className="
            max-w-2xl mx-auto
            rounded-2xl
            border border-[var(--sidebar-border)]
            bg-[var(--background)]
            p-8
            shadow-sm
          "
        >
          {/* Back */}
          <button
            onClick={() => router.back()}
            className="
              mb-6 flex items-center gap-2 text-sm font-medium
              text-[var(--sidebar-muted)]
              hover:text-[var(--foreground)]
            "
          >
            <ArrowLeft size={16} />
            Back to Organizations
          </button>

          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/10">
              <Building className="h-6 w-6 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-semibold text-[var(--foreground)]">
              Add New Organization
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <Field
              label="Organization Name *"
              icon={Building}
              value={name}
              onChange={setName}
              placeholder="Enter organization name"
              required
            />

            {/* Description */}
            <Field
              label="Description"
              icon={FileText}
              value={description}
              onChange={setDescription}
              placeholder="Short description"
              textarea
            />

            {/* Email */}
            <Field
              label="Contact Email"
              icon={Mail}
              value={contactEmail}
              onChange={setContactEmail}
              placeholder="contact@organization.com"
              type="email"
            />

            {/* Submit */}
            <div className="pt-4 border-t border-[var(--sidebar-border)]">
              <button
                type="submit"
                disabled={isLoading}
                className="
                  w-full rounded-lg bg-indigo-600 px-4 py-3
                  text-sm font-semibold text-white
                  hover:bg-indigo-700
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                {isLoading ? "Creating..." : "Create Organization"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

/* ---------- Reusable Field ---------- */

function Field({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = "text",
  textarea = false,
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[var(--sidebar-muted)]">
        {label}
      </label>

      <div
        className="
          relative flex items-center
          rounded-lg border border-[var(--sidebar-border)]
          bg-transparent
          focus-within:ring-2 focus-within:ring-indigo-500
        "
      >
        <Icon className="ml-3 h-4 w-4 text-[var(--sidebar-muted)]" />

        {textarea ? (
          <textarea
            rows={3}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="
              w-full bg-transparent px-3 py-2 text-sm
              text-[var(--foreground)]
              outline-none placeholder:text-[var(--sidebar-muted)]
            "
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            className="
              w-full bg-transparent px-3 py-2 text-sm
              text-[var(--foreground)]
              outline-none placeholder:text-[var(--sidebar-muted)]
            "
          />
        )}
      </div>
    </div>
  );
}
