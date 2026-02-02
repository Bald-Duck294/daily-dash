"use client";

import { useState } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

import TreeView from "@/features/locationTypes/components/TreeView";
import { useCompanyId } from "@/providers/CompanyProvider";

import { usePermissions } from "@/shared/hooks/usePermission";
import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { MODULES } from "@/shared/constants/permissions";

import {
  useLocationTypes,
  useDeleteLocationType,
  useUpdateLocationType,
} from "@/features/locationTypes/locationTypes.queries";

import {
  Plus,
  FolderTree,
  List,
  ArrowLeft,
  Search,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react";

export default function LocationTypesPage() {
  useRequirePermission(MODULES.LOCATION_TYPES);

  const router = useRouter();
  const { companyId } = useCompanyId();
  const { canAdd, canUpdate, canDelete } = usePermissions();

  const [deleteModal, setDeleteModal] = useState({ open: false, type: null });
  const [showTree, setShowTree] = useState(false);
  const [search, setSearch] = useState("");

  /* =======================
     TanStack Query
  ======================= */

  const {
    data: types = [],
    isLoading: loading,
  } = useLocationTypes(companyId);

  const deleteMutation = useDeleteLocationType(companyId);
  const updateMutation = useUpdateLocationType(companyId);

  /* =======================
     Derived data (NO UI change)
  ======================= */

  const filteredTypes = !search.trim()
    ? types
    : types.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase())
      );

  const hasChildren = (typeId) =>
    types.some((t) => t.parent_id === typeId);

  const parentName = (id) =>
    types.find((t) => t.id === id)?.name || "—";

  /* =======================
     Delete logic (NO UI change)
  ======================= */

  const handleDeleteClick = (type) => {
    setDeleteModal({ open: true, type });
  };

  const confirmDelete = async () => {
    if (!deleteModal.type) return;

    const { id, name } = deleteModal.type;

    if (hasChildren(id)) {
      toast.error(
        "Cannot delete location hierarchy with child hierarchy. Delete children first."
      );
      setDeleteModal({ open: false, type: null });
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      toast.success(`"${name}" deleted successfully`);
      setDeleteModal({ open: false, type: null });
    } catch {
      toast.error("Failed to delete location type");
    }
  };

  /* =======================
     Update logic (READY, no UI change)
  ======================= */

  const handleUpdate = async (id, data) => {
    try {
      await updateMutation.mutateAsync({ id, data });
      toast.success("Location type updated successfully");
    } catch {
      toast.error("Failed to update location type");
    }
  };

  return (
    <>
      <Toaster position="top-right" />

      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* Header Card */}
          <div className="rounded-2xl bg-background shadow-sm border border-border p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FolderTree className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Location Hierarchy</h1>
                <p className="text-xs text-muted-foreground uppercase">
                  Organization Structure & Zones
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowTree((v) => !v)}
                className="rounded-lg border border-primary/40 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10"
              >
                Show Hierarchy
              </button>

              {canAdd && (
                <Link
                  href={`/location-types/add${companyId ? `?companyId=${companyId}` : ""}`}
                  className="rounded-lg bg-orange-300 px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  + Add Tree Hierarchy
                </Link>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search zones or locations..."
                className="w-full rounded-xl border border-border bg-background py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Table Card */}
          <div className="rounded-2xl bg-background shadow-sm border border-border overflow-hidden">

            {!showTree ? (
              <table className="w-full">
                <thead className="bg-muted/40">
                  <tr className="text-xs text-muted-foreground">
                    <th className="px-6 py-3 text-left"># ID</th>
                    <th className="px-6 py-3 text-left">ZONE NAME</th>
                    <th className="px-6 py-3 text-left">PARENT HIERARCHY</th>
                    <th className="px-6 py-3 text-center">MAP VIEW</th>
                    <th className="px-6 py-3 text-center">ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTypes.map((type) => (
                    <tr
                      key={type.id}
                      className="border-t border-border/50 hover:bg-muted/30"
                    >
                      <td className="px-6 py-4 text-sm">#{type.id}</td>

                      <td className="px-6 py-4 text-sm font-medium">
                        {type.name}
                      </td>

                      <td className="px-6 py-4">
                        {type.parent_id ? (
                          <span className="inline-flex rounded-md bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
                            {parentName(type.parent_id)}
                          </span>
                        ) : (
                          <span className="inline-flex rounded-md bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
                            —
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-muted">
                          <MapPin className="h-4 w-4" />
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-3">
                          {canUpdate && (
                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/location-types/${type.id}${companyId ? `?companyId=${companyId}` : ""}`
                                )
                              }
                              className="h-9 w-9 rounded-full border border-blue-200 flex items-center justify-center text-blue-600 hover:bg-blue-50"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}

                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(type)}
                              className="h-9 w-9 rounded-full border border-red-200 flex items-center justify-center text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6">
                <TreeView
                  types={types}
                  onUpdate={() => {}}
                  flag={false}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>SAFAI PORTAL</span>
            <span className="text-primary font-medium">
              {filteredTypes.length} TOTAL ZONES REGISTERED
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
