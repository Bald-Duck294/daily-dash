"use client";
import React, { useState, useEffect } from "react";
import LiveFlowchart from "@/features/stepper/components/ui/LiveFlowchart";
import StepHelpDrawer from "@/features/stepper/components/ui/StepHelpDrawer";
import { generateTempId, buildTreeData } from "../../utils/hierarchyUtils";

const nodeTypes = {
  building: { label: "Building / Block", icon: "🏢" },
  floor: { label: "Floor", icon: "📋" },
  zone: { label: "Zone", icon: "📍" },
  ward: { label: "Ward", icon: "🏥" },
};

const prebuiltTemplates = [
  { id: "office", icon: "🏢", label: "Corporate Office" },
  { id: "hospital", icon: "🏥", label: "Hospital" },
  { id: "mall", icon: "🛍️", label: "Shopping Mall" },
  { id: "airport", icon: "✈️", label: "Airport" },
  { id: "metro", icon: "🚇", label: "Metro Station" },
];

export default function HierarchyStep({ onNext, nodes = [] }) {
  const defaultRoot = {
    temp_id: generateTempId("node"),
    name: "Main Facility",
    type: "building",
    parent_temp_id: null,
  };

  const [localNodes, setLocalNodes] = useState(
    nodes.length > 0 ? nodes : [defaultRoot],
  );

  useEffect(() => {
    if (nodes.length > 0) setLocalNodes(nodes);
  }, [nodes]);

  const [activeTemplate, setActiveTemplate] = useState("office");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "building",
    parent_temp_id: localNodes[0]?.temp_id || "root",
  });

  const handleAddNode = () => {
    if (!formData.name) return alert("Please enter a name for this location.");
    const newNode = {
      temp_id: generateTempId("node"),
      name: formData.name,
      type: formData.type,
      parent_temp_id:
        formData.parent_temp_id === "root" ? null : formData.parent_temp_id,
    };
    setLocalNodes([...localNodes, newNode]);
    setFormData({ ...formData, name: "" });
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
      setFormData({ name: "", type: "building", parent_temp_id: "root" });
    }
  };

  const handleApplyTemplate = (templateId) => {
    setActiveTemplate(templateId);
    let generated = [];

    if (templateId === "office") {
      const bldgId = generateTempId("node");
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
      generated.push({
        temp_id: generateTempId("node"),
        name: "Floor 1",
        type: "floor",
        parent_temp_id: bldgId,
      });
      generated.push({
        temp_id: generateTempId("node"),
        name: "Floor 2",
        type: "floor",
        parent_temp_id: bldgId,
      });
    } else if (templateId === "hospital") {
      const bldgId = generateTempId("node");
      generated.push({
        temp_id: bldgId,
        name: "Hospital Main Building",
        type: "building",
        parent_temp_id: null,
      });
      generated.push({
        temp_id: generateTempId("node"),
        name: "Block A — OPD",
        type: "ward",
        parent_temp_id: bldgId,
      });
      generated.push({
        temp_id: generateTempId("node"),
        name: "Block B — IPD",
        type: "ward",
        parent_temp_id: bldgId,
      });
      generated.push({
        temp_id: generateTempId("node"),
        name: "Block C — Emergency",
        type: "ward",
        parent_temp_id: bldgId,
      });
      generated.push({
        temp_id: generateTempId("node"),
        name: "Administration Block",
        type: "building",
        parent_temp_id: null,
      });
    } else if (templateId === "mall") {
      const bldgId = generateTempId("node");
      const groundId = generateTempId("node");
      generated.push({
        temp_id: bldgId,
        name: "Mall Building",
        type: "building",
        parent_temp_id: null,
      });
      generated.push({
        temp_id: groundId,
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
      generated.push({
        temp_id: generateTempId("node"),
        name: "Second Floor",
        type: "floor",
        parent_temp_id: bldgId,
      });
      generated.push({
        temp_id: generateTempId("node"),
        name: "Food Court",
        type: "zone",
        parent_temp_id: groundId,
      });
    } else if (templateId === "airport") {
      const t1Id = generateTempId("node");
      const t2Id = generateTempId("node");
      generated.push({
        temp_id: t1Id,
        name: "Terminal 1",
        type: "building",
        parent_temp_id: null,
      });
      generated.push({
        temp_id: generateTempId("node"),
        name: "Departures Hall",
        type: "zone",
        parent_temp_id: t1Id,
      });
      generated.push({
        temp_id: generateTempId("node"),
        name: "Arrivals Hall",
        type: "zone",
        parent_temp_id: t1Id,
      });
      generated.push({
        temp_id: t2Id,
        name: "Terminal 2",
        type: "building",
        parent_temp_id: null,
      });
      generated.push({
        temp_id: generateTempId("node"),
        name: "International Zone",
        type: "zone",
        parent_temp_id: t2Id,
      });
    } else if (templateId === "metro") {
      const stnId = generateTempId("node");
      const concourseId = generateTempId("node");
      generated.push({
        temp_id: stnId,
        name: "Central Station",
        type: "building",
        parent_temp_id: null,
      });
      generated.push({
        temp_id: concourseId,
        name: "Concourse Level",
        type: "floor",
        parent_temp_id: stnId,
      });
      generated.push({
        temp_id: generateTempId("node"),
        name: "Platform 1 & 2",
        type: "zone",
        parent_temp_id: concourseId,
      });
    } else {
      generated.push({
        temp_id: generateTempId("node"),
        name: `${templateId.charAt(0).toUpperCase() + templateId.slice(1)} Main`,
        type: "building",
        parent_temp_id: null,
      });
    }

    setLocalNodes(generated);
    setFormData({ ...formData, parent_temp_id: generated[0].temp_id });
  };

  const parentOptions = localNodes.map((n) => ({
    id: n.temp_id,
    name: n.name,
    type: n.type,
  }));

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
            <div className="mt-2 bg-slate-50 p-2 rounded border border-slate-200 text-xs font-mono text-slate-600">
              e.g. Building A
            </div>
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
              If floors contain specific zones (like North Wing or South Wing),
              add them and set their{" "}
              <strong className="text-[#1F4E79]">Parent = Ground Floor</strong>.
            </p>
          </div>
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <h3 className="font-bold text-[#1F4E79] mb-2">
              Example Structure:
            </h3>
            <ul className="text-sm font-medium text-slate-700 space-y-1">
              <li>🏢 Corporate Office</li>
              <li className="pl-4">↳ 🏢 Building A</li>
              <li className="pl-8">↳ 📋 Ground Floor</li>
              <li className="pl-12">↳ 📍 North Wing</li>
              <li className="pl-16 text-blue-600">↳ 🚻 Washroom</li>
            </ul>
          </div>
        </div>
      </StepHelpDrawer>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">
            Location Hierarchy
          </h1>
          <p className="text-sm mt-1 text-slate-500">
            Build the structural map of your facility. Washrooms attach to
            zones.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
          Pre-built Templates
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3">
          {prebuiltTemplates.map((template) => (
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
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900">
              Hierarchy Builder
            </h3>
            <div>
              <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wider text-slate-500">
                Hierarchy *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border-[1.5px] border-slate-200 rounded-lg px-3 py-3 md:py-2 text-sm outline-none focus:border-[#1F4E79]"
                placeholder="e.g. Block A, Floor 1"
                onKeyDown={(e) => e.key === "Enter" && handleAddNode()}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wider text-slate-500">
                Hierarchy Type
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
                onClick={handleAddNode}
                className="flex-1 bg-[#1F4E79] text-white py-3 md:py-2 rounded-lg font-semibold text-sm hover:bg-[#163a5a] transition-colors shadow-sm"
              >
                + Add Hierarchy
              </button>
              <button className="px-3 py-3 md:py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-semibold text-sm hover:bg-slate-50 transition-colors flex justify-center items-center gap-1 shadow-sm">
                📋 Dup.
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

        <div className="lg:col-span-8 flex flex-col h-full w-full">
          {/* Note: Map height made responsive */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col flex-1 min-h-[400px] lg:min-h-[550px] overflow-hidden relative">
            <div className="flex-1 bg-slate-50/50 flex">
              <LiveFlowchart treeData={buildTreeData(localNodes)} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-8 pt-4 border-t border-slate-200">
        <button
          onClick={() => onNext(localNodes)}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 font-bold text-sm rounded-lg bg-[#1F4E79] text-white px-8 py-3.5 md:py-3 hover:bg-[#163a5a] transition-colors shadow-sm"
        >
          Continue to Washrooms ➔
        </button>
      </div>

      {/* FAB Floating Help Button */}
      <button
        onClick={() => setIsHelpOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#1F4E79] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(31,78,121,0.4)] animate-[pulse_2s_infinite] hover:animate-none transition-all"
        title="Need Help?"
      >
        <span className="text-2xl">❓</span>
      </button>
    </div>
  );
}
