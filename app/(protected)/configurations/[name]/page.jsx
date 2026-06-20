"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Globe,
  Building2,
  Copy,
  Edit3,
  Eye,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import { useCompanyId } from "@/providers/CompanyProvider";
import {
  useTemplatesByName,
  useUpdateConfigByName,
  useDeleteConfig,
} from "@/features/configurations/configurations.queries";

export default function TemplateManager() {
  const params = useParams();
  const router = useRouter();
  const configName = params.name;
  const { companyId } = useCompanyId();

  // Optimized fetch: Only returns Global + This Company's Override
  const { data: fetchedConfigs = [], isLoading } = useTemplatesByName(
    configName,
    companyId,
  );

  console.log(fetchedConfigs, "fetch configs");
  const { mutateAsync: updateConfig, isPending: isCopying } =
    useUpdateConfigByName();
  const { mutateAsync: deleteConfig, isPending: isDeleting } =
    useDeleteConfig();

  // Safe client-side split (No data leaks)
  const globalTemplates = fetchedConfigs.filter((c) => c.company_id === null);
  const companyOverrides = fetchedConfigs.filter((c) => c.company_id !== null);

  const handleCreateOverride = async (globalTemplate) => {
    if (!companyId) {
      toast.error("No active company selected to override.");
      return;
    }

    if (companyOverrides.length > 0) {
      toast.error("Company override already exists for this template.");
      return;
    }

    try {
      await updateConfig({
        name: configName,
        payload: {
          description: globalTemplate.description,
          notes: `Copied from Global Default (ID: ${globalTemplate.id})`,
          is_active: true,
        },
        companyId: companyId,
      });
      toast.success("Override created successfully.");
    } catch (error) {
      toast.error("Failed to create override.");
    }
  };

  const handleCreateBlank = async () => {
    if (!companyId) {
      toast.error("No active company selected.");
      return;
    }

    const blankState =
      configName === "LOCATION_ADDITIONAL_FEATURES"
        ? { type: "additional_features", version: 1, categories: [] }
        : { type: "usage_category", version: 1, categories: [] };

    try {
      await updateConfig({
        name: configName,
        payload: {
          description: blankState,
          notes: "Created from scratch",
          is_active: true,
        },
        companyId: companyId,
      });
      toast.success("Blank override created successfully.");
    } catch (error) {
      toast.error("Failed to create blank configuration.");
    }
  };

  const handleDelete = async (id) => {
    if (
      confirm(
        "Are you sure you want to delete this company override? This will revert the facility back to global defaults.",
      )
    ) {
      try {
        await deleteConfig(id);
        toast.success("Override deleted.");
      } catch (error) {
        toast.error("Failed to delete.");
      }
    }
  };

  if (isLoading) return <Loader size="large" message="Loading templates..." />;

  const ConfigCard = ({ config, isGlobal }) => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
      {isGlobal ? (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-400 to-slate-600" />
      ) : (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
      )}

      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${isGlobal ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"}`}
          >
            {isGlobal ? <Globe size={20} /> : <Building2 size={20} />}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">
              {isGlobal ? "System Default Template" : "Company Custom Version"}
            </h3>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">
              ID: #{config.id}
            </p>
          </div>
        </div>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${isGlobal ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}
        >
          {isGlobal ? "GLOBAL" : "COMPANY OVERRIDE"}
        </span>
      </div>

      <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
        {isGlobal ? (
          <>
            <button
              onClick={() =>
                router.push(
                  `/configurations/${configName}/editor?id=${config.id}&mode=view`,
                )
              }
              className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Eye size={14} /> View
            </button>
            <button
              onClick={() => handleCreateOverride(config)}
              disabled={isCopying}
              className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
            >
              <Copy size={14} /> Copy to Company
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleDelete(config.id)}
              disabled={isDeleting}
              className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
            >
              <Trash2 size={14} /> Delete
            </button>
            <button
              onClick={() =>
                router.push(
                  `/configurations/${configName}/editor?id=${config.id}&mode=edit`,
                )
              }
              className="px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 bg-cyan-600 text-white hover:bg-cyan-700 transition-colors shadow-sm"
            >
              <Edit3 size={14} /> Edit Override
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6 font-sans bg-slate-50 dark:bg-slate-950 transition-colors">
      <Toaster position="top-right" />
      <div className="max-w-[1200px] mx-auto w-full space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <button
            onClick={() => router.push("/configurations")}
            className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {configName.replace(/_/g, " ")}
            </h1>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mt-1">
              Template Management
            </p>
          </div>
        </div>

        {/* Global Section */}
        <div>
          <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Globe className="text-slate-400" size={16} /> Global Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {globalTemplates.length > 0 ? (
              globalTemplates.map((config) => (
                <ConfigCard key={config.id} config={config} isGlobal={true} />
              ))
            ) : (
              <div className="p-8 text-center text-sm text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                No global templates found.
              </div>
            )}
          </div>
        </div>

        {/* Company Section */}
        <div className="pt-6">
          <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Building2 className="text-amber-500" size={16} /> Company
            Configurations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {companyOverrides.length > 0 ? (
              companyOverrides.map((config) => (
                <ConfigCard key={config.id} config={config} isGlobal={false} />
              ))
            ) : (
              <div className="p-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50">
                <Building2
                  size={32}
                  className="mx-auto text-slate-300 dark:text-slate-600 mb-3"
                />
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                  No active overrides for this company.
                </p>
                <div className="flex items-center justify-center gap-4 mt-4">
                  <p className="text-xs text-slate-400">
                    Copy a Global Template above, or
                  </p>
                  <button
                    onClick={handleCreateBlank}
                    disabled={isCopying}
                    className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    Create From Scratch
                  </button>
                </div>  
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
