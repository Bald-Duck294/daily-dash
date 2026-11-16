import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SlaPenaltyApi } from "./slaPenalty.api";

// ==========================================
// QUERIES
// ==========================================

/**
 * 1. Get all rule books for a company
 */
export const useRuleBooks = (companyId, params = {}) => {
  return useQuery({
    queryKey: ["slaRuleBooks", companyId, params],
    queryFn: async () => {
      const response = await SlaPenaltyApi.getRuleBooks(companyId, params);
      if (!response.success) throw new Error(response.error);
      return response;
    },
    enabled: !!companyId && companyId !== "null" && companyId !== undefined,
    staleTime: 30 * 1000,
    keepPreviousData: true
  });
};

/**
 * 2. Get active published rule book
 */
export const useActiveRuleBook = (companyId) => {
  return useQuery({
    queryKey: ["slaActiveRuleBook", companyId],
    queryFn: async () => {
      const response = await SlaPenaltyApi.getActiveRuleBook(companyId);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    enabled: !!companyId && companyId !== "null" && companyId !== undefined,
    staleTime: 60 * 1000
  });
};

/**
 * 3. Get single rule book by ID with its rules
 */
export const useRuleBookById = (id, companyId) => {
  return useQuery({
    queryKey: ["slaRuleBook", id, companyId],
    queryFn: async () => {
      const response = await SlaPenaltyApi.getRuleBookById(id, companyId);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    enabled: !!id && !!companyId,
    staleTime: 30 * 1000
  });
};

// ==========================================
// MUTATIONS
// ==========================================

/**
 * 4. Create Draft Rule Book
 */
export function useCreateRuleBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await SlaPenaltyApi.createRuleBook(data);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["slaRuleBooks", variables.company_id]);
    }
  });
}

/**
 * 5. Update Draft Rule Book
 */
export function useUpdateRuleBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, companyId, data }) => {
      const response = await SlaPenaltyApi.updateRuleBook(id, companyId, data);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["slaRuleBook", variables.id, variables.companyId]);
      queryClient.invalidateQueries(["slaRuleBooks", variables.companyId]);
    }
  });
}

/**
 * 6. Publish Rule Book
 */
export function usePublishRuleBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, companyId }) => {
      const response = await SlaPenaltyApi.publishRuleBook(id, companyId);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["slaRuleBook", variables.id, variables.companyId]);
      queryClient.invalidateQueries(["slaRuleBooks", variables.companyId]);
      queryClient.invalidateQueries(["slaActiveRuleBook", variables.companyId]);
    }
  });
}

/**
 * 7. Seed Default Rule Book
 */
export function useSeedDefaultRuleBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ companyId, autoPublish }) => {
      const response = await SlaPenaltyApi.seedDefaultRuleBook(companyId, autoPublish);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["slaRuleBooks", variables.companyId]);
      queryClient.invalidateQueries(["slaActiveRuleBook", variables.companyId]);
    }
  });
}

/**
 * 8. Add Rule to Book
 */
export function useAddRuleToBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ruleBookId, companyId, ruleData }) => {
      const response = await SlaPenaltyApi.addRuleToBook(ruleBookId, companyId, ruleData);
      if (!response.success) {
        const error = new Error(response.error);
        error.validationErrors = response.validationErrors;
        throw error;
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["slaRuleBook", variables.ruleBookId, variables.companyId]);
      queryClient.invalidateQueries(["slaRuleBooks", variables.companyId]);
    }
  });
}

/**
 * 9. Update Rule Clause
 */
export function useUpdateRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ruleId, companyId, ruleData, ruleBookId }) => {
      const response = await SlaPenaltyApi.updateRule(ruleId, companyId, ruleData);
      if (!response.success) {
        const error = new Error(response.error);
        error.validationErrors = response.validationErrors;
        throw error;
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      if (variables.ruleBookId) {
        queryClient.invalidateQueries(["slaRuleBook", variables.ruleBookId, variables.companyId]);
      }
      queryClient.invalidateQueries(["slaRuleBooks", variables.companyId]);
    }
  });
}

/**
 * 10. Delete Rule Clause
 */
export function useDeleteRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ruleId, companyId, ruleBookId }) => {
      const response = await SlaPenaltyApi.deleteRule(ruleId, companyId);
      if (!response.success) throw new Error(response.error);
      return response;
    },
    onSuccess: (_, variables) => {
      if (variables.ruleBookId) {
        queryClient.invalidateQueries(["slaRuleBook", variables.ruleBookId, variables.companyId]);
      }
      queryClient.invalidateQueries(["slaRuleBooks", variables.companyId]);
    }
  });
}

/**
 * 11. Rule Simulation / Preview
 */
export function usePreviewRule() {
  return useMutation({
    mutationFn: async ({ companyId, ruleDefinition, sampleReviewIds }) => {
      const response = await SlaPenaltyApi.previewRule(companyId, ruleDefinition, sampleReviewIds);
      if (!response.success) throw new Error(response.error);
      return response.data;
    }
  });
}

// ==========================================
// PHASE 2: PENALTY LEDGER QUERIES & MUTATIONS
// ==========================================

/**
 * 12. Get Penalties Ledger
 */
export const usePenalties = (companyId, params = {}) => {
  return useQuery({
    queryKey: ["slaPenalties", companyId, params],
    queryFn: async () => {
      const response = await SlaPenaltyApi.getPenalties(companyId, params);
      if (!response.success) throw new Error(response.error);
      return response;
    },
    enabled: !!companyId && companyId !== "null" && companyId !== undefined,
    staleTime: 15 * 1000,
    keepPreviousData: true
  });
};

/**
 * 13. Get Penalty Aggregate Summary KPIs
 */
export const usePenaltySummary = (companyId, params = {}) => {
  return useQuery({
    queryKey: ["slaPenaltySummary", companyId, params],
    queryFn: async () => {
      const response = await SlaPenaltyApi.getPenaltySummary(companyId, params);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    enabled: !!companyId && companyId !== "null" && companyId !== undefined,
    staleTime: 30 * 1000
  });
};

/**
 * 14. Get Single Penalty By ID with logs
 */
export const usePenaltyById = (penaltyId, companyId) => {
  return useQuery({
    queryKey: ["slaPenalty", penaltyId, companyId],
    queryFn: async () => {
      const response = await SlaPenaltyApi.getPenaltyById(penaltyId, companyId);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    enabled: !!penaltyId && !!companyId,
    staleTime: 15 * 1000
  });
};

/**
 * 15. Get SLA Violations List
 */
export const useViolations = (companyId, params = {}) => {
  return useQuery({
    queryKey: ["slaViolations", companyId, params],
    queryFn: async () => {
      const response = await SlaPenaltyApi.getViolations(companyId, params);
      if (!response.success) throw new Error(response.error);
      return response;
    },
    enabled: !!companyId && companyId !== "null" && companyId !== undefined,
    staleTime: 20 * 1000
  });
};

/**
 * 16. Approve Penalty
 */
export function useApprovePenalty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ penaltyId, companyId, data }) => {
      const response = await SlaPenaltyApi.approvePenalty(penaltyId, companyId, data);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["slaPenalties", variables.companyId]);
      queryClient.invalidateQueries(["slaPenaltySummary", variables.companyId]);
      queryClient.invalidateQueries(["slaPenalty", variables.penaltyId, variables.companyId]);
    }
  });
}

/**
 * 17. Reject Penalty
 */
export function useRejectPenalty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ penaltyId, companyId, data }) => {
      const response = await SlaPenaltyApi.rejectPenalty(penaltyId, companyId, data);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["slaPenalties", variables.companyId]);
      queryClient.invalidateQueries(["slaPenaltySummary", variables.companyId]);
      queryClient.invalidateQueries(["slaPenalty", variables.penaltyId, variables.companyId]);
    }
  });
}

/**
 * 18. Dispute Penalty
 */
export function useDisputePenalty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ penaltyId, companyId, data }) => {
      const response = await SlaPenaltyApi.disputePenalty(penaltyId, companyId, data);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["slaPenalties", variables.companyId]);
      queryClient.invalidateQueries(["slaPenaltySummary", variables.companyId]);
      queryClient.invalidateQueries(["slaPenalty", variables.penaltyId, variables.companyId]);
    }
  });
}

/**
 * 19. Reverse Penalty
 */
export function useReversePenalty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ penaltyId, companyId, data }) => {
      const response = await SlaPenaltyApi.reversePenalty(penaltyId, companyId, data);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["slaPenalties", variables.companyId]);
      queryClient.invalidateQueries(["slaPenaltySummary", variables.companyId]);
      queryClient.invalidateQueries(["slaPenalty", variables.penaltyId, variables.companyId]);
    }
  });
}

/**
 * 20. Manually trigger Review Evaluation
 */
export function useEvaluateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, companyId }) => {
      const response = await SlaPenaltyApi.evaluateReview(reviewId, companyId);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["slaPenalties", variables.companyId]);
      queryClient.invalidateQueries(["slaPenaltySummary", variables.companyId]);
      queryClient.invalidateQueries(["slaViolations", variables.companyId]);
    }
  });
}

// ==========================================
// SUPER ADMIN FEATURE TOGGLE (configurations)
// ==========================================

/**
 * 21. Query all companies status for Super Admin (role_id 1)
 */
export const useAllCompaniesSlaRulesStatus = (enabled = true) => {
  return useQuery({
    queryKey: ["slaRulesAllCompanies"],
    queryFn: async () => {
      const response = await SlaPenaltyApi.getAllCompaniesSlaRulesStatus();
      if (!response.success) throw new Error(response.error);
      return response;
    },
    enabled: Boolean(enabled),
    staleTime: 10 * 1000
  });
};

/**
 * 22. Query specific company sla_rules status
 */
export const useCompanySlaRulesStatus = (companyId, enabled = true) => {
  return useQuery({
    queryKey: ["slaRulesCompanyStatus", companyId],
    queryFn: async () => {
      if (!companyId) return { is_active: false };
      const response = await SlaPenaltyApi.getCompanySlaRulesStatus(companyId);
      return response.data || { is_active: false };
    },
    enabled: Boolean(enabled && companyId),
    staleTime: 30 * 1000
  });
};

/**
 * 23. Mutation to toggle company sla_rules status
 */
export function useToggleCompanySlaRules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ companyId, isActive }) => {
      const response = await SlaPenaltyApi.toggleCompanySlaRules(companyId, isActive);
      if (!response.success) throw new Error(response.error);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["slaRulesAllCompanies"]);
      queryClient.invalidateQueries(["slaRulesCompanyStatus", variables.companyId]);
    }
  });
}

/**
 * 24. Mutation to trigger SLA penalty cron evaluation cycle
 */
export function useTriggerPenaltyCron() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ companyId, options = {} }) => {
      const response = await SlaPenaltyApi.triggerPenaltyCron(companyId, options);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["slaPenalties", variables.companyId]);
      queryClient.invalidateQueries(["slaPenaltySummary", variables.companyId]);
      queryClient.invalidateQueries(["slaViolations", variables.companyId]);
    }
  });
}


