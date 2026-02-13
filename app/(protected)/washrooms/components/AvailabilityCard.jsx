"use client";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default function AvailabilityCard({
  schedule,
  setSchedule,
}) {

  const handleModeChange = (mode) => {
    setSchedule({
      ...schedule,
      mode,
    });
  };

  const handleFixedChange = (field, value) => {
    const updated = {
      ...schedule,
      [field]: value,
    };

    const overnight =
      updated.opens_at &&
      updated.closes_at &&
      updated.closes_at < updated.opens_at;

    setSchedule({
      ...updated,
      overnight,
    });
  };

  const handleDayChange = (day, field, value) => {
    const dayData = {
      ...schedule.days?.[day],
      [field]: value,
    };

    const overnight =
      dayData.opens_at &&
      dayData.closes_at &&
      dayData.closes_at < dayData.opens_at;

    setSchedule({
      ...schedule,
      days: {
        ...schedule.days,
        [day]: {
          ...dayData,
          overnight,
        },
      },
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">
          Availability & Operating Hours
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure washroom operating schedule
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: "24 Hours", value: "TWENTY_FOUR_HOURS" },
          { label: "Fixed Hours", value: "FIXED_HOURS" },
          { label: "Day Wise", value: "DAY_WISE" },
        ].map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => handleModeChange(item.value)}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
              schedule.mode === item.value
                ? "bg-cyan-500 text-white border-cyan-500"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 24 HOURS */}
      {schedule.mode === "TWENTY_FOUR_HOURS" && (
        <div className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">
          Washroom operates 24 hours daily.
        </div>
      )}

      {/* FIXED HOURS */}
      {schedule.mode === "FIXED_HOURS" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">
              Opens At
            </label>
            <input
              type="time"
              value={schedule.opens_at || ""}
              onChange={(e) =>
                handleFixedChange("opens_at", e.target.value)
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">
              Closes At
            </label>
            <input
              type="time"
              value={schedule.closes_at || ""}
              onChange={(e) =>
                handleFixedChange("closes_at", e.target.value)
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
          </div>

          {schedule.overnight && (
            <div className="col-span-2 text-xs text-amber-500 font-semibold">
              Closes next day (overnight schedule)
            </div>
          )}
        </div>
      )}

      {/* DAY WISE */}
      {schedule.mode === "DAY_WISE" && (
        <div className="space-y-4">
          {DAYS.map((day) => {
            const dayData = schedule.days?.[day] || {};

            return (
              <div
                key={day}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span className="capitalize font-bold text-sm text-slate-700 dark:text-slate-200">
                    {day}
                  </span>

                  <input
                    type="checkbox"
                    checked={dayData.open || false}
                    onChange={(e) =>
                      handleDayChange(day, "open", e.target.checked)
                    }
                    className="accent-cyan-500"
                  />
                </div>

                {dayData.open && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="time"
                        value={dayData.opens_at || ""}
                        onChange={(e) =>
                          handleDayChange(day, "opens_at", e.target.value)
                        }
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                      />

                      <input
                        type="time"
                        value={dayData.closes_at || ""}
                        onChange={(e) =>
                          handleDayChange(day, "closes_at", e.target.value)
                        }
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                      />
                    </div>

                    {dayData.overnight && (
                      <div className="text-xs text-amber-500 font-semibold">
                        Closes next day
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
