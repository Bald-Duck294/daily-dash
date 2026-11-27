import React, { useState } from 'react';
import { ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react';

function AllCleanersReport({ data, metadata }) {
  console.log("📊 AllCleanersReport received:", metadata);

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc',
  });

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortedData = () => {
    if (!sortConfig.key || !data) return data;

    const sorted = [...data];

    sorted.sort((a, b) => {
      const dir = sortConfig.direction === 'asc' ? 1 : -1;

      switch (sortConfig.key) {
        case 'cleaner_name': {
          const nameA = (a.cleaner_name || '').toLowerCase();
          const nameB = (b.cleaner_name || '').toLowerCase();
          if (nameA < nameB) return -1 * dir;
          if (nameA > nameB) return 1 * dir;
          return 0;
        }
        case 'location':
        case 'location_name': {
          const locA = (a.location_name || a.assigned_washrooms?.map(w => w.name).join(', ') || '').toLowerCase();
          const locB = (b.location_name || b.assigned_washrooms?.map(w => w.name).join(', ') || '').toLowerCase();
          if (locA < locB) return -1 * dir;
          if (locA > locB) return 1 * dir;
          return 0;
        }
        case 'total_cleanings': {
          return (Number(a.total_cleanings) - Number(b.total_cleanings)) * dir;
        }
        case 'completed': {
          return (Number(a.completed) - Number(b.completed)) * dir;
        }
        case 'ongoing': {
          return (Number(a.ongoing) - Number(b.ongoing)) * dir;
        }
        case 'incomplete': {
          return (Number(a.incomplete || 0) - Number(b.incomplete || 0)) * dir;
        }
        case 'avg_ai_score': {
          const scoreA = typeof a.avg_ai_score === 'number' ? a.avg_ai_score : parseFloat(a.avg_ai_score) || 0;
          const scoreB = typeof b.avg_ai_score === 'number' ? b.avg_ai_score : parseFloat(b.avg_ai_score) || 0;
          return (scoreA - scoreB) * dir;
        }
        case 'avg_duration': {
          return (Number(a.avg_duration) - Number(b.avg_duration)) * dir;
        }
        case 'last_activity': {
          const dateA = new Date(a.last_activity || 0).getTime();
          const dateB = new Date(b.last_activity || 0).getTime();
          return (dateA - dateB) * dir;
        }
        default:
          return 0;
      }
    });

    return sorted;
  };

  const sortedData = getSortedData();

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronsUpDown className="w-3 h-3 text-slate-400 ml-1" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-slate-600 ml-1" />
    ) : (
      <ChevronDown className="w-3 h-3 text-slate-600 ml-1" />
    );
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getScoreBadge = (score) => {
    const numScore = typeof score === 'number' ? score : parseFloat(score);
    if (isNaN(numScore)) return "bg-gray-100 text-gray-600";
    if (numScore >= 9) return "bg-green-100 text-green-800";
    if (numScore >= 7) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="space-y-4">
      {/* Compact Header Summary Row: KPI Cards + Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 px-4 py-3 flex flex-col justify-center">
          <span className="text-xs font-medium text-slate-500">Total Cleaners</span>
          <span className="text-xl font-bold text-slate-900 mt-0.5">
            {metadata.total_cleaners || data.length}
          </span>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 px-4 py-3 flex flex-col justify-center">
          <span className="text-xs font-medium text-slate-500">Completed</span>
          <span className="text-xl font-bold text-slate-900 mt-0.5">
            {metadata.total_cleanings_completed || 0}
          </span>
        </div>

        <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200 px-4 py-2.5 flex flex-col justify-center">
          <div className="text-xs font-semibold text-slate-700 mb-1.5">
            Top Performers (Avg Score)
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {metadata.top_avg_score?.slice(0, 5).map((cleaner, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
              >
                <span className="font-bold text-emerald-600">{index + 1}.</span>
                <span>{cleaner.cleaner_name}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Cleaners Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">#</th>

                {/* Sortable: Cleaner Name */}
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  <button
                    type="button"
                    onClick={() => handleSort('cleaner_name')}
                    className="flex items-center gap-1 hover:text-slate-900"
                  >
                    <span>Cleaner</span>
                    <SortIcon columnKey="cleaner_name" />
                  </button>
                </th>

                {/* Sortable: Location */}
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  <button
                    type="button"
                    onClick={() => handleSort('location_name')}
                    className="flex items-center gap-1 hover:text-slate-900"
                  >
                    <span>Location</span>
                    <SortIcon columnKey="location_name" />
                  </button>
                </th>

                {/* Sortable: Total */}
                <th className="px-4 py-3 text-center font-semibold text-slate-700">
                  <button
                    type="button"
                    onClick={() => handleSort('total_cleanings')}
                    className="flex items-center justify-center gap-1 hover:text-slate-900 w-full"
                  >
                    <span>Total</span>
                    <SortIcon columnKey="total_cleanings" />
                  </button>
                </th>

                {/* Sortable: Completed */}
                <th className="px-4 py-3 text-center font-semibold text-slate-700">
                  <button
                    type="button"
                    onClick={() => handleSort('completed')}
                    className="flex items-center justify-center gap-1 hover:text-slate-900 w-full"
                  >
                    <span>Completed</span>
                    <SortIcon columnKey="completed" />
                  </button>
                </th>

                {/* Sortable: Ongoing */}
                <th className="px-4 py-3 text-center font-semibold text-slate-700">
                  <button
                    type="button"
                    onClick={() => handleSort('ongoing')}
                    className="flex items-center justify-center gap-1 hover:text-slate-900 w-full"
                  >
                    <span>Ongoing</span>
                    <SortIcon columnKey="ongoing" />
                  </button>
                </th>

                {/* Sortable: Incomplete */}
                <th className="px-4 py-3 text-center font-semibold text-slate-700">
                  <button
                    type="button"
                    onClick={() => handleSort('incomplete')}
                    className="flex items-center justify-center gap-1 hover:text-slate-900 w-full"
                  >
                    <span>Incomplete</span>
                    <SortIcon columnKey="incomplete" />
                  </button>
                </th>

                {/* Sortable: Avg Score */}
                <th className="px-4 py-3 text-center font-semibold text-slate-700">
                  <button
                    type="button"
                    onClick={() => handleSort('avg_ai_score')}
                    className="flex items-center justify-center gap-1 hover:text-slate-900 w-full"
                  >
                    <span>Avg Score</span>
                    <SortIcon columnKey="avg_ai_score" />
                  </button>
                </th>

                {/* Sortable: Avg Duration */}
                <th className="px-4 py-3 text-center font-semibold text-slate-700">
                  <button
                    type="button"
                    onClick={() => handleSort('avg_duration')}
                    className="flex items-center justify-center gap-1 hover:text-slate-900 w-full"
                  >
                    <span>Avg Duration (mins)</span>
                    <SortIcon columnKey="avg_duration" />
                  </button>
                </th>

                {/* Sortable: Last Activity */}
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  <button
                    type="button"
                    onClick={() => handleSort('last_activity')}
                    className="flex items-center gap-1 hover:text-slate-900"
                  >
                    <span>Last Activity</span>
                    <SortIcon columnKey="last_activity" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedData && sortedData.length > 0 ? (
                sortedData.map((cleaner, index) => (
                  <tr key={cleaner.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{cleaner.cleaner_name}</div>
                      {(cleaner.cleaner_phone || cleaner.phone) && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          {cleaner.cleaner_phone || cleaner.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-[200px]">
                      <div
                        className="font-medium text-slate-800 line-clamp-2"
                        title={cleaner.location_name || cleaner.assigned_washrooms?.map((w) => w.name).join(", ")}
                      >
                        {cleaner.location_name || cleaner.assigned_washrooms?.map((w) => w.name).join(", ") || "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-slate-900">
                      {cleaner.total_cleanings}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">
                      {cleaner.completed}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">
                      {cleaner.ongoing}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">
                      {cleaner.incomplete || 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded font-semibold ${getScoreBadge(cleaner.avg_ai_score)}`}>
                        {typeof cleaner.avg_ai_score === 'number'
                          ? cleaner.avg_ai_score.toFixed(2)
                          : cleaner.avg_ai_score}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">
                      {cleaner.avg_duration}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDateTime(cleaner.last_activity)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="px-4 py-8 text-center text-slate-500">
                    No cleaner data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
      <div className="text-sm text-slate-600 mb-1">{title}</div>
      <div className="text-2xl font-bold text-slate-900">
        {value !== undefined && value !== null ? value : "-"}
      </div>
    </div>
  );
}

export default AllCleanersReport;
