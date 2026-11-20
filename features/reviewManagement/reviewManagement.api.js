import axiosInstance from "@/shared/api/axios.instance";

export const ReviewManagementApi = {
  /**
   * Fetch cleaner reviews for management
   */
  getCleanerReviews: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (
        params[key] !== null &&
        params[key] !== undefined &&
        params[key] !== ""
      ) {
        queryParams.append(key, params[key]);
      }
    });

    const response = await axiosInstance.get(
      `/review-management/cleaner-reviews?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Permanently delete cleaner reviews (single or multiple)
   */
  deleteCleanerReviews: async (reviewIds = []) => {
    const response = await axiosInstance.delete(
      `/review-management/cleaner-reviews`,
      {
        data: { review_ids: reviewIds },
      }
    );
    return response.data;
  },

  /**
   * Fetch user reviews for management
   */
  getUserReviews: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (
        params[key] !== null &&
        params[key] !== undefined &&
        params[key] !== ""
      ) {
        queryParams.append(key, params[key]);
      }
    });

    const response = await axiosInstance.get(
      `/review-management/user-reviews?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Permanently delete user reviews (single or multiple)
   */
  deleteUserReviews: async (reviewIds = []) => {
    const response = await axiosInstance.delete(
      `/review-management/user-reviews`,
      {
        data: { review_ids: reviewIds },
      }
    );
    return response.data;
  },
};

export default ReviewManagementApi;
