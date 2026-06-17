// features/attendance/attendance.queries.js
import { useQuery } from "@tanstack/react-query";
import AttendanceApi from "@/features/attendance/attendance.api";

export const attendanceKeys = {
  all: ["attendance"],
  lists: () => [...attendanceKeys.all, "list"],
  // Include companyId in the query key so it caches separately per company
  list: (filters, companyId) => [...attendanceKeys.lists(), filters, companyId], 
};

export const useCleanerAttendance = (filters = {}, companyId) => {
  return useQuery({
    queryKey: attendanceKeys.list(filters, companyId),
    queryFn: async () => {
      // Pass both filters and companyId to your API wrapper
      const response = await AttendanceApi.getCleanerAttendance(filters, companyId);
      
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch attendance");
      }
      return response;
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });
};