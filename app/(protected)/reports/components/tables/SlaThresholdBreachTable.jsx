import { useState } from "react";
import {
  AlertTriangle,
  Building,
  Calendar,
  MapPin,
  Percent,
  Phone,
  ShieldAlert,
  User,
} from "lucide-react";

/**
 * Displays all cleaning inspections scoring below the effective SLA pass threshold.
 */
function SlaThresholdBreachTable({ data, metadata }) {
  const [sortConfig, setSortConfig] = useState({
    key: "reviewed_at",
    direction: "desc",
  });

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedData = [...(Array.isArray(data) ? data : [])].sort((a, b) => {
    const dir = sortConfig.direction === "asc" ? 1 : -1;
    switch (sortConfig.key) {
      case "washroom_name":
        return (a.washroom_name || "").localeCompare(b.washroom_name || "") * dir;
      case "zone":
        return (a.zone || "").localeCompare(b.zone || "") * dir;
      case "cleaner_name":
        return (a.cleaner_name || "").localeCompare(b.cleaner_name || "") * dir;
      case "score":
        return ((Number(a.score) || 0) - (Number(b.score) || 0)) * dir;
      case "threshold":
        return ((Number(a.threshold) || 0) - (Number(b.threshold) || 0)) * dir;
      case "breach_gap":
        return ((Number(a.breach_gap) || 0) - (Number(b.breach_gap) || 0)) * dir;
      case "reviewed_at":
        return (
          (new Date(a.reviewed_at || 0).getTime() -
            new Date(b.reviewed_at || 0).getTime()) *
          dir
        );
      default:
        return 0;
    }
  });

  const totalBreaches = metadata?.total_breaches ?? sortedData.length;
  const breachRate = metadata?.breach_rate ?? 0;
  const affectedWashrooms = metadata?.affected_washrooms ?? 0;
  const companyThreshold = metadata?.company_threshold ?? 7.5;

  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-rose-600 font-semibold uppercase tracking-wide">
                Total Breaches
              </p>
              <p className="text-2xl font-bold text-rose-900 mt-1">
                {totalBreaches}
              </p>
              <p className="text-[11px] text-rose-600 mt-0.5">
                Baseline Threshold: {companyThreshold}/10
              </p>
            </div>
            <ShieldAlert className="w-8 h-8 text-rose-500" />
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-700 font-semibold uppercase tracking-wide">
                Breach Rate
              </p>
              <p className="text-2xl font-bold text-amber-900 mt-1">
                {breachRate}%
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Of {metadata?.total_reviews_evaluated ?? 0} evaluated
              </p>
            </div>
            <Percent className="w-8 h-8 text-amber-500" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">
                Affected Washrooms
              </p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {affectedWashrooms}
              </p>
            </div>
            <Building className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              SLA Threshold Breaches ({sortedData.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspections where AI hygiene score fell below the washroom&apos;s effective SLA threshold
            </p>
          </div>
        </div>

        {sortedData.length === 0 ? (
          <div className="p-10 text-center">
            <AlertTriangle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              No SLA threshold breaches found in this period.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">#</th>
                  <th
                    className="px-4 py-3 cursor-pointer hover:text-blue-600"
                    onClick={() => handleSort("washroom_name")}
                  >
                    Washroom
                  </th>
                  <th
                    className="px-4 py-3 cursor-pointer hover:text-blue-600"
                    onClick={() => handleSort("zone")}
                  >
                    Zone
                  </th>
                  <th
                    className="px-4 py-3 cursor-pointer hover:text-blue-600"
                    onClick={() => handleSort("cleaner_name")}
                  >
                    Cleaner
                  </th>
                  <th
                    className="px-4 py-3 text-center cursor-pointer hover:text-blue-600"
                    onClick={() => handleSort("score")}
                  >
                    AI Score
                  </th>
                  <th
                    className="px-4 py-3 text-center cursor-pointer hover:text-blue-600"
                    onClick={() => handleSort("threshold")}
                  >
                    Threshold
                  </th>
                  <th
                    className="px-4 py-3 text-center cursor-pointer hover:text-blue-600"
                    onClick={() => handleSort("breach_gap")}
                  >
                    Deficit
                  </th>
                  <th className="px-4 py-3 text-center">Attempt</th>
                  <th
                    className="px-4 py-3 cursor-pointer hover:text-blue-600"
                    onClick={() => handleSort("reviewed_at")}
                  >
                    Reviewed On
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedData.map((row, idx) => (
                  <tr
                    key={row.id || idx}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-center text-slate-500 font-medium">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{row.washroom_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {row.zone || "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{row.cleaner_name || "N/A"}</span>
                      </div>
                      {row.cleaner_phone && row.cleaner_phone !== "N/A" && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 pl-5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{row.cleaner_phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                        {row.score}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-700">
                      {row.threshold}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        -{row.breach_gap}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600 font-medium">
                      #{row.attempt_no || 1}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDateTime(row.reviewed_at)}</span>
                      </div>
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

export default SlaThresholdBreachTable;
