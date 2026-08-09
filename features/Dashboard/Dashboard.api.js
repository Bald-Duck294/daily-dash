// lib/api/DashboardApi.js
import axiosInstance from "@/shared/api/axios.instance";
export const DashboardApi = {
  // 1. Get counts only
  getCounts: async (companyId, date, startDate, endDate) => {
    try {
      const params = new URLSearchParams({
        companyId,
      });
      if (startDate && endDate) {
        params.append("startDate", startDate);
        params.append("endDate", endDate);
      } else {
        params.append("date", date || new Date().toISOString().split("T")[0]);
      }

      const response = await axiosInstance.get(
        `/dashboard/counts?${params.toString()}`,
      );

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error fetching counts:", error);
      return { success: false, error: error.message };
    }
  },

  // 2. Get top locations
getAllLocationsScores: async (companyId, date, startDate, endDate) => {
    try {
      const params = new URLSearchParams({
        companyId,
      });
      if (startDate && endDate) {
        params.append("startDate", startDate);
        params.append("endDate", endDate);
      } else {
        params.append("date", date || new Date().toISOString().split("T")[0]);
      }

      // Note: Update the endpoint URL here if you also changed your backend route name 
      // (e.g., from '/dashboard/top-locations' to '/dashboard/all-locations')
      const response = await axiosInstance.get(
        `/dashboard/top-locations?${params.toString()}`,
      );

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error fetching all locations scores:", error);
      return { success: false, error: error.message };
    }
  },
  // 3. Get today's activities
  getActivities: async (companyId, limit = 10, date, startDate, endDate) => {
    try {
      const params = new URLSearchParams({
        companyId,
        limit,
      });
      if (startDate && endDate) {
        params.append("startDate", startDate);
        params.append("endDate", endDate);
      } else {
        params.append("date", date || new Date().toISOString().split("T")[0]);
      }

      const response = await axiosInstance.get(
        `/dashboard/activities?${params.toString()}`,
      );

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Error fetching activities:", error);
      return { success: false, error: error.message };
    }
  },

  getWashroomScoresSummary: async (companyId, dateRange) => {
    try {
      let queryParams = `companyId=${companyId}`;
      if (dateRange && dateRange.startDate && dateRange.endDate) {
        queryParams += `&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      }
      const response = await axiosInstance.get(
        `/dashboard/graph-washroom-scores?${queryParams}`,
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("Washroom scores error:", error);
      return { success: false, data: [] };
    }
  },

  // 2. New API for Cleaner Performance Graph
  getCleanerPerformance: async (companyId, dateRange) => {
    try {
      let queryParams = `companyId=${companyId}`;
      if (dateRange && dateRange.startDate && dateRange.endDate) {
        queryParams += `&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      }
      const response = await axiosInstance.get(
        `/dashboard/graph-cleaner-performance?${queryParams}`
      );
      
      // Check if the response exists and has data
      if (response.data) {
        return response.data; // This returns { success: true, data: [...], stats: {...} }
      }
      return { success: false, data: [], stats: {} };
    } catch (error) {
      console.error("Cleaner performance error:", error);
      return { success: false, data: [], stats: {} };
    }
  },

getWashroomHygieneHeatmap: async (params) => {
    try {
      const response = await axiosInstance.get("/dashboard/heat-map", { 
        params 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

};
