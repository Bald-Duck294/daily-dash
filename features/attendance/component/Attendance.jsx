// features/attendance/component/Attendance.jsx
import React from 'react';

export default function Attendance({ 
  records = [], 
  pagination, 
  isLoading, 
  isError, 
  error, 
  onPageChange 
}) {
  
  if (isLoading) {
    return (
      <div className="w-full bg-white shadow-sm border border-gray-200 rounded-lg p-12 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-3"></div>
        <p className="text-sm font-medium text-emerald-600">Loading attendance...</p>
      </div>
    );
  }

  if (isError) return <div className="p-8 text-center text-red-500">{error?.message}</div>;

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
      {records.length === 0 ? (
        <div className="p-12 text-center text-gray-500">No attendance records found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700 text-xs uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-xs uppercase tracking-wider">Cleaner</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-xs uppercase tracking-wider">Check-In Time</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-xs uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-xs uppercase tracking-wider">Logs</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {/* Format YYYY-MM-DD to DD/MM/YYYY */}
                    {new Date(record.date).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    <div className="font-medium text-gray-900">{record.cleaner_name}</div>
                    {/* <div className="text-xs text-gray-400 font-mono mt-0.5">ID: {record.cleaner_id}</div> */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                    {new Date(record.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 truncate max-w-[200px]">
                    {record.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                      {record.logs_count} log{record.logs_count > 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Simple Pagination Controls */}
          {pagination && pagination.total_pages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Page {pagination.current_page} of {pagination.total_pages}
              </span>
              <div className="space-x-2">
                <button 
                  disabled={!pagination.has_prev_page} 
                  onClick={() => onPageChange(pagination.current_page - 1)}
                  className="px-4 py-2 border rounded bg-white text-sm disabled:opacity-50"
                >Prev</button>
                <button 
                  disabled={!pagination.has_next_page} 
                  onClick={() => onPageChange(pagination.current_page + 1)}
                  className="px-4 py-2 border rounded bg-white text-sm disabled:opacity-50"
                >Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}