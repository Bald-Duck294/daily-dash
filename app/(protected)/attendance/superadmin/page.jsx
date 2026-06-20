"use client";

import React, { useState, useEffect } from 'react';
import { useCompanyId } from "@/providers/CompanyProvider";
import { useQueryClient } from '@tanstack/react-query';
import { useCleanerAttendance } from '@/features/attendance/attendance.queries';
import Attendance from '@/features/attendance/component/Attendance.jsx';
import OnDutyList from '@/features/attendance/component/OnDutyList.jsx';
import { ChevronDown, RefreshCw, Filter, Users, UserCheck, UserX, LayoutGrid, List } from 'lucide-react';

// 🟢 Import all 3 Dropdown APIs
import {
  useCompaniesDropdown,
  useAssignedCleanersDropdown,
  useDropdownLocations
} from "@/features/dropdownList/dropdownlist.query";

// Helpers for Date Presets
const getLocalDateString = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60 * 1000).toISOString().split("T")[0];
};

const getStartOfWeek = () => {
  const d = new Date();
  const day = d.getDay() || 7;
  if (day !== 1) d.setHours(-24 * (day - 1));
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60 * 1000).toISOString().split("T")[0];
};

export default function SuperAdminAttendancePage() {
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState('matrix');
  const [datePreset, setDatePreset] = useState("Today");
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('all');

  const [filters, setFilters] = useState({
    companyId: "",
    locationId: "all",
    cleanerId: "all",
    start_date: getLocalDateString(0),
    end_date: getLocalDateString(0),
    page: 1,
    limit: 100
  });

  // 🟢 1. Fetch Companies
  const { data: companies = [], isLoading: isLoadingCompanies } = useCompaniesDropdown();

  // 🟢 2. Fetch Locations and Cleaners ONLY for the selected company (or null if "all")
  const activeCompanyId = filters.companyId === "all" ? null : filters.companyId;
  const { data: locations = [] } = useDropdownLocations(activeCompanyId);
  const { data: cleaners = [] } = useAssignedCleanersDropdown(activeCompanyId);

  // Date Preset Logic
  useEffect(() => {
    let start = filters.start_date;
    let end = getLocalDateString(0);

    switch (datePreset) {
      case "Today":
        start = end;
        break;
      case "This Week":
        start = getStartOfWeek();
        break;
      case "Last 30 Days":
        start = getLocalDateString(-30);
        break;
      case "Custom Date":
        return;
    }

    if (datePreset !== "Custom Date") {
      setFilters(prev => ({ ...prev, start_date: start, end_date: end, page: 1 }));
    }
  }, [datePreset]);

  // 🟢 3. Fetch Matrix Data
  const { data: queryResult, isLoading, isError, error, refetch } = useCleanerAttendance(
    {
      cleaner_user_id: filters.cleanerId !== "all" ? filters.cleanerId : "",
      search: "",
      locationId: filters.locationId !== "all" ? filters.locationId : "",
      start_date: filters.start_date,
      end_date: filters.end_date,
      page: filters.page,
      limit: filters.limit
    },
    activeCompanyId
  );

  const records = queryResult?.data?.data || queryResult?.data || [];
  const pagination = queryResult?.data?.pagination || queryResult?.pagination || null;

  // 🟢 KPI MATH (Identical to Client Side)
  const selectedLocObj = locations.find(loc => loc.id.toString() === filters.locationId);
  const selectedLocationName = selectedLocObj ? selectedLocObj.name : "all";

  const uniqueCleanersInPeriod = new Set(records.map(r => r.cleaner_id)).size;

  const relevantCleaners = selectedLocationName === "all"
    ? cleaners
    : cleaners.filter(c => c.locations?.includes(selectedLocationName));

  const totalAssigned = relevantCleaners.length;
  // If "All Companies" is selected, relevantCleaners might be empty depending on your backend,
  // so 'missing' will naturally calculate based on available data.
  const missing = totalAssigned > uniqueCleanersInPeriod ? totalAssigned - uniqueCleanersInPeriod : 0;

  const kpiLabelSuffix = datePreset === "Custom Date" ? "(Custom Range)" : `(${datePreset})`;

  // 🟢 Dynamic Filter Change Handler
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => {
      const newFilters = { ...prev, [name]: value, page: 1 };

      // If the Company changes, reset the Location and Cleaner selections 
      // because the new company has different locations/cleaners.
      if (name === "companyId") {
        newFilters.locationId = "all";
        newFilters.cleanerId = "all";
      }

      return newFilters;
    });
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['cleanerAttendance'] });
    await refetch();
  };

  return (
    <div className="min-h-screen text-slate-700 dark:text-slate-300 font-sans p-4 sm:p-6 pb-20 transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto space-y-4">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:mt-[-30px]">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-wide">Global Attendance Explorer</h1>
            <p className="text-sm text-slate-500 mt-1">Review check-in times across all active capability centers.</p>
          </div>
          <button
            onClick={() => setViewMode(prev => prev === 'matrix' ? 'list' : 'matrix')}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-[#3B82F6] dark:hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            {viewMode === 'matrix' ? <List size={16} /> : <LayoutGrid size={16} />}
            {viewMode === 'matrix' ? 'View On-Duty List' : 'View Matrix'}
          </button>
        </div>

        {/* FILTER BAR */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex flex-wrap items-center gap-3 shadow-sm dark:shadow-none transition-colors duration-200">

          {/* 🟢 COMPANY DROPDOWN */}
          <div className="relative flex-1 min-w-[150px]">
            <select
              name="companyId"
              value={filters.companyId}
              onChange={handleFilterChange}
              disabled={isLoadingCompanies}
              className={`w-full bg-white dark:bg-[#1F2937] text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm appearance-none focus:outline-none focus:border-blue-500 transition-colors duration-200 ${isLoadingCompanies ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {/* 🟢 Changed to "Select Company" and disabled it */}
              <option value="" disabled>
                {isLoadingCompanies ? 'Loading Companies...' : 'Select Company'}
              </option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {isLoadingCompanies ? (
              <RefreshCw size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin pointer-events-none" />
            ) : (
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            )}
          </div>

          {/* 🟢 LOCATION DROPDOWN (Filtered by Company) */}
          <div className="relative flex-1 min-w-[150px]">
            <select
              name="locationId"
              value={filters.locationId}
              onChange={handleFilterChange}
              disabled={filters.companyId === "all" && locations.length === 0} // Optional: disable if no company selected and backend returns empty
              className="w-full bg-white dark:bg-[#1F2937] text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm appearance-none focus:outline-none focus:border-blue-500 transition-colors duration-200 cursor-pointer disabled:opacity-50"
            >
              <option value="all">All Locations</option>
              {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* 🟢 CLEANER DROPDOWN (Filtered by Company) */}
          <div className="relative flex-1 min-w-[150px]">
            <select
              name="cleanerId"
              value={filters.cleanerId}
              onChange={handleFilterChange}
              disabled={filters.companyId === "all" && cleaners.length === 0}
              className="w-full bg-white dark:bg-[#1F2937] text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm appearance-none focus:outline-none focus:border-blue-500 transition-colors duration-200 cursor-pointer disabled:opacity-50"
            >
              <option value="all">All Cleaners</option>
              {cleaners.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Date Preset Dropdown */}
          <div className="relative flex-1 min-w-[150px]">
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="w-full bg-white dark:bg-[#1F2937] text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm appearance-none focus:outline-none focus:border-blue-500 transition-colors duration-200 cursor-pointer"
            >
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Custom Date">Custom Date</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Custom Date Pickers */}
          {datePreset === "Custom Date" && (
            <>
              <input
                type="date"
                name="start_date"
                value={filters.start_date}
                onChange={handleFilterChange}
                className="bg-white dark:bg-[#1F2937] text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors duration-200"
              />
              <input
                type="date"
                name="end_date"
                value={filters.end_date}
                onChange={handleFilterChange}
                className="bg-white dark:bg-[#1F2937] text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors duration-200"
              />
            </>
          )}

          {/* Actions */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className={`p-2 bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-300 transition-colors cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RefreshCw size={16} className={`${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {!filters.companyId ? (
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg p-16 flex flex-col items-center justify-center text-center shadow-sm mt-6 transition-colors duration-200">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 border border-blue-100 dark:border-blue-800">
              <Filter size={24} className="text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No Company Selected</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
              Please select a capability center from the dropdown above to view the attendance records, missing staff, and detailed reports.
            </p>
          </div>
        ) : (
          <>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* 🟢 ON DUTY CARD */}
              <div
                // 👇 THIS IS THE FIX: Toggle back to 'all' if already 'present'
                onClick={() => setAttendanceStatusFilter(current => current === 'present' ? 'all' : 'present')}
                className={`cursor-pointer transition-all duration-200 bg-white dark:bg-[#111827] border rounded-lg p-4 flex items-center justify-between shadow-sm ${attendanceStatusFilter === 'present'
                    ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20' // Added slight background tint when active
                    : 'border-slate-200 dark:border-slate-800'
                  }`}
              >
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-semibold uppercase tracking-wider">
                  <UserCheck size={16} /> Global On Duty <span className="text-xs opacity-75">{kpiLabelSuffix}</span>
                </div>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{uniqueCleanersInPeriod}</span>
              </div>

              {/* 🟢 MISSING CARD */}
              <div
                // 👇 THIS IS THE FIX: Toggle back to 'all' if already 'absent'
                onClick={() => setAttendanceStatusFilter(current => current === 'absent' ? 'all' : 'absent')}
                className={`cursor-pointer transition-all duration-200 bg-white dark:bg-[#111827] border rounded-lg p-4 flex items-center justify-between shadow-sm ${attendanceStatusFilter === 'absent'
                    ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/50 dark:bg-rose-900/20' // Added slight background tint when active
                    : 'border-slate-200 dark:border-slate-800'
                  }`}
              >
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-500 text-sm font-semibold uppercase tracking-wider">
                  <UserX size={16} /> Global Missing <span className="text-xs opacity-75">{kpiLabelSuffix}</span>
                </div>
                <span className="text-2xl font-bold text-rose-600 dark:text-rose-500">
                  {filters.companyId ? missing : 'N/A'}
                </span>
              </div>
            </div>

            {/* MATRIX / LIST RENDERING */}
            {viewMode === 'matrix' ? (
              <Attendance
                records={records}
                allCleaners={cleaners} // Passed properly so missing calculations work
                attendanceStatusFilter={attendanceStatusFilter}
                selectedLocationName={selectedLocationName}
                selectedCleaner={filters.cleanerId}
                startDate={filters.start_date}
                endDate={filters.end_date}
                pagination={pagination}
                isLoading={isLoading}
                isError={isError}
                error={error}
                onPageChange={handlePageChange}
              />
            ) : (
              <OnDutyList
                records={records}
                allCleaners={cleaners} // Passed properly so missing list generates
                attendanceStatusFilter={attendanceStatusFilter}
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}