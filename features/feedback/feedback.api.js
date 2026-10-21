import axiosInstance from "@/shared/api/axios.instance";

export const feedbackApi = {
  /**
   * Submit a new user washroom review
   * @param {FormData|Object} payload - Review data (rating, description, reason_ids, location_id, companyId, images)
   */
  submitReview: async (payload) => {
    let body = payload;
    let headers = {};

    if (!(payload instanceof FormData)) {
      const formData = new FormData();
      if (payload.rating !== undefined) formData.append("rating", payload.rating.toString());
      if (payload.description) formData.append("description", payload.description);
      if (payload.reasonids || payload.reason_ids) {
        formData.append("reason_ids", JSON.stringify(payload.reasonids || payload.reason_ids));
      }
      if (payload.location_id || payload.locationId) {
        formData.append("location_id", (payload.location_id || payload.locationId).toString());
      }
      if (payload.companyId || payload.company_id) {
        formData.append("companyId", (payload.companyId || payload.company_id).toString());
      }
      if (payload.name) formData.append("name", payload.name);
      if (payload.email) formData.append("email", payload.email);
      if (payload.phone) formData.append("phone", payload.phone);

      if (Array.isArray(payload.images) && payload.images.length > 0) {
        payload.images.forEach((img) => formData.append("images", img));
      }
      body = formData;
      headers = { "Content-Type": "multipart/form-data" };
    } else {
      headers = { "Content-Type": "multipart/form-data" };
    }

    const response = await axiosInstance.post("/qr-reviews/user-review", body, { headers });
    return response.data;
  },

  /**
   * Update contact details (name, email, phone) for a submitted review
   * @param {string|number} reviewId 
   * @param {{ name?: string, email?: string, phone?: string }} contactData 
   */
  updateReviewContact: async (reviewId, contactData) => {
    const response = await axiosInstance.patch(`/qr-reviews/user-review/${reviewId}`, {
      name: contactData.name?.trim(),
      email: contactData.email?.trim(),
      phone: contactData.phone?.trim(),
    });
    return response.data;
  },

  /**
   * Fetch all user reviews with optional filters
   * @param {Object} params - { company_id, location_id, rating, limit, page }
   */
  getAllUserReviews: async (params = {}) => {
    const response = await axiosInstance.get("/qr-reviews/user-review", { params });
    return response.data;
  },

  /**
   * Fetch review by ID
   * @param {string|number} reviewId 
   */
  getUserReviewById: async (reviewId) => {
    const response = await axiosInstance.get(`/qr-reviews/user-review/${reviewId}`);
    return response.data;
  },

  /**
   * Get toilet review statistics
   * @param {string|number} locationId 
   */
  getToiletReviewStats: async (locationId) => {
    const response = await axiosInstance.get(`/qr-reviews/user-review/stats/toilet/${locationId}`);
    return response.data;
  },

  /**
   * Get recent user reviews
   */
  getRecentUserReviews: async () => {
    const response = await axiosInstance.get("/qr-reviews/user-review/recent");
    return response.data;
  },
};
