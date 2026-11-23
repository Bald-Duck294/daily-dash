import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CleaningTasksApi from "./cleaningTasks.api";
import toast from "react-hot-toast";

export const CLEANING_TASKS_KEYS = {
  all: ["cleaningTasks"],
  lists: () => [...CLEANING_TASKS_KEYS.all, "list"],
  list: (params) => [...CLEANING_TASKS_KEYS.lists(), params],
  stats: (companyId) => [...CLEANING_TASKS_KEYS.all, "stats", String(companyId)],
  cleaners: (locationId) => [...CLEANING_TASKS_KEYS.all, "cleaners", String(locationId)],
};

/**
 * Query cleaning requests list
 */
export const useCleaningRequests = (params = {}, enabled = true) => {
  return useQuery({
    queryKey: CLEANING_TASKS_KEYS.list(params),
    queryFn: () => CleaningTasksApi.getCleaningRequests(params),
    enabled: Boolean(enabled),
    staleTime: 1000 * 30, // 30 seconds
  });
};

/**
 * Query cleaning requests stats
 */
export const useCleaningRequestStats = (companyId, enabled = true) => {
  return useQuery({
    queryKey: CLEANING_TASKS_KEYS.stats(companyId),
    queryFn: () => CleaningTasksApi.getCleaningRequestStats(companyId),
    enabled: Boolean(enabled),
    staleTime: 1000 * 30,
  });
};

/**
 * Query toilet-specific cleaners for task allocation
 */
export const useToiletCleaners = (locationId, enabled = true) => {
  return useQuery({
    queryKey: CLEANING_TASKS_KEYS.cleaners(locationId),
    queryFn: () => CleaningTasksApi.getToiletCleaners(locationId),
    enabled: Boolean(enabled && locationId),
    staleTime: 1000 * 60, // 1 minute
  });
};

/**
 * Mutation to assign a cleaner
 */
export const useAssignCleaner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ request_id, cleaner_id, notes }) =>
      CleaningTasksApi.assignCleaner({ request_id, cleaner_id, notes }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: CLEANING_TASKS_KEYS.all });
      if (res?.cleaner_notification?.tokenCount === 0) {
        toast(
          (res.message || "Task assigned") +
            " (Notice: Selected cleaner has no active device registered for push notifications)",
          { icon: "⚠️" }
        );
      } else {
        toast.success(res.message || "Cleaner assigned and notified successfully!");
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to assign cleaner");
    },
  });
};

/**
 * Mutation to update status (e.g. resolve)
 */
export const useUpdateRequestStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, notes, resolution_notes }) =>
      CleaningTasksApi.updateRequestStatus(id, { status, notes, resolution_notes }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: CLEANING_TASKS_KEYS.all });
      toast.success(res.message || "Request status updated successfully!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update status");
    },
  });
};
