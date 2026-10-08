/**
 * SLA Activity Formatting & UI Utilities
 */

export const cleanString = (str) =>
  str
    ? String(str)
        .replace(/^["'\s]+|["'\s,]+$/g, "")
        .trim()
    : "";

export const getTimeElapsed = (startTime) => {
  if (!startTime) return "";
  const diff = Date.now() - new Date(startTime);
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m ago` : `${m}m ago`;
};

export const getCompletionTime = (start, end) => {
  if (!start || !end) return "";
  const diff = new Date(end) - new Date(start);
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return h > 0 ? `Completed in ${h}h ${m}m` : `Completed in ${m}m`;
};

export const getLocalDateString = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split("T")[0];
};

export const formatDateTime12Hr = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });
};

export const formatDateShort = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

/**
 * Returns color tokens and icons for SLA state badge
 */
export const getSlaStateBadge = (slaState) => {
  switch (slaState) {
    case "RESOLVED":
      return {
        label: "SLA Resolved",
        bg: "rgba(16, 185, 129, 0.12)",
        text: "#10B981",
        border: "rgba(16, 185, 129, 0.25)",
        dot: "#10B981",
        icon: "CheckCircle",
      };
    case "EXHAUSTED":
      return {
        label: "SLA Exhausted",
        bg: "rgba(239, 68, 68, 0.12)",
        text: "#EF4444",
        border: "rgba(239, 68, 68, 0.25)",
        dot: "#EF4444",
        icon: "XCircle",
      };
    case "RETRY_IN_PROGRESS":
      return {
        label: "Retry In Progress",
        bg: "rgba(245, 158, 11, 0.12)",
        text: "#F59E0B",
        border: "rgba(245, 158, 11, 0.25)",
        dot: "#F59E0B",
        icon: "RefreshCw",
      };
    case "BREACHED":
      return {
        label: "SLA Breached / Retry Required",
        bg: "rgba(249, 115, 22, 0.12)",
        text: "#F97316",
        border: "rgba(249, 115, 22, 0.25)",
        dot: "#F97316",
        icon: "AlertTriangle",
      };
    case "NO_BREACH":
    default:
      return {
        label: "No SLA Breach",
        bg: "rgba(59, 130, 246, 0.1)",
        text: "#3B82F6",
        border: "rgba(59, 130, 246, 0.2)",
        dot: "#3B82F6",
        icon: "ShieldCheck",
      };
  }
};
