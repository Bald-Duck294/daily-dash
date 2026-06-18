// features/attendance/component/Attendance.jsx
import React, { useMemo, useState } from 'react';

const getDatesInRange = (startDateStr, endDateStr) => {
  const dates = [];
  let currentDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

const formatDateHeader = (dateStr) => {
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  return { day, month };
};

export default function Attendance({ 
  records = [], 
  allCleaners = [], 
  selectedLocationName = "all", // 🟢 Now accepts the location name
  attendanceStatusFilter = 'all',
  selectedCleaner = "all",
  startDate,
  endDate,
  pagination, 
  isLoading, 
  isError, 
  error, 
  onPageChange 
}) {
  
  const [locationModal, setLocationModal] = useState({ isOpen: false, name: "", locations: [] });

  const { dateColumns, matrixData } = useMemo(() => {
    if (!startDate || !endDate) return { dateColumns: [], matrixData: [] };
    
    const dates = getDatesInRange(startDate, endDate);
    const map = {};

    // 1. INITIALIZE EVERYONE using the `locations` array
    if (allCleaners && allCleaners.length > 0) {
      allCleaners.forEach(c => {
        map[c.id.toString()] = {
          id: c.id.toString(),
          name: c.name,
          locations: c.locations || ['Unassigned'], 
          tot: 0,
          attendanceMap: {} 
        };
      });
    }

    // 2. PLOT THE DATA
    records.forEach(r => {
      const cId = r.cleaner_id?.toString();
      if (!cId) return;

      if (!map[cId]) {
        map[cId] = { 
          id: cId, 
          name: r.cleaner_name || 'Unknown', 
          locations: [r.location || 'Unassigned'], 
          tot: 0, 
          attendanceMap: {} 
        };
      }

      map[cId].attendanceMap[r.date] = true;
      map[cId].tot += 1;
    });

    let finalRows = Object.values(map);

    // 3. APPLY UI FILTERS
    if (selectedCleaner && selectedCleaner !== "all") {
      finalRows = finalRows.filter(row => row.id === selectedCleaner.toString());
    }
    
    // 🟢 THE FIX: Keep them if they checked in OR if they are assigned to the location
    if (selectedLocationName && selectedLocationName !== "all") {
      finalRows = finalRows.filter(row => {
        // Keep the cleaner if they are assigned to this location
        return row.locations.includes(selectedLocationName);
      });
    }
    
    if (attendanceStatusFilter === 'present') {
      finalRows = finalRows.filter(row => row.tot > 0);
    } else if (attendanceStatusFilter === 'absent') {
      finalRows = finalRows.filter(row => row.tot === 0);
    }

    finalRows.sort((a, b) => a.name.localeCompare(b.name));

    return { dateColumns: dates, matrixData: finalRows };
  }, [records, allCleaners, startDate, endDate, selectedCleaner, selectedLocationName,attendanceStatusFilter]);

  if (isLoading) {
    return (
      <div className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg p-16 flex flex-col items-center justify-center transition-colors duration-200">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-[#3B82F6] mb-4"></div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Constructing Attendance Matrix...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-rose-600 dark:text-rose-500 bg-rose-50 dark:bg-[#111827] rounded-lg border border-rose-200 dark:border-rose-900 transition-colors duration-200">
        {error?.message}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden flex flex-col shadow-sm dark:shadow-xl transition-colors duration-200 relative">
      
      <div className="bg-slate-50 dark:bg-[#1F2937] border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between transition-colors duration-200">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white tracking-wide">Attendance Matrix</h2>
        <span className="text-xs font-mono bg-white dark:bg-[#0B1120] text-slate-600 dark:text-slate-400 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700 transition-colors duration-200">
          {new Date(startDate).toLocaleDateString('en-GB')} to {new Date(endDate).toLocaleDateString('en-GB')}
        </span>
      </div>

      {matrixData.length === 0 ? (
        <div className="p-16 text-center text-slate-500 dark:text-slate-400">No attendance records found.</div>
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-[#111827] text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 select-none transition-colors duration-200">
              <tr>
                <th className="px-4 py-3 font-semibold w-10">#</th>
                <th className="px-4 py-3 font-semibold min-w-[180px]">CLEANER NAME</th>
                <th className="px-4 py-3 font-semibold min-w-[200px]">LOCATION</th>
                <th className="px-4 py-3 font-semibold text-center w-16">TOT</th>
                {dateColumns.map(dateStr => {
                  const { day, month } = formatDateHeader(dateStr);
                  return (
                    <th key={dateStr} className="px-2 py-2 text-center font-semibold min-w-[40px] leading-tight border-l border-slate-200 dark:border-slate-800/50 transition-colors duration-200">
                      <div className="flex flex-col items-center">
                        <span className="text-[11px] text-slate-800 dark:text-white">{day}</span>
                        <span className="text-[9px] text-slate-500">{month}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-[#0B1120] transition-colors duration-200">
              {matrixData.map((row, index) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-[#111827] transition-colors duration-150 group">
                  <td className="px-4 py-3 text-slate-500 font-mono">{(pagination ? (pagination.current_page - 1) * pagination.items_per_page : 0) + index + 1}</td>
                  
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 text-[10px] font-bold transition-colors duration-200">
                        {row.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-blue-600 dark:text-[#3B82F6] font-medium group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors cursor-pointer">
                        {row.name}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {row.locations.length <= 1 ? (
                      <span className="truncate max-w-[200px] block">{row.locations[0] || 'Unassigned'}</span>
                    ) : (
                      <button 
                        onClick={() => setLocationModal({ isOpen: true, name: row.name, locations: row.locations })}
                        className="flex items-center gap-1.5 text-blue-600 dark:text-[#3B82F6] hover:text-blue-700 dark:hover:text-blue-400 transition-colors text-left"
                      >
                        <span className="truncate max-w-[150px] block">{row.locations[0]}</span>
                        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0">
                          +{row.locations.length - 1}
                        </span>
                      </button>
                    )}
                  </td>
                  
                  <td className={`px-4 py-3 text-center font-bold transition-colors duration-200 ${row.tot > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-500'}`}>
                    {row.tot}
                  </td>
                  
                  {dateColumns.map(dateStr => {
                    const isPresent = row.attendanceMap[dateStr];
                    return (
                      <td key={dateStr} className="px-2 py-3 text-center border-l border-slate-100 dark:border-slate-800/50 transition-colors duration-200">
                        <div className="flex justify-center">
                          <div className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                            isPresent 
                              ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] dark:shadow-[0_0_8px_rgba(16,185,129,0.6)]' 
                              : 'bg-rose-200 dark:bg-rose-400/40'
                          }`}></div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {pagination && pagination.total_pages > 1 && (
        <div className="bg-slate-50 dark:bg-[#1F2937] border-t border-slate-200 dark:border-slate-700 px-4 py-3 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
          <span>Page <span className="text-slate-900 dark:text-white font-medium">{pagination.current_page}</span> of {pagination.total_pages}</span>
          <div className="flex gap-2">
            <button 
              disabled={!pagination.has_prev_page} 
              onClick={() => onPageChange(pagination.current_page - 1)}
              className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              Prev
            </button>
            <button 
              disabled={!pagination.has_next_page} 
              onClick={() => onPageChange(pagination.current_page + 1)}
              className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* 🟢 LOCATION MODAL POPUP */}
      {locationModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1F2937] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-[#111827]">
              <h3 className="font-semibold text-slate-800 dark:text-white">Assigned Locations</h3>
              <button 
                onClick={() => setLocationModal({ isOpen: false, name: "", locations: [] })} 
                className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors text-lg font-bold leading-none"
              >
                &times;
              </button>
            </div>
            <div className="p-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Assignments for <span className="font-semibold text-slate-800 dark:text-slate-200">{locationModal.name}</span>:
              </p>
              <ul className="space-y-2.5">
                {locationModal.locations.map((loc, idx) => (
                  <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-3 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-[#111827] transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5 shadow-[0_0_6px_rgba(59,130,246,0.6)]"></span>
                    <span className="leading-snug">{loc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}