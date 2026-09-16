"use client";

import React, { useState } from "react";
import { useWashroomAverageReport } from "@/features/reports/reports.queries";
import { useCompanyId } from "@/providers/CompanyProvider";
import { 
  Building2, 
  Calendar as CalendarIcon, 
  Activity, 
  ClipboardCheck, 
  MessageSquare,
  BarChart3
} from "lucide-react";
import Loader from "@/components/ui/Loader";

export default function WashroomAverageReportPage() {
  const companyId = useCompanyId();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: reportResponse, isLoading, isError } = useWashroomAverageReport({
    company_id: companyId,
    date,
  });

  const reportData = reportResponse?.data || [];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
            Washroom Average Score Report
          </h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">
            Overview of cleaning activities, inspections, and user feedback averages.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 bg-[var(--surface)] p-2 rounded-xl border border-[var(--border)] shadow-sm">
          <div className="flex items-center gap-2 px-2 border-r border-[var(--border)]">
            <CalendarIcon size={16} className="text-[var(--muted-foreground)]" />
            <span className="text-sm font-medium text-[var(--muted-foreground)]">Date:</span>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent border-none text-sm font-semibold outline-none text-[var(--foreground)] cursor-pointer"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-20">
            <Loader size="lg" />
          </div>
        ) : isError ? (
          <div className="p-20 text-center text-red-500">
            Failed to load the average report. Please try again.
          </div>
        ) : reportData.length === 0 ? (
          <div className="p-20 text-center text-[var(--muted-foreground)] flex flex-col items-center justify-center">
            <Building2 size={48} className="mb-4 opacity-20" />
            <p className="font-semibold text-lg">No Washrooms Found</p>
            <p className="text-sm">There is no data available for the selected filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--muted)]/30 border-b border-[var(--border)]">
                  <th className="px-6 py-4 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                    Washroom Name
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Activity size={14} /> Cleaning Activity
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider text-center">
                    <div className="flex items-center justify-center gap-2">
                      <ClipboardCheck size={14} /> Inspection Count
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider text-center">
                    <div className="flex items-center justify-center gap-2">
                      <MessageSquare size={14} /> User Feedback
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-[var(--primary)] uppercase tracking-wider text-center bg-[var(--primary)]/5">
                    Today's Average
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider text-center">
                    <div className="flex items-center justify-center gap-2">
                      <BarChart3 size={14} /> Total Average
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider text-right">
                    Last Activity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {reportData.map((row) => (
                  <tr 
                    key={row.location_id} 
                    className="hover:bg-[var(--muted)]/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                          <Building2 size={16} className="text-[var(--primary)]" />
                        </div>
                        <span className="font-semibold text-[var(--foreground)]">
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
                    
                    <td className="px-6 py-4 text-center bg-[var(--primary)]/5">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xl font-black text-[var(--primary)]">
                          {row.todays_average > 0 ? row.todays_average : "-"}
                        </span>
                        {row.todays_average > 0 && <span className="text-xs font-bold text-[var(--primary)]/70">/10</span>}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-lg font-bold text-[var(--foreground)]">
                          {row.total_average > 0 ? row.total_average : "-"}
                        </span>
                        {row.total_average > 0 && <span className="text-xs font-semibold text-[var(--muted-foreground)]">/10</span>}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      {row.last_activity ? (
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-medium text-[var(--foreground)]">
                            {new Date(row.last_activity).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {new Date(row.last_activity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-[var(--muted-foreground)] italic">
                          No Activity
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
