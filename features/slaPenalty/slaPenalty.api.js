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
  }
};
