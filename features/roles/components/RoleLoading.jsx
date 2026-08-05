export default function RoleLoading() {
  const skeletonRows = Array.from({ length: 6 });

  return (
    <div className="space-y-4 animate-pulse max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="space-y-2">
              <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-3 w-64 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-10 w-28 bg-slate-300 dark:bg-slate-700 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {skeletonRows.map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800/60 rounded" />
                </div>
              </div>
              <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800/60 rounded hidden md:block" />
              <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg hidden sm:block" />
              <div className="h-6 w-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full" />
              <div className="flex gap-1.5">
                <div className="w-7 h-7 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="w-7 h-7 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="w-7 h-7 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}