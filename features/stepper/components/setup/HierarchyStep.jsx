"use client";
import React, { useState, useEffect } from "react";
import LiveFlowchart from "@/features/stepper/components/ui/LiveFlowchart";
import StepHelpDrawer from "@/features/stepper/components/ui/StepHelpDrawer";
import { generateTempId, buildTreeData } from "../../utils/hierarchyUtils";
import { ArrowLeft, ArrowRight } from "lucide-react";

const nodeTypes = {
  building: { label: "Building / Block", icon: "🏢" },
  floor: { label: "Floor", icon: "📋" },
  zone: { label: "Zone", icon: "📍" },
  ward: { label: "Ward", icon: "🏥" },
};

// Dynamically generate templates based on company structure
const getDynamicTemplates = (structureType, orgType) => {
  const isHospital = orgType?.includes("Hospital");
  const prefix = isHospital ? "Hospital" : "Main Facility";

  if (structureType === "Single Building") {
    return [{ id: "single", icon: "🏢", label: "Standard Single Building" }];
  } else if (structureType === "Multiple Building Campus") {
    return [{ id: "campus", icon: "🏘️", label: "Multi-Building Campus" }];
  } else if (
    structureType === "Multiple Locations" ||
    structureType?.includes("Network")
  ) {
    return [{ id: "network", icon: "📍", label: "Regional Locations" }];
  }
  // Default fallback
  return [
    { id: "office", icon: "🏢", label: "Corporate Office" },
    { id: "hospital", icon: "🏥", label: "Hospital" },
  ];
};

export default function HierarchyStep({
  onNext,
  onBack,
  nodes = [],
  companyProfile = {},
}) {
  const defaultRoot = {
    temp_id: generateTempId("node"),
    name: "Main Facility",
    type: "building",
    parent_temp_id: null,
  };

  const [localNodes, setLocalNodes] = useState(
    nodes.length > 0 ? nodes : [defaultRoot],
  );

  // EDIT STATE
  const [editMode, setEditMode] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState(null);

  useEffect(() => {
    if (nodes.length > 0) setLocalNodes(nodes);
  }, [nodes]);

  const dynamicTemplates = getDynamicTemplates(
    companyProfile.operation_structure,
    companyProfile.organization_type,
  );
  const [activeTemplate, setActiveTemplate] = useState(
    dynamicTemplates[0]?.id || "office",
  );
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "building",
    parent_temp_id: localNodes[0]?.temp_id || "root",
  });

  const handleEditRequest = (nodeId) => {
    const nodeToEdit = localNodes.find((n) => n.temp_id === nodeId);
    if (nodeToEdit) {
      setFormData({
        name: nodeToEdit.name,
        type: nodeToEdit.type,
        parent_temp_id: nodeToEdit.parent_temp_id || "root",
      });
      setEditMode(true);
      setEditingNodeId(nodeId);

      // Optional: Scroll to the form so the user knows it changed
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSaveNode = () => {
    if (!formData.name) return alert("Please enter a name for this location.");

    if (editMode && editingNodeId) {
      // UPDATE EXISTING NODE
      setLocalNodes((prev) =>
        prev.map((n) =>
          n.temp_id === editingNodeId
            ? {
                ...n,
                name: formData.name,
                type: formData.type,
                parent_temp_id:
                  formData.parent_temp_id === "root"
                    ? null
                    : formData.parent_temp_id,
              }
            : n,
        ),
      );
      // Reset form after edit
      cancelEdit();
    } else {
      // ADD NEW NODE (Your existing logic)
      const newNode = {
        temp_id: generateTempId("node"),
        name: formData.name,
        type: formData.type,
        parent_temp_id:
          formData.parent_temp_id === "root" ? null : formData.parent_temp_id,
      };
      setLocalNodes([...localNodes, newNode]);
      setFormData({ ...formData, name: "" });
    }
  };
  const cancelEdit = () => {
    setEditMode(false);
    setEditingNodeId(null);
    setFormData({
      name: "",
      type: "building",
      parent_temp_id: localNodes[0]?.temp_id || "root",
    });
  };
  const handleReset = () => {
    if (
      window.confirm("Are you sure you want to reset the entire hierarchy?")
    ) {
      const freshId = generateTempId("node");
      setLocalNodes([
        {
          temp_id: freshId,
          name: "Main Facility",
          type: "building",
          parent_temp_id: null,
        },
      ]);
      cancelEdit();
    }
  };

  const handleApplyTemplate = (templateId) => {
    setActiveTemplate(templateId);
    let generated = [];
    const bldgId = generateTempId("node");

    if (templateId === "single") {
      generated.push({
        temp_id: bldgId,
        name: "Main Building",
        type: "building",
        parent_temp_id: null,
      });
      generated.push({
        temp_id: generateTempId("node"),
        name: "Ground Floor",
        type: "floor",
        parent_temp_id: bldgId,
      });
      generated.push({
        temp_id: generateTempId("node"),
        name: "First Floor",
        type: "floor",
        parent_temp_id: bldgId,
      });
    } else if (templateId === "campus") {
      const bldg2Id = generateTempId("node");
      generated.push({
        temp_id: bldgId,
        name: "North Block",
        type: "building",
        parent_temp_id: null,
      });
      generated.push({
        temp_id: generateTempId("node"),
        name: "Ground Floor",
        type: "floor",
        parent_temp_id: bldgId,
      });
      generated.push({
        temp_id: bldg2Id,
        name: "South Block",
        type: "building",
        parent_temp_id: null,
      });
      generated.push({
        temp_id: generateTempId("node"),
        name: "Ground Floor",
        type: "floor",
        parent_temp_id: bldg2Id,
      });
    } else if (templateId === "network") {
      generated.push({
        temp_id: bldgId,
        name: "Branch 1",
        type: "building",
        parent_temp_id: null,
      });
      generated.push({
        temp_id: generateTempId("node"),
        name: "Branch 2",
        type: "building",
        parent_temp_id: null,
      });
    } else {
      // Fallbacks
      generated.push({
        temp_id: bldgId,
        name: "Corporate Office",
        type: "building",
        parent_temp_id: null,
      });
      generated.push({
        temp_id: generateTempId("node"),
        name: "Ground Floor",
        type: "floor",
        parent_temp_id: bldgId,
      });
    }

    setLocalNodes(generated);
    setFormData({ ...formData, parent_temp_id: generated[0].temp_id });
    setEditMode(false);
  };

  const parentOptions = localNodes
    .filter((n) => n.temp_id !== editingNodeId) // Prevent a node from being its own parent during edit
    .map((n) => ({ id: n.temp_id, name: n.name, type: n.type }));

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-20 md:pb-0 relative w-full">
      <StepHelpDrawer
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="How Hierarchy Works"
      >
        <div className="space-y-5">
          <div>
            <h3 className="font-bold text-slate-900 mb-1">
              Step 1: Your Highest Level
            </h3>
            <p>
              Add your main building or corporate office.{" "}
              <strong className="text-slate-900">
                Do NOT select any parent
              </strong>{" "}
              for this level.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-1">
              Step 2: Add Floors
            </h3>
            <p>
              If your building has multiple floors, add them and set their{" "}
              <strong className="text-[#1F4E79]">Parent = Building A</strong>.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-1">Step 3: Add Zones</h3>
            <p>
              If floors contain specific zones, add them and set their{" "}
              <strong className="text-[#1F4E79]">Parent = Ground Floor</strong>.
            </p>
          </div>
        </div>
      </StepHelpDrawer>

      {/* HEADER WITH GREEN BUTTONS */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">
            Location Hierarchy
          </h1>
          <p className="text-sm mt-1 text-slate-500">
            Build the structural map of your facility. Edit directly from the
            map.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
          <button
            onClick={() => onNext(localNodes)}
            className="flex items-center gap-2 text-sm font-bold text-white px-6 py-2.5 bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DYNAMIC TEMPLATES */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
          Suggested Templates based on your setup
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3">
          {dynamicTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleApplyTemplate(template.id)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 md:py-2 rounded-lg text-xs font-bold border-[1.5px] transition-colors w-full sm:w-auto
                ${activeTemplate === template.id ? "border-[#1F4E79] text-[#1F4E79] bg-[#e8f0f9]" : "border-slate-200 text-slate-600 bg-white hover:border-slate-300"}`}
            >
              <span className="text-sm">{template.icon}</span> {template.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* FORM PANEL */}
        <div className="lg:col-span-4 space-y-4">
          <div
            className={`bg-white border rounded-xl p-4 md:p-5 shadow-sm space-y-4 transition-colors ${editMode ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200"}`}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-900">
                {editMode ? "✏️ Edit Hierarchy Node" : "Hierarchy Builder"}
              </h3>
              {editMode && (
                <button
                  onClick={cancelEdit}
                  className="text-xs text-red-500 hover:text-red-700 font-bold"
                >
                  Cancel
                </button>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wider text-slate-500">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border-[1.5px] border-slate-200 rounded-lg px-3 py-3 md:py-2 text-sm outline-none focus:border-[#1F4E79]"
                placeholder="e.g. Block A, Floor 1"
                onKeyDown={(e) => e.key === "Enter" && handleSaveNode()}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wider text-slate-500">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full border-[1.5px] border-slate-200 rounded-lg px-3 py-3 md:py-2 text-sm outline-none focus:border-[#1F4E79] bg-white"
              >
                {Object.entries(nodeTypes).map(([key, data]) => (
                  <option key={key} value={key}>
                    {data.icon} {data.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wider text-slate-500">
                Parent (Optional)
              </label>
              <select
                value={formData.parent_temp_id}
                onChange={(e) =>
                  setFormData({ ...formData, parent_temp_id: e.target.value })
                }
                className="w-full border-[1.5px] border-slate-200 rounded-lg px-3 py-3 md:py-2 text-sm outline-none focus:border-[#1F4E79] bg-white"
              >
                <option value="root">— Root Level —</option>
                {parentOptions.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={handleSaveNode}
                className={`w-full text-white py-3 md:py-2 rounded-lg font-semibold text-sm transition-colors shadow-sm ${
                  editMode
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-[#1F4E79] hover:bg-[#163a5a]"
                }`}
              >
                {editMode ? "Save Changes" : "+ Add Hierarchy"}
              </button>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full bg-white border border-red-200 text-red-500 py-3 md:py-2.5 rounded-lg font-semibold text-sm hover:bg-red-50 transition-colors shadow-sm"
          >
            ↻ Reset Hierarchy
          </button>
        </div>

        {/* LIVE CHART */}
        <div className="lg:col-span-8 flex flex-col h-full w-full">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col flex-1 min-h-[400px] lg:min-h-[550px] overflow-hidden relative">
            <div className="flex-1 bg-slate-50/50 flex">
              {/* Passing it to the Chart */}
              <LiveFlowchart
                treeData={buildTreeData(localNodes)}
                isEditable={true}
                onEditNode={handleEditRequest}
              />
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER CONTINUE BUTTON */}
      <div className="flex justify-end mt-8 pt-4 border-t border-slate-200">
        <button
          onClick={() => onNext(localNodes)}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 font-bold text-sm rounded-lg bg-green-600 text-white px-8 py-3.5 md:py-3 hover:bg-green-700 transition-colors shadow-sm"
        >
          Continue to Washrooms ➔
        </button>
      </div>

      {/* FAB Floating Help Button */}
      <button
        onClick={() => setIsHelpOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#1F4E79] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(31,78,121,0.4)] hover:scale-105 transition-transform"
      >
        <span className="text-2xl">❓</span>
      </button>
    </div>
  );
}
