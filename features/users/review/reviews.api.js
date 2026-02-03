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
  const res = await axios.get("/reviews", {
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
    count: res.data.count,
  };
};

// GET /api/reviews/:id
export const fetchUserReviewById = async (id) => {
  const res = await axios.get(`/reviews/${id}`);
  return res.data.data;
};

// PUT /api/reviews/:id
export const updateUserReview = async ({ id, ...reviewData }) => {
  const res = await axios.put(`/reviews/${id}`, reviewData);
  return res.data.data;
};

// DELETE /api/reviews/:id
export const deleteUserReview = async (id) => {
  const res = await axios.delete(`/reviews/${id}`);
  return res.data.data;
};
