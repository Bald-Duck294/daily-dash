import { useQuery, useMutation } from "@tanstack/react-query";
import ReportsApi from "@/features/reports/reports.api";

/* =====================================================
   QUERY KEYS (Structured + Scalable)
===================================================== */
export const reportKeys = {
  all: ["reports"],
  
  // Dynamic Endpoints
  dynamic: (endpoint, params) => [...reportKeys.all, "dynamic", endpoint, params],
  
  // Specific Reports
  zoneWise: (params) => [...reportKeys.all, "zone-wise", params],
  dailyTask: (params) => [...reportKeys.all, "daily-task", params],
  
  // Filter/Dropdown Data
  zones: (companyId) => [...reportKeys.all, "zones", companyId],
  locations: (companyId, typeId) => [...reportKeys.all, "locations", companyId, typeId],
  cleaners: (companyId, locationId) => [...reportKeys.all, "cleaners", companyId, locationId],
};

/* =====================================================
   QUERIES (Fetching Data)
===================================================== */

// 1. Get Generic/Dynamic Report
export const useGetReport = (endpoint, params = {}) => {
  return useQuery({
    queryKey: reportKeys.dynamic(endpoint, params),
    queryFn: async () => {
      const response = await ReportsApi.getReport(endpoint, params);
      if (!response.success) throw new Error(response.error || "Failed to fetch report");
      return response;
    },
    enabled: !!endpoint,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// 2. Get Zone-wise Report
export const useGetZoneWiseReport = (params = {}) => {
  return useQuery({
    queryKey: reportKeys.zoneWise(params),
    queryFn: async () => {
      const response = await ReportsApi.getZoneWiseReport(params);
      if (!response.success) throw new Error(response.error || "Failed to fetch zone-wise report");
      return response;
    },
    enabled: !!params.company_id && params.company_id !== "null",
    staleTime: 5 * 60 * 1000,
  });
};

// 3. Get Daily Task Report
export const useGetDailyTaskReport = (params = {}) => {
  return useQuery({
    queryKey: reportKeys.dailyTask(params),
    queryFn: async () => {
      const response = await ReportsApi.getDailyTaskReport(params);
      if (!response.success) throw new Error(response.error || "Failed to fetch daily task report");
      return response;
    },
    enabled: !!params.company_id && params.company_id !== "null",
    staleTime: 5 * 60 * 1000,
  });
};

/* =====================================================
   QUERIES (Filters & Dropdowns)
===================================================== */

// 4. Get Available Zones
export const useGetAvailableZones = (companyId) => {
  return useQuery({
    queryKey: reportKeys.zones(companyId),
    queryFn: async () => {
      const response = await ReportsApi.getAvailableZones(companyId);
      if (!response.success) throw new Error(response.error || "Failed to fetch zones");
      return response.data;
    },
    enabled: !!companyId && companyId !== "null",
    staleTime: 15 * 60 * 1000, // Zones change rarely, cache longer (15 mins)
  });
};

// 5. Get Locations For Report (Axios Version)
export const useGetLocationsForReport = (companyId, typeId) => {
  return useQuery({
    queryKey: reportKeys.locations(companyId, typeId),
    queryFn: async () => {
      const response = await ReportsApi.getLocationsForReport(companyId, typeId);
      if (!response.success) throw new Error(response.error || "Failed to fetch locations");
      return response.data;
    },
    enabled: !!companyId && companyId !== "null",
    staleTime: 10 * 60 * 1000,
  });
};

// 6. Get Cleaners For Report (Axios Version)
export const useGetCleanersForReport = (companyId, locationId) => {
  return useQuery({
    queryKey: reportKeys.cleaners(companyId, locationId),
    queryFn: async () => {
      const response = await ReportsApi.getCleanersForReport(companyId, locationId);
      if (!response.success) throw new Error(response.error || "Failed to fetch cleaners");
      return response.data;
    },
    enabled: !!companyId && !!locationId,
    staleTime: 10 * 60 * 1000,
  });
};

/* =====================================================
   MUTATIONS (Actions / File Downloads)
===================================================== */

// 7. Export CSV
// Used as a mutation because it's an action triggered by a user click (side-effect), not reactive state.
export const useExportReportCSV = () => {
  return useMutation({
    mutationFn: async (params) => {
      const response = await ReportsApi.exportCSV(params);
      if (!response.success) throw new Error(response.error || "Failed to export CSV");
      return response;
    },
  });
};