"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

import TreeView from "@/features/locationTypes/components/TreeView";
import { VisualArchitectureMap } from "@/features/locationTypes/components/VisualArchitectureMap";
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
  Network,
  Maximize2,
  X,
  Layers,
  Building2,
} from "lucide-react";

export default function LocationTypesPage() {
  useRequirePermission(MODULES.LOCATION_TYPES);

  const router = useRouter();
  const { companyId } = useCompanyId();
  const { canAdd, canUpdate, canDelete } = usePermissions();

  const [viewMode, setViewMode] = useState("map"); // Default directly to Architecture Hierarchical Map
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, type: null });
  const [search, setSearch] = useState("");

  /* =======================
     TanStack Query
  ======================= */

  const { data: types = [], isLoading: loading } = useLocationTypes(companyId);

  const hierarchicalTypes = useMemo(() => {
    if (!types || !Array.isArray(types)) return [];

    const tree = [];
    const lookup = {};

    types.forEach((item) => {
      const direct =
        item.nodesCount ??
        item.locationsCount ??
        item.locations_count ??
        item._count?.locations ??
        0;
      lookup[item.id] = {
        ...item,
        children: [],
        directNodesCount: direct,
        nodesCount: direct,
        totalNodesCount: direct,
      };
    });

    types.forEach((item) => {
      if (item.parent_id && lookup[item.parent_id]) {
        lookup[item.parent_id].children.push(lookup[item.id]);
      } else {
        tree.push(lookup[item.id]);
      }
    });

    // Rollup child nodes count recursively for parent zones
    const rollupCounts = (node) => {
      let sum = node.directNodesCount || 0;
      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => {
          sum += rollupCounts(child);
        });
      }
      node.totalNodesCount = sum;
      node.nodesCount = sum;
      return sum;
    };

    tree.forEach(rollupCounts);

    return tree;
  }, [types]);

  const totalFacilityNodes = useMemo(() => {
    if (!types || !Array.isArray(types)) return 0;
    return types.reduce(
      (acc, t) =>
        acc +
        (t.locationsCount ||
          t.locations_count ||
          t.nodesCount ||
          t._count?.locations ||
          0),
      0,
    );
  }, [types]);

  const deleteMutation = useDeleteLocationType(companyId);
  const updateMutation = useUpdateLocationType(companyId);

  /* =======================
     Derived data (NO UI change)
  ======================= */

  const filteredTypes = !search.trim()
    ? types
    : types.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

  const hasChildren = (typeId) => types.some((t) => t.parent_id === typeId);

  const parentName = (id) => types.find((t) => t.id === id)?.name || "—";

  /* =======================
     Delete logic
  ======================= */

  const handleDeleteClick = (type) => {
    setDeleteModal({ open: true, type });
  };

  const confirmDelete = async () => {
    if (!deleteModal.type) return;

    const { id, name } = deleteModal.type;

    if (hasChildren(id)) {
      toast.error(
        "Cannot delete location hierarchy with child hierarchy. Delete children first.",
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
     Update logic
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

      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header Card */}
          <div
            className="
              rounded-2xl bg-background shadow-sm border border-border p-4 sm:p-5
              flex flex-col gap-4
              sm:flex-row sm:items-center sm:justify-between
            "
          >
            {/* Left section */}
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FolderTree className="h-5 w-5 text-primary" />
              </div>

              <div>
                <h1 className="text-base sm:text-lg font-semibold">
                  Location Hierarchy
                </h1>
                <p className="text-[11px] sm:text-xs text-muted-foreground uppercase">
                  Architecture Hierarchy & Organization Structure
                </p>
              </div>
            </div>

            {/* Right section (view switcher & actions) */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* View Switcher Pills */}
              <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-border">
                <button
                  type="button"
                  onClick={() => setViewMode("map")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === "map"
                      ? "bg-white dark:bg-slate-900 text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Network className="h-3.5 w-3.5" />
                  Map View
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === "table"
                      ? "bg-white dark:bg-slate-900 text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                  Table View
                </button>
              </div>

              {canAdd && (
                <Link
                  href={`/location-types/add${companyId ? `?companyId=${companyId}` : ""}`}
                  className="
                    rounded-lg bg-orange-400 hover:bg-orange-500 text-white
                    px-4 py-2 text-xs sm:text-sm font-semibold text-center
                    transition-colors flex items-center gap-1.5 shadow-sm
                  "
                >
                  <Plus className="h-4 w-4" /> Add Tree Hierarchy
                </Link>
              )}
            </div>
          </div>

          {/* ================= MAP VIEW (DEFAULT DIRECT LOAD) ================= */}
          {viewMode === "map" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Stats & Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-background border border-border shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                    <Layers size={13} /> {types.length} Zones
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                    <Building2 size={13} /> {totalFacilityNodes} Total Facility
                    Nodes
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFullScreen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border text-foreground hover:bg-muted transition-colors cursor-pointer"
                    title="Fullscreen Map"
                  >
                    <Maximize2 size={14} />
                    <span className="hidden sm:inline">Fullscreen</span>
                  </button>
                </div>
              </div>

              {/* The Interactive Visual Architecture Map */}
              <div className="rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/30 shadow-sm overflow-hidden h-[calc(100vh-270px)] min-h-[520px] relative">
                {loading ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : (
                  <VisualArchitectureMap data={hierarchicalTypes} />
                )}
              </div>
            </div>
          )}

          {/* ================= TABLE VIEW ================= */}
          {viewMode === "table" && (
            <div className="space-y-4 animate-in fade-in duration-200">
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
                {/* ================= DESKTOP TABLE ================= */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/40">
                      <tr className="text-xs text-muted-foreground">
                        <th className="px-6 py-3 text-left"># ID</th>
                        <th className="px-6 py-3 text-left">ZONE NAME</th>
                        <th className="px-6 py-3 text-left">
                          PARENT HIERARCHY
                        </th>
                        <th className="px-6 py-3 text-center">
                          FACILITY NODES
                        </th>
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
                            <span className="inline-flex items-center gap-1 font-semibold text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {type.nodesCount ||
                                type.locationsCount ||
                                type.locations_count ||
                                0}{" "}
                              Nodes
                            </span>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <Link
                              href={`/locations`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors"
                              title="View Locations"
                            >
                              <MapPin className="h-4 w-4" />
                            </Link>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-3">
                              {canUpdate && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    router.push(
                                      `/location-types/${type.id}${
                                        companyId
                                          ? `?companyId=${companyId}`
                                          : ""
                                      }`,
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
                </div>

                {/* ================= MOBILE CARDS ================= */}
                <div className="md:hidden divide-y divide-border">
                  {filteredTypes.map((type) => (
                    <div key={type.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            #{type.id}
                          </p>
                          <h3 className="font-medium">{type.name}</h3>
                        </div>

                        <Link
                          href={`/locations`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-muted"
                        >
                          <MapPin className="h-4 w-4" />
                        </Link>
                      </div>

                      <div className="flex items-center gap-2">
                        {type.parent_id ? (
                          <span className="inline-flex rounded-md bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
                            {parentName(type.parent_id)}
                          </span>
                        ) : (
                          <span className="inline-flex rounded-md bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
                            —
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 font-semibold text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {type.nodesCount ||
                            type.locationsCount ||
                            type.locations_count ||
                            0}{" "}
                          Nodes
                        </span>
                      </div>

                      <div className="flex gap-3 pt-2">
                        {canUpdate && (
                          <button
                            onClick={() =>
                              router.push(
                                `/location-types/${type.id}${
                                  companyId ? `?companyId=${companyId}` : ""
                                }`,
                              )
                            }
                            className="flex-1 rounded-lg border border-blue-200 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
                          >
                            Edit
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => handleDeleteClick(type)}
                            className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>SAFAI PORTAL</span>
                <span className="text-primary font-medium">
                  {filteredTypes.length} TOTAL ZONES REGISTERED
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl border border-border">
            <h3 className="text-lg font-semibold mb-2 text-foreground">
              Delete Location Hierarchy
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete{" "}
              <strong className="text-foreground">
                {deleteModal.type?.name}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, type: null })}
                className="rounded-lg px-4 py-2 text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors"
                disabled={deleteMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors flex items-center gap-2"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FULLSCREEN ARCHITECTURE MAP MODAL ================= */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                <Network className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-widest text-slate-800 dark:text-slate-100 uppercase">
                  Architecture Hierarchical Map
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Interactive hierarchical visualization of organization zones &
                  locations
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsFullScreen(false)}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title="Close Fullscreen"
            >
              <X size={22} />
            </button>
          </div>

          <div className="flex-1 relative bg-slate-50/50 dark:bg-slate-900/30 overflow-hidden min-h-[500px]">
            <VisualArchitectureMap data={hierarchicalTypes} />
          </div>
        </div>
      )}
    </>
  );
}
