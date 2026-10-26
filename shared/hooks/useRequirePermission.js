// src/lib/hooks/useRequirePermission.js

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

export const useRequirePermission = (module, options = {}) => {
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const isLoggingOut = useSelector((state) => state.auth.isLoggingOut);

  // ✅ Memoize permissions to prevent unnecessary re-renders
  const permissions = useMemo(() => {
    if (!user?.role?.permissions) return [];
    return Array.isArray(user.role.permissions) ? user.role.permissions : [];
  }, [user?.role?.permissions]);

  const { action = "view", errorMessage, redirectTo } = options;

  useEffect(() => {
    // 🛑 If user is logging out, unauthenticated, or user data is not loaded yet,
    // do NOT perform permission check or show error toast.
    if (isLoggingOut || !isAuthenticated || !user) {
      return;
    }

    // ✅ Superadmin bypass (has all permissions)
    if (user?.role_id === 1) {
      return;
    }

    // ✅ Build permission key (e.g., "locations.view")
    const requiredPermission = `${module}.${action}`;

    // ✅ Check if user has permission
    if (!permissions.includes(requiredPermission)) {
      // ✅ Show error toast
      const message =
        errorMessage || `You do not have permission to ${action} ${module}`;
      toast.error(message);

      // ✅ Determine redirect path
      let redirectPath;

      if (redirectTo) {
        redirectPath = redirectTo;
      } else if (user?.role_id === 1) {
        redirectPath = "/dashboard";
      } else if (user?.company_id) {
        redirectPath = `/clientDashboard/${user.company_id}`;
      } else {
        redirectPath = "/login";
      }

      console.log("❌ Permission denied:", requiredPermission);
      console.log("🔄 Redirecting to:", redirectPath);

      router.push(redirectPath);
    }
  }, [
    module,
    action,
    permissions,
    user?.role_id,
    user?.company_id,
    user,
    isAuthenticated,
    isLoggingOut,
    router,
    errorMessage,
    redirectTo,
  ]);
};
