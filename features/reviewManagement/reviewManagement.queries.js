import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReviewManagementApi from "./reviewManagement.api";
import toast from "react-hot-toast";

export const reviewManagementKeys = {
  all: ["review-management"],
  cleanerReviews: (filters) => ["review-management", "cleaner-reviews", filters],
  userReviews: (filters) => ["review-management", "user-reviews", filters],
};

/**
 * Hook to fetch cleaner reviews with filters
 */
export const useGetCleanerReviewsForManagement = (filters = {}, enabled = true) => {
  return useQuery({
    queryKey: reviewManagementKeys.cleanerReviews(filters),
    queryFn: () => ReviewManagementApi.getCleanerReviews(filters),
    enabled,
    staleTime: 30 * 1000,
  });
};

/**
 * Hook to permanently delete cleaner reviews
 */
export const useDeleteCleanerReviews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewIds) => ReviewManagementApi.deleteCleanerReviews(reviewIds),
    onSuccess: (data) => {
      toast.success(data?.message || "Cleaner review(s) permanently deleted");
      queryClient.invalidateQueries({
        queryKey: ["review-management", "cleaner-reviews"],
      });
    },
    onError: (error) => {
      console.error("Error deleting cleaner reviews:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete cleaner review(s)"
      );
    },
  });
};

/**
 * Hook to fetch user reviews with filters
 */
export const useGetUserReviewsForManagement = (filters = {}, enabled = true) => {
  return useQuery({
    queryKey: reviewManagementKeys.userReviews(filters),
    queryFn: () => ReviewManagementApi.getUserReviews(filters),
    enabled,
    staleTime: 30 * 1000,
  });
};

/**
 * Hook to permanently delete user reviews
 */
export const useDeleteUserReviews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewIds) => ReviewManagementApi.deleteUserReviews(reviewIds),
    onSuccess: (data) => {
      toast.success(data?.message || "User review(s) permanently deleted");
      queryClient.invalidateQueries({
        queryKey: ["review-management", "user-reviews"],
      });
    },
    onError: (error) => {
      console.error("Error deleting user reviews:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete user review(s)"
      );
    },
  });
};
