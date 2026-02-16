/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

export default function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = "Select or type...",
  allowCustom = true,
  label,
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (searchTerm) {
      const filtered = options.filter(opt =>
        opt.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    if (allowCustom) {
      onChange(newValue);
    }
    if (!isOpen) setIsOpen(true);
  };

  const clearSelection = () => {
    onChange("");
    setSearchTerm("");
  };

  return (
      <div ref={dropdownRef} className="relative">

      <div className="relative">
        <input
          type="text"
          value={value || searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="
  w-full p-3 pr-20 rounded-xl text-sm transition-all duration-200 outline-none
  border border-slate-300 bg-white text-slate-700
  focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500

  dark:bg-slate-800
  dark:border-slate-700
  dark:text-slate-200
  dark:placeholder-slate-500
  dark:focus:ring-cyan-400/30
  dark:focus:border-cyan-400
"

        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {value && (
            <button
              type="button"
              onClick={clearSelection}
              className="text-slate-400 hover:text-slate-600
dark:text-slate-500 dark:hover:text-slate-300 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <ChevronDown
            className={`h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}

          />
        </div>
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="
  absolute z-50 w-full mt-2 rounded-xl shadow-lg max-h-60 overflow-y-auto
  bg-white border border-slate-200

  dark:bg-slate-800
  dark:border-slate-700
"
        >
          {filteredOptions.map((option, index) => (
            <div
              key={index}
              onClick={() => handleSelect(option)}
              className="
  px-4 py-3 cursor-pointer transition-colors duration-150
  text-slate-700 hover:bg-cyan-50

  dark:text-slate-200
  dark:hover:bg-slate-700
"

            >
              {option}
            </div>
          ))}
        </div>
      )}

      {isOpen && filteredOptions.length === 0 && searchTerm && (
        <div className="
  absolute z-50 w-full mt-2 p-4 text-center rounded-xl shadow-lg
  bg-white border border-slate-200 text-slate-500

  dark:bg-slate-800
  dark:border-slate-700
  dark:text-slate-400
"
        >
          {allowCustom ? `Press Enter to use "${searchTerm}"` : "No results found"}
        </div>
      )}
    </div>
  );
}
