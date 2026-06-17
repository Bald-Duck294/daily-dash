// features/attendance/attendance.api.js
import axiosInstance from "@/shared/api/axios.instance";

export const AttendanceApi = {
  // getCleanerAttendance: async (params = {}, company_id) => {
  //   try {
  //     const queryParams = new URLSearchParams();

  //     // 1. Cleaner Filter
  //     if (params.cleaner_id || params.cleanerId) {
  //       queryParams.append("cleaner_user_id", params.cleaner_id || params.cleanerId);
  //     }
      
  //     // 2. Date Range Filters
  //     if (params.start_date || params.startDate) {
  //       queryParams.append("start_date", params.start_date || params.startDate);
  //     }
  //     if (params.end_date || params.endDate) {
  //       queryParams.append("end_date", params.end_date || params.endDate);
  //     }

  //     // 3. Pagination Filters
  //     if (params.page) {
  //       queryParams.append("page", params.page);
  //     }
  //     if (params.limit) {
  //       queryParams.append("limit", params.limit);
  //     }

  //     // 4. Company ID (Can be passed as separate arg or inside params)
  //     const finalCompanyId = company_id || params.company_id || params.company;
  //     if (finalCompanyId) {
  //       queryParams.append("company_id", finalCompanyId);
  //     }

  //     // Make sure the endpoint matches your backend route
  //     const response = await axiosInstance.get(
  //       `/attendance?${queryParams.toString()}` 
  //     );

  //     return {
  //       success: true,
  //       // response.data contains your { data: [...], pagination: {...} } object
  //       data: response.data, 
  //     };
  //   } catch (error) {
  //     console.error("Error fetching cleaner attendance:", error);
  //     return {
  //       success: false,
  //       error: error.response?.data?.message || error.message,
  //     };
  //   }
  // },
getCleanerAttendance: async (params = {}, company_id) => {
    try {
      const queryParams = new URLSearchParams();

      // Send ID if it exists
      if (params.cleanerId && params.cleanerId !== "all") {
        queryParams.append("cleaner_user_id", params.cleanerId);
      }

      // Send String search if it exists
      if (params.search) {
        queryParams.append("search", params.search);
      }
      
      if (params.start_date) queryParams.append("start_date", params.start_date);
      if (params.end_date) queryParams.append("end_date", params.end_date);
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);

      const finalCompanyId = company_id || params.company_id || params.company;
      if (finalCompanyId) queryParams.append("company_id", finalCompanyId);

      const response = await axiosInstance.get(`/attendance?${queryParams.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching attendance:", error);
      return { success: false, error: error.message };
    }
  },
};

export default AttendanceApi;