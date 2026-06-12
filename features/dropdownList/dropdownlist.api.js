import axiosInstance from "@/shared/api/axios.instance";

export const DropdownlistApi = {
  /**
   * Fetches the optimized list of locations for dropdowns.
   * @param {Object} filters - Optional filters
   * @param {string|number} filters.company_id
   * @param {string|number} filters.type_id
   * @param {string|number} filters.facility_company_id
   * @returns {Promise<Object>} The API response { success: true, data: [...] }
   */
  getLocationsForDropdown: async (filters = {}) => {
    const { company_id, type_id, facility_company_id } = filters;

    // axiosInstance automatically serializes this object into ?company_id=1&type_id=2
    // It safely ignores keys that are undefined.
    const response = await axiosInstance.get("/dropdown-list/location", {
      params: {
        company_id,
        type_id,
        facility_company_id,
      },
    });

    // Axios automatically parses the JSON response, so we just return .data
    return response.data;
  },

  getUsersForDropdown: async (filters = {}) => {
    const { companyId, roleId, search } = filters;

    const response = await axiosInstance.get("/dropdown-list/user", {
      params: {
        companyId,
        roleId,
        search,
      },
    });

    return response.data;
  },
  getCompaniesDropdown: async () => {
    try {
      const response = await axiosInstance.get("/dropdown-list/companies");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching companies:", error);
      return [];
    }
  },

  getCleanersForDropdown: async (companyId) => {
    try {
      // NOTE: Update this URL to match wherever you routed the new backend function!
      const response = await axiosInstance.get("/dropdown-list/cleaners", {
        params: { companyId },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching cleaners for dropdown:", error);
      return { success: false, data: [] };
    }
  },

 getZonesForDropdown: async (filters = {}) => {
    const { company_id, type_id } = filters;

    // axiosInstance automatically serializes this object into query parameters (e.g., ?company_id=1&type_id=2)
    // It safely ignores keys that are undefined.
    const response = await axiosInstance.get("/dropdown-list/zone", {
      params: {
        company_id,
        type_id,
      },
    });

    // Axios automatically parses the JSON response, so we just return .data
    return response.data;
  },

  getRolesForDropdown: async () => {
    const response = await axiosInstance.get("/dropdown-list/role");
    return response.data;
  },
};

export default DropdownlistApi;
