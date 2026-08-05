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

    // Fetch latest onboarding status from API
    let onboardingStatusData = null;
    try {
      const obStatus = await AuthApi.getOnboardingStatus();
      if (obStatus.success && obStatus.data) {
        onboardingStatusData = obStatus.data;
      }
    } catch (e) {
      console.error("Failed to fetch onboarding status", e);
    }

    dispatch(loginSuccess(user));

    const roleId = parseInt(user?.role_id);

    // ✅ Extract company data correctly
    const companyData =
      onboardingStatusData?.company ||
      fullResponse?.company ||
      user?.companies ||
      user?.company ||
      {};

    // Check strict boolean true to ensure it ignores undefined
    let isOnboardingDone = companyData?.is_onboarding_completed === true;

    if (
      onboardingStatusData &&
      onboardingStatusData.is_onboarding_completed !== undefined
    ) {
      isOnboardingDone = onboardingStatusData.is_onboarding_completed === true;
    }

    const hasMetadata =
      companyData?.metadata?.organization_type ||
      companyData?.onboarding_metadata?.organization_type;
    const companyName = companyData?.name;

    // OLD COMPANY CHECK:
    // If it has a real name but metadata is null (and is_onboarding_completed is false/null),
    // it's an old company already operating. We bypass the stepper.
    const isOldCompany =
      companyName && companyName !== "Pending Setup" && !hasMetadata;

    if (isOldCompany) {
      isOnboardingDone = true;
    }

    if (roleId === 2 && !isOnboardingDone) {
      if (!hasMetadata || companyName === "Pending Setup" || !companyName) {
        toast("Please complete your company profile.");
        // router.push("/company-setup");
      } else {
        toast("Resuming workspace setup...");
        router.push("/stepper");
      }
      return;
    }

    toast.success(`Welcome back, ${user.name}!`);
    if (roleId === 1) {
      router.push("/dashboard");
    } else if (user?.company_id) {
      router.push(`/clientDashboard/${user.company_id}`);
    } else {
      toast.error("No company assigned. Contact support.");
      dispatch(loginFailure("No company"));
    }
  };

  return handleAuthSuccess;
};
