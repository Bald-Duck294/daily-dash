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
 
};



export default DropdownlistApi;