"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { useCompanyId } from "@/providers/CompanyProvider";
import {
  useLocationTypes,
  useUpdateLocationType,
} from "@/features/locationTypes/locationTypes.queries";

import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { MODULES } from "@/shared/constants/permissions";

import { ArrowLeft, Pencil, ChevronDown, Loader2, Network } from "lucide-react";

export default function EditLocationTypePage() {
  const allowed = useRequirePermission(MODULES.LOCATION_TYPES, {
    action: "update",
  });

  const { id } = useParams();
  const router = useRouter();
  const { companyId } = useCompanyId();

  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [saving, setSaving] = useState(false);

  /* ================= QUERY ================= */

  const { data: types = [], isLoading: loading } = useLocationTypes(companyId);

  console.log(types, "types from edit ");
  const updateMutation = useUpdateLocationType(companyId);

  const current = types.find((t) => String(t.id) === String(id));

  console.log(current, "current ");
  useEffect(() => {
    if (!current) return;
    setName(current.name);
    setParentId(current.parent_id ?? "");
  }, [current]);

  console.log();
  /* ================= UPDATE ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Zone name is required");
      return;
    }

    if (String(parentId) === String(id)) {
      toast.error("Zone cannot be its own parent");
      return;
    }

    setSaving(true);
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          name: name.trim(),
          parent_id: parentId || null,
        },
      });

      toast.success("Zone updated successfully");
      router.push("/location-types");
    } catch {
      toast.error("Failed to update zone");
    } finally {
      setSaving(false);
    }
  };

  // if (!allowed) {
  //   return (
  //     <Loader2 className="h-8 w-8 animate-spin text-primary text-center" />
  //   );
  // }

  if (loading || !current) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* ===== HEADER ===== */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-md p-2 hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex-1 rounded-2xl border border-border bg-background p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Pencil className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Edit Zone Type</h1>
                <p className="text-xs uppercase text-muted-foreground">
                  Configuration Portal • Workspace Management
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push("/location-types")}
              className="rounded-lg border border-orange-400 px-4 py-2 text-sm font-medium text-orange-500 hover:bg-orange-50"
            >
              ← Back to List
            </button>
          </div>
        </div>

        {/* ===== CONTENT ===== */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ===== FORM ===== */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-background shadow-sm overflow-hidden">
            {/* Accent */}
            <div className="h-1 bg-gradient-to-r from-orange-300 to-orange-400" />

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Zone Name */}
              <div>
                <label className="text-xs font-semibold uppercase text-orange-500">
                  Zone Type Name *
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {/* Parent */}
              <div>
                <label className="text-xs font-semibold uppercase text-orange-500">
                  Parent Type (Optional)
                </label>

                <div className="relative mt-2">
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-border bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="">No Parent (Top Level)</option>
                    {types
                      .filter((t) => t.id !== current.id)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 rounded-xl border border-border py-3 text-sm font-medium hover:bg-muted"
                  disabled={saving}
                >
                  ✕ Discard Changes
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-gradient-to-r from-orange-300 to-orange-400 py-3 text-sm font-semibold text-white hover:opacity-90"
                >
                  {saving ? "Updating..." : "Update Zone Details"}
                </button>
              </div>
            </form>
          </div>

          {/* ===== TOPOLOGY ===== */}
          <div className="rounded-2xl border border-border bg-background shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Network className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Zone Topology</h3>
                <p className="text-xs text-muted-foreground">
                  Live Relationship Map
                </p>
              </div>
            </div>

            {/* Simple preview */}
            <div className="space-y-3">
              <div className="rounded-xl border border-border px-4 py-2 text-sm font-medium">
                {current.name}
                <span className="ml-2 text-xs text-muted-foreground">
                  #{current.id}
                </span>
              </div>

              {types
                .filter((t) => t.parent_id === current.id)
                .map((child) => (
                  <div
                    key={child.id}
                    className="ml-4 rounded-xl bg-emerald-50 px-4 py-2 text-sm"
                  >
                    {child.name}
                    <span className="ml-2 text-xs text-muted-foreground">
                      #{child.id}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
