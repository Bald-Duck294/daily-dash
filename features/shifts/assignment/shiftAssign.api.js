import axiosInstance from "@/shared/api/axios.instance.js";

const shiftAssignApi = {
  // 🔹 Get ALL shift assignments (company level)
  getAll: async (companyId) => {
    const response = await axiosInstance.get(`/shifts-assign`, {
      params: { company_id: companyId },
    });
    return response.data;
  },

  // 🔹 Get assignments by specific shift
  getByShift: async (shiftId, companyId) => {
    const response = await axiosInstance.get(
      `/shifts-assign/by-shift/${shiftId}`,
      {
        params: { company_id: companyId },
      },
    );
    return response.data;
  },

  // 🔹 Get assignable users (cleaner + supervisor)
  getAssignableUsers: async (companyId) => {
    const response = await axiosInstance.get(
      `/shifts-assign/assignable-users`,
      {
        params: { company_id: companyId },
      },
    );
    return response.data;
  },

  // 🔹 Create shift assignments
  create: async (payload) => {
    const response = await axiosInstance.post(`/shifts-assign`, payload);
    return response.data;
  },

  // 🔹 Update shift assignment
  update: async (id, payload) => {
    const response = await axiosInstance.put(`/shifts-assign/${id}`, payload);
    return response.data;
  },

  // 🔹 update assignment status
  toggleStatus: async (id) => {
    const response = await axiosInstance.patch(
      `/shifts-assign/${id}/toggle-status`,
    );
    return response.data;
  },

  // 🔹 Delete shift assignment
  delete: async (id) => {
    const response = await axiosInstance.delete(`/shifts-assign/${id}`);
    return response.data;
  },
};

export default shiftAssignApi;
