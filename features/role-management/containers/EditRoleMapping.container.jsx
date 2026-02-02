"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, AlertTriangle } from "lucide-react";

import { usePermissions } from "@/shared/hooks/usePermission";
import { MODULES } from "@/shared/constants/permissions";
import RolesApi from "@/features/roles/api/roles.api";

import RoleForm from "@/features/role-management/components/RoleForm";
import RolePermissions from "@/features/role-management/components/RolePermissions";

export default function EditRoleMappingContainer() {
  const router = useRouter();
  const { id } = useParams();
  const { canUpdate } = usePermissions();

  const roleId = Number(id);
  const isSystemRole = roleId <= 4;

  const [originalRole, setOriginalRole] = useState(null);
  const [modules, setModules] = useState([]);
  const [userCount, setUserCount] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!canUpdate(MODULES.ROLE_MANAGEMENT)) {
      toast.error("No permission");
      router.push("/role-management");
      return;
    }
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [roleRes, permRes] = await Promise.all([
        RolesApi.getById(roleId),
        RolesApi.getAvailablePermissions(),
      ]);

      if (!roleRes.success) throw new Error("Role not found");

      const role = roleRes.data.role;

      setOriginalRole(role);
      setUserCount(role._count?.users || 0);
      setFormData({
        name: role.name,
        description: role.description || "",
        permissions: role.permissions || [],
      });

      if (permRes.success) {
        setModules(permRes.data.modules);
      }
    } catch {
      toast.error("Failed to load role");
      router.push("/role-management");
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

    const update = {};

    if (formData.name !== originalRole.name) update.name = formData.name.trim();

    if ((formData.description || "") !== (originalRole.description || ""))
      update.description = formData.description || null;

    if (
      JSON.stringify(formData.permissions) !==
      JSON.stringify(originalRole.permissions)
    )
      update.permissions = formData.permissions;

    if (Object.keys(update).length === 0) {
      toast.error("No changes made");
      return;
    }

    setSubmitting(true);
    try {
      const res = await RolesApi.update(roleId, update);
      if (res.success) {
        toast.success("Role updated");
        router.push("/role-management");
      } else {
        toast.error(res.error || "Update failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !originalRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* System role warning */}
        {isSystemRole && (
          <div className="border border-warning bg-warning/10 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="text-warning" />
            <div className="text-sm text-foreground">
              <strong>System role:</strong> affects {userCount} user(s). Be
              careful.
            </div>
          </div>
        )}

        {/* Users info */}
        {userCount > 0 && (
          <div className="border border-border bg-muted rounded-lg p-3 text-sm">
            {userCount} user{userCount !== 1 && "s"} assigned to this role
          </div>
        )}

        <RoleForm
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          submitting={submitting}
          onCancel={() => router.back()}
          onSubmit={submit}
          title={`Edit Role: ${originalRole.name}`}
          subtitle="Update role details and permissions"
          submitLabel="Update Role"
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
