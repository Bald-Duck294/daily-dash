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
// 🆕 SLA CLEANER ACTIVITY LIFECYCLE QUERIES
// ==========================================

// 5. Get Paginated SLA Cleaner Activities (Grouped by Activity Lifecycle)
export const useSlaCleanerActivities = (params = {}, companyId) => {
  return useQuery({
    queryKey: ["sla-cleaner-activities", "list", params, companyId],
    queryFn: async () => {
      const response = await CleanerReviewApi.getSlaCleanerActivities(params, companyId);
      if (!response.success) throw new Error(response.error || "Failed to fetch SLA cleaner activities");
      return response;
    },
    enabled: !!companyId && companyId !== "null",
    staleTime: 30 * 1000,
    keepPreviousData: true,
  });
};

// 6. Get Single SLA Cleaner Activity by Activity/Review ID
export const useSlaCleanerActivityById = (activityId) => {
  return useQuery({
    queryKey: ["sla-cleaner-activity", "detail", activityId],
    queryFn: async () => {
      const response = await CleanerReviewApi.getSlaCleanerActivityById(activityId);
      if (!response.success) throw new Error(response.error || "Failed to fetch SLA activity detail");
      return response.data;
    },
    enabled: !!activityId,
    staleTime: 30 * 1000,
  });
};

// ==========================================
// MUTATIONS (Modifying Data)
// ==========================================

// 7. Update Review Score
export function useUpdateReviewScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, newScore, trigger_escalation = false }) => {
      const response = await CleanerReviewApi.updateReviewScore(reviewId, newScore, trigger_escalation);
      if (!response.success) throw new Error(response.error || "Failed to update score");
      return response.data;
    },

    // 1. onMutate fires immediately when mutate() is called, before the network trip
    onMutate: async ({ reviewId, newScore }) => {
      await queryClient.cancelQueries({ queryKey: ["cleaner-reviews"] });
      await queryClient.cancelQueries({ queryKey: ["sla-cleaner-activities"] });

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
      queryClient.invalidateQueries({ queryKey: ["sla-cleaner-activities"] });
      queryClient.invalidateQueries({ queryKey: ["sla-cleaner-activity"] });
    },
  });
}

export function useUpdateSupervisorScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, newScore, trigger_escalation = true }) => {
      const response = await CleanerReviewApi.updateSupervisorScore(reviewId, newScore);
      if (!response.success) throw new Error(response.error || "Failed to update score");
      return response.data;
    },
    onMutate: async ({ reviewId, newScore }) => {
      await queryClient.cancelQueries({ queryKey: ["cleaner-reviews"] });
      await queryClient.cancelQueries({ queryKey: ["sla-cleaner-activities"] });

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
      queryClient.invalidateQueries({ queryKey: ["sla-cleaner-activities"] });
      queryClient.invalidateQueries({ queryKey: ["sla-cleaner-activity"] });
    },
  });
}

export function useUpdateManagementScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, formData }) => {
      const response = await CleanerReviewApi.updateManagementScore(reviewId, formData);
      if (!response.success) throw new Error(response.error || "Failed to update score");
      return response.data;
    },
    onMutate: async ({ reviewId, formData }) => {
      await queryClient.cancelQueries({ queryKey: ["cleaner-reviews"] });
      await queryClient.cancelQueries({ queryKey: ["sla-cleaner-activities"] });

      const previousReviews = queryClient.getQueriesData({ queryKey: ["cleaner-reviews"] });
      const previousDetail = queryClient.getQueryData(["cleaner-reviews", "detail", reviewId]);

      const newScore = Number(formData.get("score"));

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
      queryClient.invalidateQueries({ queryKey: ["sla-cleaner-activities"] });
      queryClient.invalidateQueries({ queryKey: ["sla-cleaner-activity"] });
    },
  });
}
