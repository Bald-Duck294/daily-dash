import { useQuery } from '@tanstack/react-query';
import { DashboardApi } from '@/features/Dashboard/Dashboard.api'; // Adjust import path as needed

// 1. Get counts
export const useDashboardCounts = (companyId, date) => {
  return useQuery({
    queryKey: ['dashboard', 'counts', companyId, date],
    queryFn: async () => {
      const response = await DashboardApi.getCounts(companyId, date);
      if (!response.success) throw new Error(response.error || 'Failed to fetch counts');
      return response.data;
    },
    enabled: !!companyId, // Prevents query from running if companyId is undefined
  });
};

// 2. Get top locations
export const useDashboardAllLocations = (companyId, date) => {
  return useQuery({
    // Removed 'limit' from the query key array
    queryKey: ['dashboard', 'allLocationsScores', companyId, date],
    queryFn: async () => {
      // Calling the updated API function
      const response = await DashboardApi.getAllLocationsScores(companyId, date);
      if (!response.success) throw new Error(response.error || 'Failed to fetch locations scores');
      return response.data;
    },
    enabled: !!companyId,
  });
};

// 3. Get activities
export const useDashboardActivities = (companyId, limit = 10, date) => {
  return useQuery({
    queryKey: ['dashboard', 'activities', companyId, limit, date],
    queryFn: async () => {
      const response = await DashboardApi.getActivities(companyId, limit, date);
      if (!response.success) throw new Error(response.error || 'Failed to fetch activities');
      return response.data;
    },
    enabled: !!companyId,
  });
};

// 4. Get washroom scores summary
export const useWashroomScoresSummary = (companyId) => {
  return useQuery({
    queryKey: ['dashboard', 'washroomScores', companyId],
    queryFn: async () => {
      const response = await DashboardApi.getWashroomScoresSummary(companyId);
      if (!response.success) throw new Error('Failed to fetch washroom scores');
      return response.data;
    },
    enabled: !!companyId,
  });
};

// 5. Get cleaner performance
// Inside features/Dashboard/Dashboard.queries.js
// In features/Dashboard/Dashboard.queries.js
export const useCleanerPerformance = (companyId) => {
  return useQuery({
    queryKey: ['dashboard', 'cleanerPerformance', companyId],
    queryFn: async () => {
      const response = await DashboardApi.getCleanerPerformance(companyId);
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