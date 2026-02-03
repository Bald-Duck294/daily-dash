"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Building, Mail, FileText, ArrowLeft } from "lucide-react";
import { CompanyApi } from "@/features/companies/api/companies.api.js";

/* ---------------- Skeleton ---------------- */
const FormSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i}>
        <div className="h-4 w-1/4 rounded bg-[var(--sidebar-hover)] mb-2" />
        <div className="h-10 w-full rounded-lg bg-[var(--sidebar-hover)]" />
      </div>
    ))}
    <div className="pt-4 border-t border-[var(--sidebar-border)]">
      <div className="h-12 w-full rounded-lg bg-[var(--sidebar-hover)]" />
    </div>
  </div>
);

export default function EditCompanyPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const router = useRouter();
  const { id } = useParams();

  /* ---------------- Fetch ---------------- */
  useEffect(() => {
    if (!id) return;

    const fetchCompany = async () => {
      setIsFetching(true);
      const response = await CompanyApi.getCompanyById(id);

      if (response.success) {
        const { name, description, contact_email } = response.data;
        setName(name);
        setDescription(description || "");
        setContactEmail(contact_email || "");
      } else {
        toast.error(response.error || "Failed to fetch company.");
        router.replace("/companies");
      }

      setIsFetching(false);
    };

    fetchCompany();
  }, [id, router]);

  /* ---------------- Submit ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return toast.error("Company name is required.");

    setIsLoading(true);

    const response = await CompanyApi.updateCompany({
      id,
      companyData: {
        name,
        description,
        contact_email: contactEmail,
      },
    });

    if (response.success) {
      toast.success("Company updated successfully!");
      router.push("/companies");
    } else {
      toast.error(response.error || "Failed to update company.");
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
            Back to Companies
          </button>

          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/10">
              <Building className="h-6 w-6 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-semibold text-[var(--foreground)]">
              Edit Company
            </h1>
          </div>

          {isFetching ? (
            <FormSkeleton />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Field
                label="Company Name *"
                icon={Building}
                value={name}
                onChange={setName}
                placeholder="Company name"
                required
              />

              <Field
                label="Description"
                icon={FileText}
                value={description}
                onChange={setDescription}
                placeholder="Short description"
                textarea
              />

              <Field
                label="Contact Email"
                icon={Mail}
                value={contactEmail}
                onChange={setContactEmail}
                placeholder="contact@company.com"
                type="email"
              />

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
                  {isLoading ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

/* ---------------- Reusable Field ---------------- */

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
