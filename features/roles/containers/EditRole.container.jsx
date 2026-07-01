"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { useCompanyId } from "@/providers/CompanyProvider";
import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { MODULES } from "@/shared/constants/permissions";

import EditRoleForm from "@/features/roles/components/EditRoleForm.jsx";

// Import React Query hooks
import { useGetUserById, useUpdateUser } from "@/features/users/users.queries";
import { useCompaniesDropdown } from "@/features/dropdownList/dropdownlist.query";

const ROLE_TITLE_MAP = {
  superadmin: "Superadmin",
  admin: "Admin",
  supervisor: "Supervisor",
  cleaner: "Cleaner",
};

export default function EditRoleContainer() {
  const { role, id } = useParams();
  const router = useRouter();
  const { companyId: currentCompanyId } = useCompanyId();
  
  useRequirePermission({
    module: MODULES.ROLES,
    action: "update",
  });
  
  const title = ROLE_TITLE_MAP[role] ?? "User";
  const isSuperAdmin = role === "superadmin";

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    company_id: "",
    age: "",
    password: "",
    confirmPassword: "",
  });

  /* ================= Queries & Mutations ================= */
  
  // 1. Fetch User Data
  const { data: user, isLoading: isUserLoading } = useGetUserById(id);

  // 2. Fetch Companies (Skip entirely if superadmin)
  const { data: companiesResponse } = useCompaniesDropdown({
    enabled: !isSuperAdmin,
  });
  const companies = companiesResponse?.data || companiesResponse || [];

  // 3. Setup Update Mutation
  const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser();

  /* ================= Sync Data ================= */
  
  // Populate form once user data is successfully fetched
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name ?? "",
        phone: user.phone ?? "",
        company_id: user.company_id ?? "",
        age: user.age ?? "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  /* ================= Submit ================= */
  
  const handleSubmit = async () => {
    if (!formData.name.trim()) return toast.error("Name is required");
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    // Require company for non-superadmins
    if (!isSuperAdmin && !formData.company_id) {
      return toast.error("Company is required");
    }

    try {
      const payload = { ...formData };
      delete payload.confirmPassword;

      // Clean up empty strings
      if (payload.age === "") delete payload.age;
      
      // Prevent superadmins from accidentally sending a company_id
      if (isSuperAdmin) {
        delete payload.company_id;
      }

      // Trigger React Query Mutation
      await updateUser({ id, data: payload });

      toast.success(`${title} updated successfully`);
      router.push(
        `/roles/${role}/${id}${currentCompanyId ? `?companyId=${currentCompanyId}` : ""}`
      );
      
    } catch (error) {
      console.error("Update error:", error);
      const backendMessage = 
        error?.response?.data?.message || 
        error?.message || 
        "Failed to update user";
      toast.error(backendMessage);
    }
  };

  /* ================= Loading UI ================= */
  
  if (isUserLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-[var(--muted-foreground)]">
        Loading user data…
      </div>
    );
  }

  /* ================= Render ================= */
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <EditRoleForm
        title={title}
        isSuperAdmin={isSuperAdmin} // Passed so the form can hide the Company dropdown
        formData={formData}
        setFormData={setFormData}
        companies={companies}
        saving={isUpdating} // Uses React Query's isPending state
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  );
}