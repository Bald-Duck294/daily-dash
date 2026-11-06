// features/reviews/reviews.api.js
import axios from "@/shared/api/axios.instance.js"; // or wherever your axios instance lives

// GET /api/reviews
export const fetchUserReviews = async ({
  toilet_id,
  company_id,
  location_id,
  status,
  date,
  from_date,
  to_date,
  start_date,
  end_date,
  limit = 50,
  page = 1,
  offset,
  search,
  min_rating,
  max_rating,
  issues_only,
} = {}) => {
  const res = await axios.get("/qr-reviews/user-review", {
    params: {
      toilet_id,
      company_id,
      location_id,
      status,
      date,
      from_date,
      to_date,
      start_date,
      end_date,
      limit,
      page,
      offset,
      search,
      min_rating,
      max_rating,
      issues_only,
    },
  });

  return {
    reviews: res.data.data || [],
    count: res.data.pagination ? res.data.pagination.total : (res.data.data?.length || 0),
    pagination: res.data.pagination || {
      total: res.data.data?.length || 0,
      page: page || 1,
      limit: limit || 50,
      totalPages: 1,
    },
    stats: res.data.stats || {
      total: res.data.pagination?.total || res.data.data?.length || 0,
      today: 0,
      avgRating: 0,
      issuesCount: 0,
    },
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
