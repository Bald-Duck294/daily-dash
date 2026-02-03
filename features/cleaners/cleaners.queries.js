// src/lib/queries/cleanerReview.queries.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CleanerReviewApi } from "@/features/cleaners/cleaners.api.js";

/* -----------------------------------------
   GET: All cleaner reviews (filters + company)
----------------------------------------- */

export const useCleanerReviews = (params = {}, companyId) => {
  return useQuery({
    queryKey: ["cleanerReviews", companyId, params],
    queryFn: async () => {
      const res = await CleanerReviewApi.getAllCleanerReviews(params, companyId);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    enabled: companyId !== undefined,
    keepPreviousData: true,
  });
};

/* -----------------------------------------
   GET: Reviews by cleaner user ID
----------------------------------------- */

export const useCleanerReviewsByCleanerId = (cleanerUserId) => {
  return useQuery({
    queryKey: ["cleanerReviews", "byCleaner", cleanerUserId],
    queryFn: async () => {
      const res =
        await CleanerReviewApi.getCleanerReviewsByCleanerId(cleanerUserId);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    enabled: !!cleanerUserId,
  });
};

/* -----------------------------------------
   GET: Single review by review ID
----------------------------------------- */

export const useCleanerReviewById = (reviewId) => {
  return useQuery({
    queryKey: ["cleanerReview", reviewId],
    queryFn: async () => {
      const res = await CleanerReviewApi.getCleanerReviewById(reviewId);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    enabled: !!reviewId,
  });
};

/* -----------------------------------------
   GET: Reviews by location ID
----------------------------------------- */

export const useCleanerReviewsByLocation = (
  locationId,
  companyId,
  take
) => {
  return useQuery({
    queryKey: ["cleanerReviews", "byLocation", locationId, companyId, take],
    queryFn: async () => {
      const res =
        await CleanerReviewApi.getCleanerReviewsByLocationId(
          locationId,
          companyId,
          take
        );
      if (!res.success) throw new Error(res.error);
      return res;
    },
    enabled: !!locationId && !!companyId,
  });
};

/* -----------------------------------------
   MUTATION: Update review score
----------------------------------------- */

export const useUpdateCleanerReviewScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, score }) => {
      const res = await CleanerReviewApi.updateReviewScore(reviewId, score);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: (_, { reviewId }) => {
      // invalidate everything related
      queryClient.invalidateQueries({ queryKey: ["cleanerReview", reviewId] });
      queryClient.invalidateQueries({ queryKey: ["cleanerReviews"] });
    },
  });
};
