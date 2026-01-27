import axiosInstance from "@/shared/api/axios.instance";

export const CompanyApi = {
  // CREATE (mutation → no cancellation)
  createCompany: async (companyData) => {
    try {
      const response = await axiosInstance.post("/companies", companyData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // READ ALL (QUERY → MUST support cancellation)
  getAllCompanies: async ({ signal } = {}) => {
    try {
      const response = await axiosInstance.get("/companies", { signal });
      return response.data;
    } catch (error) {
      if (error.name === "CanceledError") return;
      throw error;
    }
  },

  // READ ONE (QUERY → MUST support cancellation)
  getCompanyById: async ({ queryKey, signal }) => {
    const [, id] = queryKey;

    try {
      const response = await axiosInstance.get(`/companies/${id}`, { signal });
      return { success: true, data: response.data };
    } catch (error) {
      if (error.name === "CanceledError") return;

      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // UPDATE (mutation → no cancellation)
  updateCompany: async ({ id, companyData }) => {
    try {
      const response = await axiosInstance.put(`/companies/${id}`, companyData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // DELETE (mutation → no cancellation)
  deleteCompany: async (id) => {
    try {
      const response = await axiosInstance.delete(`/companies/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },
};
