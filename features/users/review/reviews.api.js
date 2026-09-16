// features/reviews/reviews.api.js
import axios from "@/shared/api/axios.instance.js"; // or wherever your axios instance lives

// GET /api/reviews
export const fetchUserReviews = async ({
  toilet_id,
  company_id,
  status,
  date,
  limit = 50,
} = {}) => {
  const res = await axios.get("/qr-reviews/user-review", {
    params: {
      toilet_id,
      company_id,
      status,
      date,
      limit,
    },
  });

  return {
    reviews: res.data.data,
    count: res.data.pagination ? res.data.pagination.total : res.data.data.length,
  };
};

// GET /api/qr-reviews/user-review/:id
export const fetchUserReviewById = async (id) => {
  const res = await axios.get(`/qr-reviews/user-review/${id}`);
  return res.data.data;
};

// PUT /api/qr-reviews/user-review/:id
export const updateUserReview = async ({ id, ...reviewData }) => {
  const res = await axios.patch(`/qr-reviews/user-review/${id}`, reviewData);
  return res.data.data;
};

// DELETE /api/qr-reviews/user-review/:id
export const deleteUserReview = async (id) => {
  const res = await axios.delete(`/qr-reviews/user-review/${id}`);
  return res.data.data;
};
