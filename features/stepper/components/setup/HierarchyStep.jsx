/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useMemo, useRef } from "react";
import LiveFlowchart from "@/features/stepper/components/ui/LiveFlowchart";
import StepHelpDrawer from "@/features/stepper/components/ui/StepHelpDrawer";
import { generateTempId, buildTreeData } from "../../utils/hierarchyUtils";
import { getTemplatesForStructure } from "../../utils/hierarchyTemplates";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Check,
  LayoutTemplate,
  X,
  RotateCcw,
  PencilLine,
  Plus,
  Trash2,
} from "lucide-react";

const nodeTypes = {
  building: { label: "Building / Block", icon: "🏢" },
  floor:    { label: "Floor",            icon: "📋" },
  zone:     { label: "Zone",             icon: "📍" },
  ward:     { label: "Ward",             icon: "🏥" },
};

/* ====================================================================
   TEMPLATE CARD — used in both primary list & Browse modal
   ==================================================================== */
function TemplateCard({ template, isSelected, isRecommended, onApply, compact = true }) {
  return (
    <button
      type="button"
      onClick={() => onApply(template)}
      className={[
        "relative w-full text-left rounded-xl border-2 transition-all duration-200 group flex items-start gap-2.5 p-2.5",
        isSelected
          ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 dark:border-blue-500 shadow-sm"
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm",
      ].join(" ")}
    >
      <span className="text-xl shrink-0 leading-none mt-0.5">{template.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 truncate">
            {template.label}
          </h4>
          <div className="flex items-center gap-1 shrink-0">
            {isRecommended && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700">
                ★ Best match
              </span>
            )}
            {isSelected && (
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 dark:bg-blue-500 text-white shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            )}
          </div>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight truncate">
          {template.desc}
        </p>
        {template.stats && (
          <div className="mt-1 flex items-center gap-1">
            <span className="inline-flex items-center text-[9px] font-medium px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400">
              {template.stats.levels} levels · {template.stats.areas} areas
            </span>
          </div>
        )}
      </div>
    </button>
  );
}

/* ====================================================================
   BROWSE ALL MODAL
   ==================================================================== */
function BrowseTemplatesModal({ allTemplates, activeTemplateId, onApply, onClose }) {
  const [activeTab, setActiveTab] = useState(Object.keys(allTemplates)[0]);
  const tabs = Object.keys(allTemplates);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal panel */}
      <div
        className="relative w-full sm:max-w-2xl bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Browse All Presets</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-3 shrink-0 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                "shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                activeTab === tab
                  ? "bg-blue-600 dark:bg-blue-500 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700",
              ].join(" ")}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="overflow-y-auto flex-1 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(allTemplates[activeTab] || []).map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={activeTemplateId === template.id}
                isRecommended={false}
                compact={true}
                onApply={(t) => { onApply(t); onClose(); }}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
            Applying a preset will replace your current hierarchy. You can still customize nodes after applying.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ====================================================================
   MAIN COMPONENT
   ==================================================================== */
export default function HierarchyStep({
  onNext,
  onBack,
  onChange,
  nodes = [],
  isDraftLoaded = false,
  companyProfile = {},
}) {
  const structure =
    companyProfile?.operation_structure ||
    companyProfile?.onboarding_metadata?.operation_structure ||
    companyProfile?.metadata?.operation_structure ||
    "";

  const orgType =
    companyProfile?.organization_type ||
    companyProfile?.onboarding_metadata?.organization_type ||
    companyProfile?.metadata?.organization_type ||
    "";

  const { recommended, primary, allTemplates } = useMemo(
    () => getTemplatesForStructure(structure, orgType),
    [structure, orgType],
  );

  const [localNodes, setLocalNodes] = useState(() => {
    if (nodes && nodes.length > 0) return nodes;
    if (isDraftLoaded) return [];
    if (recommended) return recommended.buildNodes();
    return [];
  });

  const updateLocalNodes = (updated) => {
    setLocalNodes(updated);
    onChange?.(updated);
  };

  const [activeTemplateId, setActiveTemplateId] = useState(recommended?.id || "");
  const [editMode, setEditMode] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isBrowseOpen, setIsBrowseOpen] = useState(false);

  const hasAutoSelectedRef = useRef(false);

  useEffect(() => {
    if (!hasAutoSelectedRef.current) {
      if (nodes && nodes.length > 0) {
        setLocalNodes(nodes);
        hasAutoSelectedRef.current = true;
      } else if (isDraftLoaded) {
        setLocalNodes(nodes || []);
        hasAutoSelectedRef.current = true;
      } else if (recommended) {
        hasAutoSelectedRef.current = true;
        setActiveTemplateId(recommended.id);
        const generated = recommended.buildNodes();
        setLocalNodes(generated);
        onChange?.(generated);
      }
    }
  }, [recommended, nodes, isDraftLoaded, onChange]);

  const [formData, setFormData] = useState({
    name: "",
    type: "building",
    parent_temp_id: localNodes[0]?.temp_id || "root",
  });

  /* ── Node actions ─────────────────────────────────────────────── */
  const handleEditRequest = (nodeId) => {
    const n = localNodes.find((x) => x.temp_id === nodeId);
    if (!n) return;
    setFormData({ name: n.name, type: n.type, parent_temp_id: n.parent_temp_id || "root" });
    setEditMode(true);
    setEditingNodeId(nodeId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveNode = () => {
    if (!formData.name) return alert("Please enter a name for this location.");
    if (editMode && editingNodeId) {
      const updated = localNodes.map((n) =>
        n.temp_id === editingNodeId
          ? { ...n, name: formData.name, type: formData.type, parent_temp_id: formData.parent_temp_id === "root" ? null : formData.parent_temp_id }
          : n,
      );
      updateLocalNodes(updated);
      cancelEdit();
    } else {
      const newNode = {
        temp_id: generateTempId("node"),
        name: formData.name,
        type: formData.type,
        parent_temp_id: formData.parent_temp_id === "root" ? null : formData.parent_temp_id,
      };
      const updated = [...localNodes, newNode];
      updateLocalNodes(updated);
      setFormData({ ...formData, name: "" });
    }
  };

  const handleDeleteNode = () => {
    if (!editingNodeId) return;
    const nodeToDelete = localNodes.find((n) => n.temp_id === editingNodeId);
    if (!nodeToDelete) return;

    if (window.confirm(`Are you sure you want to delete "${nodeToDelete.name}"?`)) {
      const parentId = nodeToDelete.parent_temp_id;
      const updated = localNodes
        .filter((n) => n.temp_id !== editingNodeId)
        .map((n) =>
          n.parent_temp_id === editingNodeId ? { ...n, parent_temp_id: parentId } : n,
        );
      updateLocalNodes(updated);
      cancelEdit();
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditingNodeId(null);
    setFormData({ name: "", type: "building", parent_temp_id: localNodes[0]?.temp_id || "root" });
  };

  const handleReset = () => {
    if (window.confirm("Reset the entire hierarchy to a blank slate?")) {
      updateLocalNodes([]);
      setActiveTemplateId("scratch");
      setEditMode(false);
      setEditingNodeId(null);
      setFormData({ name: "", type: "building", parent_temp_id: "root" });
    }
  };

  const handleApplyTemplate = (template) => {
    if (localNodes.length > 0 && activeTemplateId && activeTemplateId !== template.id) {
      const ok = window.confirm(
        `Applying "${template.label}" will replace your current hierarchy. Continue?`,
      );
      if (!ok) return;
    }
    setActiveTemplateId(template.id);
    const generated = template.buildNodes();
    updateLocalNodes(generated);
    setFormData((prev) => ({ ...prev, parent_temp_id: generated[0]?.temp_id || "root" }));
    setEditMode(false);
  };

  const handleNext = () => {
    const validIds = new Set(localNodes.map((n) => n.temp_id));
    const sanitized = localNodes.map((n) => ({
      ...n,
      parent_temp_id: validIds.has(n.parent_temp_id) ? n.parent_temp_id : null,
    }));
    onNext(sanitized);
  };

  const parentOptions = localNodes
    .filter((n) => n.temp_id !== editingNodeId)
    .map((n) => ({ id: n.temp_id, name: n.name, type: n.type }));

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-24 md:pb-6 relative w-full">

      {/* ── Help Drawer ─────────────────────────────────────────────── */}
      <StepHelpDrawer isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} title="How Hierarchy Works">
        <div className="space-y-5 text-sm text-slate-600 dark:text-slate-400">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Step 1 — Top-Level Location</h3>
            <p>Start with your main building, campus, or headquarters. <strong className="text-slate-900 dark:text-slate-100">Don&apos;t assign a parent</strong> to this root node.</p>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Step 2 — Floors or Blocks</h3>
            <p>Add floors, wings, or blocks and set their parent to the building you just created.</p>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Step 3 — Zones or Wards</h3>
            <p>Add specific areas (Reception, OPD, Cafeteria) under the relevant floor or block.</p>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">💡 Tip</h3>
            <p>Use the preset templates above to auto-generate a relevant structure. You can always edit, add, or remove nodes after applying.</p>
          </div>
        </div>
      </StepHelpDrawer>

      {/* ── Browse All Modal ─────────────────────────────────────────── */}
      {isBrowseOpen && (
        <BrowseTemplatesModal
          allTemplates={allTemplates}
          activeTemplateId={activeTemplateId}
          onApply={handleApplyTemplate}
          onClose={() => setIsBrowseOpen(false)}
        />
      )}

      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-white dark:bg-slate-800 p-3.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div>
          <h1 className="text-lg md:text-xl font-black text-slate-900 dark:text-slate-100">Location Hierarchy</h1>
          <p className="text-xs mt-0.5 text-slate-500 dark:text-slate-400">
            Build the structural map of your facility. Customise directly from the map.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3.5 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 text-xs font-bold text-white px-5 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            Continue <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Preset Templates Section — Compact & Space-Efficient ─────── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-sm space-y-2">
        {/* Section header */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Recommended Presets
            {structure && (
              <span className="ml-1 text-[10px] font-semibold px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 normal-case tracking-normal">
                {structure}
              </span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700/60"
            >
              <RotateCcw className="w-3 h-3" />
              Start from scratch
            </button>
            <span className="text-slate-200 dark:text-slate-700">|</span>
            <button
              onClick={() => setIsBrowseOpen(true)}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950/40"
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              Browse all
            </button>
          </div>
        </div>

        {/* Primary preset cards — 2 cards max, side by side, compact height */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {primary.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={activeTemplateId === template.id}
              isRecommended={template.id === recommended?.id}
              onApply={handleApplyTemplate}
              compact={true}
            />
          ))}
        </div>
      </div>

      {/* ── Builder + Chart ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* Left: Form panel */}
        <div className="lg:col-span-4 space-y-3">
          <div
            className={[
              "bg-white dark:bg-slate-800 border rounded-xl p-4 md:p-5 shadow-sm space-y-4 transition-colors",
              editMode
                ? "border-blue-400 dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-950"
                : "border-slate-200 dark:border-slate-700",
            ].join(" ")}
          >
            {/* Form header */}
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                {editMode ? (
                  <><PencilLine className="w-3.5 h-3.5 text-blue-500" /> Edit Node</>
                ) : (
                  <><Plus className="w-3.5 h-3.5 text-slate-500" /> Add Location</>
                )}
              </h3>
              {editMode && (
                <button onClick={cancelEdit} className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-semibold">
                  Cancel
                </button>
              )}
            </div>

            {/* Name input */}
            <div>
              <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  const v = e.target.value;
                  const lc = v.toLowerCase();
                  let autoType = formData.type;
                  if (lc.includes("ward")) autoType = "ward";
                  else if (lc.includes("floor") || lc.includes("level")) autoType = "floor";
                  else if (lc.includes("zone") || lc.includes("area") || lc.includes("wing")) autoType = "zone";
                  else if (lc.includes("building") || lc.includes("block") || lc.includes("facility")) autoType = "building";
                  setFormData({ ...formData, name: v, type: autoType });
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSaveNode()}
                className="w-full border-[1.5px] border-slate-200 dark:border-slate-600 rounded-lg px-3 py-3 md:py-2 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                placeholder="e.g. Block A, Floor 1, OPD Ward"
              />
            </div>

            {/* Type select */}
            <div>
              <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full border-[1.5px] border-slate-200 dark:border-slate-600 rounded-lg px-3 py-3 md:py-2 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors"
              >
                {Object.entries(nodeTypes).map(([key, data]) => (
                  <option key={key} value={key}>
                    {data.icon} {data.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Parent select */}
            <div>
              <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Parent (Optional)
              </label>
              <select
                value={formData.parent_temp_id}
                onChange={(e) => setFormData({ ...formData, parent_temp_id: e.target.value })}
                className="w-full border-[1.5px] border-slate-200 dark:border-slate-600 rounded-lg px-3 py-3 md:py-2 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors"
              >
                <option value="root">— Root Level —</option>
                {parentOptions.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Save & Delete buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleSaveNode}
                className={[
                  "w-full text-white py-3 md:py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-sm",
                  editMode
                    ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    : "bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600",
                ].join(" ")}
              >
                {editMode ? "Save Changes" : "+ Add Location"}
              </button>

              {editMode && (
                <button
                  type="button"
                  onClick={handleDeleteNode}
                  className="w-full text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 py-2 rounded-lg font-semibold text-xs border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete this Location
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Live flowchart */}
        <div className="lg:col-span-8 flex flex-col h-full w-full">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm flex flex-col flex-1 min-h-[380px] lg:min-h-[500px] overflow-hidden relative">
            <div className="flex-1 bg-slate-50/50 dark:bg-slate-900/30 flex">
              <LiveFlowchart
                treeData={buildTreeData(localNodes)}
                isEditable={true}
                onEditNode={handleEditRequest}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer Continue ───────────────────────────────────────────── */}
      <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={handleNext}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 font-bold text-sm rounded-lg bg-green-600 hover:bg-green-700 text-white px-8 py-3.5 md:py-3 transition-colors shadow-sm"
        >
          Continue to Washrooms <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── FAB Help Button ───────────────────────────────────────────── */}
      <button
        onClick={() => setIsHelpOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-slate-800 dark:bg-slate-700 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-900 dark:hover:bg-slate-600 hover:scale-105 transition-all"
        title="How hierarchy works"
      >
        <span className="text-xl">❓</span>
      </button>
    </div>
  );
}
