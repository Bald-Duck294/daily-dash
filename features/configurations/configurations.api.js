import axiosInstance from "@/shared/api/axios.instance";

export const ConfigurationsApi = {
  // 1. Fetch available dynamic modules
  getDynamicModules: async () => {
    try {
      const response = await axiosInstance.get(`/configurations/modules`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("Error fetching modules:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // 2. Fetch specific configuration by name (Tenant aware)
  getConfigByName: async (name, companyId) => {
    try {
      const params = new URLSearchParams();
      if (companyId) params.append("company_id", companyId);

      const response = await axiosInstance.get(
        `/configurations/name/${name}?${params.toString()}`,
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      // 404 means it hasn't been created yet, which is fine for the editor
      if (error.response?.status === 404) {
        return { success: true, data: null, isNew: true };
      }
      console.error(`Error fetching config ${name}:`, error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // 3. Update/Create configuration
  updateConfigByName: async (name, payload, companyId) => {
    try {
      const requestData = {
        ...payload,
        company_id: companyId,
      };

      const response = await axiosInstance.put(
        `/configurations/name/${name}`,
        requestData,
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error(`Error updating config ${name}:`, error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // 4. Get compiled location schema (For Add/Edit Washroom forms)
  getLocationSchema: async (companyId) => {
    try {
      const params = new URLSearchParams();
      if (companyId) params.append("company_id", companyId);

      const response = await axiosInstance.get(
        `/configurations/location-schema?${params.toString()}`,
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("Error fetching location schema:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  getTemplatesByName: async (name) => {
    console.log(name, "getTemplates by name");
    try {
      const response = await axiosInstance.get(`/configurations?name=${name}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },
  getConfigById: async (id) => {
    try {
      const response = await axiosInstance.get(`/configurations/id/${id}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },
  deleteConfigById: async (id) => {
    try {
      const response = await axiosInstance.delete(`/configurations/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },
};
