"use client";

import { useState } from "react";
import locationTypesApi from "@/features/locationTypes/locationTypes.api";
import { useCompanyId } from "@/providers/CompanyProvider";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Layers,
  Info,
  ChevronDown,
  RotateCcw,
  Save,
} from "lucide-react";

export default function CreateForm({ onCreated, allTypes }) {
  const { companyId } = useCompanyId();
  const router = useRouter();
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizeName = (value) =>
    value.trim().replace(/\s+/g, " ").toLowerCase();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Zone type name is required");
      return;
    }

    const duplicate = allTypes?.some((type) => {
      const sameLevel =
        (!parentId && !type.parent_id) ||
        (parentId && type.parent_id === Number(parentId));

      return sameLevel && normalizeName(type.name) === normalizeName(name);
    });

    if (duplicate) {
      toast.error("A zone with this name already exists at this level");
      return;
    }

    setIsSubmitting(true);
    const loading = toast.loading("Creating zone...");

    try {
      await locationTypesApi.create(
        {
          name: name.trim(),
          parent_id: parentId ? Number(parentId) : null,
        },
        companyId
      );

      toast.success("Zone created successfully", { id: loading });

      setName("");
      setParentId("");
      onCreated();
    } catch (err) {
      toast.error("Failed to create zone", { id: loading });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ===== FORM HEADER ===== */}
      {/* <div className="flex items-center gap-4 pb-4 border-b border-border">
        <div className="h-11 w-11 rounded-xl bg-indigo-100 flex items-center justify-center">
          <Layers className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold tracking-wide">
            ZONE CONFIGURATION
          </h3>
          <p className="text-xs text-muted-foreground uppercase">
            Define a new zone classification
          </p>
        </div>
      </div> */}

      {/* ===== ZONE NAME ===== */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase text-indigo-600">
          Zone Type Name <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Layers className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder=""
            disabled={isSubmitting}
            maxLength={100}
            className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
          />
        </div>
      </div>

      {/* ===== PARENT TYPE ===== */}
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
            disabled={isSubmitting}
            className="
        w-full appearance-none rounded-xl py-3 pl-4 pr-10 text-sm
        border border-slate-300 bg-white text-slate-800
        transition-all outline-none
        focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500
        disabled:opacity-60

        dark:bg-slate-800
        dark:border-slate-700
        dark:text-slate-200
        dark:focus:ring-cyan-400/20
        dark:focus:border-cyan-400
      "
          >
            <option value="">—</option>
            {allTypes?.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>

          <ChevronDown
            className="
        pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2
        text-slate-400 dark:text-slate-500
      "
          />
        </div>
      </div>


      {/* ===== INFO BOX ===== */}
      <div className="
  flex gap-4 rounded-xl p-4
  border border-emerald-200 bg-emerald-50
  dark:bg-emerald-900/20 dark:border-emerald-800
">
        <div className="
    flex-shrink-0 h-9 w-9 rounded-lg
    bg-emerald-100 dark:bg-emerald-800/40
    flex items-center justify-center
  ">
          <Info className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
            Functional Relationship Architecture
          </p>

          <p className="
      text-xs mt-1 leading-relaxed
      text-slate-600 dark:text-slate-400
    ">
            Establishing a parent organizes zones logically and enables better
            resource management across the registry.
          </p>
        </div>
      </div>


      {/* ===== ACTIONS ===== */}
      <div className="flex gap-4 pt-6">
        <button
          type="button"
          onClick={() => router.push("/location-types")}
          disabled={isSubmitting}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-400 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4" />
          Discard
        </button>

        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-300 to-orange-400 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          Create Zone
        </button>
      </div>
    </form>
  );
}
