"use client";
import React, { useState } from "react";
import LiveFlowchart from "@/features/stepper/components/ui/LiveFlowchart";
import StepHelpDrawer from "@/features/stepper/components/ui/StepHelpDrawer";
import { generateTempId, buildTreeData } from "../../utils/hierarchyUtils";

const washroomTypes = {
  male: {
    label: "Male",
    icon: "🚹",
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  female: {
    label: "Female",
    icon: "🚺",
    color: "text-pink-600 bg-pink-50 border-pink-200",
  },
  unisex: {
    label: "Unisex",
    icon: "🚻",
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
  handicap: {
    label: "Handicap",
    icon: "♿",
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
};

const quickTemplates = [
  {
    id: "standard",
    name: "Standard WC",
    desc: "WC×2 · Basin×2 · Urinal×1",
    icon: "🚻",
    fixtures: { wc: 2, bas: 2, uri: 1, ind: 0, sho: 0, plb: 1 },
  },
  {
    id: "high",
    name: "High Traffic",
    desc: "WC×6 · Basin×4 · Urinal×4",
    icon: "🔥",
    fixtures: { wc: 6, bas: 4, uri: 4, ind: 0, sho: 0, plb: 3 },
  },
  {
    id: "exec",
    name: "Executive",
    desc: "WC×3 · Basin×3 · Hand Dryer",
    icon: "💼",
    fixtures: { wc: 3, bas: 3, uri: 0, ind: 2, sho: 0, plb: 4 },
  },
  {
    id: "access",
    name: "Handicap",
    desc: "WC×1 · Basin×1 · Grab Rails",
    icon: "♿",
    fixtures: { wc: 1, bas: 1, uri: 0, ind: 0, sho: 0, plb: 1 },
    overrideType: "handicap",
  },
];

const defaultFixtures = {
  men: { wc: 2, ind: 0, uri: 3, bas: 2, sho: 0, plb: 1 },
  women: { wc: 4, ind: 1, uri: 0, bas: 3, sho: 0, plb: 1 },
  handicap: { wc: 1, ind: 0, uri: 0, bas: 1, sho: 0, plb: 1 },
};

export default function WashroomsStep({
  onNext,
  onBack,
  nodes = [],
  washrooms = [],
}) {
  const [localWashrooms, setLocalWashrooms] = useState(washrooms);
  const [activeTab, setActiveTab] = useState("manual");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [showPublicTooltip, setShowPublicTooltip] = useState(false);

  // EDIT STATE
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    zone_temp_id: "",
    type: "male",
    is_public: false,
    fixtures: JSON.parse(JSON.stringify(defaultFixtures)),
  });

  const [autoConfig, setAutoConfig] = useState({
    male: true,
    female: true,
    handicap: false,
  });

  const [showTemplateSuccess, setShowTemplateSuccess] = useState(false);

  const handleFixtureChange = (category, field, value) => {
    setFormData((prev) => ({
      ...prev,
      fixtures: {
        ...prev.fixtures,
        [category]: {
          ...prev.fixtures[category],
          [field]: parseInt(value) || 0,
        },
      },
    }));
  };

  // Extract save logic so it can be called by both "Save" button and "Continue" button
  const performSave = () => {
    if (!formData.name || !formData.zone_temp_id) {
      alert("Name and Location are required");
      return false;
    }

    let totalWc = 0;
    let totalBasin = 0;

    if (formData.type === "male" || formData.type === "unisex") {
      totalWc += formData.fixtures.men.wc;
      totalBasin += formData.fixtures.men.bas;
    }
    if (formData.type === "female" || formData.type === "unisex") {
      totalWc += formData.fixtures.women.wc;
      totalBasin += formData.fixtures.women.bas;
    }
    if (formData.type === "handicap" || formData.type === "unisex") {
      totalWc += formData.fixtures.handicap.wc;
      totalBasin += formData.fixtures.handicap.bas;
    }

    const washroomRecord = {
      temp_id: editingId || generateTempId("wash"),
      name: formData.name,
      type: formData.type,
      zone_temp_id: formData.zone_temp_id,
      is_public: formData.is_public,
      wc_count: totalWc || 1,
      basin_count: totalBasin || 1,
      rawFixtures: JSON.parse(JSON.stringify(formData.fixtures)),
    };

    let updatedList;
    if (editingId) {
      updatedList = localWashrooms.map((w) =>
        w.temp_id === editingId ? washroomRecord : w,
      );
      setEditingId(null);
    } else {
      updatedList = [...localWashrooms, washroomRecord];
    }

    setLocalWashrooms(updatedList);
    setFormData({
      name: "",
      zone_temp_id: formData.zone_temp_id,
      type: "male",
      is_public: false,
      fixtures: JSON.parse(JSON.stringify(defaultFixtures)),
    });

    return updatedList; // Return the new list so handleContinue can use it immediately
  };

  const handleAddOrUpdateManual = () => {
    performSave();
  };

  const handleContinue = () => {
    let finalDataToPass = localWashrooms;

    // If the user typed a name but forgot to hit save, auto-save it before continuing
    if (formData.name.trim() !== "") {
      const result = performSave();
      if (!result) return; // Validation failed (missing location)
      finalDataToPass = result;
    }

    onNext(finalDataToPass);
  };

  const handleEdit = (w) => {
    setFormData({
      name: w.name,
      zone_temp_id: w.zone_temp_id,
      type: w.type,
      is_public: w.is_public || false,
      fixtures: w.rawFixtures || JSON.parse(JSON.stringify(defaultFixtures)),
    });
    setEditingId(w.temp_id);
    setActiveTab("manual");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: "",
      zone_temp_id: "",
      type: "male",
      is_public: false,
      fixtures: JSON.parse(JSON.stringify(defaultFixtures)),
    });
  };

  const handleDelete = (id) => {
    setLocalWashrooms(localWashrooms.filter((w) => w.temp_id !== id));
    if (editingId === id) handleCancelEdit();
  };

  const handleApplyQuickTemplate = (template) => {
    const targetCategory =
      template.overrideType === "handicap"
        ? "handicap"
        : formData.type === "female"
          ? "women"
          : "men";

    setFormData((prev) => ({
      ...prev,
      type: template.overrideType || prev.type,
      fixtures: {
        ...prev.fixtures,
        [targetCategory]: { ...template.fixtures },
      },
    }));

    setShowTemplateSuccess(true);
    setTimeout(() => setShowTemplateSuccess(false), 4000);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGenerateAll = () => {
    if (nodes.length === 0)
      return alert("No valid locations found to attach washrooms.");

    let generated = [];
    nodes.forEach((node) => {
      if (autoConfig.male)
        generated.push({
          temp_id: generateTempId("wash"),
          name: `${node.name} Male WC`,
          zone_temp_id: node.temp_id,
          type: "male",
          is_public: false,
          wc_count: 3,
          basin_count: 3,
          rawFixtures: {
            men: { wc: 3, ind: 0, uri: 3, bas: 3, sho: 0, plb: 1 },
            women: defaultFixtures.women,
            handicap: defaultFixtures.handicap,
          },
        });
      if (autoConfig.female)
        generated.push({
          temp_id: generateTempId("wash"),
          name: `${node.name} Female WC`,
          zone_temp_id: node.temp_id,
          type: "female",
          is_public: false,
          wc_count: 3,
          basin_count: 3,
          rawFixtures: {
            men: defaultFixtures.men,
            women: { wc: 3, ind: 0, uri: 0, bas: 3, sho: 0, plb: 1 },
            handicap: defaultFixtures.handicap,
          },
        });
      if (autoConfig.handicap)
        generated.push({
          temp_id: generateTempId("wash"),
          name: `${node.name} Handicap WC`,
          zone_temp_id: node.temp_id,
          type: "handicap",
          is_public: false,
          wc_count: 1,
          basin_count: 1,
          rawFixtures: {
            men: defaultFixtures.men,
            women: defaultFixtures.women,
            handicap: { wc: 1, ind: 0, uri: 0, bas: 1, sho: 0, plb: 1 },
          },
        });
    });

    setLocalWashrooms([...localWashrooms, ...generated]);
    setActiveTab("manual");
  };

  const generatePreviewList = () => {
    let previewItems = [];
    nodes.forEach((node) => {
      if (autoConfig.male)
        previewItems.push({ label: `${node.name} — 🚹 Male WC` });
      if (autoConfig.female)
        previewItems.push({ label: `${node.name} — 🚺 Female WC` });
      if (autoConfig.handicap)
        previewItems.push({ label: `${node.name} — ♿ Handicap WC` });
    });
    return previewItems;
  };

  const FixtureInput = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between border border-slate-200 rounded-md px-2 py-2 md:py-1.5 min-h-[44px] md:min-h-0 bg-white shadow-sm">
      <span className="text-[10px] font-black text-slate-500">{label}</span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={onChange}
        className="w-10 text-center text-sm font-bold text-slate-800 outline-none p-0 border-none bg-transparent focus:ring-0"
      />
    </div>
  );

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-16 w-full relative">
      <StepHelpDrawer
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="Washroom Configuration Guide"
      >
        <div className="space-y-6">
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <h3 className="font-bold text-[#1F4E79] mb-1">
              Why do we create Washrooms?
            </h3>
            <p>
              Washrooms are the core operational units in Safai. Cleaners are
              assigned to these specific locations to receive their daily tasks
              and checklists.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-1 border-b pb-1">
              Hierarchy Assignment
            </h3>
            <p className="mb-2">
              You can attach a washroom to <strong>ANY</strong> location in your
              hierarchy.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-1 border-b pb-1">
              What are Usage Categories?
            </h3>
            <p className="mb-2">
              Usage Categories define the exact fixtures inside the washroom
              (WCs, Basins, Urinals, etc.).
            </p>
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 mt-2">
              <span className="font-bold text-emerald-700 block mb-1">
                📱 Why does this matter?
              </span>
              This data directly powers the Cleaner Mobile App. If you set "3
              Basins" and "2 WCs", the system automatically generates the exact
              cleaning checklist and asks the cleaner to upload exactly 5
              Before/After photos to prove the work is done.
            </div>
          </div>
        </div>
      </StepHelpDrawer>

      {/* ── COMPACT INLINE HEADER ── */}
      <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-[22px] font-black text-slate-900 tracking-tight leading-tight">
            Washroom Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Register washrooms, configure fixtures, and link them to your
            hierarchy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={onBack}
            className="flex-1 md:flex-none bg-slate-100 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-200 hover:text-slate-900 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 md:flex-none bg-[#22c55e] text-white px-5 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-[#16a34a] transition-colors flex items-center justify-center gap-1.5"
          >
            Continue ➔
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start mt-2">
        {/* ── LEFT: CONFIGURATION PANEL ── */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex gap-2">
            {[
              { id: "manual", icon: "✏️", label: "Manual" },
              { id: "auto", icon: "🤖", label: "Auto-Configure" },
              { id: "quick", icon: "⚡", label: "Quick Templates" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTab(t.id);
                  if (t.id !== "manual") handleCancelEdit();
                }}
                className={`flex-1 py-2 px-1 rounded-lg text-[10px] md:text-[11px] font-bold border-[1.5px] transition-colors flex flex-col md:flex-row items-center justify-center gap-1.5 shadow-sm min-h-[44px]
                  ${activeTab === t.id ? "bg-[#1F4E79] border-[#1F4E79] text-white" : "bg-white border-slate-200 text-slate-500 hover:border-[#1F4E79]"}`}
              >
                <span className="text-sm md:text-base">{t.icon}</span> {t.label}
              </button>
            ))}
          </div>

          {activeTab === "manual" && (
            <div className="space-y-4 animate-in fade-in">
              <div
                className={`bg-white border-[2px] ${editingId ? "border-amber-400 shadow-md" : "border-slate-200 shadow-sm"} rounded-xl p-4 md:p-5 space-y-4 transition-all`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3
                    className={`font-bold text-xs ${editingId ? "text-amber-600" : "text-slate-800"}`}
                  >
                    {editingId ? "✏️ Edit Washroom" : "Basic Details"}
                  </h3>
                  {editingId && (
                    <span className="bg-amber-100 text-amber-700 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest">
                      Editing Mode
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wider text-slate-500">
                    Washroom Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full min-h-[44px] border-[1.5px] border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1F4E79]"
                    placeholder="e.g. Ground Floor Male WC"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wider text-slate-500">
                    Assign to Location *
                  </label>
                  <select
                    value={formData.zone_temp_id}
                    onChange={(e) =>
                      setFormData({ ...formData, zone_temp_id: e.target.value })
                    }
                    className="w-full min-h-[44px] border-[1.5px] border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-[#1F4E79] bg-white truncate"
                  >
                    <option value="">— Select ANY Hierarchy Node —</option>
                    {nodes.map((n) => (
                      <option key={n.temp_id} value={n.temp_id}>
                        {n.name} ({n.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wider text-slate-500">
                      Washroom Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="w-full min-h-[44px] border-[1.5px] border-slate-200 rounded-lg px-2 py-2 text-xs font-bold text-[#1F4E79] outline-none focus:border-[#1F4E79] bg-[#f8fafc]"
                    >
                      <option value="male">🚹 Male</option>
                      <option value="female">🚺 Female</option>
                      <option value="unisex">🚻 Unisex</option>
                      <option value="handicap">♿ Handicap</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5 h-[15px]">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 leading-none">
                        Access Level
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPublicTooltip(!showPublicTooltip)}
                        className="w-[15px] h-[15px] rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold border border-blue-100 hover:bg-blue-100 transition-colors"
                        title="Click for info"
                      >
                        ?
                      </button>
                    </div>
                    <select
                      value={formData.is_public ? "public" : "private"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_public: e.target.value === "public",
                        })
                      }
                      className="w-full min-h-[44px] border-[1.5px] border-slate-200 rounded-lg px-2 py-2 text-xs font-bold text-slate-700 outline-none focus:border-[#1F4E79] bg-[#f8fafc]"
                    >
                      <option value="private">🔒 Private</option>
                      <option value="public">🌍 Public</option>
                    </select>
                  </div>
                </div>

                {showPublicTooltip && (
                  <div className="mb-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 leading-snug animate-in fade-in zoom-in-95 duration-200">
                    <strong>Note:</strong> If made <strong>Public</strong>, this
                    washroom will be visible and accessible to general visitors
                    on the public-facing application. Private washrooms are
                    strictly for internal staff access.
                  </div>
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                  <span className="text-slate-400">🎛️</span>
                  <h3 className="font-bold text-xs text-slate-800">
                    Usage Categories
                  </h3>
                </div>

                <div className="space-y-4">
                  {(formData.type === "male" || formData.type === "unisex") && (
                    <div className="border border-blue-200 bg-blue-50/50 rounded-lg p-3">
                      <h4 className="text-[10px] font-bold text-blue-600 mb-3">
                        🚹 MEN
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {["wc", "ind", "uri", "bas", "sho"].map((f) => (
                          <FixtureInput
                            key={`m-${f}`}
                            label={f.toUpperCase()}
                            value={formData.fixtures.men[f]}
                            onChange={(e) =>
                              handleFixtureChange("men", f, e.target.value)
                            }
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {(formData.type === "female" ||
                    formData.type === "unisex") && (
                    <div className="border border-pink-200 bg-pink-50/50 rounded-lg p-3">
                      <h4 className="text-[10px] font-bold text-pink-500 mb-3">
                        🚺 WOMEN
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {["wc", "ind", "uri", "bas", "sho"].map((f) => (
                          <FixtureInput
                            key={`w-${f}`}
                            label={f.toUpperCase()}
                            value={formData.fixtures.women[f]}
                            onChange={(e) =>
                              handleFixtureChange("women", f, e.target.value)
                            }
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {(formData.type === "handicap" ||
                    formData.type === "unisex") && (
                    <div className="border border-amber-200 bg-amber-50/50 rounded-lg p-3">
                      <h4 className="text-[10px] font-bold text-amber-500 mb-3">
                        ♿ HANDICAP
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {["wc", "ind", "bas", "sho"].map((f) => (
                          <FixtureInput
                            key={`h-${f}`}
                            label={f.toUpperCase()}
                            value={formData.fixtures.handicap[f]}
                            onChange={(e) =>
                              handleFixtureChange("handicap", f, e.target.value)
                            }
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleAddOrUpdateManual}
                  className={`w-full min-h-[48px] text-white py-3 rounded-lg font-bold text-sm transition-colors shadow-sm
                    ${editingId ? "bg-amber-500 hover:bg-amber-600" : "bg-[#1F4E79] hover:bg-[#163a5a]"}`}
                >
                  {editingId ? "✓ Save Changes" : "+ Add Washroom"}
                </button>
                {editingId && (
                  <button
                    onClick={handleCancelEdit}
                    className="w-full min-h-[48px] bg-white border border-slate-300 text-slate-600 py-3 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === "auto" && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[#1F4E79] text-lg">🤖</span>
                <h3 className="font-bold text-sm text-slate-900">
                  Auto-Configure Washrooms
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Automatically generate washrooms for every location node in your
                hierarchy.
              </p>

              <div className="bg-[#f8fafc] border border-slate-200 rounded-lg p-4 mt-2">
                <p className="text-[11px] font-bold text-slate-800 mb-3">
                  Will be created:
                </p>
                <div className="space-y-1.5">
                  {generatePreviewList()
                    .slice(0, 8)
                    .map((item, idx) => (
                      <div
                        key={idx}
                        className="text-xs font-medium text-slate-600 flex items-center gap-2"
                      >
                        <span className="text-slate-400 text-[10px]">🏢</span>{" "}
                        {item.label}
                      </div>
                    ))}
                  {generatePreviewList().length > 8 && (
                    <p className="text-xs font-bold text-slate-400 italic pt-1">
                      +{generatePreviewList().length - 8} more...
                    </p>
                  )}
                  {generatePreviewList().length === 0 && (
                    <p className="text-xs text-red-400 italic pt-1">
                      No nodes found. Add hierarchy first.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer min-h-[36px]">
                  <input
                    type="checkbox"
                    checked={autoConfig.male}
                    onChange={(e) =>
                      setAutoConfig({ ...autoConfig, male: e.target.checked })
                    }
                    className="w-5 h-5 md:w-4 md:h-4 rounded border-slate-300 text-[#1F4E79] focus:ring-[#1F4E79]"
                  />
                  <span className="text-xs font-medium text-slate-700">
                    🚹 Male WC (WC×3, Basin×3)
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer min-h-[36px]">
                  <input
                    type="checkbox"
                    checked={autoConfig.female}
                    onChange={(e) =>
                      setAutoConfig({ ...autoConfig, female: e.target.checked })
                    }
                    className="w-5 h-5 md:w-4 md:h-4 rounded border-slate-300 text-[#1F4E79] focus:ring-[#1F4E79]"
                  />
                  <span className="text-xs font-medium text-slate-700">
                    🚺 Female WC (WC×3, Basin×3)
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer min-h-[36px]">
                  <input
                    type="checkbox"
                    checked={autoConfig.handicap}
                    onChange={(e) =>
                      setAutoConfig({
                        ...autoConfig,
                        handicap: e.target.checked,
                      })
                    }
                    className="w-5 h-5 md:w-4 md:h-4 rounded border-slate-300 text-[#1F4E79] focus:ring-[#1F4E79]"
                  />
                  <span className="text-xs font-medium text-slate-700">
                    ♿ Handicap WC (WC×1, Basin×1)
                  </span>
                </label>
              </div>

              <button
                onClick={handleGenerateAll}
                className="w-full min-h-[48px] bg-[#1F4E79] text-white mt-4 rounded-lg font-bold text-sm hover:bg-[#163a5a] transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>🤖</span> Generate All
              </button>
            </div>
          )}

          {activeTab === "quick" && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-amber-500 text-lg">⚡</span>
                <h3 className="font-bold text-sm text-slate-900">
                  Quick Templates
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Pick a template to instantly apply preset fixture counts to the
                manual form.
              </p>

              <div className="space-y-3">
                {quickTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleApplyQuickTemplate(template)}
                    className="border border-slate-200 rounded-lg p-3 flex justify-between items-center cursor-pointer hover:border-[#1F4E79] hover:bg-[#f8fafc] transition-all group min-h-[64px]"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-xl shadow-sm border border-slate-200 shrink-0">
                        {template.icon}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {template.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                          {template.desc}
                        </p>
                      </div>
                    </div>
                    <span className="text-slate-300 group-hover:text-[#1F4E79] transition-colors shrink-0 pl-2">
                      ➔
                    </span>
                  </div>
                ))}
              </div>

              {showTemplateSuccess && (
                <div className="mt-4 bg-[#f0fdf4] border border-[#bbf7d0] text-emerald-700 px-4 py-3 rounded-lg text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
                  ✓ Template applied — view Manual tab to save.
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: WASHROOMS LIST DIRECTORY ── */}
        <div className="lg:col-span-8 flex flex-col h-full w-full">
          <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm flex flex-col flex-1 min-h-[400px] lg:min-h-[600px]">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
              <h3 className="font-bold text-sm text-slate-900">
                Configured Washrooms
              </h3>
              <span className="bg-[#e8f0f9] text-[#1F4E79] border border-[#bfdbfe] px-3 py-1 rounded-full text-[10px] font-bold shrink-0">
                {localWashrooms.length} items
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
              {localWashrooms.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                  <span className="text-4xl block mb-3 opacity-50">🚻</span>
                  <p className="text-sm font-semibold text-slate-400 text-center px-4">
                    No washrooms configured yet
                  </p>
                </div>
              ) : (
                localWashrooms.map((w) => {
                  const t = washroomTypes[w.type] || washroomTypes.male;
                  const parentName =
                    nodes.find((n) => n.temp_id === w.zone_temp_id)?.name ||
                    "Unknown Location";

                  return (
                    <div
                      key={w.temp_id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-xl bg-white transition-colors animate-in slide-in-from-bottom-2 gap-3
                        ${editingId === w.temp_id ? "border-amber-400 bg-amber-50/20" : "border-slate-200 hover:border-[#1F4E79]"}`}
                    >
                      <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
                        <div
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center text-xl md:text-2xl shrink-0 border ${t.color}`}
                        >
                          {t.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-slate-900 truncate">
                            {w.name}
                          </p>
                          <p className="text-[10px] md:text-xs text-slate-500 truncate mt-0.5">
                            📍 {parentName}
                          </p>
                          <div className="flex gap-1.5 mt-1.5 flex-wrap items-center">
                            <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              {t.label}
                            </span>
                            <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              {w.wc_count} WC
                            </span>
                            <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              {w.basin_count} Basins
                            </span>
                            {w.is_public && (
                              <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded ml-1">
                                🌍 Public
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0 shrink-0">
                        <button
                          onClick={() => handleEdit(w)}
                          disabled={editingId === w.temp_id}
                          className="flex-1 sm:flex-none text-[#1F4E79] bg-[#e8f0f9] hover:bg-[#d1e3f8] font-bold text-xs px-4 py-2 rounded-lg transition-colors min-h-[44px] sm:min-h-0 border border-[#bfdbfe] disabled:opacity-50"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(w.temp_id)}
                          className="flex-1 sm:flex-none text-red-500 bg-red-50 hover:bg-red-100 font-bold text-xs px-4 py-2 rounded-lg transition-colors min-h-[44px] sm:min-h-0 border border-red-100 hover:border-red-200"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Help Button */}
      <button
        onClick={() => setIsHelpOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-tr from-[#1F4E79] to-[#3a7ca5] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(31,78,121,0.4)] hover:scale-105 transition-transform"
        title="Need Help?"
      >
        <span className="text-2xl animate-pulse">❓</span>
      </button>
    </div>
  );
}
