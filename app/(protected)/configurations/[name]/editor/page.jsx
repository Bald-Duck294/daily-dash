"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Bot,
  Settings2,
  GripVertical,
  Lock,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import { useCompanyId } from "@/providers/CompanyProvider";
import {
  useConfigById,
  useUpdateConfigByName,
} from "@/features/configurations/configurations.queries";

const generateMachineKey = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_|_$)/g, "");

const INITIAL_METRICS_STATE = {
  type: "usage_category",
  version: 1,
  categories: [],
};

export default function ConfigurationEditor() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const configName = params.name;
  const configId = searchParams.get("id");
  const isViewMode = searchParams.get("mode") === "view";

  const { companyId } = useCompanyId();

  const { data: configRecord, isLoading } = useConfigById(configId);
  const { mutateAsync: updateConfig, isPending: isSaving } =
    useUpdateConfigByName();

  const [configData, setConfigData] = useState(INITIAL_METRICS_STATE);

  useEffect(() => {
    if (configRecord?.description) {
      setConfigData(configRecord.description);
    }
  }, [configRecord]);

  const handleSave = async () => {
    if (isViewMode) return;
    try {
      await updateConfig({
        name: configName,
        payload: { description: configData, is_active: true },
        companyId,
      });
      toast.success("Configuration saved successfully.");
      router.back();
    } catch (error) {
      toast.error(error.message || "Failed to save.");
    }
  };

  const modifyState = (modifierFn) => {
    if (isViewMode) return;
    setConfigData((prev) => modifierFn(prev));
  };

  const addCategory = () =>
    modifyState((prev) => ({
      ...prev,
      categories: [
        ...prev.categories,
        { id: "new_category", label: "New Category", entities: [] },
      ],
    }));

  const deleteCategory = (index) =>
    modifyState((prev) => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index),
    }));

  const updateCategory = (index, field, value) =>
    modifyState((prev) => {
      const newCats = [...prev.categories];
      newCats[index][field] = value;
      if (field === "label" && newCats[index].id.includes("new_category")) {
        newCats[index].id = generateMachineKey(value);
      }
      return { ...prev, categories: newCats };
    });

  const addEntity = (catIndex) =>
    modifyState((prev) => {
      const newCats = [...prev.categories];
      newCats[catIndex].entities.push({
        id: "new_entity",
        label: "New Entity",
        isAiScoringEnabled: false,
      });
      return { ...prev, categories: newCats };
    });

  const updateEntity = (catIndex, entIndex, field, value) =>
    modifyState((prev) => {
      const newCats = [...prev.categories];
      newCats[catIndex].entities[entIndex][field] =
        field === "id" ? generateMachineKey(value) : value;
      return { ...prev, categories: newCats };
    });

  const deleteEntity = (catIndex, entIndex) =>
    modifyState((prev) => {
      const newCats = [...prev.categories];
      newCats[catIndex].entities = newCats[catIndex].entities.filter(
        (_, i) => i !== entIndex,
      );
      return { ...prev, categories: newCats };
    });

  if (isLoading)
    return <Loader size="large" message="Loading configuration schema..." />;

  return (
    <div className="min-h-screen p-6 font-sans bg-slate-50 dark:bg-slate-950 transition-colors pb-24">
      <Toaster position="top-right" />
      <div className="max-w-[1000px] mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-4 z-20">
          <div className="flex items-center gap-5">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">
                  {configName.replace(/_/g, " ")}
                </h1>
                {isViewMode && (
                  <span className="flex items-center gap-1.5 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-[10px] px-2.5 py-1 rounded-md uppercase font-black tracking-widest">
                    <Lock size={12} /> Read Only
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1.5">
                Schema Builder & AI Rules
              </p>
            </div>
          </div>
          {!isViewMode && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-cyan-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-cyan-700 active:scale-95 disabled:opacity-50 transition-all"
            >
              <Save size={16} /> {isSaving ? "Saving..." : "Save Configuration"}
            </button>
          )}
        </div>

        {/* Editor Body */}
        <div className="space-y-6">
          {configData.categories.map((category, catIndex) => (
            <div
              key={catIndex}
              className="bg-white dark:bg-slate-900 border-y border-r border-l-4 border-l-cyan-500 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="bg-slate-50/50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-5 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <GripVertical
                    className="text-slate-300 dark:text-slate-600"
                    size={20}
                  />
                  <div className="grid grid-cols-2 gap-6 flex-1">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 mb-1 block">
                        Label (Display Name)
                      </label>
                      <input
                        value={category.label}
                        readOnly={isViewMode}
                        onChange={(e) =>
                          updateCategory(catIndex, "label", e.target.value)
                        }
                        className={`w-full px-4 py-2.5 rounded-xl text-sm font-bold outline-none transition-all ${
                          isViewMode
                            ? "bg-transparent border-transparent text-slate-900 dark:text-slate-100 px-0"
                            : "border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 mb-1 block">
                        Machine Key (ID)
                      </label>
                      <input
                        value={category.id}
                        readOnly={isViewMode}
                        onChange={(e) =>
                          updateCategory(catIndex, "id", e.target.value)
                        }
                        className={`w-full px-4 py-2.5 rounded-xl text-sm font-mono outline-none transition-all ${
                          isViewMode
                            ? "bg-cyan-50 dark:bg-cyan-900/20 border-transparent text-cyan-700 dark:text-cyan-400 font-bold"
                            : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 focus:border-cyan-500"
                        }`}
                      />
                    </div>
                  </div>
                </div>
                {!isViewMode && (
                  <button
                    onClick={() => deleteCategory(catIndex)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors ml-6"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="p-5 space-y-3 bg-white dark:bg-slate-900">
                {category.entities.map((entity, entIndex) => (
                  <div
                    key={entIndex}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${isViewMode ? "bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800" : "bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-cyan-300 shadow-sm"}`}
                  >
                    <div className="grid grid-cols-2 gap-4 flex-1">
                      <input
                        value={entity.label}
                        readOnly={isViewMode}
                        onChange={(e) =>
                          updateEntity(
                            catIndex,
                            entIndex,
                            "label",
                            e.target.value,
                          )
                        }
                        placeholder="Entity Label"
                        className={`w-full px-4 py-2 rounded-lg text-sm outline-none transition-all ${
                          isViewMode
                            ? "bg-transparent border-transparent text-slate-900 dark:text-slate-100 font-bold"
                            : "border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10"
                        }`}
                      />
                      <input
                        value={entity.id}
                        readOnly={isViewMode}
                        onChange={(e) =>
                          updateEntity(catIndex, entIndex, "id", e.target.value)
                        }
                        placeholder="machine_id"
                        className={`w-full px-4 py-2 rounded-lg text-sm font-mono outline-none transition-all ${
                          isViewMode
                            ? "bg-slate-100/50 dark:bg-slate-800 border-transparent text-slate-600 dark:text-slate-400 font-semibold"
                            : "border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 focus:border-cyan-500"
                        }`}
                      />
                    </div>

                    {/* Vibrant AI Toggle - Works perfectly in both modes */}
                    <div
                      onClick={() =>
                        !isViewMode &&
                        updateEntity(
                          catIndex,
                          entIndex,
                          "isAiScoringEnabled",
                          !entity.isAiScoringEnabled,
                        )
                      }
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider border transition-all select-none ${isViewMode ? "cursor-default" : "cursor-pointer hover:shadow-sm"} ${
                        entity.isAiScoringEnabled
                          ? "bg-cyan-50 dark:bg-cyan-900/30 border-cyan-200 dark:border-cyan-700 text-cyan-700 dark:text-cyan-400"
                          : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <Bot
                        size={16}
                        className={
                          entity.isAiScoringEnabled
                            ? "text-cyan-500 dark:text-cyan-400"
                            : "text-slate-400"
                        }
                      />
                      {entity.isAiScoringEnabled ? "AI Enabled" : "AI Disabled"}
                    </div>

                    {!isViewMode && (
                      <button
                        onClick={() => deleteEntity(catIndex, entIndex)}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}

                {!isViewMode && (
                  <button
                    onClick={() => addEntity(catIndex)}
                    className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest p-3 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-xl transition-colors mt-3 w-full border border-dashed border-cyan-200 dark:border-cyan-800 justify-center"
                  >
                    <Plus size={16} /> Add Entity
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {!isViewMode && (
          <button
            onClick={addCategory}
            className="w-full py-5 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all bg-white dark:bg-slate-900 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/10 shadow-sm"
          >
            <Settings2 size={20} /> Add New Category
          </button>
        )}
      </div>
    </div>
  );
}
