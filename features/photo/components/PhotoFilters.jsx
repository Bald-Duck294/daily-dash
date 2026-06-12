"use client";
import React from "react";
import { Search } from "lucide-react";
// Adjust the import path to wherever you saved the query hooks
import { useCompaniesDropdown, useDropdownLocations } from "@/features/dropdownList/dropdownlist.query"; 

export default function PhotoFilters({ filters, setFilters }) {
  const { data: companies = [], isLoading: isLoadingCompanies } = useCompaniesDropdown();

  const { data: locations = [], isLoading: isLoadingLocations } = useDropdownLocations(
    filters.company === "all" ? null : filters.company
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFilters((prev) => {
      const updatedFilters = { ...prev, [name]: value };
      
      if (name === "company") {
        updatedFilters.location = "all";
        updatedFilters.page = 1; 
      }
      
      if (name !== "page") {
        updatedFilters.page = 1;
      }

      return updatedFilters;
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Search Bar - Full Width */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          name="search"
          placeholder="Search by company or location..."
          value={filters.search}
          onChange={handleChange}
          className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
        />
      </div>

      {/* Inline Filters Container */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Company Dropdown */}
        <select 
          name="company" 
          value={filters.company} 
          onChange={handleChange} 
          disabled={isLoadingCompanies}
          className="flex-1 min-w-[180px] p-2 text-sm border rounded-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 dark:text-white disabled:opacity-50 outline-none cursor-pointer"
        >
          <option value="all">
            {isLoadingCompanies ? "Loading Companies..." : "All Companies"}
          </option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Location Dropdown */}
        <select 
          name="location" 
          value={filters.location} 
          onChange={handleChange} 
          disabled={isLoadingLocations || locations.length === 0}
          className="flex-1 min-w-[180px] p-2 text-sm border rounded-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 dark:text-white disabled:opacity-50 outline-none cursor-pointer"
        >
          <option value="all">
            {isLoadingLocations ? "Loading Locations..." : "All Locations"}
          </option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>

        {/* Image Type Dropdown */}
        <select 
          name="imageType" 
          value={filters.imageType} 
          onChange={handleChange} 
          className="flex-1 min-w-[140px] p-2 text-sm border rounded-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 dark:text-white outline-none cursor-pointer"
        >
          <option value="all">All Image Types</option>
          <option value="before">Before</option>
          <option value="after">After</option>
        </select>

        {/* Date Pickers (Grouped tightly) */}
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <input 
            type="date" 
            name="startDate" 
            value={filters.startDate} 
            onChange={handleChange} 
            className="w-1/2 p-2 text-sm border rounded-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 dark:text-white outline-none cursor-pointer" 
          />
          <input 
            type="date" 
            name="endDate" 
            value={filters.endDate} 
            onChange={handleChange} 
            className="w-1/2 p-2 text-sm border rounded-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 dark:text-white outline-none cursor-pointer" 
          />
        </div>
      </div>
    </div>
  );
}