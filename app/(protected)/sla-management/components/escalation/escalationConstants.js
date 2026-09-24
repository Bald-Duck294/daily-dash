export const TARGET_ROLE_OPTIONS = [
  {
    value: "cleaner",
    label: "Cleaner",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
    description: "Ground cleaning personnel assigned to the location",
  },
  {
    value: "supervisor",
    label: "Supervisor",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
    description: "Shift supervisor responsible for washroom inspection",
  },
  {
    value: "admin",
    label: "Admin",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
    description: "Company or organization operations administrator",
  },
  {
    value: "facility_supv",
    label: "Facility Supervisor",
    badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800",
    description: "Facility maintenance lead",
  },
  {
    value: "facility_admin",
    label: "Facility Admin",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800",
    description: "Facility management executive",
  },
  {
    value: "zonal_admin",
    label: "Zonal Admin",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
    description: "Regional / Zonal executive administrator",
  },
];

export const DELAY_PRESETS = [
  { label: "Immediate (0m)", minutes: 0 },
  { label: "30 min", minutes: 30 },
  { label: "1 hour", minutes: 60 },
  { label: "2 hours", minutes: 120 },
  { label: "4 hours", minutes: 240 },
  { label: "8 hours", minutes: 480 },
];

export const formatDelayMinutes = (minutes) => {
  const mins = Number(minutes);
  if (isNaN(mins) || mins <= 0) return "Immediate (0m)";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""}`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (remainingMins === 0) {
    return `${hours} hr${hours > 1 ? "s" : ""}`;
  }
  return `${hours} hr${hours > 1 ? "s" : ""} ${remainingMins}m`;
};

export const createDefaultLevel = (levelNumber, prevDelay = 0) => {
  const nextDelay = prevDelay === 0 ? 120 : prevDelay + 120;
  const defaultRoles = ["cleaner", "supervisor", "admin", "facility_admin"];
  const roleIndex = Math.min(levelNumber - 1, defaultRoles.length - 1);

  return {
    level: levelNumber,
    target_role: defaultRoles[roleIndex] || "supervisor",
    delay_minutes: nextDelay,
    send_notification: true,
  };
};
