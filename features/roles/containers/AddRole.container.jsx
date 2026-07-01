"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

import { useCompanyId } from "@/providers/CompanyProvider";
import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import AddRoleForm from "@/features/roles/components/AddRoleForm.jsx";
import { MODULES } from "@/shared/constants/permissions";

// Import your React Query hooks (adjust paths as needed for your project structure)
import { useCreateUser } from "@/features/users/users.queries";
import { useCompaniesDropdown } from "@/features/dropdownList/dropdownlist.query"; 

/* ================= Constants ================= */

const ROLE_ID_MAP = {
  superadmin: 1,
  admin: 2,
  supervisor: 3,
  user: 4,
  cleaner: 5,
};

const ROLE_TITLE_MAP = {
  superadmin: "Superadmin",
  admin: "Admin",
  supervisor: "Supervisor",
  user: "User",
  cleaner: "Cleaner",
};

export default function AddRoleContainer() {
  const { role } = useParams();
  const router = useRouter();
  const { companyId: currentCompanyId } = useCompanyId();

  /* ================= Permission ================= */
  useRequirePermission({
    module: MODULES.ROLES,
    action: "create",
  });

  /* ================= Derived ================= */
  const roleId = role ? ROLE_ID_MAP[role] : null;
  const title = role ? ROLE_TITLE_MAP[role] : "";
  const isSuperAdmin = role === "superadmin";

  /* ================= Guard ================= */
  useEffect(() => {
    if (role === undefined) return; 

    if (!ROLE_ID_MAP[role]) {
      toast.error("Invalid role");
      router.replace("/dashboard");
    }
  }, [role, router]);

  /* ================= State ================= */
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    company_id: currentCompanyId || "", // Initialize with context ID if available
    role_id: roleId,
    age: "",
  });

  /* ================= Queries & Mutations ================= */
  
  // Fetch companies for dropdown (skips if user is superadmin)
  const { data: companiesResponse } = useCompaniesDropdown({
    enabled: !isSuperAdmin,
  });
  // Handle both { data: [...] } and direct array responses based on your API structure
  const companies = companiesResponse?.data || companiesResponse || [];

  // Setup the create user mutation
  const { mutateAsync: createUser, isPending: isCreating } = useCreateUser();

  /* ================= Sync role_id & company_id ================= */
  useEffect(() => {
    setFormData((p) => ({
      ...p,
      ...(roleId && { role_id: roleId }),
      ...(currentCompanyId && { company_id: currentCompanyId }),
    }));
  }, [roleId, currentCompanyId]);


  /* ================= Submit ================= */
  const handleSubmit = async () => {
    if (!formData.name.trim()) return toast.error("Name is required");

    if (!formData.phone || formData.phone.length !== 10)
      return toast.error("Phone must be exactly 10 digits");

    if (!formData.password || formData.password.length < 6)
      return toast.error("Password must be at least 6 characters");

    if (formData.password !== formData.confirm_password)
      return toast.error("Passwords do not match");

    if (!isSuperAdmin && !formData.company_id) {
      return toast.error("Company is required");
    }

    try {
      const payload = { ...formData };
      delete payload.confirm_password;
      
      // Clean up empty strings
      if (payload.age === "") delete payload.age;
      if (payload.email === "") delete payload.email;

      // Completely remove company_id for superadmins
      if (isSuperAdmin) {
        delete payload.company_id; 
      }

      const companyIdArg = isSuperAdmin ? null : payload.company_id;

      // Trigger React Query Mutation (Note: passing an object to match your hook definition)
      await createUser({ data: payload, companyId: companyIdArg });

      toast.success(`${title} created successfully`);
      router.push(
        `/roles/${role}${currentCompanyId ? `?companyId=${currentCompanyId}` : ""}`,
      );
      
    } catch (error) {
      console.error("Creation error:", error);
      const backendMessage = 
        error?.response?.data?.message || 
        error?.message ||                 
        "Failed to create user";
        
      toast.error(backendMessage);
    }
  };

  /* ================= Loading UI ================= */
  if (role === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-sm text-muted-foreground">
          Loading add role page...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 ">
      {/* ================= Header ================= */}
      <div className="mb-6 rounded-lg border p-4 sm:p-6 flex items-center gap-3 bg-[var(--surface)] border-[var(--border)] md:mt-[-30px] ">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-md transition hover:bg-[var(--muted)] text-[var(--foreground)]"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Add New {title}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Create a new {title.toLowerCase()} account
          </p>
        </div>
      </div>

      {/* ================= Form ================= */}
      <AddRoleForm
        title={title}
        isSuperAdmin={isSuperAdmin}
        formData={formData}
        setFormData={setFormData}
        companies={companies}
        loading={isCreating} // Passed from React Query's isPending
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  );
}