"use client";

import { useState, useRef, useEffect } from "react";
import locationTypesApi from "@/features/locationTypes/locationTypes.api";
import { useCompanyId } from "@/providers/CompanyProvider";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Layers,
  Info,
  ChevronDown,
  RotateCcw,
  Save,
  Search,
  FolderTree, Map
} from "lucide-react";

export default function CreateForm({ onCreated, allTypes }) {
  const { companyId } = useCompanyId();
  const router = useRouter();
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false);
  const [parentSearchTerm, setParentSearchTerm] = useState("");
  const parentDropdownRef = useRef(null);
  const normalizeName = (value) =>
    value.trim().replace(/\s+/g, " ").toLowerCase();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Zone type name is required");
      return;
    }

    const duplicate = allTypes?.some((type) => {
      const sameLevel =
        (!parentId && !type.parent_id) ||
        (parentId && type.parent_id === Number(parentId));

      return sameLevel && normalizeName(type.name) === normalizeName(name);
    });

    if (duplicate) {
      toast.error("A zone with this name already exists at this level");
      return;
    }

    setIsSubmitting(true);
    const loading = toast.loading("Creating zone...");

    try {
      await locationTypesApi.create(
        {
          name: name.trim(),
          parent_id: parentId ? Number(parentId) : null,
        },
        companyId
      );

      toast.success("Zone created successfully", { id: loading });

      setName("");
      setParentId("");
      onCreated();
    } catch (err) {
      toast.error("Failed to create zone", { id: loading });
    } finally {
      setIsSubmitting(false);
    }
  };
  const filteredParents = allTypes?.filter((type) =>
    type.name.toLowerCase().includes(parentSearchTerm.toLowerCase())
  ) || [];
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (parentDropdownRef.current && !parentDropdownRef.current.contains(event.target)) {
        setIsParentDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ===== FORM HEADER ===== */}
      {/* <div className="flex items-center gap-4 pb-4 border-b border-border">
        <div className="h-11 w-11 rounded-xl bg-indigo-100 flex items-center justify-center">
          <Layers className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold tracking-wide">
            ZONE CONFIGURATION
          </h3>
          <p className="text-xs text-muted-foreground uppercase">
            Define a new zone classification
          </p>
        </div>
      </div> */}

      {/* ===== ZONE NAME ===== */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase text-indigo-600">
          Zone Type Name <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Layers className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder=""
            disabled={isSubmitting}
            maxLength={100}
            className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
          />
        </div>
      </div>

      {/* ===== PARENT TYPE ===== */}
    <div className="text-left space-y-2 relative" ref={parentDropdownRef}>
  <label className="text-xs font-black uppercase tracking-widest ml-1 flex items-center gap-2" style={{ color: "var(--assignment-title)" }}>
    Parent Type <span className="text-slate-400 normal-case font-normal">(Optional)</span>
  </label>
  
  <div className="relative">
    {/* Trigger Input */}
    <div 
      onClick={() => setIsParentDropdownOpen(!isParentDropdownOpen)} 
      className="relative cursor-pointer group"
    >
      <input
        type="text"
        readOnly
        value={allTypes?.find(t => t.id === parentId)?.name || ""}
        placeholder="Select parent type..."
        className="w-full px-4 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base rounded-xl outline-none cursor-pointer transition-all"
        style={{ 
          background: "var(--assignment-input-bg)", 
          border: "1px solid var(--assignment-input-border)", 
          color: "var(--assignment-input-text)" 
        }}
      />
      <ChevronDown 
        size={18} 
        strokeWidth={2.5} 
        className={`absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 transition-transform duration-300 ${isParentDropdownOpen ? "rotate-180" : ""}`} 
        style={{ color: "var(--assignment-subtitle)" }} 
      />
    </div>

    {/* Dropdown Panel */}
    {isParentDropdownOpen && (
      <div 
        className="absolute z-50 w-full mt-2 rounded-xl overflow-hidden flex flex-col" 
        style={{ 
          background: "var(--assignment-dropdown-bg)", 
          border: "1px solid var(--assignment-dropdown-border)", 
          boxShadow: "var(--assignment-shadow)", 
          maxHeight: "300px" 
        }}
      >
        {/* Search Header */}
        <div className="p-2.5 flex-shrink-0" style={{ borderBottom: "1px solid var(--assignment-divider)" }}>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--assignment-subtitle)" }} />
            <input 
              type="text" 
              value={parentSearchTerm} 
              onChange={(e) => setParentSearchTerm(e.target.value)} 
              placeholder="Search zones..." 
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg outline-none" 
              style={{ background: "var(--assignment-input-bg)", border: "1px solid var(--assignment-input-border)", color: "var(--assignment-input-text)" }} 
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>

        {/* List Items */}
        <div className="overflow-y-auto flex-1 p-1">
  {filteredParents.length === 0 ? (
    <div className="p-4 text-center text-sm" style={{ color: "var(--assignment-subtitle)" }}>No types found</div>
  ) : (
    filteredParents.map((type) => {
      const isSelected = parentId === type.id;
      const isMain = !type.parent_id; // Check if root item
      
      return (
        <div 
          key={type.id} 
          onClick={() => { setParentId(type.id); setIsParentDropdownOpen(false); }}
          className="flex items-center px-3 py-2.5 cursor-pointer rounded-lg transition-colors mx-1 my-0.5 group" 
          style={{ 
            background: isSelected ? "var(--assignment-dropdown-selected)" : "transparent",
            // This padding creates the hierarchy tree look
            paddingLeft: `${(type.level || 0) * 24 + 12}px` 
          }}
        >
          {/* Hierarchy Dash (Only for children) */}
          {type.level > 0 && (
            <span className="text-slate-400 mr-2 opacity-50 font-mono">—</span>
          )}
          
          {/* Square Checkbox (matching your image) */}
          <div 
            className="w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 mr-3" 
            style={{ 
              borderColor: isSelected ? "var(--assignment-accent-border)" : "var(--assignment-border)"
            }}
          >
             {isSelected && (
               <div className="w-2 h-2 rounded-[1px]" style={{ background: "var(--assignment-accent-border)" }} />
             )}
          </div>
          
          {/* Folder Icon */}
          <FolderTree className="w-4 h-4 flex-shrink-0 mr-2" style={{ color: "var(--assignment-subtitle)" }} />
          
          {/* Name */}
          <span className="text-sm font-medium" style={{ color: "var(--assignment-input-text)" }}>{type.name}</span>
          
          {/* "MAIN" Tag */}
          {isMain && (
            <span className="ml-auto text-[9px] font-bold uppercase tracking-widest opacity-40 pr-1" style={{ color: "var(--assignment-subtitle)" }}>
              MAIN
            </span>
          )}
        </div>
      );
    })
  )}
</div>
      </div>
    )}
  </div>
</div>


      {/* ===== INFO BOX ===== */}
      <div className="
  flex gap-4 rounded-xl p-4
  border border-emerald-200 bg-emerald-50
  dark:bg-emerald-900/20 dark:border-emerald-800
">
        <div className="
    flex-shrink-0 h-9 w-9 rounded-lg
    bg-emerald-100 dark:bg-emerald-800/40
    flex items-center justify-center
  ">
          <Info className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
            Functional Relationship Architecture
          </p>

          <p className="
      text-xs mt-1 leading-relaxed
      text-slate-600 dark:text-slate-400
    ">
            Establishing a parent organizes zones logically and enables better
            resource management across the registry.
          </p>
        </div>
      </div>


      {/* ===== ACTIONS ===== */}
      <div className="flex gap-4 pt-6">
        <button
          type="button"
          onClick={() => router.push("/location-types")}
          disabled={isSubmitting}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-400 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4" />
          Discard
        </button>

        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-300 to-orange-400 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          Create Zone
        </button>
      </div>
    </form>
  );
}
