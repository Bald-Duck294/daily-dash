"use client";
import React, { useState, useEffect } from "react";
import LiveFlowchart from "@/features/stepper/components/ui/LiveFlowchart";
import StepHelpDrawer from "@/features/stepper/components/ui/StepHelpDrawer";
import CustomDialog from "@/features/stepper/components/ui/CustomDialog";
import { generateTempId, buildTreeData } from "../../utils/hierarchyUtils";

export default function UsersStep({
  onNext,
  onBack,
  users = [],
  nodes = [],
  washrooms = [],
}) {
  const [localUsers, setLocalUsers] = useState(users);
  useEffect(() => {
    if (users.length > 0) setLocalUsers(users);
  }, [users]);

  const [activeTab, setActiveTab] = useState("manual");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAssignmentHelpOpen, setIsAssignmentHelpOpen] = useState(false);

  // Custom Dialog State
  const [dialogConfig, setDialogConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const inviteLink = "https://daily-dash-alpha.vercel.app/login";

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    role: "cleaner",
    assigned_zone_temp_id: "",
    assigned_washrooms: [],
  });

  const showDialog = (title, message, type = "warning") => {
    setDialogConfig({ isOpen: true, title, message, type });
  };

  const handleWashroomToggle = (washId) => {
    setFormData((prev) => {
      const current = prev.assigned_washrooms;
      if (current.includes(washId)) {
        return {
          ...prev,
          assigned_washrooms: current.filter((id) => id !== washId),
        };
      } else {
        return { ...prev, assigned_washrooms: [...current, washId] };
      }
    });
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData({ ...formData, phone: val });
  };

  const handleCreate = () => {
    if (!formData.phone || formData.phone.length !== 10) {
      return showDialog(
        "Invalid Phone Number",
        "Please enter a valid 10-digit mobile number. This is required as it acts as their login ID.",
      );
    }

    if (
      formData.role === "cleaner" &&
      formData.assigned_washrooms.length === 0
    ) {
      return showDialog(
        "Assignment Required",
        "You must assign at least one washroom to this cleaner. Without a location, the cleaner will not be able to perform any cleaning tasks on the mobile app.",
      );
    }

    let finalName = formData.name.trim();
    if (!finalName) {
      const roleCount =
        localUsers.filter((u) => u.role === formData.role).length + 1;
      finalName = `${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}-${roleCount.toString().padStart(3, "0")}`;
    }

    const newUser = {
      temp_id: generateTempId("user"),
      name: finalName,
      phone: formData.phone,
      role: formData.role,
      assigned_zone_temp_id:
        formData.role === "supervisor"
          ? formData.assigned_zone_temp_id || null
          : null,
      assigned_washrooms:
        formData.role === "cleaner"
          ? formData.assigned_washrooms
          : formData.assigned_washrooms.length > 0
            ? [formData.assigned_washrooms[0]]
            : [],
    };

    setLocalUsers([newUser, ...localUsers]);
    setFormData({ ...formData, name: "", phone: "", assigned_washrooms: [] });
  };

  const handleDelete = (id) => {
    setLocalUsers(localUsers.filter((u) => u.temp_id !== id));
  };

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {}
  };

  const getDefaultWashroom = () =>
    washrooms.length > 0 ? [washrooms[0].temp_id] : [];

  const handleAutoFill = () => {
    const fakeNames = [
      "Rahul Sharma",
      "Priya Patel",
      "Amit Kumar",
      "Sneha Gupta",
    ];
    const randomName = fakeNames[Math.floor(Math.random() * fakeNames.length)];
    const randomPhone = `91${Math.floor(Math.random() * 90000000) + 10000000}`;
    setLocalUsers([
      {
        temp_id: generateTempId("user"),
        name: randomName,
        phone: randomPhone,
        role: "cleaner",
        assigned_zone_temp_id: null,
        assigned_washrooms: getDefaultWashroom(),
      },
      ...localUsers,
    ]);
  };

  const handleAddFullTeam = () => {
    const team = [
      {
        temp_id: generateTempId("user"),
        name: "Anjali Desai",
        phone: "9876543211",
        role: "supervisor",
        assigned_zone_temp_id: null,
        assigned_washrooms: [],
      },
      {
        temp_id: generateTempId("user"),
        name: "Suresh Kumar",
        phone: "9876543212",
        role: "cleaner",
        assigned_zone_temp_id: null,
        assigned_washrooms: getDefaultWashroom(),
      },
      {
        temp_id: generateTempId("user"),
        name: "Meena Devi",
        phone: "9876543213",
        role: "cleaner",
        assigned_zone_temp_id: null,
        assigned_washrooms: getDefaultWashroom(),
      },
    ];
    setLocalUsers([...team, ...localUsers]);
  };

  const handleQuickAdd = (role) => {
    const id = generateTempId("user");
    setLocalUsers([
      {
        temp_id: id,
        name: `New ${role.charAt(0).toUpperCase() + role.slice(1)} ${id.slice(-3)}`,
        phone: `91000${Math.floor(Math.random() * 99999)}`,
        role,
        assigned_zone_temp_id: null,
        assigned_washrooms: role === "cleaner" ? getDefaultWashroom() : [],
      },
      ...localUsers,
    ]);
  };

  const handleContinue = () => {
    const cleaners = localUsers.filter((u) => u.role === "cleaner");

    if (cleaners.length === 0) {
      return showDialog(
        "Setup Incomplete",
        "You must add at least 1 Cleaner to continue. Cleaners are essential for the Safai system to function.",
        "warning",
      );
    }

    const assignedCleaners = cleaners.filter(
      (c) => c.assigned_washrooms && c.assigned_washrooms.length > 0,
    );
    if (assignedCleaners.length === 0) {
      return showDialog(
        "Missing Assignments",
        "You have added cleaners, but none of them are assigned to a washroom. Please assign at least one location so they have tasks to perform.",
        "warning",
      );
    }

    onNext(localUsers);
  };

  const roleDisplay = {
    cleaner: {
      label: "Cleaner",
      icon: "🧹",
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      bar: "#10b981",
    },
    supervisor: {
      label: "Supervisor",
      icon: "👁️",
      color: "text-amber-700 bg-amber-50 border-amber-200",
      bar: "#F59E0B",
    },
    admin: {
      label: "Admin",
      icon: "⚙️",
      color: "text-slate-700 bg-slate-100 border-slate-200",
      bar: "#64748b",
    },
  };

  const totalUsers = localUsers.length || 1;
  const counts = {
    cleaner: localUsers.filter((u) => u.role === "cleaner").length,
    supervisor: localUsers.filter((u) => u.role === "supervisor").length,
    admin: localUsers.filter((u) => u.role === "admin").length,
  };

  const filteredUsers = localUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery);
    const matchesRole = roleFilter === "" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-20 md:pb-0 w-full relative">
      <CustomDialog
        isOpen={dialogConfig.isOpen}
        onClose={() => setDialogConfig({ ...dialogConfig, isOpen: false })}
        title={dialogConfig.title}
        message={dialogConfig.message}
        type={dialogConfig.type}
      />

      {/* Main Educational Drawer */}
      <StepHelpDrawer
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="Team Management Guide"
      >
        <div className="space-y-6">
          <p className="text-slate-600 font-medium leading-relaxed">
            Welcome to the User Directory. Here you will define who uses the
            Safai system and what locations they are responsible for. It is
            crucial to set this up correctly so tasks generate properly.
          </p>

          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <h3 className="font-bold text-[#1F4E79] mb-1 text-base">
              Phone Numbers are Logins
            </h3>
            <p>
              We designed Safai to be easy for field staff. They do not need an
              email or a complex password. Their{" "}
              <strong>10-digit mobile number</strong> is their unique ID to log
              into the mobile app.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-base mb-2 border-b pb-2">
              Understanding Roles
            </h3>
            <ul className="space-y-4 text-slate-600">
              <li className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                <span className="font-bold text-emerald-700 block mb-1">
                  🧹 Cleaner (Mandatory)
                </span>
                The core of your operations. Cleaners use the mobile app to view
                their checklists, perform cleaning, and upload before/after
                photos. They must be assigned to at least one washroom.
              </li>
              <li className="bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                <span className="font-bold text-amber-700 block mb-1">
                  👁️ Supervisor
                </span>
                Team leaders who monitor specific zones. They can view cleaning
                scores, track attendance, and oversee the cleaners in their
                assigned area.
              </li>
              <li className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">
                  ⚙️ Admin
                </span>
                Highest level access. Admins can view the entire dashboard and
                manage the system. They do not require any location assignment.
              </li>
            </ul>
          </div>
        </div>
      </StepHelpDrawer>

      {/* Specific Assignment Help Drawer */}
      <StepHelpDrawer
        isOpen={isAssignmentHelpOpen}
        onClose={() => setIsAssignmentHelpOpen(false)}
        title="How Assignments Work"
      >
        <div className="space-y-5">
          <p className="font-medium text-slate-600">
            Assignments dictate what a user sees when they open their app.
          </p>

          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            <h3 className="font-bold text-emerald-700 mb-2">
              Assigning Cleaners
            </h3>
            <p className="mb-2 text-slate-700">
              Cleaners work at the{" "}
              <strong className="text-slate-900">Washroom Level</strong>.
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>You can select multiple washrooms for a single cleaner.</li>
              <li>
                If you do not assign a washroom, the cleaner will see an empty
                screen when they log in.
              </li>
            </ul>
          </div>

          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
            <h3 className="font-bold text-amber-700 mb-2">
              Assigning Supervisors
            </h3>
            <p className="mb-2 text-slate-700">
              Supervisors monitor broader areas.
            </p>
            <ul className="list-disc pl-4 space-y-2 text-slate-600">
              <li>
                <strong>Option A (Recommended):</strong> Assign them to a{" "}
                <strong>Zone</strong> or <strong>Floor</strong>. This
                automatically grants them oversight of <em>every</em> washroom
                inside that area.
              </li>
              <li>
                <strong>Option B:</strong> Assign them to a single, specific
                Washroom.
              </li>
            </ul>
            <p className="mt-2 text-xs italic text-amber-800">
              Note: You cannot assign a supervisor to both a zone and a washroom
              simultaneously.
            </p>
          </div>
        </div>
      </StepHelpDrawer>

      <div className="flex items-start justify-between mb-5 gap-4 flex-wrap relative">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Users & Assignments
          </h1>
          <p className="text-sm mt-1 text-slate-500">
            Register your workforce and assign them to locations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-4 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 w-full">
            {[
              { id: "manual", icon: "✏️", label: "Manual" },
              { id: "autofill", icon: "🤖", label: "Auto-Fill" },
              { id: "quickadd", icon: "⚡", label: "Quick" },
              { id: "invite", icon: "🔗", label: "Invite" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full py-2 px-1 rounded-lg text-[10px] md:text-[11px] font-bold border-[1.5px] transition-colors flex flex-col items-center justify-center gap-1 shadow-sm min-h-[50px] md:min-h-[60px]
                  ${activeTab === t.id ? "bg-[#1F4E79] border-[#1F4E79] text-white" : "bg-white border-slate-200 text-slate-500 hover:border-[#1F4E79]"}`}
              >
                <span className="text-sm md:text-lg mb-0.5 leading-none">
                  {t.icon}
                </span>
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === "manual" && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm space-y-4 animate-in fade-in">
              <h3 className="font-bold text-sm border-b border-slate-100 pb-3 text-slate-900 flex items-center gap-2">
                👤 Add New User
              </h3>

              <div>
                <label className="block text-[10px] md:text-xs font-bold mb-1.5 uppercase tracking-wider text-slate-500">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full min-h-[44px] border-[1.5px] border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1F4E79]"
                  placeholder="e.g. Cleaner-001"
                />
              </div>

              <div>
                <label className="block text-[10px] md:text-xs font-bold mb-1.5 uppercase tracking-wider text-slate-500">
                  Phone Number *
                </label>
                <div className="flex gap-2">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 flex items-center shrink-0 min-h-[44px]">
                    🇮🇳 +91
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className="w-full min-h-[44px] border-[1.5px] border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1F4E79] font-medium tracking-wide"
                    placeholder="10-digit mobile"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] md:text-xs font-bold mb-1.5 uppercase tracking-wider text-slate-500">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value,
                      assigned_washrooms: [],
                      assigned_zone_temp_id: "",
                    })
                  }
                  className="w-full min-h-[44px] border-[1.5px] border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1F4E79] bg-white font-medium"
                >
                  <option value="cleaner">🧹 Cleaner</option>
                  <option value="supervisor">👁️ Supervisor</option>
                  <option value="admin">⚙️ Admin</option>
                </select>
              </div>

              {formData.role !== "admin" && (
                <div className="pt-2 border-t border-slate-100 space-y-3 mt-2 relative">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#1F4E79]">
                      Assignment Details
                    </p>
                    <button
                      onClick={() => setIsAssignmentHelpOpen(true)}
                      className="w-6 h-6 md:w-5 md:h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold hover:bg-blue-100 transition-colors shadow-sm"
                    >
                      ?
                    </button>
                  </div>

                  {formData.role === "supervisor" && (
                    <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                      <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wider text-amber-700">
                        Assign to Entire Location
                      </label>
                      <select
                        value={formData.assigned_zone_temp_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            assigned_zone_temp_id: e.target.value,
                            assigned_washrooms: [],
                          })
                        }
                        disabled={formData.assigned_washrooms.length > 0}
                        className="w-full min-h-[44px] border-[1.5px] border-amber-200 rounded-md px-2 py-1.5 text-xs outline-none focus:border-amber-400 bg-white disabled:opacity-50 font-medium truncate"
                      >
                        <option value="">— None / Select —</option>
                        {nodes.map((n) => (
                          <option key={n.temp_id} value={n.temp_id}>
                            {n.name} ({n.type})
                          </option>
                        ))}
                      </select>
                      <p className="text-[9px] text-amber-600 mt-2 leading-tight font-medium">
                        Assigning a higher-level node automatically assigns
                        every washroom inside it.
                      </p>
                    </div>
                  )}

                  <div
                    className={`${formData.role === "cleaner" ? "bg-emerald-50/50 border-emerald-100" : "bg-slate-50 border-slate-100"} p-3 rounded-lg border`}
                  >
                    <label
                      className={`block text-[10px] font-bold mb-2 uppercase tracking-wider ${formData.role === "cleaner" ? "text-emerald-700" : "text-slate-600"}`}
                    >
                      {formData.role === "cleaner"
                        ? "Assign Washrooms (Multiple Allowed) *"
                        : "OR Assign Single Washroom"}
                    </label>

                    {formData.role === "cleaner" ? (
                      <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1">
                        {washrooms.map((w) => (
                          <label
                            key={w.temp_id}
                            className="flex items-start gap-3 cursor-pointer bg-white border border-slate-200 p-2.5 rounded-lg hover:border-emerald-300 min-h-[44px]"
                          >
                            <input
                              type="checkbox"
                              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                              checked={formData.assigned_washrooms.includes(
                                w.temp_id,
                              )}
                              onChange={() => handleWashroomToggle(w.temp_id)}
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-slate-800 leading-tight truncate">
                                {w.name}
                              </span>
                              <span className="text-[9px] text-slate-400 font-medium truncate mt-0.5">
                                Location:{" "}
                                {nodes.find((n) => n.temp_id === w.zone_temp_id)
                                  ?.name || "Unknown"}
                              </span>
                            </div>
                          </label>
                        ))}
                        {washrooms.length === 0 && (
                          <p className="text-xs text-slate-400 italic font-medium p-3 bg-white rounded-lg border border-slate-100">
                            ⚠️ Please create washrooms in Step 2 first.
                          </p>
                        )}
                      </div>
                    ) : (
                      <select
                        value={formData.assigned_washrooms[0] || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            assigned_washrooms: e.target.value
                              ? [e.target.value]
                              : [],
                            assigned_zone_temp_id: "",
                          })
                        }
                        disabled={!!formData.assigned_zone_temp_id}
                        className="w-full min-h-[44px] border-[1.5px] border-slate-200 rounded-md px-2 py-1.5 text-xs outline-none focus:border-[#1F4E79] bg-white disabled:opacity-50 font-medium truncate"
                      >
                        <option value="">— None —</option>
                        {washrooms.map((w) => (
                          <option key={w.temp_id} value={w.temp_id}>
                            {w.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={handleCreate}
                className="w-full min-h-[48px] bg-[#1F4E79] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#163a5a] transition-colors shadow-sm mt-4 flex items-center justify-center gap-2"
              >
                👤 Add User
              </button>
            </div>
          )}

          {activeTab === "autofill" && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[#1F4E79] text-xl">🤖</span>
                <h3 className="font-bold text-sm text-slate-900">
                  AI Auto-Fill
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Automatically generate realistic team members. Cleaners will be
                auto-assigned to available washrooms so you can test the app
                preview quickly.
              </p>
              <div className="flex flex-col gap-3 mt-4">
                <button
                  onClick={handleAutoFill}
                  className="w-full bg-[#1F4E79] text-white py-3 min-h-[44px] rounded-lg font-bold text-sm hover:bg-[#163a5a] transition-colors shadow-sm"
                >
                  🤖 Add 1 Demo Cleaner
                </button>
                <button
                  onClick={handleAddFullTeam}
                  className="w-full bg-white border border-slate-200 text-slate-700 py-3 min-h-[44px] rounded-lg font-bold text-xs hover:bg-slate-50 transition-colors shadow-sm"
                >
                  👥 Add Full Demo Team (3 Staff)
                </button>
              </div>
            </div>
          )}

          {activeTab === "quickadd" && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm animate-in fade-in">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-amber-500 text-xl">⚡</span>
                <h3 className="font-bold text-sm text-slate-900">
                  Quick Role Add
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-5">
                Click a role to instantly generate a placeholder staff member.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => handleQuickAdd("cleaner")}
                  className="border border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-[#1F4E79] hover:bg-[#f8fafc] transition-all min-h-[80px] flex flex-col justify-center items-center group"
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                    🧹
                  </div>
                  <p className="text-xs font-bold text-slate-900">Cleaner</p>
                </div>
                <div
                  onClick={() => handleQuickAdd("supervisor")}
                  className="border border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-[#1F4E79] hover:bg-[#f8fafc] transition-all min-h-[80px] flex flex-col justify-center items-center group"
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                    👁️
                  </div>
                  <p className="text-xs font-bold text-slate-900">Supervisor</p>
                </div>
                <div
                  onClick={() => handleQuickAdd("admin")}
                  className="col-span-2 border border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-[#1F4E79] hover:bg-[#f8fafc] flex items-center justify-center gap-3 transition-all min-h-[60px]"
                >
                  <div className="text-2xl">⚙️</div>
                  <p className="text-xs font-bold text-slate-900">
                    System Admin
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "invite" && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[#2E7D32] text-xl">🔗</span>
                <h3 className="font-bold text-sm text-slate-900">
                  Invite Link
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Share this link with your team. They can fill their own details
                and join your workspace automatically.
              </p>
              <div className="flex flex-col gap-2 mt-4">
                <input
                  readOnly
                  value={inviteLink}
                  className="w-full min-h-[44px] border-[1.5px] border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 outline-none select-all"
                />
                <button
                  onClick={handleCopyInvite}
                  className={`text-white w-full min-h-[44px] flex items-center justify-center rounded-lg transition-colors font-bold text-sm shadow-sm ${isCopied ? "bg-[#2E7D32]" : "bg-[#1F4E79]"}`}
                >
                  {isCopied ? "✓ Link Copied!" : "📋 Copy Link"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-8 flex flex-col h-full w-full">
          <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm flex flex-col flex-1 h-[500px] lg:h-[700px]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 border-b border-slate-100 pb-4 gap-3">
              <div className="flex items-center justify-between w-full sm:w-auto">
                <h3 className="font-bold text-sm text-slate-900">
                  User Directory
                </h3>
                <span className="bg-[#e8f0f9] text-[#1F4E79] border border-[#bfdbfe] px-2 py-0.5 rounded-md text-[10px] font-bold ml-2">
                  {localUsers.length} users
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-[150px]">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                    🔍
                  </span>
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 border-[1.5px] border-slate-200 rounded-lg pr-3 py-2 text-xs outline-none focus:border-[#1F4E79] w-full min-h-[44px]"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full sm:w-[120px] border-[1.5px] border-slate-200 rounded-lg px-2 py-2 text-xs outline-none focus:border-[#1F4E79] bg-white font-medium min-h-[44px]"
                >
                  <option value="">All Roles</option>
                  <option value="cleaner">Cleaners</option>
                  <option value="supervisor">Supervisors</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>

            {localUsers.length > 0 && (
              <div className="mb-4 animate-in fade-in">
                <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 bg-slate-100">
                  <div
                    style={{
                      width: `${(counts.cleaner / totalUsers) * 100}%`,
                      backgroundColor: roleDisplay.cleaner.bar,
                      transition: "width 0.4s",
                    }}
                  />
                  <div
                    style={{
                      width: `${(counts.supervisor / totalUsers) * 100}%`,
                      backgroundColor: roleDisplay.supervisor.bar,
                      transition: "width 0.4s",
                    }}
                  />
                  <div
                    style={{
                      width: `${(counts.admin / totalUsers) * 100}%`,
                      backgroundColor: roleDisplay.admin.bar,
                      transition: "width 0.4s",
                    }}
                  />
                </div>
                <div className="flex gap-3 mt-2 text-[10px] md:text-xs flex-wrap">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                    <strong className="text-slate-700">{counts.cleaner}</strong>{" "}
                    Cleaners
                  </span>
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
                    <strong className="text-slate-700">
                      {counts.supervisor}
                    </strong>{" "}
                    Sup.
                  </span>
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#64748b]"></span>
                    <strong className="text-slate-700">{counts.admin}</strong>{" "}
                    Admins
                  </span>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-10 text-sm text-slate-400 h-full flex flex-col justify-center">
                  <span className="text-4xl block mb-3 opacity-30">👥</span>
                  {localUsers.length === 0
                    ? "No users added yet."
                    : "No users match filter."}
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const roleData = roleDisplay[u.role] || roleDisplay.cleaner;

                  let assignmentText = (
                    <span className="text-slate-400 italic text-[10px]">
                      No assignment
                    </span>
                  );
                  if (u.role === "admin") {
                    assignmentText = (
                      <span className="text-slate-600 font-bold text-[10px]">
                        System Administrator
                      </span>
                    );
                  } else if (
                    u.role === "supervisor" &&
                    u.assigned_zone_temp_id
                  ) {
                    const zName =
                      nodes.find((n) => n.temp_id === u.assigned_zone_temp_id)
                        ?.name || "Unknown Location";
                    assignmentText = (
                      <span className="text-amber-700 text-[10px] font-bold">
                        Location:{" "}
                        <span className="text-slate-800">{zName}</span>
                      </span>
                    );
                  } else if (u.assigned_washrooms?.length > 0) {
                    const wNames = u.assigned_washrooms.map(
                      (wid) =>
                        washrooms.find((w) => w.temp_id === wid)?.name ||
                        "Unknown",
                    );
                    assignmentText = (
                      <span className="text-emerald-700 text-[10px] font-bold truncate block">
                        Assigned:{" "}
                        <span className="text-slate-800">
                          {wNames.join(", ")}
                        </span>
                      </span>
                    );
                  }

                  return (
                    <div
                      key={u.temp_id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 border border-slate-200 rounded-xl bg-white hover:border-[#1F4E79] transition-colors animate-in slide-in-from-bottom-2 gap-3"
                    >
                      <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden flex-1">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-xl shrink-0 shadow-sm">
                          {roleData.icon}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm md:text-base text-slate-900 truncate">
                              {u.name}
                            </p>
                            <span
                              className={`hidden sm:inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${roleData.color}`}
                            >
                              {roleData.label}
                            </span>
                          </div>
                          <p className="text-[10px] md:text-xs text-slate-500 font-medium font-mono mt-0.5">
                            +91 {u.phone}
                          </p>
                          <div
                            className={`mt-1.5 inline-block px-2 py-1 rounded-md border text-[9px] w-fit max-w-full truncate ${u.role === "cleaner" ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-200"}`}
                          >
                            {assignmentText}
                          </div>
                        </div>
                      </div>

                      {/* Mobile Role Badge (hidden on desktop) */}
                      <div className="sm:hidden w-full flex justify-start mb-1">
                        <span
                          className={`text-[9px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${roleData.color}`}
                        >
                          {roleData.label}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDelete(u.temp_id)}
                        className="w-full sm:w-auto text-red-500 bg-red-50 hover:bg-red-100 font-bold text-xs px-4 py-2 rounded-lg transition-colors min-h-[44px] sm:min-h-0 shrink-0 border border-red-100"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden shadow-sm h-[400px]">
        <LiveFlowchart
          title="TEAM DISTRIBUTION MAP"
          countLabel={`${localUsers.length} staff`}
          treeData={buildTreeData(nodes, washrooms, localUsers)}
        />
      </div>

      <div className="flex flex-col-reverse md:flex-row justify-between mt-6 pt-4 border-t border-slate-200 gap-3 w-full">
        <button
          onClick={onBack}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 font-bold text-sm rounded-lg border border-slate-200 bg-white text-slate-700 min-h-[48px] px-6 hover:bg-slate-50 transition-colors shadow-sm"
        >
          ← Back
        </button>
        <button
          onClick={handleContinue}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 font-bold text-sm rounded-lg bg-[#1F4E79] text-white min-h-[48px] px-8 hover:bg-[#163a5a] transition-colors shadow-sm"
        >
          Continue to App Preview ➔
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
