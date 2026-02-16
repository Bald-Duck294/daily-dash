"use client";
import { ChevronDown } from "lucide-react";
export default function LocationTypeSelect({
  types,
  selectedType,
  setSelectedType,
  className = ""

}) {
  // console.log(types, "types");
  return (
  <div className={`relative ${className}`}>
  <select
    value={selectedType || ""}
    onChange={(e) => setSelectedType(e.target.value)}
    className="
      w-full h-11 px-4 pr-10 rounded-xl text-sm appearance-none
      border border-slate-200 bg-white text-slate-700
      focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10
      transition-all outline-none

      dark:bg-slate-800
      dark:border-slate-700
      dark:text-slate-200
      dark:focus:border-cyan-400
      dark:focus:ring-cyan-400/20
    "
  >
    <option value="">Select a location hierarchy</option>
    {types.map((type) => (
      <option key={type.id} value={type.id}>
        {type.name}
      </option>
    ))}
  </select>

  <ChevronDown
    size={16}
    className="
      absolute right-4 top-1/2 -translate-y-1/2
      pointer-events-none
      text-slate-400
      dark:text-slate-500
    "
  />
</div>

  );
}
