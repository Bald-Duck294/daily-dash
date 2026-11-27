import { useState } from "react";
import {
  AlertTriangle,
  Building,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Users,
} from "lucide-react";

/**
 * Displays washrooms with zero cleaning activity in the selected period.
 */
function NotCleanedWashroomsTable({ data, metadata }) {
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  const formatDateTime = (date) => {
    if (!date) return "Never Cleaned";
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
      case "name":
        return (a.name || "").localeCompare(b.name || "") * dir;
      case "zone":
        return (a.zone || "").localeCompare(b.zone || "") * dir;
      case "assigned_cleaners":
        return (a.assigned_cleaners || "").localeCompare(b.assigned_cleaners || "") * dir;
      case "last_cleaned_on":
        return (
          (new Date(a.last_cleaned_on || 0).getTime() -
            new Date(b.last_cleaned_on || 0).getTime()) *
          dir
        );
      case "days_since_cleaned":
        return (
          ((a.days_since_cleaned ?? 99999) - (b.days_since_cleaned ?? 99999)) * dir
        );
      default:
        return 0;
    }
  });

  const totalWashrooms = metadata?.total_washrooms ?? 0;
  const cleanedWashrooms = metadata?.cleaned_washrooms ?? 0;
  const notCleanedCount = metadata?.not_cleaned_count ?? sortedData.length;
  const coveragePct = metadata?.coverage_percentage ?? 0;

  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">
                Total Washrooms
              </p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {totalWashrooms}
              </p>
            </div>
            <Building className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">
                Cleaned Washrooms
              </p>
              <p className="text-2xl font-bold text-emerald-900 mt-1">
                {cleanedWashrooms}
              </p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-rose-600 font-semibold uppercase tracking-wide">
                Not Cleaned
              </p>
              <p className="text-2xl font-bold text-rose-900 mt-1">
                {notCleanedCount}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-700 font-semibold uppercase tracking-wide">
                Cleaning Coverage
              </p>
              <p className="text-2xl font-bold text-amber-900 mt-1">
                {coveragePct}%
              </p>
            </div>
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Uncleaned Washrooms ({sortedData.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Washrooms with zero recorded cleaning activity during the selected period
            </p>
          </div>
        </div>

        {sortedData.length === 0 ? (
          <div className="p-10 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              All accessible washrooms were cleaned in this period!
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
                    onClick={() => handleSort("name")}
                  >
                    Washroom Name
                  </th>
                  <th
                    className="px-4 py-3 cursor-pointer hover:text-blue-600"
                    onClick={() => handleSort("zone")}
                  >
                    Zone
                  </th>
                  <th
                    className="px-4 py-3 cursor-pointer hover:text-blue-600"
                    onClick={() => handleSort("assigned_cleaners")}
                  >
                    Assigned Cleaner(s)
                  </th>
                  <th
                    className="px-4 py-3 cursor-pointer hover:text-blue-600"
                    onClick={() => handleSort("last_cleaned_on")}
                  >
                    Last Cleaned On
                  </th>
                  <th
                    className="px-4 py-3 text-center cursor-pointer hover:text-blue-600"
                    onClick={() => handleSort("days_since_cleaned")}
                  >
                    Days Since Cleaned
                  </th>
                  <th className="px-4 py-3 text-center">Status</th>
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
                        <span>{row.name}</span>
                      </div>
                      {row.address && row.address !== "N/A" && (
                        <div className="text-xs text-slate-500 mt-0.5 pl-5">
                          {row.address}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {row.zone || "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{row.assigned_cleaners || "Unassigned"}</span>
                      </div>
                      {row.cleaner_phones && row.cleaner_phones !== "N/A" && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 pl-5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{row.cleaner_phones}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDateTime(row.last_cleaned_on)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.days_since_cleaned !== null &&
                      row.days_since_cleaned !== undefined ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                          {row.days_since_cleaned}{" "}
                          {row.days_since_cleaned === 1 ? "day" : "days"}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">
                          Never
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
                        Not Cleaned
                      </span>
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

export default NotCleanedWashroomsTable;
