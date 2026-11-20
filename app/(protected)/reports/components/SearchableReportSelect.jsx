"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X, Check } from "lucide-react";

/**
 * SearchableReportSelect
 * A custom select dropdown where the search bar only appears inside the opened popover menu.
 */
export default function SearchableReportSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select option",
  searchPlaceholder = "Type to search...",
  disabled = false,
  isLoading = false,
  allOptionLabel = "All",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-focus search input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm("");
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Find currently selected label
  const selectedOption = options.find(
    (opt) => String(opt.id) === String(value)
  );

  // Filter options based on search query
  const filteredOptions = options.filter((opt) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const label = (opt.label || opt.name || opt.display_name || "").toLowerCase();
    return label.includes(q);
  });

  const handleSelect = (selectedId) => {
    onChange(selectedId);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* Dropdown trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full px-4 py-3 text-sm font-medium rounded-xl bg-[var(--report-input-bg)] border border-[var(--report-input-border)] text-[var(--report-input-text)] flex items-center justify-between text-left transition-all disabled:opacity-60 focus:border-[var(--report-input-focus)] outline-none cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">
          {isLoading
            ? "Loading..."
            : selectedOption
            ? selectedOption.label || selectedOption.name || selectedOption.display_name
            : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`ml-2 flex-shrink-0 text-[var(--report-input-placeholder)] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Popover menu containing search input and options */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-1.5 animate-in fade-in zoom-in-95 duration-100">
          {/* Search input inside dropdown only */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-7 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchTerm("");
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Scrollable options list */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 scrollbar-thin">
            {/* "All" reset option */}
            <button
              type="button"
              onClick={() => handleSelect("")}
              className={`w-full flex items-center justify-between text-left px-3 py-2 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                !value
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <span>{allOptionLabel}</span>
              {!value && <Check size={14} className="text-blue-600 dark:text-blue-400" />}
            </button>

            {/* Filtered options */}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = String(value) === String(opt.id);
                const optText = opt.label || opt.name || opt.display_name;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect(opt.id)}
                    className={`w-full flex items-center justify-between text-left px-3 py-2 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="truncate pr-2">{optText}</span>
                    {isSelected && (
                      <Check size={14} className="flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="py-4 text-center text-xs text-slate-400 dark:text-slate-500">
                No matching options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
