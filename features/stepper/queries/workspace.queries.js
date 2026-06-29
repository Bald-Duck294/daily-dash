import { useMutation } from "@tanstack/react-query";
import { WorkspaceApi } from "../api/workspace.api";

export const useDeployWorkspace = () => {
  return useMutation({
    mutationFn: (payload) => WorkspaceApi.deployWorkspace(payload),
    onSuccess: (data) => {
      console.log("✅ [Mutation] Workspace Deployed Successfully:", data);
    },
    onError: (error) => {
      console.error(
        "❌ [Mutation] Workspace Deployment Failed:",
        error.response?.data || error.message,
      );
    },
  });
};
