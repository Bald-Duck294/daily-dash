// features/attendance/attendance.api.js
import axiosInstance from "@/shared/api/axios.instance";

export const AttendanceApi = {
  getCleanerAttendance: async (params = {}, company_id) => {
    try {
      const queryParams = new URLSearchParams();

      // 🟢 Send Location ID
      if (params.locationId && params.locationId !== "all") {
        queryParams.append("location_id", params.locationId);
      }

      if (params.cleanerId && params.cleanerId !== "all") {
        queryParams.append("cleaner_user_id", params.cleanerId);
      }
      if (params.search) {
        queryParams.append("search", params.search);
      }
      
      if (params.start_date) queryParams.append("start_date", params.start_date);
      if (params.end_date) queryParams.append("end_date", params.end_date);
      if (params.page) queryParams.append("page", params.page);
      
      // 🟢 For a matrix view, we need a massive limit so we get all records for the month
      queryParams.append("limit", params.limit || 5000); 

      const finalCompanyId = company_id || params.company_id || params.company;
      if (finalCompanyId) queryParams.append("company_id", finalCompanyId);

      const response = await axiosInstance.get(`/attendance?${queryParams.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default AttendanceApi;