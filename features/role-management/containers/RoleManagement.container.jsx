"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { usePermissions } from "@/shared/hooks/usePermission";
import { MODULES } from "@/shared/constants/permissions";

import { useGetAllRoles, useDeleteRole } from "@/features/roles/queries/roles.queries.js";

import RoleHeader from "@/features/role-management/components/RoleHeader";
import RoleSearch from "@/features/role-management/components/RoleSearch";
import RoleTable from "@/features/role-management/components/RoleTable";
import RoleMobileList from "@/features/role-management/components/RoleMobileList";
import DeleteRoleModal from "@/features/role-management/components/DeleteRoleModal";
import Loader from "@/components/ui/Loader";

const RoleManagementContainer = () => {
  const router = useRouter();
  const { canView, canAdd, canUpdate, canDelete } = usePermissions();

  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModal, setDeleteModal] = useState({ open: false, role: null });

  /* ===============================
     PERMISSION CHECK
  ================================ */

  useEffect(() => {
    if (!canView(MODULES.ROLE_MANAGEMENT)) {
      toast.error("You do not have permission");
      router.push("/dashboard");
    }
  }, [canView, router]);

  /* ===============================
     FETCH ROLES (TanStack)
  ================================ */

  const { data: roles = [], isLoading, isError, error } = useGetAllRoles();

  /* ===============================
     DELETE ROLE (TanStack)
  ================================ */

  const { mutate: deleteRole, isPending: deleting } = useDeleteRole();

  const handleDelete = () => {
    if (!deleteModal.role) return;

    deleteRole(deleteModal.role.id, {
      onSuccess: () => {
        toast.success("Role deleted");
        setDeleteModal({ open: false, role: null });
      },
      onError: (err) => {
        toast.error(err.message || "Delete failed");
      },
    });
  };

  /* ===============================
     ERROR HANDLING
  ================================ */

  useEffect(() => {
    if (isError) {
      toast.error(error?.message || "Failed to load roles");
    }
  }, [isError, error]);

  /* ===============================
     SEARCH FILTER
  ================================ */

  const filteredRoles = useMemo(() => {
    return roles.filter((r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [roles, searchQuery]);

  if (isLoading) {
    return <Loader message="Loading roles..." />;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        <RoleHeader
          onAdd={() => router.push("/role-management/add")}
          canAdd={canAdd(MODULES.ROLE_MANAGEMENT)}
        />

        <RoleSearch value={searchQuery} onChange={setSearchQuery} />

        <RoleTable
          roles={filteredRoles}
          canUpdate={canUpdate(MODULES.ROLE_MANAGEMENT)}
          canDelete={canDelete(MODULES.ROLE_MANAGEMENT)}
          onEdit={(id) => router.push(`/role-management/${id}`)}
          onDelete={(role) => setDeleteModal({ open: true, role })}
        />

        <RoleMobileList
          roles={filteredRoles}
          canUpdate={canUpdate(MODULES.ROLE_MANAGEMENT)}
          canDelete={canDelete(MODULES.ROLE_MANAGEMENT)}
          onEdit={(id) => router.push(`/role-management/${id}/edit`)}
          onDelete={(role) => setDeleteModal({ open: true, role })}
        />
      </div>

      <DeleteRoleModal
        open={deleteModal.open}
        role={deleteModal.role}
        deleting={deleting}
        onClose={() => setDeleteModal({ open: false, role: null })}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default RoleManagementContainer;
