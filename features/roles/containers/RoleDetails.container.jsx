"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { UsersApi } from "@/features/users/users.api";
import { useCompanyId } from "@/providers/CompanyProvider";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";

import RoleDetails from "../components/RoleDetails";
import RoleMeta from "../components/RoleMeta";
import RoleLoading from "../components/RoleLoading";

const roleTitleMap = {
  superadmin: "Superadmin",
  admin: "Admin",
  supervisor: "Supervisor",
  user: "User",
};

export default function RoleDetailsContainer() {
  const { role, id } = useParams();
  const router = useRouter();
  const { companyId } = useCompanyId();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const title = roleTitleMap[role] || "User";

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        const res = await UsersApi.getUserById(id);
        if (!res.success) throw new Error(res.error);
        setUser(res.data);
      } catch {
        toast.error("Failed to fetch user");
        router.push(`/roles/${role}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, role, router]);

  const handleDelete = async () => {
    if (!confirm(`Delete ${user?.name}?`)) return;

    const t = toast.loading("Deleting user...");
    try {
      const res = await UsersApi.deleteUser(id);
      if (!res.success) throw new Error();
      toast.success("User deleted", { id: t });
      router.push(`/roles/${role}`);
    } catch {
      toast.error("Delete failed", { id: t });
    }
  };

  if (loading) return <RoleLoading />;
  if (!user) return null;

  return (
    <>
      <Toaster position="top-center" />

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        {/* ===== HEADER (INLINE) ===== */}
        <div className="bg-[var(--background)] border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-md hover:bg-[var(--muted)]"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <h1 className="text-xl font-semibold">{user.name}</h1>
              <p className="text-sm text-[var(--muted-foreground)]">
                {title} Details
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() =>
                router.push(
                  `/roles/${role}/${id}/edit${
                    companyId ? `?companyId=${companyId}` : ""
                  }`
                )
              }
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md
                bg-[var(--primary)] text-white"
            >
              <Edit size={16} />
              Edit
            </button>

            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md
                bg-red-600 text-white"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>

        {/* ===== CONTENT ===== */}
        <RoleDetails user={user} />
        <RoleMeta user={user} />
      </div>
    </>
  );
}
