import axiosInstance from "@/shared/api/axios.instance.js";

function buildQueryParams(params = {}, companyId) {
  const queryParams = new URLSearchParams();

  const effectiveCompanyId = companyId || params.companyId || params.company_id;
  if (effectiveCompanyId) {
    queryParams.append("company_id", effectiveCompanyId);
  }

  if (params.cleanerId && params.cleanerId !== "all") {
    queryParams.append("cleaner_user_id", params.cleanerId);
  }

  if (params.locationId && params.locationId !== "all") {
    queryParams.append("location_id", params.locationId);
  }

  if (params.eventType && params.eventType !== "all") {
    queryParams.append("event_type", params.eventType);
  }

  if (params.status && params.status !== "all") {
    queryParams.append("state", params.status);
  }

  if (params.tier && params.tier !== "all") {
    queryParams.append("tier", params.tier);
  }

  if (params.datePreset) {
    queryParams.append("datePreset", params.datePreset);
  }

  if (params.startDate) {
    queryParams.append("startDate", params.startDate);
  }

  if (params.endDate) {
    queryParams.append("endDate", params.endDate);
  }

  if (params.search && params.search.trim()) {
    queryParams.append("search", params.search.trim());
  }

  if (params.page) {
    queryParams.append("page", params.page);
  }

  if (params.limit) {
    queryParams.append("limit", params.limit);
  }

  if (params.sort) {
    queryParams.append("sort", params.sort);
  }

  return queryParams;
}

export const SlaLogsApi = {
  // 1. Primary Incident List API
  getSlaIncidents: async (params = {}, companyId) => {
    try {
      const queryParams = buildQueryParams(params, companyId);
      const response = await axiosInstance.get(`/sla-logs/incidents?${queryParams.toString()}`);

      return {
        success: true,
        data: response.data?.data || [],
        pagination: response.data?.pagination || {},
        summary: response.data?.summary || {
          totalIncidents: 0,
          activeIncidents: 0,
          open: 0,
          resolved: 0,
          exhausted: 0,
          newBreaches: 0,
        },
      };
    } catch (error) {
      console.error("Error fetching SLA incidents:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: [],
        pagination: {},
        summary: {},
      };
    }
  },

  // 2. Single Incident Details API
  getSlaIncidentById: async (incidentId) => {
    try {
      const response = await axiosInstance.get(`/sla-logs/incidents/${incidentId}`);
      return {
        success: true,
        data: response.data?.data || null,
      };
    } catch (error) {
      console.error(`Error fetching SLA incident #${incidentId}:`, error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null,
      };
    }
  },

  // 3. Raw Audit Stream API
  getSlaLogs: async (params = {}, companyId) => {
    try {
      const queryParams = buildQueryParams(params, companyId);
      const response = await axiosInstance.get(`/sla-logs?${queryParams.toString()}`);

      return {
        success: true,
        data: response.data?.data || [],
        pagination: response.data?.pagination || {},
        summary: response.data?.summary || {
          totalIncidents: 0,
          activeIncidents: 0,
          open: 0,
          resolved: 0,
          exhausted: 0,
          newBreaches: 0,
        },
      };
    } catch (error) {
      console.error("Error fetching SLA logs:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: [],
        pagination: {},
        summary: {},
      };
    }
  },
};
