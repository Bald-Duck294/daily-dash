"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { UsersApi } from "@/features/users/users.api";
import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { usePermissions } from "@/shared/hooks/usePermission";
import { MODULES } from "@/shared/constants/permissions";

import RoleHeader from "@/features/roles/components/RoleHeader";
import RoleTable from "@/features/roles/components/RoleTable";
import RoleEmptyState from "@/features/roles/components/RoleEmptyState";
import RoleLoading from "@/features/roles/components/RoleLoading";

const ROLE_ID_MAP = {
  superadmin: 1,
  admin: 2,
  supervisor: 3,
  user: 4,
  cleaner: 5,
};

export default function RolesListContainer({ role }) {
  useRequirePermission(MODULES.USERS);

  const roleId = ROLE_ID_MAP[role];
  const { canAdd, canView, canUpdate, canDelete } = usePermissions();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!roleId) return;

    const fetchUsers = async () => {
      try {
        const res = await UsersApi.getAllUsers();
        const roleUsers = res.data.filter(u => u.role_id === roleId);
        setUsers(roleUsers);
      } catch {
        toast.error("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [roleId]);

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(
      u =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q)
    );
  }, [users, search]);

  if (loading) return <RoleLoading />;

  return (
    <>
      <RoleHeader
        role={role}
        search={search}
        onSearch={setSearch}
        canAdd={canAdd(MODULES.USERS)}
      />

      {filteredUsers.length === 0 ? (
        <RoleEmptyState role={role} canAdd={canAdd(MODULES.USERS)} />
      ) : (
        <RoleTable
          users={filteredUsers}
          role={role}
          permissions={{
            canView: canView(MODULES.USERS),
            canEdit: canUpdate(MODULES.USERS),
            canDelete: canDelete(MODULES.USERS),
          }}
        />
      )}
    </>
  );
}
