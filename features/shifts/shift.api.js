import axiosInstance from "@/shared/api/axios.instance.js";

// 🔹 Get All Shifts
export const getAllShifts = async ({ company_id, include_unavailable = false } = {}) => {
  const response = await axiosInstance.get("/shifts", {
    params: {
      company_id,
      include_unavailable,
    },
  });

  return {
    shifts: response.data.data,
    count: response.data.count,
  };
};

// 🔹 Get Shift By ID
export const getShiftById = async ({ id, company_id, include_unavailable = false }) => {
  const response = await axiosInstance.get(`/shifts/${id}`, {
    params: {
      company_id,
      include_unavailable,
    },
  });

  return response.data.data;
};

// 🔹 Create Shift
export const createShift = async (shiftData) => {
  const response = await axiosInstance.post("/shifts", shiftData);
  return response.data.data;
};

// 🔹 Update Shift
export const updateShift = async (id, shiftData) => {
  const response = await axiosInstance.put(`/shifts/${id}`, shiftData);
  return response.data.data;
};

// 🔹 Delete Shift
export const deleteShift = async (id) => {
  await axiosInstance.delete(`/shifts/${id}`);
  return true;
};

// 🔹 Toggle Shift Status
export const toggleShiftStatus = async (id) => {
  const response = await axiosInstance.patch(`/shifts/${id}/toggle-status`);
  return response.data.data;
};
