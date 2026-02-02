"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { usePermissions } from "@/shared/hooks/usePermission";
import { MODULES } from "@/shared/constants/permissions";
// import RolesApi from "@/features/roles/api/roles.api";
import RolesApi from "@/features/roles/api/roles.api";

import RoleHeader from "@/features/role-management/components/RoleHeader";
import RoleSearch from "@/features/role-management/components/RoleSearch";
import RoleTable from "@/features/role-management/components/RoleTable";
import RoleMobileList from "@/features/role-management/components/RoleMobileList";
import DeleteRoleModal from "@/features/role-management/components/DeleteRoleModal";
import Loader from "@/components/ui/Loader";

const RoleManagementContainer = () => {
  const router = useRouter();
  const { canView, canAdd, canUpdate, canDelete } = usePermissions();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModal, setDeleteModal] = useState({ open: false, role: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!canView(MODULES.ROLE_MANAGEMENT)) {
      toast.error("You do not have permission");
      router.push("/dashboard");
      return;
    }
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await RolesApi.getAllRoles();
      if (res.success) setRoles(res.data.roles);
      else toast.error("Failed to load roles");
    } catch (e) {
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.role) return;
    setDeleting(true);
    try {
      const res = await RolesApi.delete(deleteModal.role.id);
      if (res.success) {
        toast.success("Role deleted");
        fetchRoles();
        setDeleteModal({ open: false, role: null });
      } else {
        toast.error("Delete failed");
      }
    } finally {
      setDeleting(false);
    }
  };

  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
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
