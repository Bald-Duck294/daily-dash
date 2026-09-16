import React, { useState, useMemo } from "react";
import { Building2, Activity, ClipboardCheck, MessageSquare, BarChart3, ArrowUpDown } from "lucide-react";

export default function WashroomAverageReportTable({ data }) {
  const [sortOrder, setSortOrder] = useState("highest"); // 'highest' or 'lowest'

  const sortedData = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      const valA = parseFloat(a.total_average) || 0;
      const valB = parseFloat(b.total_average) || 0;
      if (sortOrder === "highest") {
        return valB - valA;
      } else {
        return valA - valB;
      }
    });
  }, [data, sortOrder]);

  if (!data || data.length === 0) {
    return (
      <div className="p-20 text-center text-slate-500 flex flex-col items-center justify-center">
        <Building2 size={48} className="mb-4 opacity-20" />
        <p className="font-semibold text-lg">No Washrooms Found</p>
        <p className="text-sm">There is no data available for the selected filters.</p>
      </div>
    );
  }

  const getRankColor = (index) => {
    const colors = [
      "bg-orange-500", // Rank 1
      "bg-blue-500",   // Rank 2
      "bg-purple-500", // Rank 3
      "bg-teal-500",   // Rank 4
    ];
    return colors[index] || "bg-slate-400"; // Rank 5+
  };

  return (
    <div className="space-y-4">
      {/* Sorting Toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setSortOrder(prev => prev === "highest" ? "lowest" : "highest")}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-sm font-semibold text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 transition"
        >
          <ArrowUpDown size={16} className="text-blue-500" />
          Sort Total Average: {sortOrder === "highest" ? "Highest to Lowest" : "Lowest to Highest"}
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-left border-collapse bg-white">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-16 text-center">
                Rank
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Washroom Name
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                <div className="flex items-center justify-center gap-2">
                  <Activity size={14} /> Cleaning Activity
                </div>
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                <div className="flex items-center justify-center gap-2">
                  <ClipboardCheck size={14} /> Inspection Count
                </div>
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                <div className="flex items-center justify-center gap-2">
                  <MessageSquare size={14} /> User Feedback
                </div>
              </th>
              <th className="px-6 py-4 text-xs font-bold text-blue-600 uppercase tracking-wider text-center bg-blue-50/50">
                Today's Average
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                <div className="flex items-center justify-center gap-2">
                  <BarChart3 size={14} /> Total Average
                </div>
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                Last Activity
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sortedData.map((row, index) => (
              <tr 
                key={row.location_id} 
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-6 py-4 text-center">
                  <div className={`w-8 h-8 rounded-full ${getRankColor(index)} flex items-center justify-center mx-auto shadow-sm`}>
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-800">
                      {row.washroom_name || "Unknown Washroom"}
                    </span>
                  </div>
                </td>
                
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-md bg-blue-50 text-blue-700 font-bold text-sm">
                    {row.cleaning_activity_count}
                  </span>
                </td>
                
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-md bg-amber-50 text-amber-700 font-bold text-sm">
                    {row.inspection_count}
                  </span>
                </td>
                
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-md bg-purple-50 text-purple-700 font-bold text-sm">
                    {row.user_feedback_count}
                  </span>
                </td>
                
                <td className="px-6 py-4 text-center bg-blue-50/30">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-xl font-black text-blue-600">
                      {row.todays_average > 0 ? row.todays_average : "-"}
                    </span>
                    {row.todays_average > 0 && <span className="text-xs font-bold text-blue-400">/10</span>}
                  </div>
                </td>

                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-lg font-bold text-slate-700">
                      {row.total_average > 0 ? row.total_average : "-"}
                    </span>
                    {row.total_average > 0 && <span className="text-xs font-semibold text-slate-400">/10</span>}
                  </div>
                </td>

                <td className="px-6 py-4 text-right">
                  {row.last_activity ? (
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium text-slate-800">
                        {new Date(row.last_activity).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(row.last_activity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400 italic">
                      No Activity
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
