export const TADOBA_FEEDBACK_FORM_BASE_URL = "https://portal.saafai.in/feedback/tadoba";
export const GENERIC_FEEDBACK_FORM_BASE_URL = "https://portal.saafai.in/feedback";

// Keep backward compatibility export
export const FEEDBACK_FORM_BASE_URL = GENERIC_FEEDBACK_FORM_BASE_URL;

/**
 * Builds the feedback form URL with dynamic locationId and companyId.
 * - Company ID 95 -> https://portal.saafai.in/feedback/tadoba?...
 * - All other companies -> https://portal.saafai.in/feedback?...
 */
export const getFeedbackFormUrl = (locationId, companyId) => {
  const isTadoba = String(companyId).trim() === "95";
  const baseUrl = isTadoba
    ? TADOBA_FEEDBACK_FORM_BASE_URL
    : GENERIC_FEEDBACK_FORM_BASE_URL;

  const params = new URLSearchParams();
  if (locationId) params.append("locationId", locationId);
  if (companyId) params.append("companyId", companyId);

  const query = params.toString();
  return query ? `${baseUrl}?${query}` : baseUrl;
};

const formConstants = {
  FEEDBACK_FORM_BASE_URL,
  TADOBA_FEEDBACK_FORM_BASE_URL,
  GENERIC_FEEDBACK_FORM_BASE_URL,
  getFeedbackFormUrl,
};

export default formConstants;
