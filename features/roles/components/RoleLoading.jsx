export default function RoleLoading() {
  const skeletonRows = Array.from({ length: 5 });

  // Custom helper to make the skeleton blocks highly visible with explicit borders
  const skeletonBlock = "bg-[var(--muted)] border border-[var(--border)] rounded animate-pulse";
  const skeletonCircle = "bg-[var(--muted)] border border-[var(--border)] rounded-full shrink-0 animate-pulse";

  return (
    <div className="space-y-6">
      {/* ================= Header Skeleton ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Title & Subtitle */}
        <div className="space-y-2">
          <div className={`h-7 w-40 ${skeletonBlock}`} />
          <div className={`h-4 w-64 ${skeletonBlock} opacity-60`} />
        </div>

        {/* Search Bar & Add Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className={`h-10 w-full sm:w-64 ${skeletonBlock}`} />
          <div className={`h-10 w-28 hidden sm:block ${skeletonBlock}`} />
        </div>
      </div>

      {/* ================= Table Skeleton ================= */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] overflow-hidden">
        <table className="w-full text-sm">
          {/* Table Header */}
          <thead className="hidden sm:table-header-group bg-[var(--muted)]/50 border-b border-[var(--border)]">
            <tr>
              <th className="px-5 py-4"><div className={`h-4 w-8 ${skeletonBlock}`} /></th>
              <th className="px-5 py-4"><div className={`h-4 w-32 ${skeletonBlock}`} /></th>
              <th className="px-5 py-4"><div className={`h-4 w-40 ${skeletonBlock}`} /></th>
              <th className="px-5 py-4"><div className={`h-4 w-24 ${skeletonBlock}`} /></th>
              <th className="px-5 py-4"><div className={`h-4 w-16 ${skeletonBlock}`} /></th>
              <th className="px-5 py-4"><div className={`h-4 w-20 ${skeletonBlock}`} /></th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-[var(--border)]">
            {skeletonRows.map((_, index) => (
              <tr key={index} className="block sm:table-row p-4 sm:p-0">
                {/* ID */}
                <td className="hidden sm:table-cell px-5 py-4">
                  <div className={`h-4 w-8 ${skeletonBlock}`} />
                </td>
                
                {/* Name */}
                <td className="block sm:table-cell px-5 py-2 sm:py-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 ${skeletonCircle}`} />
                    <div className={`h-4 w-32 ${skeletonBlock}`} />
                  </div>
                </td>

                {/* Email */}
                <td className="block sm:table-cell px-5 py-2 sm:py-4">
                  <div className={`h-4 w-40 ${skeletonBlock}`} />
                </td>

                {/* Phone */}
                <td className="block sm:table-cell px-5 py-2 sm:py-4">
                  <div className={`h-4 w-24 ${skeletonBlock}`} />
                </td>

                {/* Status */}
                <td className="block sm:table-cell px-5 py-2 sm:py-4">
                  <div className={`h-6 w-16 ${skeletonCircle}`} />
                </td>

                {/* Actions */}
                <td className="block sm:table-cell px-5 py-3 sm:py-4">
                  <div className="flex gap-2">
                    <div className={`h-8 w-16 ${skeletonBlock}`} />
                    <div className={`h-8 w-16 ${skeletonBlock}`} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Table Footer / Pagination Area */}
        <div className="px-5 py-4 bg-[var(--muted)]/50 border-t border-[var(--border)]">
          <div className={`h-4 w-48 ${skeletonBlock} opacity-50`} />
        </div>
      </div>
    </div>
  );
}