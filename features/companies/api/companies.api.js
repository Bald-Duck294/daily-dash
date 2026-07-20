// import axiosInstance from "@/shared/api/axios.instance";

// export const CompanyApi = {
//   // CREATE (mutation → no cancellation)
//   createCompany: async (companyData) => {
//     try {
//       const response = await axiosInstance.post("/companies", companyData);
//       return { success: true, data: response.data };
//     } catch (error) {
//       return {
//         success: false,
//         error: error.response?.data?.message || error.message,
//       };
//     }
//   },

//   // READ ALL (QUERY → MUST support cancellation)
//   getAllCompanies: async ({ page, limit, signal } = {}) => {
//     try {
//       const response = await axiosInstance.get(
//         `/companies?page=${page}&limit=${limit}`,
//         { signal },
//       );
//       return response.data;
//     } catch (error) {
//       if (error.name === "CanceledError") return;
//       throw error;
//     }
//   },

//   // READ ONE (QUERY → MUST support cancellation)
//   // getCompanyById: async ({ queryKey, signal }) => {
//   //   const [, id] = queryKey;

//   //   try {
//   //     const response = await axiosInstance.get(`/companies/${id}`, { signal });
//   //     return { success: true, data: response.data };
//   //   } catch (error) {
//   //     if (error.name === "CanceledError") return;

//   //     return {
//   //       success: false,
//   //       error: error.response?.data?.message || error.message,
//   //     };
//   //   }
//   // },

//   getCompanyById: async (id) => {
//     // console.log('get by id company ')
//     try {
//       const response = await axiosInstance.get(`/companies/${id}`);
//       // console.log(response?.data, "data")
//       return { success: true, data: response.data };
//     } catch (error) {
//       return {
//         success: false,
//         error: error.response?.data?.message || error.message,
//       };
//     }
//   },

//   // UPDATE (mutation → no cancellation)
//   updateCompany: async ({ id, companyData }) => {
//     try {
//       const response = await axiosInstance.post(
//         `/companies/${id}`,
//         companyData,
//       );
//       return { success: true, data: response.data };
//     } catch (error) {
//       return {
//         success: false,
//         error: error.response?.data?.message || error.message,
//       };
//     }
//   },

//   // DELETE (mutation → no cancellation)
//   deleteCompany: async (id) => {
//     try {
//       const response = await axiosInstance.delete(`/companies/${id}`);
//       return { success: true, data: response.data };
//     } catch (error) {
//       return {
//         success: false,
//         error: error.response?.data?.message || error.message,
//       };
//     }
//   },
// };

import axiosInstance from "@/shared/api/axios.instance";

export const CompanyApi = {
  // READ ALL (QUERY → supports pagination)

  getCompaniesCount: async ({ search = "" } = {}) => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      const response = await axiosInstance.get(`/companies/count?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  getAllCompanies: async ({ page = 1, limit = 4, search = "", sortField = "", sortOrder = "", signal } = {}) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) params.append("search", search);
      if (sortField) params.append("sortField", sortField);
      if (sortOrder) params.append("sortOrder", sortOrder);

      const response = await axiosInstance.get(
        `/companies?${params.toString()}`,
        { signal },
      );
      return response.data;
    } catch (error) {
      if (error.name === "CanceledError") return;
      throw error;
    }
  },

  // UPDATE (mutation)
  updateCompany: async ({ id, companyData }) => {
    try {
      const response = await axiosInstance.post(
        `/companies/${id}`,
        companyData,
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // DELETE (mutation)
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

  // Other methods unchanged...
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

  getCompanyById: async (id) => {
    try {
      const response = await axiosInstance.get(`/companies/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  setupCompany: async (payload) => {
    // payload: { organization_name, organization_type, operation_structure }
    const response = await axiosInstance.post("/companies/setup", payload);
    return response.data;
  },

  // RESET WORKSPACE (mutation)
  resetCompanyWorkspace: async (companyId) => {
    try {
      const response = await axiosInstance.post("/companies/reset", { companyId });
      return { success: true, data: response.data };
    } catch (error) {
      // Preserve the HTTP status for granular error handling
      const err = new Error(error.response?.data?.error || error.response?.data?.message || error.message);
      err.status = error.response?.status;
      throw err;
    }
  },
};
