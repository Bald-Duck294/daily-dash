"use client";

export default function WashroomSLAForm({
  isEnabled,
  setIsEnabled,
  config,
  setConfig,
  isSaving,
}) {
  return (
    <div className="space-y-6">
      {/* Enable Toggle Section */}
      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Enable SLA
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Activate SLA monitoring and retry rules for this washroom
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
            disabled={isSaving}
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {!isEnabled ? (
        <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
          SLA is currently disabled for this washroom.
        </div>
      ) : (
        <div className="space-y-6">
          {/* SLA Rules Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              SLA Rules
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Threshold Score (0-10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={config.threshold_score}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      threshold_score: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Max Retry Attempts
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={config.max_retry_attempts}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      max_retry_attempts: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
