import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { loginSuccess, loginFailure } from "@/features/auth/auth.slice.js";

export const useAuthSuccess = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleAuthSuccess = (user, fullResponse) => {
    const token = user?.token;

    if (!user?.role || !Array.isArray(user?.role?.permissions)) {
      toast.error("Invalid Login, Please Contact Support!");
      dispatch(loginFailure("Missing role/permissions"));
      return;
    }

    if (token) localStorage.setItem("token", token);
    dispatch(loginSuccess(user));

    const roleId = parseInt(user?.role_id);
    // ✅ Extract company data correctly
    const companyData = fullResponse?.company || user?.companies || user?.company || {};

    // Check strict boolean true to ensure it ignores undefined
    const isOnboardingDone = companyData?.is_onboarding_completed === true;
    const hasMetadata = companyData?.metadata?.organization_type || companyData?.onboarding_metadata?.organization_type;
    const companyName = companyData?.name;

    // 🚀 NEW GOOGLE ADMINS HIT THIS EXACT LOGIC:
    if (roleId === 2 && !isOnboardingDone) {
      if (!hasMetadata || companyName === "Pending Setup" || !companyName) {
        toast("Please complete your company profile.");
        router.push("/company-setup");
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
