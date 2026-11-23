import axiosInstance from "@/shared/api/axios.instance";

export const CleaningTasksApi = {
  /**
   * Fetch cleaning requests / tasks with filters
   */
  getCleaningRequests: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.company_id && params.company_id !== "all") {
        queryParams.append("company_id", params.company_id);
      }
      if (params.location_id && params.location_id !== "all") {
        queryParams.append("location_id", params.location_id);
      }
      if (params.cleaner_id && params.cleaner_id !== "all") {
        queryParams.append("cleaner_id", params.cleaner_id);
      }
      if (params.status && params.status !== "all") {
        queryParams.append("status", params.status);
      }
      if (params.priority && params.priority !== "all") {
        queryParams.append("priority", params.priority);
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

      const response = await axiosInstance.get(
        `/cleaning-requests?${queryParams.toString()}`
      );
      return {
        success: true,
        data: response.data?.data || [],
        pagination: response.data?.pagination || { total: 0, page: 1, limit: 15, pages: 1 },
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to fetch cleaning tasks",
        data: [],
        pagination: { total: 0, page: 1, limit: 15, pages: 1 },
      };
    }
  },

  /**
   * Fetch cleaning task statistics (Total, Pending, In Progress, Resolved, Urgent, Auto Assigned)
   */
  getCleaningRequestStats: async (companyId) => {
    try {
      const queryParams = new URLSearchParams();
      if (companyId && companyId !== "all") {
        queryParams.append("company_id", companyId);
      }
      const response = await axiosInstance.get(
        `/cleaning-requests/stats?${queryParams.toString()}`
      );
      return {
        success: true,
        data: response.data?.data || {
          total: 0,
          pending: 0,
          in_progress: 0,
          resolved: 0,
          urgent: 0,
          auto_assigned: 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to fetch statistics",
        data: {
          total: 0,
          pending: 0,
          in_progress: 0,
          resolved: 0,
          urgent: 0,
          auto_assigned: 0,
        },
      };
    }
  },

  /**
   * Fetch cleaners mapped specifically to a toilet / location
   */
  getToiletCleaners: async (locationId) => {
    try {
      if (!locationId) return { success: true, data: [] };
      const response = await axiosInstance.get(
        `/cleaning-requests/cleaners?location_id=${locationId}`
      );
      return {
        success: true,
        data: response.data?.data || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to fetch toilet cleaners",
        data: [],
      };
    }
  },

  /**
   * Supervisor assigns a cleaner to a cleaning request
   */
  assignCleaner: async ({ request_id, cleaner_id, notes }) => {
    try {
      const response = await axiosInstance.post("/cleaning-requests/assign", {
        request_id,
        request_ids: [request_id],
        cleaner_id,
        cleaner_user_id: cleaner_id,
        notes,
      });
      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message || "Task assigned successfully",
        cleaner_notification: response.data?.cleaner_notification,
        citizen_notification: response.data?.citizen_notification,
      };
    } catch (error) {
      throw new Error(
        error.response?.data?.message || error.message || "Failed to assign cleaner"
      );
    }
  },

  /**
   * Update request status (e.g. mark resolved)
   */
  updateRequestStatus: async (id, { status, notes, resolution_notes }) => {
    try {
      const response = await axiosInstance.put(`/cleaning-requests/${id}/status`, {
        status,
        notes,
        resolution_notes,
      });
      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message || "Status updated successfully",
      };
    } catch (error) {
      throw new Error(
        error.response?.data?.message || error.message || "Failed to update status"
      );
    }
  },
};

export default CleaningTasksApi;
