import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CleanerReviewApi } from "@/features/cleanerReview/cleanerReview.api"; // Adjust import path if needed

// ==========================================
// QUERIES (Fetching Data)
// ==========================================

// 1. Get All Cleaner Reviews (with filters)
export const useAllCleanerReviews = (params = {}, companyId) => {
  return useQuery({
    queryKey: ["cleaner-reviews", "all", params, companyId],
    queryFn: async () => {
      const response = await CleanerReviewApi.getAllCleanerReviews(params, companyId);
      if (!response.success) throw new Error(response.error || "Failed to fetch cleaner reviews");
      return response.data;
    },
    // Only run if companyId is provided (matching your UI component logic)
    enabled: !!companyId && companyId !== "null", 
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// 2. Get Reviews by Cleaner ID
export const useCleanerReviewsByCleanerId = (cleanerUserId) => {
  return useQuery({
    queryKey: ["cleaner-reviews", "byCleaner", cleanerUserId],
    queryFn: async () => {
      const response = await CleanerReviewApi.getCleanerReviewsByCleanerId(cleanerUserId);
      if (!response.success) throw new Error(response.error || "Failed to fetch reviews for cleaner");
      return response.data;
    },
    enabled: !!cleanerUserId,
    staleTime: 5 * 60 * 1000,
  });
};

// 3. Get Single Review by Review ID
export const useCleanerReviewById = (reviewId) => {
  return useQuery({
    queryKey: ["cleaner-reviews", "detail", reviewId],
    queryFn: async () => {
      const response = await CleanerReviewApi.getCleanerReviewById(reviewId);
      if (!response.success) throw new Error(response.error || "Failed to fetch review details");
      return response.data;
    },
    enabled: !!reviewId,
    staleTime: 5 * 60 * 1000,
  });
};

// 4. Get Reviews by Location ID
export const useCleanerReviewsByLocationId = (locationId, companyId, take) => {
  return useQuery({
    queryKey: ["cleaner-reviews", "byLocation", locationId, companyId, take],
    queryFn: async () => {
      const response = await CleanerReviewApi.getCleanerReviewsByLocationId(locationId, companyId, take);
      if (!response.success) throw new Error(response.error || "Failed to fetch location reviews");
      // Returning both data and stats based on your API structure
      return { data: response.data, stats: response.stats }; 
    },
    enabled: !!locationId && !!companyId && companyId !== "null",
    staleTime: 5 * 60 * 1000,
  });
};

// ==========================================
// MUTATIONS (Modifying Data)
// ==========================================

// 5. Update Review Score
export function useUpdateReviewScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, newScore }) => {
      const response = await CleanerReviewApi.updateReviewScore(reviewId, newScore);
      if (!response.success) throw new Error(response.error || "Failed to update score");
      return response.data;
    },

    // 1. onMutate fires immediately when mutate() is called, before the network trip
    onMutate: async ({ reviewId, newScore }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["cleaner-reviews"] });

      // Snapshot the previous cache state (to roll back if the API fails)
      // getQueriesData gets all variations of the list (e.g., different filters/pages)
      const previousReviews = queryClient.getQueriesData({ queryKey: ["cleaner-reviews"] });
      const previousDetail = queryClient.getQueryData(["cleaner-reviews", "detail", reviewId]);

      // Optimistically update all cached lists with the new score
      queryClient.setQueriesData({ queryKey: ["cleaner-reviews"] }, (oldData) => {
        if (!oldData) return oldData;
        
        return oldData.map((review) =>
          review.id === reviewId
            ? { ...review, score: newScore, is_modified: true } // Inject new values
            : review
        );
      });

      // Optimistically update the specific detail query (if it exists)
      queryClient.setQueryData(["cleaner-reviews", "detail", reviewId], (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, score: newScore, is_modified: true };
      });

      // Return the snapshots so we have them if things go wrong
      return { previousReviews, previousDetail };
    },

    // 2. If the API fails, use the snapshots to roll the UI back
    onError: (err, variables, context) => {
      // Restore all list queries
      context.previousReviews.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      
      // Restore the detail query
      if (context.previousDetail) {
        queryClient.setQueryData(
          ["cleaner-reviews", "detail", variables.reviewId], 
          context.previousDetail
        );
      }
    },

    // 3. Regardless of success or failure, invalidate to ensure true sync with the server
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cleaner-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["cleaner-reviews", "detail", variables.reviewId] });
    },
  });
}
export function useUpdateSupervisorScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, newScore }) => {
      const response = await CleanerReviewApi.updateSupervisorScore(reviewId, newScore);
      if (!response.success) throw new Error(response.error || "Failed to update score");
      return response.data;
    },
    onMutate: async ({ reviewId, newScore }) => {
      await queryClient.cancelQueries({ queryKey: ["cleaner-reviews"] });
      const previousReviews = queryClient.getQueriesData({ queryKey: ["cleaner-reviews"] });
      const previousDetail = queryClient.getQueryData(["cleaner-reviews", "detail", reviewId]);

      queryClient.setQueriesData({ queryKey: ["cleaner-reviews"] }, (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((review) =>
          review.id === reviewId
            ? { ...review, score: newScore, is_modified: true }
            : review
        );
      });

      queryClient.setQueryData(["cleaner-reviews", "detail", reviewId], (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, score: newScore, is_modified: true };
      });

      return { previousReviews, previousDetail };
    },
    onError: (err, variables, context) => {
      context.previousReviews.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      if (context.previousDetail) {
        queryClient.setQueryData(
          ["cleaner-reviews", "detail", variables.reviewId], 
          context.previousDetail
        );
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cleaner-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["cleaner-reviews", "detail", variables.reviewId] });
    },
  });
}

