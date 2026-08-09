import { useQuery } from '@tanstack/react-query';
import { DashboardApi } from '@/features/Dashboard/Dashboard.api'; // Adjust import path as needed

// 1. Get counts
export const useDashboardCounts = (companyId, dateObj) => {
  const isDateRange = typeof dateObj === 'object' && dateObj !== null;
  const dateStr = isDateRange ? undefined : dateObj;
  const startDate = isDateRange ? dateObj.startDate : undefined;
  const endDate = isDateRange ? dateObj.endDate : undefined;

  return useQuery({
    queryKey: ['dashboard', 'counts', companyId, isDateRange ? `${startDate}-${endDate}` : dateStr],
    queryFn: async () => {
      const response = await DashboardApi.getCounts(companyId, dateStr, startDate, endDate);
      if (!response.success) throw new Error(response.error || 'Failed to fetch counts');
      return response.data;
    },
    enabled: !!companyId, // Prevents query from running if companyId is undefined
  });
};

// 2. Get top locations
export const useDashboardAllLocations = (companyId, dateObj) => {
  const isDateRange = typeof dateObj === 'object' && dateObj !== null;
  const dateStr = isDateRange ? undefined : dateObj;
  const startDate = isDateRange ? dateObj.startDate : undefined;
  const endDate = isDateRange ? dateObj.endDate : undefined;

  return useQuery({
    // Removed 'limit' from the query key array
    queryKey: ['dashboard', 'allLocationsScores', companyId, isDateRange ? `${startDate}-${endDate}` : dateStr],
    queryFn: async () => {
      // Calling the updated API function
      const response = await DashboardApi.getAllLocationsScores(companyId, dateStr, startDate, endDate);
      if (!response.success) throw new Error(response.error || 'Failed to fetch locations scores');
      return response.data;
    },
    enabled: !!companyId,
  });
};

// 3. Get activities
export const useDashboardActivities = (companyId, limit = 10, dateObj) => {
  const isDateRange = typeof dateObj === 'object' && dateObj !== null;
  const dateStr = isDateRange ? undefined : dateObj;
  const startDate = isDateRange ? dateObj.startDate : undefined;
  const endDate = isDateRange ? dateObj.endDate : undefined;

  return useQuery({
    queryKey: ['dashboard', 'activities', companyId, limit, isDateRange ? `${startDate}-${endDate}` : dateStr],
    queryFn: async () => {
      const response = await DashboardApi.getActivities(companyId, limit, dateStr, startDate, endDate);
      if (!response.success) throw new Error(response.error || 'Failed to fetch activities');
      return response.data;
    },
    enabled: !!companyId,
  });
};

// 4. Get washroom scores summary
export const useWashroomScoresSummary = (companyId, dateRange) => {
  return useQuery({
    queryKey: ['dashboard', 'washroomScores', companyId, dateRange],
    queryFn: async () => {
      const response = await DashboardApi.getWashroomScoresSummary(companyId, dateRange);
      if (!response.success) throw new Error('Failed to fetch washroom scores');
      return response.data;
    },
    enabled: !!companyId,
  });
};

// 5. Get cleaner performance
// Inside features/Dashboard/Dashboard.queries.js
// In features/Dashboard/Dashboard.queries.js
export const useCleanerPerformance = (companyId, dateRange) => {
  return useQuery({
    queryKey: ['dashboard', 'cleanerPerformance', companyId, dateRange],
    queryFn: async () => {
      const response = await DashboardApi.getCleanerPerformance(companyId, dateRange);
      if (!response.success) throw new Error('Failed to fetch');
      
      // Return the whole object so we get { data, stats, success }
      return response; 
    },
    enabled: !!companyId,
  });
};

export const useGetWashroomHygieneHeatmap = (params = {}) => {
  return useQuery({
    // Updated query key to match the new endpoint identifier
    queryKey: ["dashboard", "heat-map", params], 
    queryFn: async () => {
      const response = await DashboardApi.getWashroomHygieneHeatmap(params);
      
      // Validate successful response format
      if (response.status !== "success") {
          throw new Error(response.message || "Failed to fetch heatmap data");
      }
      
      return response;
    },
    // Prevent query execution until all required dates and companyId are present
    enabled: !!params.company_id && params.company_id !== "null" && !!params.start_date && !!params.end_date,
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
  });
};