import axiosInstance from "@/shared/api/axios.instance";

export const SlaApi = {
  // GET all companies SLA status
  getSlaStatuses: async ({ signal } = {}) => {
    try {
      const response = await axiosInstance.get("/sla-config", { signal });
      return response.data;
    } catch (error) {
      if (error.name === "CanceledError") return;
      throw error;
    }
  },

  // GET specific company SLA config
  getCompanySlaConfig: async (companyId, { signal } = {}) => {
    try {
      const response = await axiosInstance.get(`/sla-config/${companyId}`, { signal });
      return response.data;
    } catch (error) {
      if (error.name === "CanceledError") return;
      throw error;
    }
  },

  // ENABLE SLA
  enableSla: async (companyId) => {
    try {
      const response = await axiosInstance.post("/sla-config/enable", { company_id: companyId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DISABLE SLA
  disableSla: async (companyId) => {
    try {
      const response = await axiosInstance.post("/sla-config/disable", { company_id: companyId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // UPDATE SLA CONFIG
  updateSlaConfig: async (companyId, configData) => {
    try {
      const response = await axiosInstance.put(`/sla-config/${companyId}`, configData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
