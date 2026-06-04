import axiosInstance from "@/shared/api/axios.instance";

export const PhotoApi = {
  /**
   * Fetch cleaner review photos based on filters
   * @param {Object} filters - Filter state from the frontend
   */
getCleanerReviewPhotos: async (filters) => {
    try {
      // Map frontend state keys to the keys your backend controller expects
      const payload = {
        company_id: filters.company,       
        location_id: filters.location,     
        image_type: filters.imageType,
        start_date: filters.startDate,
        end_date: filters.endDate,
        search: filters.search,
        page: filters.page || 1,      
        limit: filters.limit || 20    
      };

      // ✅ Changed to .get and wrapped the payload inside the { params } configuration object
      const response = await axiosInstance.get("/photo", {
        params: payload 
      });

      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination, 
      };
    } catch (error) {
      console.error("Error fetching cleaner review photos:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: [],
        pagination: {
          current_page: 1,
          total_pages: 0,
          total_records: 0
        },
      };
    }
  },
  /**
   * Delete a specific photo (Placeholder for future use)
   * @param {string|number} id - Photo ID or Record ID
   */
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/photo/${id}`);

      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error deleting photo:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },
};

export default PhotoApi;