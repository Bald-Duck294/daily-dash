import { useQuery } from "@tanstack/react-query";
import PhotoApi from "@/features/photo/photo.api";

/**
 * Custom hook to fetch cleaner review photos using TanStack Query.
 * Automatically refetches when the filters change.
 * * @param {Object} filters - The filter state (search, company, location, etc.)
 */
export const useCleanerReviewPhotos = (filters) => {
  return useQuery({
    // By passing the entire 'filters' object (which now includes 'page' and 'limit'),
    // TanStack Query will automatically refetch when the user goes to the next page.
    queryKey: ["cleaner-photos", filters],
    
    queryFn: async () => {
      const response = await PhotoApi.getCleanerReviewPhotos(filters);
      
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch photos.");
      }
      
      // Response now includes: { success: true, data: [...], pagination: {...} }
      return response;
    },
    
    staleTime: 5 * 60 * 1000, // Data remains fresh for 5 minutes
    
    // --- PAGINATION UX SETTING ---
    // This keeps the current page's images on screen while the next page loads,
    // preventing the grid from flashing white/empty between page clicks.
    
    // 👉 IF YOU ARE USING React Query v4:
    keepPreviousData: true, 

    // 👉 IF YOU ARE USING TanStack Query v5 (the latest version), delete the line above and use this instead:
    // placeholderData: keepPreviousData,
  });
};