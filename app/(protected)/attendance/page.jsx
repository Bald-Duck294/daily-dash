// (protected)/attendance/page.jsx
"use client";

import React, { useState } from 'react';
import { useCompanyId } from "@/providers/CompanyProvider"; // Import the provider
import { useCleanerAttendance } from '@/features/attendance/attendance.queries';
import Attendance from '@/features/attendance/component/Attendance.jsx'; 

export default function AttendancePage() {
  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() ); 

  // Extract the active company ID from your top navigation context
  const { companyId } = useCompanyId(); 

  const [filters, setFilters] = useState({
   search: "",
    start_date: defaultStartDate.toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    page: 1,
    limit: 15
  });

  // Pass the companyId as the second argument to your query
  const { data: queryResult, isLoading, isError, error } = useCleanerAttendance(filters, companyId);

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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Attendance Logs</h1>
          <p className="text-sm text-gray-500 mt-1">Review check-in times and locations for your cleaning staff.</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Start Date</label>
            <input
              type="date"
              name="start_date"
              value={filters.start_date}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">End Date</label>
            <input
              type="date"
              name="end_date"
              value={filters.end_date}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            {/* 🟢 Change the label so you know it updated */}
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Search Cleaner Name
            </label>
            <div className="relative">
              <input
                type="text"
                name="search" // 🟢 CRITICAL: This must be "search"
                placeholder="Enter Cleaner Name..."
                value={filters.search} // 🟢 CRITICAL: This must be filters.search
                onChange={handleFilterChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
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