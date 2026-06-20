"use client";

import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Lock,
  GripVertical,
  Layers,
  ListPlus,
  Type,
  ToggleLeft,
  Hash,
  ListFilter,
  EyeOff,
  ListChecks,
  Settings2,
  X,
} from "lucide-react";

const sanitizeKey = (str) => str.replace(/[^a-zA-Z0-9_]+/g, "");
const generateMachineKey = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_|_$)/g, "");

export default function AdditionalFeaturesEditor({
  initialData,
  configName,
  isViewMode,
  companyId,
  updateConfig,
  isSaving,
  router,
}) {
  // ✅ 1. Initialize local state from the parent's prop
  const [configData, setConfigData] = useState(initialData);

  // ✅ 2. Handle save logic internally
  const handleSave = async () => {
    if (isViewMode) return;
    try {
      // Force correct type to bypass any legacy data issues
      const sanitizedConfigData = {
        ...configData,
        type: "additional_features",
      };

      await updateConfig({
        name: configName,
        payload: { description: sanitizedConfigData, is_active: true },
        companyId,
      });
      toast.success("Configuration saved successfully.");
      router.back();
    } catch (error) {
      toast.error(error.message || "Failed to save.");
    }
  };

  const modifyState = (modifierFn) => {
    if (!isViewMode) setConfigData((prev) => modifierFn(prev));
  };

  const addCategory = () =>
    modifyState((prev) => ({
      ...prev,
      categories: [
        ...prev.categories,
        {
          id: "new_category",
          label: "New Category",
          sortOrder: prev.categories.length + 1,
          fields: [],
        },
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

  const addField = (catIndex) =>
    modifyState((prev) => {
      const newCats = [...prev.categories];
      newCats[catIndex].fields.push({
        key: "newField",
        label: "New Field",
        type: "boolean",
        sortOrder: newCats[catIndex].fields.length + 1,
        defaultValue: false,
      });
      return { ...prev, categories: newCats };
    });

  const updateField = (catIndex, fieldIndex, key, value) =>
    modifyState((prev) => {
      const newCats = [...prev.categories];
      newCats[catIndex].fields[fieldIndex][key] =
        key === "key" ? sanitizeKey(value) : value;
      if (key === "type") {
        const f = newCats[catIndex].fields[fieldIndex];
        if (value === "boolean") f.defaultValue = false;
        if (value === "number") f.defaultValue = 0;
        if (value === "text") f.defaultValue = "";
        if (value === "select" || value === "multiselect") {
          f.defaultValue = null;
          if (!f.options) f.options = [{ label: "Option 1", value: "opt_1" }];
        }
      }
      return { ...prev, categories: newCats };
    });

  const deleteField = (catIndex, fieldIndex) =>
    modifyState((prev) => {
      const newCats = [...prev.categories];
      newCats[catIndex].fields = newCats[catIndex].fields.filter(
        (_, i) => i !== fieldIndex,
      );
      return { ...prev, categories: newCats };
    });

  const addOption = (catIndex, fieldIndex) =>
    modifyState((prev) => {
      const newCats = [...prev.categories];
      if (!newCats[catIndex].fields[fieldIndex].options)
        newCats[catIndex].fields[fieldIndex].options = [];
      newCats[catIndex].fields[fieldIndex].options.push({
        label: "New Option",
        value: "new_opt",
      });
      return { ...prev, categories: newCats };
    });

  const updateOption = (cIdx, fIdx, oIdx, key, val) =>
    modifyState((prev) => {
      const newCats = [...prev.categories];
      newCats[cIdx].fields[fIdx].options[oIdx][key] =
        key === "value" ? sanitizeKey(val) : val;
      return { ...prev, categories: newCats };
    });

  const deleteOption = (cIdx, fIdx, oIdx) =>
    modifyState((prev) => {
      const newCats = [...prev.categories];
      newCats[cIdx].fields[fIdx].options = newCats[cIdx].fields[
        fIdx
      ].options.filter((_, i) => i !== oIdx);
      return { ...prev, categories: newCats };
    });

  const toggleCondition = (cIdx, fIdx) =>
    modifyState((prev) => {
      const newCats = [...prev.categories];
      if (newCats[cIdx].fields[fIdx].visibleWhen)
        delete newCats[cIdx].fields[fIdx].visibleWhen;
      else newCats[cIdx].fields[fIdx].visibleWhen = { field: "", equals: true };
      return { ...prev, categories: newCats };
    });

  const getFieldIcon = (type) => {
    switch (type) {
      case "boolean":
        return <ToggleLeft size={16} className="text-indigo-500" />;
      case "number":
        return <Hash size={16} className="text-amber-500" />;
      case "text":
        return <Type size={16} className="text-emerald-500" />;
      case "select":
        return <ListFilter size={16} className="text-rose-500" />;
      case "multiselect":
        return <ListChecks size={16} className="text-blue-500" />;
      default:
        return <Layers size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 font-sans bg-slate-50 dark:bg-slate-950 transition-colors pb-24">
      <Toaster position="top-right" />
      <div className="max-w-[1100px] mx-auto w-full space-y-6">
        {/* Header */}
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
                Dynamic Features & Logic Editor
              </p>
            </div>
          </div>
          {!isViewMode && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto flex justify-center items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Save size={16} /> {isSaving ? "Saving..." : "Save Configuration"}
            </button>
          )}
        </div>

        {/* Editor Body */}
        <div className="space-y-8">
          {(configData.categories || [])
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((category, catIndex) => (
              <div
                key={catIndex}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden"
              >
                {/* Category Header */}
                <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 w-full">
                    <GripVertical
                      className="text-slate-400 hidden sm:block cursor-grab"
                      size={20}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 flex-1 w-full">
                      <div className="sm:col-span-5">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 mb-1 block">
                          Category Label
                        </label>
                        <input
                          value={category.label}
                          readOnly={isViewMode}
                          onChange={(e) =>
                            updateCategory(catIndex, "label", e.target.value)
                          }
                          className={`w-full px-3 py-2 rounded-lg text-sm font-bold outline-none transition-all ${isViewMode ? "bg-transparent border-transparent text-slate-900 dark:text-slate-100 px-0" : "border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"}`}
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 mb-1 block">
                          Machine ID
                        </label>
                        <input
                          value={category.id}
                          readOnly={isViewMode}
                          onChange={(e) =>
                            updateCategory(catIndex, "id", e.target.value)
                          }
                          className={`w-full px-3 py-2 rounded-lg text-sm font-mono outline-none transition-all ${isViewMode ? "bg-slate-100 dark:bg-slate-900 border-transparent text-slate-600 dark:text-slate-400" : "border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 focus:border-indigo-500"}`}
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 mb-1 block">
                          Sort Order
                        </label>
                        <input
                          type="number"
                          value={category.sortOrder}
                          readOnly={isViewMode}
                          onChange={(e) =>
                            updateCategory(
                              catIndex,
                              "sortOrder",
                              Number(e.target.value),
                            )
                          }
                          className={`w-full px-3 py-2 rounded-lg text-sm outline-none transition-all ${isViewMode ? "bg-transparent border-transparent text-slate-900 dark:text-slate-100 px-0" : "border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 focus:border-indigo-500"}`}
                        />
                      </div>
                    </div>
                  </div>
                  {!isViewMode && (
                    <button
                      onClick={() => deleteCategory(catIndex)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors self-end sm:self-center cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                {/* Fields List */}
                <div className="p-4 sm:p-5 space-y-4 bg-white dark:bg-slate-900">
                  {(category.fields || [])
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((field, fieldIndex) => (
                      <div
                        key={fieldIndex}
                        className="bg-white border border-slate-200 dark:border-slate-700 rounded-xl p-4 transition-all shadow-sm hover:border-indigo-300"
                      >
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                          <div className="mt-2 hidden sm:block p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                            {getFieldIcon(field.type)}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 flex-1 w-full">
                            <div className="sm:col-span-4">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1 block mb-1">
                                Field Label
                              </label>
                              <input
                                value={field.label}
                                readOnly={isViewMode}
                                onChange={(e) =>
                                  updateField(
                                    catIndex,
                                    fieldIndex,
                                    "label",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-3 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1 block mb-1">
                                camelCase_Key
                              </label>
                              <input
                                value={field.key}
                                readOnly={isViewMode}
                                onChange={(e) =>
                                  updateField(
                                    catIndex,
                                    fieldIndex,
                                    "key",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-3 py-2 rounded-lg text-sm font-mono border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1 block mb-1">
                                Data Type
                              </label>
                              <div className="flex items-center gap-2">
                                <span className="sm:hidden">
                                  {getFieldIcon(field.type)}
                                </span>
                                <select
                                  disabled={isViewMode}
                                  value={field.type}
                                  onChange={(e) =>
                                    updateField(
                                      catIndex,
                                      fieldIndex,
                                      "type",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full px-3 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 disabled:opacity-70 cursor-pointer"
                                >
                                  <option value="boolean">Boolean</option>
                                  <option value="number">Number</option>
                                  <option value="text">Text (String)</option>
                                  <option value="select">Dropdown</option>
                                  <option value="multiselect">
                                    Multi-Select
                                  </option>
                                </select>
                              </div>
                            </div>
                            <div className="sm:col-span-2 flex items-end gap-2">
                              <div className="flex-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1 block mb-1">
                                  Order
                                </label>
                                <input
                                  type="number"
                                  value={field.sortOrder}
                                  readOnly={isViewMode}
                                  onChange={(e) =>
                                    updateField(
                                      catIndex,
                                      fieldIndex,
                                      "sortOrder",
                                      Number(e.target.value),
                                    )
                                  }
                                  className="w-full px-3 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
                                />
                              </div>
                              {!isViewMode && (
                                <button
                                  onClick={() =>
                                    deleteField(catIndex, fieldIndex)
                                  }
                                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer mb-0.5"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="sm:pl-14 mt-4 space-y-4 border-t sm:border-t-0 border-slate-100 dark:border-slate-700 pt-4 sm:pt-0">
                          {["select", "multiselect"].includes(field.type) && (
                            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 rounded-xl p-4">
                              <h4 className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <ListChecks size={14} /> Selection Options
                              </h4>
                              <div className="space-y-2">
                                {(field.options || []).map((opt, optIdx) => (
                                  <div
                                    key={optIdx}
                                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3"
                                  >
                                    <input
                                      value={opt.label}
                                      readOnly={isViewMode}
                                      onChange={(e) =>
                                        updateOption(
                                          catIndex,
                                          fieldIndex,
                                          optIdx,
                                          "label",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Display Label"
                                      className="w-full sm:flex-1 px-3 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                                    />
                                    <div className="flex w-full sm:flex-1 gap-2">
                                      <input
                                        value={opt.value}
                                        readOnly={isViewMode}
                                        onChange={(e) =>
                                          updateOption(
                                            catIndex,
                                            fieldIndex,
                                            optIdx,
                                            "value",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="data_value"
                                        className="flex-1 px-3 py-1.5 text-xs font-mono rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 outline-none focus:border-indigo-500"
                                      />
                                      {!isViewMode && (
                                        <button
                                          onClick={() =>
                                            deleteOption(
                                              catIndex,
                                              fieldIndex,
                                              optIdx,
                                            )
                                          }
                                          className="text-slate-400 hover:text-rose-500 p-1 bg-white border border-slate-200 rounded cursor-pointer"
                                        >
                                          <X size={14} />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                {!isViewMode && (
                                  <button
                                    onClick={() =>
                                      addOption(catIndex, fieldIndex)
                                    }
                                    className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider hover:underline mt-2 cursor-pointer"
                                  >
                                    + Add Option
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                            <div
                              onClick={() =>
                                !isViewMode &&
                                toggleCondition(catIndex, fieldIndex)
                              }
                              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-colors select-none ${isViewMode ? "cursor-default opacity-80" : "cursor-pointer hover:bg-slate-50 active:scale-95"} ${field.visibleWhen ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"}`}
                            >
                              <EyeOff
                                size={14}
                                className={
                                  field.visibleWhen
                                    ? "text-amber-500"
                                    : "text-slate-400"
                                }
                              />
                              {field.visibleWhen
                                ? "Conditional Visibility On"
                                : "Add Visibility Condition"}
                            </div>
                            {field.visibleWhen && (
                              <div className="flex flex-wrap items-center gap-2 flex-1 bg-amber-50/50 dark:bg-amber-900/10 p-2 sm:p-3 rounded-lg border border-amber-100 dark:border-amber-800/30">
                                <span className="text-xs font-medium text-amber-700 dark:text-amber-400 sm:ml-2">
                                  Show IF:
                                </span>
                                <input
                                  placeholder="target_key"
                                  value={field.visibleWhen.field}
                                  readOnly={isViewMode}
                                  onChange={(e) =>
                                    modifyState((p) => {
                                      p.categories[catIndex].fields[
                                        fieldIndex
                                      ].visibleWhen.field = sanitizeKey(
                                        e.target.value,
                                      );
                                      return { ...p };
                                    })
                                  }
                                  className="w-28 sm:w-32 px-2 py-1.5 text-xs font-mono rounded border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 outline-none text-slate-700 dark:text-slate-200 focus:border-amber-500"
                                />
                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500">
                                  EQUALS
                                </span>
                                <select
                                  disabled={isViewMode}
                                  value={String(field.visibleWhen.equals)}
                                  onChange={(e) =>
                                    modifyState((p) => {
                                      const val = e.target.value;
                                      p.categories[catIndex].fields[
                                        fieldIndex
                                      ].visibleWhen.equals =
                                        val === "true"
                                          ? true
                                          : val === "false"
                                            ? false
                                            : val;
                                      return { ...p };
                                    })
                                  }
                                  className="w-24 px-2 py-1.5 text-xs rounded border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 outline-none text-slate-700 dark:text-slate-200 focus:border-amber-500 cursor-pointer"
                                >
                                  <option value="true">True</option>
                                  <option value="false">False</option>
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  {!isViewMode && (
                    <button
                      onClick={() => addField(catIndex)}
                      className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest p-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors mt-2 w-full border border-dashed border-indigo-200 dark:border-indigo-800/50 justify-center cursor-pointer active:scale-[0.99]"
                    >
                      <ListPlus size={16} /> Add New Field
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
