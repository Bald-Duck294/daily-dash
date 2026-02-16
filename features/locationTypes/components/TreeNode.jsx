"use client";
import { useState } from "react";
import locationTypesApi from "@/features/locationTypes/locationTypes.api.js";

export default function TreeNode({
  type,
  onUpdate,
  allTypes = [],
  read = false,   // 👈 use this properly
}) {
  const [editName, setEditName] = useState(type.name);
  const [editParentId, setEditParentId] = useState(type.parent_id || "");
  const [isSaving, setIsSaving] = useState(false);

  const readonly = read; // 👈 single source of truth

  const handleSave = async () => {
    if (!onUpdate) return;

    setIsSaving(true);
    await locationTypesApi.update(type.id, {
      name: editName,
      parent_id: editParentId || null,
    });
    setIsSaving(false);
    onUpdate();
  };

  return (
    <div className="ml-4 mt-2 border-l border-slate-300 dark:border-slate-700 pl-3">
      {readonly ? (
        // ✅ Read-Only View
        <div className="flex gap-2 items-center py-1">
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {type.name}
          </span>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            [ID: {type.id}]
          </span>

          {type.is_toilet && (
            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              (Toilet Type)
            </span>
          )}
        </div>
      ) : (
        // ✅ Edit Mode
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 py-1">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            ID: {type.id}
          </span>

          <input
            className="
          px-2 py-1 rounded-md w-48 text-sm
          border border-slate-300 bg-white text-slate-800
          focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none

          dark:bg-slate-800
          dark:border-slate-700
          dark:text-slate-200
          dark:focus:border-cyan-400
          dark:focus:ring-cyan-400/20
        "
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />

          <select
            value={editParentId || ""}
            onChange={(e) => setEditParentId(e.target.value)}
            className="
          px-2 py-1 rounded-md text-sm
          border border-slate-300 bg-white text-slate-800
          focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none

          dark:bg-slate-800
          dark:border-slate-700
          dark:text-slate-200
          dark:focus:border-cyan-400
          dark:focus:ring-cyan-400/20
        "
          >
            <option value="">No Parent</option>
            {allTypes
              .filter((t) => t.id !== type.id)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
          </select>

          <button
            className="
          text-cyan-600 hover:text-cyan-700
          dark:text-cyan-400 dark:hover:text-cyan-300
          text-sm font-medium
        "
            onClick={handleSave}
            disabled={isSaving}
          >
            Save Changes
          </button>
        </div>
      )}

      {/* Children */}
      {type.children?.map((child) => (
        <TreeNode
          key={child.id}
          type={child}
          onUpdate={onUpdate}
          allTypes={allTypes}
          read={read}
        />
      ))}
    </div>

  );
}
