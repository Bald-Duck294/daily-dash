// app/configurations/[name]/editor/components/UsageCategoryEditor.jsx
"use client";

import React from "react";
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

const generateMachineKey = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_|_$)/g, "");

export default function UsageCategoryEditor({
  configData,
  setConfigData,
  configName,
  isViewMode,
  handleSave,
  isSaving,
  router,
}) {
  const modifyState = (modifierFn) => {
    if (!isViewMode) setConfigData((prev) => modifierFn(prev));
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
      if (field === "label" && newCats[index].id.includes("new_category"))
        newCats[index].id = generateMachineKey(value);
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

  return (
    <div className="min-h-screen p-4 sm:p-6 font-sans bg-slate-50 dark:bg-slate-950 transition-colors pb-24">
      <div className="max-w-[1000px] mx-auto w-full">
        {/* Header - Slimmed down, non-sticky */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white dark:bg-slate-900 px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors cursor-pointer active:scale-95"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                  {configName.replace(/_/g, " ")}
                </h1>
                {isViewMode && (
                  <span className="flex items-center gap-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-widest">
                    <Lock size={12} /> Read Only
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium mt-0.5">
                Schema Builder & AI Rules
              </p>
            </div>
          </div>
          {!isViewMode && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto flex justify-center items-center gap-2 bg-cyan-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-cyan-700 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Save size={16} /> {isSaving ? "Saving..." : "Save Configuration"}
            </button>
          )}
        </div>

        {/* Editor Body - Increased spacing between categories */}
        <div className="space-y-8">
          {(configData.categories || []).map((category, catIndex) => (
            <div
              key={catIndex}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden"
            >
              {/* Category Header Section */}
              <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 w-full">
                  <GripVertical
                    className="text-slate-400 hidden sm:block cursor-grab"
                    size={20}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 w-full">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 mb-1 block">
                        Label (Display Name)
                      </label>
                      <input
                        value={category.label}
                        readOnly={isViewMode}
                        onChange={(e) =>
                          updateCategory(catIndex, "label", e.target.value)
                        }
                        className={`w-full px-3 py-2 rounded-lg text-sm font-bold outline-none transition-all ${isViewMode ? "bg-transparent border-transparent text-slate-900 dark:text-slate-100 px-0" : "border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"}`}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 mb-1 block">
                        Machine Key (ID)
                      </label>
                      <input
                        value={category.id}
                        readOnly={isViewMode}
                        onChange={(e) =>
                          updateCategory(catIndex, "id", e.target.value)
                        }
                        className={`w-full px-3 py-2 rounded-lg text-sm font-mono outline-none transition-all ${isViewMode ? "bg-slate-100 dark:bg-slate-900 border-transparent text-slate-600 dark:text-slate-400" : "border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"}`}
                      />
                    </div>
                  </div>
                </div>
                {!isViewMode && (
                  <button
                    onClick={() => deleteCategory(catIndex)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors cursor-pointer self-end sm:self-center"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              {/* Entities Section */}
              <div className="p-4 sm:p-5 space-y-3 bg-white dark:bg-slate-900">
                {category.entities.map((entity, entIndex) => (
                  <div
                    key={entIndex}
                    className={`flex flex-col sm:flex-row sm:items-center gap-4 p-3 rounded-xl transition-colors ${isViewMode ? "bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800" : "bg-white border border-slate-200 dark:border-slate-700 hover:border-cyan-300"}`}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 w-full">
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
                        placeholder="Entity Label (e.g. WC)"
                        className={`w-full px-3 py-2 rounded-lg text-sm outline-none transition-all ${isViewMode ? "bg-transparent border-transparent text-slate-900 dark:text-slate-100 font-bold" : "border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"}`}
                      />
                      <input
                        value={entity.id}
                        readOnly={isViewMode}
                        onChange={(e) =>
                          updateEntity(catIndex, entIndex, "id", e.target.value)
                        }
                        placeholder="machine_id"
                        className={`w-full px-3 py-2 rounded-lg text-sm font-mono outline-none transition-all ${isViewMode ? "bg-slate-100/50 dark:bg-slate-800 border-transparent text-slate-600 dark:text-slate-400 font-medium" : "border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 focus:border-cyan-500"}`}
                      />
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
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
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider border transition-all select-none ${isViewMode ? "cursor-default opacity-80" : "cursor-pointer hover:bg-slate-50 active:scale-95"} ${entity.isAiScoringEnabled ? "bg-cyan-50 dark:bg-cyan-900/30 border-cyan-200 dark:border-cyan-700 text-cyan-700 dark:text-cyan-400" : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"}`}
                      >
                        <Bot
                          size={16}
                          className={
                            entity.isAiScoringEnabled
                              ? "text-cyan-500 dark:text-cyan-400"
                              : "text-slate-400"
                          }
                        />
                        {entity.isAiScoringEnabled
                          ? "AI Enabled"
                          : "AI Disabled"}
                      </div>

                      {!isViewMode && (
                        <button
                          onClick={() => deleteEntity(catIndex, entIndex)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {!isViewMode && (
                  <button
                    onClick={() => addEntity(catIndex)}
                    className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest p-3 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-xl transition-colors mt-2 w-full border border-dashed border-cyan-200 dark:border-cyan-800 justify-center cursor-pointer active:scale-[0.99]"
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
            className="w-full py-4 mt-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all bg-white dark:bg-slate-900 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/10 cursor-pointer active:scale-[0.99]"
          >
            <Settings2 size={18} /> Add New Category
          </button>
        )}
      </div>
    </div>
  );
}
