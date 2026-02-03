// features/reviews/reviews.queries.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUserReviews,
  fetchUserReviewById,
  updateUserReview,
  deleteUserReview,
} from "@/features/users/review/reviews.api.js";

/* -----------------------------------
   GET: all reviews
----------------------------------- */

export const useUserReviews = (filters = {}) => {
  return useQuery({
    queryKey: ["userReviews", filters],
    queryFn: () => fetchUserReviews(filters),
    keepPreviousData: true,
  });
};

/* -----------------------------------
   GET: single review   
----------------------------------- */

export const useUserReviewById = (id) => {
  return useQuery({
    queryKey: ["userReview", id],
    queryFn: () => fetchUserReviewById(id),
    enabled: !!id,
  });
};

/* -----------------------------------
   UPDATE review
----------------------------------- */

export const useUpdateUserReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserReview,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["userReview", id] });
      queryClient.invalidateQueries({ queryKey: ["userReviews"] });
    },
  });
};

/* -----------------------------------
   DELETE review
----------------------------------- */

export const useDeleteUserReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUserReview,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["userReview", id] });
      queryClient.invalidateQueries({ queryKey: ["userReviews"] });
    },
  });
};
