"use client";

import React, { useState, useEffect } from 'react';
import { useCompanyId } from "@/providers/CompanyProvider";
import { useCleanerAttendance } from '@/features/attendance/attendance.queries';
import Attendance from '@/features/attendance/component/Attendance.jsx';
import { ChevronDown, RefreshCw, Filter, Users, UserCheck, UserX, LayoutGrid, List } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
// Import the real TanStack query hooks
import { useAssignedCleanersDropdown, useDropdownLocations } from "@/features/dropdownList/dropdownlist.query";
import OnDutyList from '@/features/attendance/component/OnDutyList.jsx';
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

export default function AttendancePage() {
  const { companyId } = useCompanyId();
  const queryClient = useQueryClient();
  // Fetch real data for the dropdowns
  const { data: locations = [] } = useDropdownLocations(companyId);
  const { data: cleaners = [] } = useAssignedCleanersDropdown(companyId);
  const [viewMode, setViewMode] = useState('matrix');
  const [datePreset, setDatePreset] = useState("Today");

  const [filters, setFilters] = useState({
    locationId: "all",
    cleanerId: "all",
    start_date: getLocalDateString(0),
    end_date: getLocalDateString(0),
    page: 1,
    limit: 100
  });
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('all');

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

  const { data: queryResult, isLoading, isError, error, refetch } = useCleanerAttendance(
    {
      // 🟢 CORRECT: Use cleaner_user_id for IDs, search for text
      cleaner_user_id: filters.cleanerId !== "all" ? filters.cleanerId : "",
      search: "", // Keep search empty unless you are typing a name
      locationId: filters.locationId !== "all" ? filters.locationId : "",
      start_date: filters.start_date,
      end_date: filters.end_date,
      page: filters.page,
      limit: filters.limit
    },
    companyId
  );

  const records = queryResult?.data?.data || queryResult?.data || [];
  const pagination = queryResult?.data?.pagination || queryResult?.pagination || null;

  // 🟢 FIND THE LOCATION NAME FOR FILTERING
  const selectedLocObj = locations.find(loc => loc.id.toString() === filters.locationId);
  const selectedLocationName = selectedLocObj ? selectedLocObj.name : "all";

  // 🟢 DYNAMIC KPI MATH
  const uniqueCleanersInPeriod = new Set(
    records.map(r => r.cleaner_id)
  ).size;

  // Make sure the "Missing" card calculates against the filtered roster!
  const relevantCleaners = selectedLocationName === "all"
    ? cleaners
    : cleaners.filter(c => c.locations?.includes(selectedLocationName));

  const totalAssigned = relevantCleaners.length;
  const missing = totalAssigned > uniqueCleanersInPeriod ? totalAssigned - uniqueCleanersInPeriod : 0;

  // 🟢 DYNAMIC LABEL GENERATOR
  const kpiLabelSuffix = datePreset === "Custom Date" ? "(Custom Range)" : `(${datePreset})`;

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };
  const handleRefresh = async () => {
    // 🟢 Step A: Invalidate the specific query key used in 'useCleanerAttendance'
    // Make sure 'cleanerAttendance' matches the queryKey in your useCleanerAttendance hook
    await queryClient.invalidateQueries({ queryKey: ['cleanerAttendance'] });

    // 🟢 Step B: Trigger the refetch
    await refetch();
  };

  return (
    <div className="min-h-screen text-slate-700 dark:text-slate-300 font-sans p-4 sm:p-6 pb-20 transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto space-y-4">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:mt-[-30px]">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-wide">Attendance Explorer</h1>
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

          {/* Location Dropdown */}
          <div className="relative flex-1 min-w-[150px]">
            <select
              name="locationId"
              value={filters.locationId}
              onChange={handleFilterChange}
              className="w-full bg-white dark:bg-[#1F2937] text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm appearance-none focus:outline-none focus:border-blue-500 transition-colors duration-200"
            >
              <option value="all">All Locations</option>
              {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Cleaner Dropdown */}
          <div className="relative flex-1 min-w-[150px]">
            <select
              name="cleanerId"
              value={filters.cleanerId}
              onChange={handleFilterChange}
              className="w-full bg-white dark:bg-[#1F2937] text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm appearance-none focus:outline-none focus:border-blue-500 transition-colors duration-200"
            >
              <option value="all"> All Cleaners</option>
              {cleaners.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Date Preset Dropdown */}
          <div className="relative flex-1 min-w-[150px]">
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="w-full bg-white dark:bg-[#1F2937] text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm appearance-none focus:outline-none focus:border-blue-500 transition-colors duration-200"
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
            className={`p-2 bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-700 
    hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md 
    text-slate-600 dark:text-slate-300 transition-colors cursor-pointer 
    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RefreshCw
              size={16}
              className={`${isLoading ? 'animate-spin' : ''}`}
            />
          </button>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* ON DUTY CARD */}
          <div
            onClick={() => setAttendanceStatusFilter(prev => prev === 'present' ? 'all' : 'present')} // 🟢 Toggle logic
            className={`cursor-pointer transition-all duration-200 bg-white dark:bg-[#111827] border rounded-lg p-4 flex items-center justify-between shadow-sm ${attendanceStatusFilter === 'present' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-200 dark:border-slate-800'}`}
          >
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-semibold uppercase tracking-wider">
              <UserCheck size={16} /> On Duty <span className="text-xs opacity-75">{kpiLabelSuffix}</span>
            </div>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{uniqueCleanersInPeriod}</span>
          </div>

          {/* MISSING CARD */}
          <div
            onClick={() => setAttendanceStatusFilter(prev => prev === 'absent' ? 'all' : 'absent')} // 🟢 Toggle logic
            className={`cursor-pointer transition-all duration-200 bg-white dark:bg-[#111827] border rounded-lg p-4 flex items-center justify-between shadow-sm ${attendanceStatusFilter === 'absent' ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-800'}`}
          >
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-500 text-sm font-semibold uppercase tracking-wider">
              <UserX size={16} /> Missing <span className="text-xs opacity-75">{kpiLabelSuffix}</span>
            </div>
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-500">{missing}</span>
          </div>
        </div>

        {/* MATRIX TABLE */}
        {viewMode === 'matrix' ? (
          <Attendance
            records={records}
            allCleaners={cleaners}
            attendanceStatusFilter={attendanceStatusFilter} // 🟢 ADD THIS PROP
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
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        )}

      </div>
    </div>
  );
}