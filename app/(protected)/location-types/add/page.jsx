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
          <div className="flex items-center gap-3">
            <button
              onClick={() => history.back()}
              className="rounded-md p-2 hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="flex-1 rounded-2xl border border-border bg-background px-6 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Layers className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <h1 className="text-lg font-semibold">
                    Add New Zone Type
                  </h1>
                  <p className="text-xs uppercase text-muted-foreground">
                    Configure Workspace Architecture
                  </p>
                </div>
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
