"use client";
import React from "react";
import { Search } from "lucide-react";
// Adjust the import path to wherever you saved the query hooks
import { useCompaniesDropdown, useDropdownLocations } from "@/features/dropdownList/dropdownlist.query"; 

export default function PhotoFilters({ filters, setFilters }) {
  // 1. Fetch Companies using TanStack Query
  const { data: companies = [], isLoading: isLoadingCompanies } = useCompaniesDropdown();

  // 2. Fetch Locations dynamically based on the selected company
  // We pass the company ID if it's selected. If "all" is selected, we can pass "all" 
  // (since !!"all" evaluates to true, keeping the query enabled, and your backend handles "all").
 const { data: locations = [], isLoading: isLoadingLocations } = useDropdownLocations(
    filters.company === "all" ? null : filters.company
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFilters((prev) => {
      const updatedFilters = { ...prev, [name]: value };
      
      // Reset logic: If company changes, reset location and go back to page 1
      if (name === "company") {
        updatedFilters.location = "all";
        updatedFilters.page = 1; 
      }
      
      // If any filter changes (other than pagination itself), reset back to page 1
      if (name !== "page") {
        updatedFilters.page = 1;
      }

      return updatedFilters;
    });
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          name="search"
          placeholder="Search by company or location..."
          value={filters.search}
          onChange={handleChange}
          className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Dynamic Company Dropdown */}
        <select 
          name="company" 
          value={filters.company} 
          onChange={handleChange} 
          disabled={isLoadingCompanies}
          className="p-2 border rounded-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 dark:text-white disabled:opacity-50 transition-opacity"
        >
          <option value="all">
            {isLoadingCompanies ? "Loading Companies..." : "All Companies"}
          </option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Dynamic Location Dropdown */}
        <select 
          name="location" 
          value={filters.location} 
          onChange={handleChange} 
          // Disable if locations are still loading OR if the array is empty
          disabled={isLoadingLocations || locations.length === 0}
          className="p-2 border rounded-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 dark:text-white disabled:opacity-50 transition-opacity"
        >
          <option value="all">
            {isLoadingLocations ? "Loading Locations..." : "All Locations"}
          </option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>

        <select 
          name="imageType" 
          value={filters.imageType} 
          onChange={handleChange} 
          className="p-2 border rounded-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 dark:text-white"
        >
          <option value="all">All Image Types</option>
          <option value="before">Before</option>
          <option value="after">After</option>
          <option value="pairs">Before & After Pairs</option>
        </select>

        <div className="flex gap-2">
          <input 
            type="date" 
            name="startDate" 
            value={filters.startDate} 
            onChange={handleChange} 
            className="w-1/2 p-2 border rounded-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 dark:text-white" 
          />
          <input 
            type="date" 
            name="endDate" 
            value={filters.endDate} 
            onChange={handleChange} 
            className="w-1/2 p-2 border rounded-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 dark:text-white" 
          />
        </div>
      </div>
    </div>
  );
}