import axiosInstance from "@/shared/api/axios.instance";

export const SlaPenaltyApi = {
  /**
   * Fetch all rule books for a company
   */
  getRuleBooks: async (companyId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (companyId) queryParams.append("company_id", companyId);
      if (params.status) queryParams.append("status", params.status);
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);

      const response = await axiosInstance.get(`/sla-penalty/rule-books?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data?.data || [],
        pagination: response.data?.pagination || {}
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to fetch SLA rule books"
      };
    }
  },

  /**
   * Fetch active published rule book for a company
   */
  getActiveRuleBook: async (companyId) => {
    try {
      const response = await axiosInstance.get(`/sla-penalty/rule-books/active?company_id=${companyId}`);
      return {
        success: true,
        data: response.data?.data || null
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to fetch active rule book"
      };
    }
  },

  /**
   * Fetch single rule book by ID with its rules
   */
  getRuleBookById: async (id, companyId) => {
    try {
      const response = await axiosInstance.get(`/sla-penalty/rule-books/${id}?company_id=${companyId}`);
      return {
        success: true,
        data: response.data?.data || null
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to fetch rule book"
      };
    }
  },

  /**
   * Create a draft rule book
   */
  createRuleBook: async (data) => {
    try {
      const response = await axiosInstance.post("/sla-penalty/rule-books", data);
      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to create rule book"
      };
    }
  },

  /**
   * Update draft rule book
   */
  updateRuleBook: async (id, companyId, data) => {
    try {
      const response = await axiosInstance.put(`/sla-penalty/rule-books/${id}?company_id=${companyId}`, data);
      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to update rule book"
      };
    }
  },

  /**
   * Publish a rule book version
   */
  publishRuleBook: async (id, companyId) => {
    try {
      const response = await axiosInstance.post(`/sla-penalty/rule-books/${id}/publish`, { company_id: companyId });
      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to publish rule book"
      };
    }
  },

  /**
   * Seed default baseline rule book for a company
   */
  seedDefaultRuleBook: async (companyId, autoPublish = false) => {
    try {
      const response = await axiosInstance.post("/sla-penalty/rule-books/seed", {
        company_id: companyId,
        auto_publish: autoPublish
      });
      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to seed default rule book"
      };
    }
  },

  /**
   * Add a rule clause to a draft rule book
   */
  addRuleToBook: async (ruleBookId, companyId, ruleData) => {
    try {
      const response = await axiosInstance.post(`/sla-penalty/rule-books/${ruleBookId}/rules`, {
        company_id: companyId,
        ...ruleData
      });
      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to add rule clause",
        validationErrors: error.response?.data?.validationErrors || null
      };
    }
  },

  /**
   * Update an existing rule clause
   */
  updateRule: async (ruleId, companyId, ruleData) => {
    try {
      const response = await axiosInstance.put(`/sla-penalty/rules/${ruleId}`, {
        company_id: companyId,
        ...ruleData
      });
      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to update rule clause",
        validationErrors: error.response?.data?.validationErrors || null
      };
    }
  },

  /**
   * Delete a rule clause from a draft rule book
   */
  deleteRule: async (ruleId, companyId) => {
    try {
      const response = await axiosInstance.delete(`/sla-penalty/rules/${ruleId}?company_id=${companyId}`);
      return {
        success: true,
        message: response.data?.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to delete rule"
      };
    }
  },

  /**
   * Preview / simulate candidate rule against historical reviews
   */
  previewRule: async (companyId, ruleDefinition, sampleReviewIds = []) => {
    try {
      const response = await axiosInstance.post("/sla-penalty/rules/preview", {
        company_id: companyId,
        rule_definition: ruleDefinition,
        sample_review_ids: sampleReviewIds
      });
      return {
        success: true,
        data: response.data?.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Simulation failed"
      };
    }
  },

  // ==========================================
  // PHASE 2: PENALTY LEDGER & APPROVAL QUEUE
  // ==========================================

  /**
   * Fetch penalties ledger with filters
   */
  getPenalties: async (companyId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (companyId) queryParams.append("company_id", companyId);
      if (params.status) queryParams.append("status", params.status);
      if (params.cleaner_id) queryParams.append("cleaner_id", params.cleaner_id);
      if (params.location_id) queryParams.append("location_id", params.location_id);
      if (params.scope) queryParams.append("scope", params.scope);
      if (params.start_date) queryParams.append("start_date", params.start_date);
      if (params.end_date) queryParams.append("end_date", params.end_date);
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);

      const response = await axiosInstance.get(`/sla-penalty/penalties?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data?.data || [],
        pagination: response.data?.pagination || {}
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to fetch penalties"
      };
    }
  },

  /**
   * Fetch aggregate KPI metrics summary
   */
  getPenaltySummary: async (companyId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (companyId) queryParams.append("company_id", companyId);
      if (params.cleaner_id) queryParams.append("cleaner_id", params.cleaner_id);
      if (params.start_date) queryParams.append("start_date", params.start_date);
      if (params.end_date) queryParams.append("end_date", params.end_date);

      const response = await axiosInstance.get(`/sla-penalty/penalties/summary?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data?.data || null
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to fetch summary"
      };
    }
  },

  /**
   * Fetch penalty by ID with full audit log and violations
   */
  getPenaltyById: async (penaltyId, companyId) => {
    try {
      const response = await axiosInstance.get(`/sla-penalty/penalties/${penaltyId}?company_id=${companyId}`);
      return {
        success: true,
        data: response.data?.data || null
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to fetch penalty details"
      };
    }
  },

  /**
   * Approve a penalty
   */
  approvePenalty: async (penaltyId, companyId, data = {}) => {
    try {
      const response = await axiosInstance.post(`/sla-penalty/penalties/${penaltyId}/approve`, {
        company_id: companyId,
        ...data
      });
      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to approve penalty"
      };
    }
  },

  /**
   * Reject / waive a penalty
   */
  rejectPenalty: async (penaltyId, companyId, data = {}) => {
    try {
      const response = await axiosInstance.post(`/sla-penalty/penalties/${penaltyId}/reject`, {
        company_id: companyId,
        ...data
      });
      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to reject penalty"
      };
    }
  },

  /**
   * Dispute a penalty
   */
  disputePenalty: async (penaltyId, companyId, data = {}) => {
    try {
      const response = await axiosInstance.post(`/sla-penalty/penalties/${penaltyId}/dispute`, {
        company_id: companyId,
        ...data
      });
      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to dispute penalty"
      };
    }
  },

  /**
   * Reverse an approved penalty
   */
  reversePenalty: async (penaltyId, companyId, data = {}) => {
    try {
      const response = await axiosInstance.post(`/sla-penalty/penalties/${penaltyId}/reverse`, {
        company_id: companyId,
        ...data
      });
      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to reverse penalty"
      };
    }
  },

  /**
   * Fetch violations list
   */
  getViolations: async (companyId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (companyId) queryParams.append("company_id", companyId);
      if (params.cleaner_id) queryParams.append("cleaner_id", params.cleaner_id);
      if (params.location_id) queryParams.append("location_id", params.location_id);
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);

      const response = await axiosInstance.get(`/sla-penalty/violations?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data?.data || [],
        pagination: response.data?.pagination || {}
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to fetch violations"
      };
    }
  },

  /**
   * Evaluate review manually (testing / recalculation)
   */
  evaluateReview: async (reviewId, companyId) => {
    try {
      const response = await axiosInstance.post(`/sla-penalty/evaluate/${reviewId}`, { company_id: companyId });
      return {
        success: true,
        data: response.data?.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Evaluation failed"
      };
    }
  },

  // ==========================================
  // SUPER ADMIN FEATURE TOGGLE (configurations)
  // ==========================================

  /**
   * Super Admin only: Get all companies with their sla_rules configuration status
   */
  getAllCompaniesSlaRulesStatus: async () => {
    try {
      const response = await axiosInstance.get("/sla-penalty/company-status");
      return {
        success: true,
        data: response.data?.data || [],
        total: response.data?.total || 0,
        active_count: response.data?.active_count || 0,
        inactive_count: response.data?.inactive_count || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to fetch companies status"
      };
    }
  },

  /**
   * Get specific company sla_rules configuration status
   */
  getCompanySlaRulesStatus: async (companyId) => {
    try {
      if (!companyId) return { success: false, data: { is_active: false } };
      const response = await axiosInstance.get(`/sla-penalty/company-status/${companyId}`);
      return {
        success: true,
        data: response.data?.data || { is_active: false }
      };
    } catch (error) {
      return {
        success: false,
        data: { is_active: false },
        error: error.response?.data?.message || error.message || "Failed to fetch company status"
      };
    }
  },

  /**
   * Super Admin only: Toggle sla_rules status for a company in configurations table
   */
  toggleCompanySlaRules: async (companyId, isActive) => {
    try {
      const response = await axiosInstance.post("/sla-penalty/toggle-status", {
        company_id: companyId,
        is_active: isActive
      });
      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to toggle SLA rules status"
      };
    }
  },

  /**
   * Manually trigger the SLA Penalty Cron evaluation cycle for testing / sync
   */
  triggerPenaltyCron: async (companyId, options = {}) => {
    try {
      const response = await axiosInstance.post("/sla-penalty/cron/trigger", {
        company_id: companyId,
        ...options
      });
      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to trigger penalty cron"
      };
    }
  }
};

