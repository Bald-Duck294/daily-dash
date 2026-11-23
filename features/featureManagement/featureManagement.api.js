import axiosInstance from "@/shared/api/axios.instance";

export const FeatureManagementApi = {
  /**
   * Super Admin only: Get all companies and their feature states
   */
  getAllCompaniesFeatures: async () => {
    try {
      const response = await axiosInstance.get("/feature-management/companies");
      return {
        success: true,
        data: response.data?.data || [],
        total: response.data?.total || 0,
      };
    } catch (error) {
      console.error("Error fetching companies features:", error);
      throw error;
    }
  },

  /**
   * Get feature flags for a specific company
   */
  getCompanyFeatures: async (companyId) => {
    try {
      if (!companyId) {
        return {
          success: false,
          features: { cleaner_assignment: true, cleaning_request: false, sla_rules: false },
        };
      }
      const response = await axiosInstance.get(`/feature-management/company/${companyId}`);
      return {
        success: true,
        company_id: response.data?.company_id,
        features: response.data?.features || {
          cleaner_assignment: true,
          cleaning_request: false,
          sla_rules: false,
          service_req_threshold: false,
          service_req_threshold_value: 3,
        },
      };
    } catch (error) {
      console.error("Error fetching company features:", error);
      return {
        success: false,
        features: {
          cleaner_assignment: true,
          cleaning_request: false,
          sla_rules: false,
          service_req_threshold: false,
          service_req_threshold_value: 3,
        },
      };
    }
  },

  /**
   * Super Admin only: Toggle a feature for a company (with optional threshold)
   */
  toggleCompanyFeature: async (companyId, featureKey, isActive, threshold) => {
    try {
      const payload = {
        company_id: companyId,
        feature_key: featureKey,
        is_active: isActive,
      };
      if (threshold !== undefined) {
        payload.threshold = threshold;
      }
      const response = await axiosInstance.post("/feature-management/toggle", payload);
      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message,
      };
    } catch (error) {
      console.error("Error toggling company feature:", error);
      throw error;
    }
  },
};

export default FeatureManagementApi;
