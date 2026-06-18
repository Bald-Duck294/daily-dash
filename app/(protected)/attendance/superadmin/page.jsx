"use client";

import React, { useState } from 'react';
import { useCleanerAttendance } from '@/features/attendance/attendance.queries';
import Attendance from '@/features/attendance/component/Attendance.jsx'; 
import { ChevronDown } from 'lucide-react';

// Make sure to import your actual hook for fetching the companies list!
// import { useCompaniesList } from '@/features/companies/companies.queries'; 

const getLocalDateString = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split("T")[0];
};

export default function SuperAdminAttendancePage() {
  // Fetch your global list of companies to populate the dropdown
  // const { data: companies = [] } = useCompaniesList();
  
  // Example placeholder data so the UI renders for you immediately
  const companies = [
    { id: "27", name: "Nagpur Railway Station" },
    { id: "28", name: "Kampthe Railway Station" }
  ];

  const [filters, setFilters] = useState({
    companyId: "all", // 🟢 Super Admin defaults to 'all' companies
    search: "", 
    start_date: getLocalDateString(-30),
    end_date: getLocalDateString(0),
    page: 1,
    limit: 15
  });

  // 🟢 Pass the companyId ONLY if it's not "all"
  const activeCompanyId = filters.companyId === "all" ? null : filters.companyId;

  const { data: queryResult, isLoading, isError, error } = useCleanerAttendance(filters, activeCompanyId);

  const records = queryResult?.data?.data || queryResult?.data || [];
  const pagination = queryResult?.data?.pagination || queryResult?.pagination || null;

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 })); 
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:mt-[-30px] mt-[-20px]">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Global Attendance Logs</h1>
          <p className="text-sm text-gray-500 mt-1">Review check-in times across all active capability centers.</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        {/* 🟢 Changed to 4 columns to fit the new Company Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</label>
            <div className="relative">
              <select
                name="companyId"
                value={filters.companyId}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer bg-white"
              >
                <option value="all">All Companies</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Start Date</label>
            <input
              type="date"
              name="start_date"
              value={filters.start_date}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">End Date</label>
            <input
              type="date"
              name="end_date"
              value={filters.end_date}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Search Name</label>
            <div className="relative">
              <input
                type="text"
                name="search" 
                placeholder="Enter Cleaner Name..."
                value={filters.search} 
                onChange={handleFilterChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

        </div>
      </div>

      <Attendance
        records={records}
        pagination={pagination}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onPageChange={handlePageChange}
      />
    </div>
  );
}