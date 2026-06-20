// features/attendance/component/OnDutyList.jsx
import React, { useState } from 'react';
import Link from 'next/link';
export default function OnDutyList({ records = [], pagination, onPageChange }) {
    // 🟢 NEW: State for the Multi-Location Modal
    const [locationModal, setLocationModal] = useState({ isOpen: false, name: "", locations: [] });

    const format12Hour = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm dark:shadow-xl transition-colors duration-200 relative">
            {records.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                    <p className="text-base font-medium text-slate-900 dark:text-white">No records found</p>
                    <p className="text-sm mt-1">Try adjusting your filters or search criteria.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-[#111827]">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 tracking-wider uppercase text-xs">Date</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 tracking-wider uppercase text-xs">Cleaner</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 tracking-wider uppercase text-xs">Check-In Time</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 tracking-wider uppercase text-xs">Location</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 tracking-wider uppercase text-xs">Logs</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-[#0B1120]">
                            {records.map((record, index) => {
                                // Determine locations array (default to single location if array missing)
                                const locations = record.assigned_locations || [record.location || 'Unassigned'];

                                return (
                                    <tr key={record.id || index} className="hover:bg-slate-50 dark:hover:bg-[#111827] transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-slate-200">
                                            {record.date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                                            <div className="font-medium text-slate-900 dark:text-slate-100">{record.cleaner_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400 font-medium">
                                            {format12Hour(record.check_in_time)}
                                        </td>

                                        {/* 🟢 UPDATED LOCATION COLUMN */}
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400"> {/* 🟢 Removed 'whitespace-nowrap' */}
                                            {locations.length <= 1 ? (
                                                <span
                                                    className="block whitespace-normal min-w-[200px] max-w-[300px]"
                                                    title={locations[0]} // 🟢 Native tooltip for single location
                                                >
                                                    {locations[0] || 'Unassigned'}
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => setLocationModal({ isOpen: true, name: record.cleaner_name, locations: locations })}
                                                    className="flex items-start gap-1.5 text-blue-600 dark:text-[#3B82F6] hover:text-blue-700 dark:hover:text-blue-400 transition-colors text-left"
                                                    title={locations.join(", ")} // 🟢 Tooltip shows ALL locations on hover
                                                >
                                                    {/* 🟢 Removed 'truncate' and 'max-w', added 'whitespace-normal' so text wraps */}
                                                    <span className="whitespace-normal min-w-[150px] max-w-[250px] block">
                                                        {locations[0]}
                                                    </span>
                                                    <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 mt-0.5">
                                                        +{locations.length - 1}
                                                    </span>
                                                </button>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link
                                                href={`/cleaners?cleanerId=${record.cleaner_id}&date=${record.date}`}
                                                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors cursor-pointer"
                                            >
                                                {record.logs_count || 1} log
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {pagination && pagination.total_pages > 1 && (
                        <div className="bg-slate-50 dark:bg-[#1F2937] px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors">
                            <span className="text-sm text-slate-700 dark:text-slate-400">
                                Page {pagination.current_page} of {pagination.total_pages}
                            </span>
                            <div className="flex space-x-2">
                                <button
                                    disabled={!pagination.has_prev_page}
                                    onClick={() => onPageChange(pagination.current_page - 1)}
                                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#111827] hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                                >
                                    Prev
                                </button>
                                <button
                                    disabled={!pagination.has_next_page}
                                    onClick={() => onPageChange(pagination.current_page + 1)}
                                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#111827] hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
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