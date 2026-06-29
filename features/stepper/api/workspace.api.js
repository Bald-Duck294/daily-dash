import axiosInstance from "@/shared/api/axios.instance";

export const WorkspaceApi = {
  deployWorkspace: async (payload) => {
    console.log("🚀 [API] Initiating Workspace Deployment. Payload:", payload);
    const response = await axiosInstance.post("/workspace/deploy", payload);
    return response.data;
  },
};
