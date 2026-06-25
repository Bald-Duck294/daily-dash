import axiosInstance from "../../shared/api/axios.instance";

export const systemLimitsApi = {
  // Fetch limits (optional companyId)
  getLimits: async (companyId = null) => {
    const params = {};
    if (companyId && companyId !== "global") {
      params.company_id = companyId;
    }
    const response = await axiosInstance.get("/limits", { params });
    return response.data;
  },

  // Set or update a limit
  setLimit: async (data) => {
    // data format: { limit_key, limit_value, is_enabled, company_id }
    const response = await axiosInstance.post("/limits/set", data);
    return response.data;
  },
};
