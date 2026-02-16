/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import CreateForm from "@/features/locationTypes/components/CreateForm";
import TreeView from "@/features/locationTypes/components/TreeView";
import { useLocationTypes } from "@/features/locationTypes/locationTypes.queries";
import { useCompanyId } from "@/providers/CompanyProvider";

import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { MODULES } from "@/shared/constants/permissions";

import {
  ArrowLeft,
  Layers,
  Network,
} from "lucide-react";

export default function AddLocationTypesPage() {
  useRequirePermission(MODULES.LOCATION_TYPES, { action: "add" });

  const { companyId } = useCompanyId();


  const {
    data: types = [],
    refetch,
  } = useLocationTypes(companyId);


  return (
    <>
      <Toaster position="top-right" />

      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* ===== PAGE HEADER ===== */}
          <div className="w-full">
            <div
              className="
      rounded-2xl
      border border-slate-200 dark:border-slate-800
      bg-white dark:bg-slate-900
      px-4 sm:px-6
      py-4 sm:py-5
      shadow-sm
    "
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                {/* LEFT SIDE */}
                <div className="flex items-start gap-3">

                  {/* Icon */}
                  <div
                    className="
            h-9 w-9 sm:h-10 sm:w-10
            rounded-xl
            bg-indigo-500/10
            flex items-center justify-center
          "
                  >
                    <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500" />
                  </div>

                  {/* Text */}
                  <div>
                    <h1
                      className="
              text-base sm:text-lg
              font-semibold
              text-slate-900 dark:text-slate-100
            "
                    >
                      Add New Zone Type
                    </h1>

                    <p
                      className="
              mt-1
              text-[10px] sm:text-xs
              uppercase tracking-widest
              text-slate-500 dark:text-slate-400
            "
                    >
                      Configure Workspace Architecture
                    </p>
                  </div>
                </div>

                {/* RIGHT SIDE - Back Button */}
                <button
                  onClick={() => router.push("/location-types")}
                  className="
          self-start sm:self-auto
          rounded-lg
          border border-orange-400
          px-4 py-2
          text-xs sm:text-sm
          font-medium
          text-orange-500
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

          {/* ===== MAIN CONTENT ===== */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* ===== LEFT: FORM CARD ===== */}
            <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Layers className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">
                    Zone Configuration
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Define a new zone classification
                  </p>
                </div>
              </div>

              {/* FORM */}
              <CreateForm onCreated={refetch} allTypes={types} />

            </div>

            {/* ===== RIGHT: ARCHITECTURE CARD ===== */}
            <div className="rounded-2xl border border-border bg-background shadow-sm">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Network className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">
                      Architecture
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Hierarchical Map
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <TreeView
                  types={types}
                  onUpdate={refetch}
                  flag={true}
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
