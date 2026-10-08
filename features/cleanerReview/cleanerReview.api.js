// src/lib/api/cleanerReviewApi.js
import axiosInstance from "@/shared/api/axios.instance";
// import API_BASE_URL from "../utils/Constant";

export const CleanerReviewApi = {
  getAllCleanerReviews: async (params = {}, company_id) => {
    // console.log('in get all cleaner review ', company_id)
    try {
      const queryParams = new URLSearchParams();

      // console.log(queryParams, "query params ")
      if (params.status) {
        queryParams.append("status", params.status);
      }
      if (params.cleanerId) {
        queryParams.append("cleaner_user_id", params.cleanerId);
      }
      if (params.date) {
        queryParams.append("date", params.date);
      }

      if (company_id) {
        queryParams.append("company_id", company_id);
      }
      // console.log(queryParams, "query params after response")

      const response = await axiosInstance.get(
        `/cleaner-reviews?${queryParams.toString()}`,
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching cleaner reviews:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },
  getAllCleanerReview: async (params = {}, company_id) => {
    // console.log('in get all cleaner review ', company_id)
    try {
      const queryParams = new URLSearchParams();

      // console.log(queryParams, "query params ")
      if (params.status) {
        queryParams.append("status", params.status);
      }
      if (params.cleanerId) {
        queryParams.append("cleaner_user_id", params.cleanerId);
      }
      if (params.date) {
        queryParams.append("date", params.date);
      }

      if (company_id) {
        queryParams.append("company_id", company_id);
      }
      // console.log(queryParams, "query params after response")

      const response = await axiosInstance.get(
        `/cleaner-reviews/paginated?${queryParams.toString()}`,
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching cleaner reviews:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  getCleanerReviewsByCleanerId: async (cleanerUserId) => {
    try {
      const response = await axiosInstance.get(
        `/cleaner-reviews/${cleanerUserId}`,
      );
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error fetching cleaner reviews:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: { reviews: [], stats: {} },
      };
    }
  },
  async getCleanerReviewById(reviewId) {
    // console.log(reviewId, "id")
    try {
      const response = await axiosInstance(
        `/cleaner-reviews/task/${reviewId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      // console.log(response, "response")

      if (response) {
        return {
          success: true,
          data: response?.data,
        };
      } else {
        return {
          success: false,
          error: data.message || "Failed to fetch review details",
        };
      }
    } catch (error) {
      console.error("Error fetching review by ID:", error);
      return {
        success: false,
        error: "Network error occurred",
      };
    }
  },

  async getCleanerReviewsByLocationId(locationId, companyId, take) {
    console.log(
      "Fetching cleaner reviews for location:",
      locationId,
      "company:",
      companyId,
    );
    try {
      const queryParams = new URLSearchParams();
      if (companyId) {
        queryParams.append("company_id", companyId);
      }

      if (take) {
        queryParams.append("take", take);
      }
      const response = await axiosInstance.get(
        `/cleaner-reviews/location/${locationId}?${queryParams.toString()}`,
      );

      // console.log('✅ Cleaner reviews response:', response);

      if (response.data) {
        return {
          success: true,
          data: response.data.data, // Extract the data object
          stats: response.data.data?.stats || null,
        };
      } else {
        return {
          success: false,
          error: "Failed to fetch cleaner reviews",
        };
      }
    } catch (error) {
      console.error("❌ Error fetching cleaner reviews by location:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Network error occurred",
        data: { reviews: [], stats: { total_reviews: 0 } },
      };
    }
  },

  updateReviewScore: async (reviewId, newScore, trigger_escalation = false) => {
    try {
      const response = await axiosInstance.patch(
        `/cleaner-reviews/${reviewId}/score`,
        {
          score: newScore,
          trigger_escalation,
        },
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating score:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  updateSupervisorScore: async (reviewId, newScore) => {
    try {
      const response = await axiosInstance.put(
        `/cleaner-reviews/${reviewId}/supervisor-score`,
        {
          score: newScore,
        },
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating supervisor score:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  updateManagementScore: async (reviewId, formData) => {
    try {
      const response = await axiosInstance.put(
        `/cleaner-reviews/${reviewId}/management-score`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
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

  getSlaCleanerActivities: async (params = {}, companyId) => {
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

  getSlaCleanerActivityById: async (activityId) => {
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
};

