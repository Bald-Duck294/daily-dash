import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { feedbackApi } from "./feedback.api";
import toast from "react-hot-toast";

export const feedbackKeys = {
  all: ["userReviews"],
  lists: () => [...feedbackKeys.all, "list"],
  list: (params) => [...feedbackKeys.lists(), params],
  details: () => [...feedbackKeys.all, "detail"],
  detail: (id) => [...feedbackKeys.details(), id],
  stats: (locationId) => [...feedbackKeys.all, "stats", locationId],
};

// Hook to submit user washroom review
export const useSubmitFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => feedbackApi.submitReview(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.all });
      toast.success(data?.message || "Review submitted successfully!");
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to submit review";
      toast.error(message);
    },
  });
};

// Hook to update contact details on a submitted review
export const useUpdateFeedbackContact = () => {
  return useMutation({
    mutationFn: ({ reviewId, contactDetails }) =>
      feedbackApi.updateReviewContact(reviewId, contactDetails),
    onSuccess: (data) => {
      toast.success(data?.message || "Contact details updated successfully!");
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update contact details";
      toast.error(message);
    },
  });
};

// Hook to get toilet review stats
export const useGetToiletFeedbackStats = (locationId) => {
  return useQuery({
    queryKey: feedbackKeys.stats(locationId),
    queryFn: () => feedbackApi.getToiletReviewStats(locationId),
    enabled: Boolean(locationId),
    select: (res) => res?.data,
  });
};
