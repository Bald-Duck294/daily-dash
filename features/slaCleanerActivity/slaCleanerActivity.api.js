import axiosInstance from "@/shared/api/axios.instance";

export const SlaCleanerActivityApi = {
  /**
   * Fetch paginated list of SLA Cleaner Activities
   */
  getSlaActivities: async (params = {}, companyId) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.status && params.status !== "all") {
        queryParams.append("status", params.status);
      }
      if (params.sla_status && params.sla_status !== "all") {
        queryParams.append("sla_status", params.sla_status);
      }
      if (params.cleaner_id && params.cleaner_id !== "all") {
        queryParams.append("cleaner_id", params.cleaner_id);
      }
      if (params.cleanerId && params.cleanerId !== "all") {
        queryParams.append("cleaner_id", params.cleanerId);
      }
      if (params.start_date) {
        queryParams.append("start_date", params.start_date);
      }
      if (params.end_date) {
        queryParams.append("end_date", params.end_date);
      }
      if (params.search) {
        queryParams.append("search", params.search);
      }
      if (params.page) {
        queryParams.append("page", params.page);
      }
      if (params.limit) {
        queryParams.append("limit", params.limit);
      }
      if (companyId) {
        queryParams.append("company_id", companyId);
      }

      const response = await axiosInstance.get(
        `/cleaner-reviews/sla-activities?${queryParams.toString()}`
      );

      return {
        success: true,
        data: response.data?.data || [],
        pagination: response.data?.pagination || {},
      };
    } catch (error) {
      console.error("Error fetching SLA cleaner activities:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: [],
        pagination: {},
      };
    }
  },

  /**
   * Fetch single SLA Cleaner Activity lifecycle details by activityId
   */
  getSlaActivityById: async (activityId) => {
    try {
      const response = await axiosInstance.get(
        `/cleaner-reviews/sla-activities/${activityId}`
      );

      return {
        success: true,
        data: response.data?.data,
      };
    } catch (error) {
      console.error("Error fetching SLA cleaner activity by ID:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  /**
   * Update management score for a review attempt in an SLA lifecycle
   */
  updateManagementScore: async (reviewId, formData) => {
    try {
      const response = await axiosInstance.put(
        `/cleaner-reviews/${reviewId}/management-score`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating management score:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },
};
