import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { loginSuccess, loginFailure } from "@/features/auth/auth.slice.js";
import { AuthApi } from "@/features/auth/auth.api.js";

export const useAuthSuccess = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleAuthSuccess = async (user, fullResponse) => {
    const token = user?.token;

    if (!user?.role || !Array.isArray(user?.role?.permissions)) {
      toast.error("Invalid Login, Please Contact Support!");
      dispatch(loginFailure("Missing role/permissions"));
      return;
    }

    if (token) localStorage.setItem("token", token);
    dispatch(loginSuccess(user));

    const roleId = parseInt(user?.role_id);

    // 1. Super Admin (Role 1)
    if (roleId === 1) {
      toast.success(`Welcome back, ${user.name || "Admin"}!`);
      router.push("/dashboard");
      return;
    }

    // 2. Client Admin (Role 2) - Smart Onboarding Flow
    if (roleId === 2) {
      let nextStep =
        fullResponse?.nextStep ||
        fullResponse?.data?.nextStep;

      let onboardingData = null;
      try {
        const obStatus = await AuthApi.getOnboardingStatus();
        if (obStatus.success && obStatus.data) {
          onboardingData = obStatus.data;
          if (onboardingData.nextStep) {
            nextStep = onboardingData.nextStep;
          }
        }
      } catch (e) {
        console.error("Failed to fetch onboarding status", e);
      }

      // Fallback calculation if nextStep wasn't returned
      if (!nextStep) {
        const companyData =
          onboardingData?.company ||
          fullResponse?.company ||
          fullResponse?.data?.company ||
          user?.companies ||
          user?.company ||
          {};

        const isOnboardingDone =
          companyData?.is_onboarding_completed === true ||
          onboardingData?.isOnboardingCompleted === true ||
          onboardingData?.workspaceExists === true;

        const hasMetadata = Boolean(
          companyData?.metadata?.organization_type ||
          companyData?.onboarding_metadata?.organization_type
        );
        const companyName = companyData?.name;

        if (isOnboardingDone) {
          nextStep = "dashboard";
        } else if (!hasMetadata || companyName === "Pending Setup" || !companyName) {
          nextStep = "company";
        } else {
          nextStep = "workspace";
        }
      }

      // 🚀 REDIRECT BASED ON SMART ONBOARDING STATUS
      if (nextStep === "company") {
        toast("Please complete your company profile.");
        router.push("/company-setup");
        return;
      }

      if (nextStep === "workspace") {
        toast("Resuming workspace setup...");
        router.push("/stepper");
        return;
      }

      // Complete -> Dashboard
      toast.success(`Welcome back, ${user.name}!`);
      if (user?.company_id) {
        router.push(`/clientDashboard/${user.company_id}`);
      } else {
        toast.error("No company assigned. Contact support.");
        dispatch(loginFailure("No company"));
      }
      return;
    }

    // 3. Any other role (e.g. Supervisor)
    toast.success(`Welcome back, ${user.name}!`);
    if (user?.company_id) {
      router.push(`/clientDashboard/${user.company_id}`);
    } else {
      router.push("/dashboard");
    }
  };

  return handleAuthSuccess;
};

