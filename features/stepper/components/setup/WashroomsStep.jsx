"use client";
import React, { useState } from "react";
import LiveFlowchart from "@/features/stepper/components/ui/LiveFlowchart";
import StepHelpDrawer from "@/features/stepper/components/ui/StepHelpDrawer";
import { generateTempId } from "../../utils/hierarchyUtils";
import {
  ArrowLeft,
  ArrowRight,
  User,
  Users,
  Accessibility,
  MapPin,
  Edit2,
  Trash2,
  Settings,
  Bot,
  Zap,
  RotateCcw,
  Building,
  Info,
  CheckCircle2,
} from "lucide-react";

// Professional Lucide Icons and Colors
const washroomTypes = {
  male: {
    label: "Male",
    Icon: User,
    colorClass: "text-blue-600 bg-blue-50 border-blue-200",
  },
  female: {
    label: "Female",
    Icon: User, // Differentiated by color
    colorClass: "text-pink-600 bg-pink-50 border-pink-200",
  },
  unisex: {
    label: "Unisex",
    Icon: Users,
    colorClass: "text-purple-600 bg-purple-50 border-purple-200",
  },
  handicap: {
    label: "Handicap",
    Icon: Accessibility,
    colorClass: "text-amber-600 bg-amber-50 border-amber-200",
  },
};

const quickTemplates = [
  {
    id: "standard",
    name: "Standard WC",
    desc: "WC×2 · Basin×2 · Urinal×1",
    Icon: Users,
    fixtures: { wc: 2, bas: 2, uri: 1, ind: 0, sho: 0, plb: 1 },
  },
  {
    id: "high",
    name: "High Traffic",
    desc: "WC×6 · Basin×4 · Urinal×4",
    Icon: Zap,
    fixtures: { wc: 6, bas: 4, uri: 4, ind: 0, sho: 0, plb: 3 },
  },
  {
    id: "exec",
    name: "Executive",
    desc: "WC×3 · Basin×3 · Hand Dryer",
    Icon: Settings,
    fixtures: { wc: 3, bas: 3, uri: 0, ind: 2, sho: 0, plb: 4 },
  },
  {
    id: "access",
    name: "Handicap",
    desc: "WC×1 · Basin×1 · Grab Rails",
    Icon: Accessibility,
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

    return updatedList;
  };

  const handleAddOrUpdateManual = () => {
    performSave();
  };

  const handleContinue = () => {
    let finalDataToPass = localWashrooms;
    if (formData.name.trim() !== "") {
      const result = performSave();
      if (!result) return;
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

  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to remove all configured washrooms?"
      )
    ) {
      setLocalWashrooms([]);
      handleCancelEdit();
    }
  };

  const handleTogglePublicOnItem = (tempId) => {
    setLocalWashrooms((prev) =>
      prev.map((w) =>
        w.temp_id === tempId ? { ...w, is_public: !w.is_public } : w,
      ),
    );
  };

  const handleApplyQuickTemplate = (template) => {
    if (nodes.length === 0) {
      alert("No hierarchy locations found. Please add locations in Step 1 first.");
      return;
    }

    const washroomRegex = /(washroom|wc|restroom|toilet)/i;
    let generated = [];

    const typesToCreate = template.overrideType
      ? [template.overrideType]
      : ["male", "female"];

    const targetNodes = formData.zone_temp_id
      ? nodes.filter((n) => n.temp_id === formData.zone_temp_id)
      : nodes;

    targetNodes.forEach((node) => {
      const hasWashroomTerm = washroomRegex.test(node.name);

      typesToCreate.forEach((tType) => {
        let namePrefix = "";
        if (tType === "male")
          namePrefix = hasWashroomTerm ? `${node.name} - Male` : `${node.name} Male WC`;
        else if (tType === "female")
          namePrefix = hasWashroomTerm ? `${node.name} - Female` : `${node.name} Female WC`;
        else
          namePrefix = hasWashroomTerm ? `${node.name} - Handicap` : `${node.name} Handicap WC`;

        const rawFixtures = JSON.parse(JSON.stringify(defaultFixtures));
        const catKey =
          tType === "female" ? "women" : tType === "male" ? "men" : "handicap";
        rawFixtures[catKey] = {
          wc: template.fixtures.wc || 0,
          ind: template.fixtures.ind || 0,
          uri: template.fixtures.uri || 0,
          bas: template.fixtures.bas || 0,
          sho: template.fixtures.sho || 0,
          plb: template.fixtures.plb || 1,
        };

        generated.push({
          temp_id: generateTempId("wash"),
          name: namePrefix,
          zone_temp_id: node.temp_id,
          type: tType,
          is_public: false, // Default: Private
          wc_count: template.fixtures.wc || 1,
          basin_count: template.fixtures.bas || 1,
          rawFixtures,
        });
      });
    });

    setLocalWashrooms((prev) => [...prev, ...generated]);

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
  };

  const handleGenerateAll = () => {
    if (nodes.length === 0)
      return alert("No valid locations found to attach washrooms.");

    const washroomRegex = /(washroom|wc|restroom|toilet)/i;
    let generated = [];
    nodes.forEach((node) => {
      const hasWashroomTerm = washroomRegex.test(node.name);
      const maleName = hasWashroomTerm ? `${node.name} - Male` : `${node.name} Male WC`;
      const femaleName = hasWashroomTerm ? `${node.name} - Female` : `${node.name} Female WC`;
      const handicapName = hasWashroomTerm ? `${node.name} - Handicap` : `${node.name} Handicap WC`;

      if (autoConfig.male)
        generated.push({
          temp_id: generateTempId("wash"),
          name: maleName,
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
          name: femaleName,
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
          name: handicapName,
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
    const washroomRegex = /(washroom|wc|restroom|toilet)/i;
    let previewItems = [];
    nodes.forEach((node) => {
      const hasWashroomTerm = washroomRegex.test(node.name);
      
      if (autoConfig.male)
        previewItems.push({ label: hasWashroomTerm ? `${node.name} — Male` : `${node.name} — Male WC`, type: "male" });
      if (autoConfig.female)
        previewItems.push({ label: hasWashroomTerm ? `${node.name} — Female` : `${node.name} — Female WC`, type: "female" });
      if (autoConfig.handicap)
        previewItems.push({ label: hasWashroomTerm ? `${node.name} — Handicap` : `${node.name} — Handicap WC`, type: "handicap" });
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
        </div>
      </StepHelpDrawer>

      {/* ── HEADER WITH GREEN BUTTONS ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">
            Washroom Configuration
          </h1>
          <p className="text-sm mt-1 text-slate-500">
            Register washrooms, configure fixtures, and link them to your
            hierarchy.
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
            onClick={handleContinue}
            className="flex items-center gap-2 text-sm font-bold text-white px-6 py-2.5 bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start mt-2">
        {/* ── LEFT: CONFIGURATION PANEL ── */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex gap-2">
            {[
              { id: "manual", Icon: Edit2, label: "Manual" },
              { id: "auto", Icon: Bot, label: "Auto-Configure" },
              { id: "quick", Icon: Zap, label: "Templates" },
            ].map((t) => {
              const TabIcon = t.Icon;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTab(t.id);
                    if (t.id !== "manual") handleCancelEdit();
                  }}
                  className={`flex-1 py-2 px-1 rounded-lg text-[10px] md:text-[11px] font-bold border-[1.5px] transition-colors flex flex-col items-center justify-center gap-1 shadow-sm min-h-[50px]
                    ${activeTab === t.id
                      ? "bg-[#1F4E79] border-[#1F4E79] text-white"
                      : "bg-white border-slate-200 text-slate-500 hover:border-[#1F4E79]"
                    }`}
                >
                  <TabIcon className="w-4 h-4" /> {t.label}
                </button>
              );
            })}
          </div>

          {activeTab === "manual" && (
            <div className="space-y-4 animate-in fade-in">
              <div
                className={`bg-white border-[2px] ${editingId
                    ? "border-amber-400 shadow-md"
                    : "border-slate-200 shadow-sm"
                  } rounded-xl p-4 md:p-5 space-y-4 transition-all`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3
                    className={`font-bold text-sm ${editingId ? "text-amber-600" : "text-slate-800"
                      }`}
                  >
                    {editingId ? "Edit Washroom" : "Basic Details"}
                  </h3>
                  {editingId && (
                    <span className="bg-amber-100 text-amber-700 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                      <Edit2 className="w-3 h-3" /> Editing Mode
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
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="unisex">Unisex</option>
                      <option value="handicap">Handicap</option>
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
                        className="w-[16px] h-[16px] rounded-full bg-[#e8f0f9] text-[#1F4E79] flex items-center justify-center hover:bg-[#bfdbfe] transition-colors font-bold text-[11px] shrink-0"
                        title="Click to view Access Level Info"
                      >
                        ?
                      </button>
                    </div>
                    <div className="flex items-center justify-between bg-[#f8fafc] border border-slate-200 rounded-lg px-3 py-2 min-h-[44px]">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              is_public: !formData.is_public,
                            })
                          }
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            formData.is_public ? "bg-blue-600" : "bg-slate-300"
                          }`}
                          title="Click to toggle Public / Private"
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              formData.is_public
                                ? "translate-x-5"
                                : "translate-x-0"
                            }`}
                          />
                        </button>
                        <span className="text-xs font-extrabold text-slate-800">
                          {formData.is_public ? "🌐 Public" : "🔒 Private"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {showPublicTooltip && (
                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed shadow-sm animate-in fade-in zoom-in-95 duration-200">
                    <div className="font-bold flex items-center gap-1.5 text-blue-950 mb-1">
                      <Info className="w-4 h-4 text-blue-600" />
                      Access Level Importance:
                    </div>
                    <ul className="space-y-1 text-[11.5px]">
                      <li>
                        <strong>• Private (Default):</strong> Restricts access to authorized facility staff & assigned cleaners. Recommended for internal office floors, staff WCs, and restricted facility zones.
                      </li>
                      <li>
                        <strong>• Public:</strong> Open for general visitors on public apps & QR feedback scanning stations.
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                  <Settings className="w-4 h-4 text-slate-400" />
                  <h3 className="font-bold text-xs text-slate-800">
                    Usage Categories
                  </h3>
                </div>

                <div className="space-y-4">
                  {(formData.type === "male" || formData.type === "unisex") && (
                    <div className="border border-blue-200 bg-blue-50/50 rounded-lg p-3">
                      <h4 className="text-[10px] font-bold text-blue-600 mb-3 flex items-center gap-1">
                        <User className="w-3 h-3" /> MEN
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
                        <h4 className="text-[10px] font-bold text-pink-500 mb-3 flex items-center gap-1">
                          <User className="w-3 h-3" /> WOMEN
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
                        <h4 className="text-[10px] font-bold text-amber-500 mb-3 flex items-center gap-1">
                          <Accessibility className="w-3 h-3" /> HANDICAP
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
                  className={`w-full min-h-[48px] text-white py-3 rounded-lg font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2
                    ${editingId
                      ? "bg-amber-500 hover:bg-amber-600"
                      : "bg-[#1F4E79] hover:bg-[#163a5a]"
                    }`}
                >
                  {editingId ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Save Changes
                    </>
                  ) : (
                    "+ Add Washroom"
                  )}
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
                <Bot className="w-5 h-5 text-[#1F4E79]" />
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
                <div className="space-y-2">
                  {generatePreviewList()
                    .slice(0, 8)
                    .map((item, idx) => {
                      const TypeIcon =
                        washroomTypes[item.type]?.Icon || Building;
                      return (
                        <div
                          key={idx}
                          className="text-xs font-medium text-slate-600 flex items-center gap-2 bg-white px-2 py-1.5 rounded border border-slate-100"
                        >
                          <TypeIcon className="w-3.5 h-3.5 text-slate-400" />
                          {item.label}
                        </div>
                      );
                    })}
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
                    Male WC (WC×3, Basin×3)
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer min-h-[36px]">
                  <input
                    type="checkbox"
                    checked={autoConfig.female}
                    onChange={(e) =>
                      setAutoConfig({
                        ...autoConfig,
                        female: e.target.checked,
                      })
                    }
                    className="w-5 h-5 md:w-4 md:h-4 rounded border-slate-300 text-[#1F4E79] focus:ring-[#1F4E79]"
                  />
                  <span className="text-xs font-medium text-slate-700">
                    Female WC (WC×3, Basin×3)
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
                    Handicap WC (WC×1, Basin×1)
                  </span>
                </label>
              </div>

              <button
                onClick={handleGenerateAll}
                className="w-full min-h-[48px] bg-[#1F4E79] text-white mt-4 rounded-lg font-bold text-sm hover:bg-[#163a5a] transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Bot className="w-4 h-4" /> Generate All
              </button>
            </div>
          )}

          {activeTab === "quick" && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900">
                  Quick Templates
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Pick a template to instantly apply preset fixture counts to the
                manual form.
              </p>

              <div className="space-y-3">
                {quickTemplates.map((template) => {
                  const TemplateIcon = template.Icon;
                  return (
                    <div
                      key={template.id}
                      onClick={() => handleApplyQuickTemplate(template)}
                      className="border border-slate-200 rounded-lg p-3 flex justify-between items-center cursor-pointer hover:border-[#1F4E79] hover:bg-[#f8fafc] transition-all group min-h-[64px]"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center shadow-sm border border-slate-200 shrink-0 text-slate-600 group-hover:text-[#1F4E79] group-hover:border-[#1F4E79] transition-colors">
                          <TemplateIcon className="w-5 h-5" />
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
                  );
                })}
              </div>

              {showTemplateSuccess && (
                <div className="mt-4 bg-[#f0fdf4] border border-[#bbf7d0] text-emerald-700 px-4 py-3 rounded-lg text-xs font-bold animate-in fade-in slide-in-from-bottom-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Template applied — view
                  Manual tab to save.
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: WASHROOMS LIST DIRECTORY ── */}
        <div className="lg:col-span-8 flex flex-col h-full w-full">
          {/* Constrain height to enable internal scrolling */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm flex flex-col h-[550px] lg:h-[750px] relative">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                Configured Washrooms
                <span className="bg-[#e8f0f9] text-[#1F4E79] border border-[#bfdbfe] px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0">
                  {localWashrooms.length} items
                </span>
              </h3>
              {localWashrooms.length > 0 && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-red-500 hover:text-red-700 transition-colors bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-100 hover:border-red-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar pb-2">
              {localWashrooms.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                  <Building className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm font-semibold text-slate-400 text-center px-4">
                    No washrooms configured yet
                  </p>
                </div>
              ) : (
                localWashrooms.map((w, index) => {
                  const t = washroomTypes[w.type] || washroomTypes.male;
                  const TypeIcon = t.Icon;
                  const parentName =
                    nodes.find((n) => n.temp_id === w.zone_temp_id)?.name ||
                    "Unknown Location";

                  return (
                    <div
                      key={w.temp_id}
                      className={`group flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl bg-white transition-all animate-in slide-in-from-bottom-2 gap-4
                        ${editingId === w.temp_id
                          ? "border-amber-400 ring-2 ring-amber-50 shadow-md"
                          : "border-slate-200 hover:border-blue-300 hover:shadow-sm"
                        }`}
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto overflow-hidden flex-1">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border bg-opacity-20 ${t.colorClass}`}
                        >
                          <TypeIcon className="w-6 h-6 opacity-90" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-slate-900 truncate">
                            {w.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                            <MapPin className="w-3.5 h-3.5 opacity-70" />
                            <span className="truncate">{parentName}</span>
                          </div>
                          <div className="flex gap-2 mt-2 flex-wrap items-center">
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                              {t.label}
                            </span>
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                              {w.wc_count} WC
                            </span>
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                              {w.basin_count} Basins
                            </span>
                            {/* Inline Real Access Level Toggle Switch & Question Mark */}
                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg">
                              <button
                                type="button"
                                onClick={() => handleTogglePublicOnItem(w.temp_id)}
                                className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                  w.is_public ? "bg-blue-600" : "bg-slate-300"
                                }`}
                                title={`Click to switch to ${w.is_public ? "Private" : "Public"}`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                    w.is_public ? "translate-x-3" : "translate-x-0"
                                  }`}
                                />
                              </button>
                              <span className="text-[10px] font-bold text-slate-700">
                                {w.is_public ? "🌐 Public" : "🔒 Private"}
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowPublicTooltip(!showPublicTooltip)}
                                className="w-[14px] h-[14px] rounded-full bg-[#e8f0f9] text-[#1F4E79] flex items-center justify-center hover:bg-[#bfdbfe] transition-colors font-bold text-[9px] shrink-0 ml-0.5"
                                title="Access Level Info"
                              >
                                ?
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right side: Serial Number & Always-Visible Styled Action Icon Buttons */}
                      <div className="flex items-center sm:flex-col justify-between sm:justify-center gap-2 shrink-0">
                        {/* Serial Number Badge on Right Side */}
                        <span className="text-xs font-black text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-mono shrink-0">
                          #{index + 1}
                        </span>

                        {/* Always-Visible Pen & Trash Icon Buttons with Hover Effects */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Pen / Edit Icon Button */}
                          <button
                            type="button"
                            onClick={() => handleEdit(w)}
                            disabled={editingId === w.temp_id}
                            title="Edit Washroom"
                            className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 transition-all flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 disabled:opacity-40 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Trash / Delete Icon Button */}
                          <button
                            type="button"
                            onClick={() => handleDelete(w.temp_id)}
                            title="Remove Washroom"
                            className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200 transition-all flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER CONTINUE BUTTON */}
      <div className="flex justify-end mt-8 pt-4 border-t border-slate-200">
        <button
          onClick={handleContinue}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 font-bold text-sm rounded-lg bg-green-600 text-white px-8 py-3.5 md:py-3 hover:bg-green-700 transition-colors shadow-sm"
        >
          Continue to Users ➔
        </button>
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