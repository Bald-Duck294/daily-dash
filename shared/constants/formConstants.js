export const FEEDBACK_FORM_BASE_URL = "https://portal.saafai.in/feedback/tadoba";

/**
 * Builds the feedback form URL with dynamic locationId and companyId.
 * e.g., https://portal.saafai.in/feedback/tadoba?locationId=2080&companyId=93
 */
export const getFeedbackFormUrl = (locationId, companyId) => {
  const params = new URLSearchParams();
  if (locationId) params.append("locationId", locationId);
  if (companyId) params.append("companyId", companyId);

  const query = params.toString();
  return query
    ? `${FEEDBACK_FORM_BASE_URL}?${query}`
    : `${FEEDBACK_FORM_BASE_URL}`;
};

const formConstants = {
  FEEDBACK_FORM_BASE_URL,
  getFeedbackFormUrl,
};

export default formConstants;
