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
import TreeView from "@/features/locationTypes/components/TreeView";
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
        <div className="w-full">
          <div className="
    rounded-2xl border border-slate-200 dark:border-slate-800
    bg-white dark:bg-slate-900
    p-4 sm:p-5
    shadow-sm
  ">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              {/* Left Section */}
              <div className="flex items-start gap-3">
                <div className="
          h-9 w-9 sm:h-10 sm:w-10
          rounded-xl
          bg-orange-500/10
          flex items-center justify-center
        ">
                  <Pencil className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                </div>

                <div>
                  <h1 className="
            text-base sm:text-lg font-semibold
            text-slate-900 dark:text-slate-100
          ">
                    Edit Zone Type
                  </h1>

                  <p className="
            text-[10px] sm:text-xs
            uppercase tracking-widest
            text-slate-500 dark:text-slate-400
            mt-1
          ">
                    Configuration Portal • Workspace Management
                  </p>
                </div>
              </div>

              {/* Right Section */}
              <button
                onClick={() => router.push("/location-types")}
                className="
          w-full sm:w-auto
          text-sm font-medium
          rounded-xl
          border border-orange-400
          text-orange-500
          px-4 py-2
          transition-all
          hover:bg-orange-50
          dark:hover:bg-orange-500/10
        "
              >
                ← Back to List
              </button>

            </div>
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
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Zone Type Name <span className="text-rose-500">*</span>
                </label>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="
      w-full rounded-xl px-4 py-3 text-sm
      border border-slate-300 bg-white text-slate-800
      transition-all outline-none
      focus:ring-2 focus:ring-orange-400/20 focus:border-orange-500

      dark:bg-slate-800
      dark:border-slate-700
      dark:text-slate-200
      dark:focus:ring-orange-400/20
      dark:focus:border-orange-400
    "
                />
              </div>

              {/* Parent Type */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Parent Type
                  <span className="ml-1 text-slate-400 dark:text-slate-500 normal-case font-normal">
                    (Optional)
                  </span>
                </label>

                <div className="relative">
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="
        w-full appearance-none rounded-xl px-4 py-3 text-sm
        border border-slate-300 bg-white text-slate-800
        transition-all outline-none
        focus:ring-2 focus:ring-orange-400/20 focus:border-orange-500

        dark:bg-slate-800
        dark:border-slate-700
        dark:text-slate-200
        dark:focus:ring-orange-400/20
        dark:focus:border-orange-400
      "
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

                  <ChevronDown
                    className="
        absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2
        text-slate-400 dark:text-slate-500 pointer-events-none
      "
                  />
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
            <div className="p-2">
              <TreeView
                types={types}

                flag={true}          // read-only mode
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
