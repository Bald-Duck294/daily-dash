"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

import { usePermissions } from "@/shared/hooks/usePermission";
import { MODULES } from "@/shared/constants/permissions";
import RolesApi from "@/features/roles/api/roles.api";
import RoleForm from "@/features/role-management/components/RoleForm";
import RolePermissions from "@/features/role-management/components/RolePermissions";

export default function AddRoleMappingContainer() {
  const router = useRouter();
  const { canAdd } = usePermissions();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [],
  });

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!canAdd(MODULES.ROLE_MANAGEMENT)) {
      toast.error("No permission");
      router.push("/role-management");
      return;
    }
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const res = await RolesApi.getAvailablePermissions();
      if (res.success) setModules(res.data.modules);
      else toast.error("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Role name is required";
    if (formData.permissions.length === 0)
      e.permissions = "Select at least one permission";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await RolesApi.create({
        name: formData.name.trim(),
        description: formData.description || null,
        permissions: formData.permissions,
      });

      if (res.success) {
        toast.success("Role created");
        router.push("/role-management");
      } else {
        toast.error(res.error || "Failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <RoleForm
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          submitting={submitting}
          onCancel={() => router.back()}
          onSubmit={submit}
        />

        <RolePermissions
          modules={modules}
          formData={formData}
          setFormData={setFormData}
          error={errors.permissions}
        />
      </div>
    </div>
  );
}
