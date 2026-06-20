/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";

import CreateForm from "@/features/locationTypes/components/CreateForm";
import { useLocationTypes } from "@/features/locationTypes/locationTypes.queries";
import { useCompanyId } from "@/providers/CompanyProvider";
import { useRouter } from "next/navigation";
import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { MODULES } from "@/shared/constants/permissions";

import {
  Layers,
  Network,
  Maximize2,
  X
} from "lucide-react";

import { VisualArchitectureMap } from "@/features/locationTypes/components/VisualArchitectureMap";

export default function AddLocationTypesPage() {
  useRequirePermission(MODULES.LOCATION_TYPES, { action: "add" });

  const { companyId } = useCompanyId();
  const router = useRouter();

  const [isFullScreen, setIsFullScreen] = useState(false);

  const { data: types = [], refetch } = useLocationTypes(companyId);

  const hierarchicalTypes = useMemo(() => {
    if (!types || !Array.isArray(types)) return [];

    const tree = [];
    const lookup = {};

    types.forEach((item) => {
      lookup[item.id] = { ...item, children: [] };
    });

    types.forEach((item) => {
      if (item.parent_id && lookup[item.parent_id]) {
        lookup[item.parent_id].children.push(lookup[item.id]);
      } else {
        tree.push(lookup[item.id]);
      }
    });

    return tree;
  }, [types]);

  return (
    <>
      <Toaster position="top-right" />

      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="w-full md:mt-[-35px]">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-5 py-2.5 sm:py-3 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 shrink-0 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <Layers className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="flex flex-col">
                    <h1 className="text-sm sm:text-base font-semibold leading-tight text-slate-900 dark:text-slate-100">
                      Add New Zone Type
                    </h1>
                    <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Configure Workspace Architecture
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/location-types")}
                  className="self-start sm:self-auto rounded-md border border-orange-400 px-3 py-1.5 text-xs font-medium text-orange-500 transition-all hover:bg-orange-50 dark:hover:bg-orange-500/10"
                >
                  ← Back to List
                </button>

              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 md:mt-[-15px]">
            <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Layers className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Zone Configuration</h2>
                  <p className="text-xs text-muted-foreground">
                    Define a new zone classification
                  </p>
                </div>
              </div>

              <CreateForm onCreated={refetch} allTypes={types} />
            </div>

            {/* Architecture Visual Map Card */}
            <div className="rounded-2xl border border-border bg-background shadow-sm overflow-hidden flex flex-col">
              <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-slate-50 dark:bg-slate-800/30">

                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
                    <Network className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold tracking-tight uppercase text-slate-900 dark:text-slate-100">
                      Architecture
                    </h2>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:block">
                      Hierarchical Map
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsFullScreen(true)}
                  className="p-1.5 rounded-lg text-slate-400 border border-transparent hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                  title="View Full Screen"
                >
                  <Maximize2 size={18} />
                </button>
              </div>

              {/* The interactive canvas component wrapper */}
              <div className="p-0 bg-slate-50/50 dark:bg-slate-900/20 relative flex-1 min-h-[400px]">
                <VisualArchitectureMap data={hierarchicalTypes} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Modal */}
      {isFullScreen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                <Network className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-sm font-bold tracking-widest text-slate-800 dark:text-slate-100 uppercase">
                Full Architecture Map
              </h2>
            </div>

            <button
              onClick={() => setIsFullScreen(false)}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 relative">
            <VisualArchitectureMap data={hierarchicalTypes} />
          </div>
        </div>
      )}
    </>
  );
}