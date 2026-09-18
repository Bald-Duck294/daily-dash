"use client";

import { useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";

import UserForm from "../../components/UserForm";
import { useCompanyId } from "@/providers/CompanyProvider";
import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { MODULES } from "@/shared/constants/permissions";
import { usePermissions } from "@/shared/hooks/usePermission";

// TanStack Query Hooks
import { useGetUserById, useUpdateUser } from "@/features/users/users.queries";
import { useDropdownLocations } from "@/features/dropdownList/dropdownlist.query";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { userId } = params;
  const { companyId } = useCompanyId();
  const queryCompanyId = searchParams?.get("companyId");

  useRequirePermission(MODULES.USERS);

  const { canUpdate } = usePermissions();
  const canEditUser = canUpdate(MODULES.USERS);

  // --- TANSTACK QUERIES & MUTATIONS ---
  const { 
    data: user, 
    isLoading, 
    isError 
  } = useGetUserById(userId);

  const updateUserMutation = useUpdateUser();

  // Fetch dropdown locations for assigning
  const effectiveCompanyId = queryCompanyId || companyId || user?.company_id;
  const { data: locationsResponse = [], isLoading: isLoadingLocations } = useDropdownLocations(effectiveCompanyId);

  const availableLocations = Array.isArray(locationsResponse)
    ? locationsResponse
    : (locationsResponse?.data || []);

  // Redirect safely if the user fails to load
  useEffect(() => {
    if (isError) {
      toast.error("Failed to fetch user data.");
      router.push(`/users?companyId=${effectiveCompanyId || ""}`);
    }
  }, [isError, router, effectiveCompanyId]);

  // --- HANDLERS ---
  const handleUpdateUser = async (formData) => {
    // Prevent sending an empty password string on update
    if (!formData.password || (typeof formData.password === "string" && !formData.password.trim())) {
      delete formData.password;
    }

    // Ensure email is null instead of empty string
    if (formData.email === "" || (typeof formData.email === "string" && !formData.email.trim())) {
      formData.email = null;
    }

    const toastId = toast.loading("Updating user...");
    
    try {
      await updateUserMutation.mutateAsync({ id: userId, data: formData });
      toast.success("User updated successfully!", { id: toastId });
      router.push(`/users?companyId=${effectiveCompanyId || ""}`);
    } catch (error) {
      toast.error(error.message || "Failed to update user.", { id: toastId });
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div 
        className="p-4 sm:p-6 md:p-8 min-h-screen transition-colors duration-300"
        style={{ background: "var(--user-add-bg)" }}
      >
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="cursor-pointer flex items-center gap-2 mb-6 text-sm font-semibold transition-colors"
            style={{ color: "var(--user-add-back-text)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--user-add-back-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--user-add-back-text)")
            }
          >
            <ArrowLeft size={20} />
            Back to Users
          </button>

          {/* Permission Warning Banner */}
          {!canEditUser && (
            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg mb-6 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    Read-Only Mode
                  </p>
                  <p className="text-sm text-amber-700">
                    You don&apos;t have permission to edit users
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Card */}
          <div
            className="rounded-2xl overflow-hidden transition-colors duration-300"
            style={{
              background: "var(--user-add-surface)",
              border: "1px solid var(--user-add-border)",
              boxShadow: "var(--user-add-shadow)",
            }}
          >
            {/* Header */}
            <div
              className="px-6 sm:px-8 py-5 flex justify-between items-center transition-colors duration-300"
              style={{
                background: "var(--user-add-header-bg)",
                borderBottom: "1px solid var(--user-add-header-border)",
              }}
            >
              <div className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: "var(--user-add-accent)" }}
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" x2="19" y1="8" y2="14" />
                  <line x1="22" x2="16" y1="11" y2="11" />
                </svg>

                <h1
                  className="text-lg sm:text-xl font-extrabold tracking-tight transition-colors duration-300"
                  style={{ color: "var(--user-add-title)" }}
                >
                  Edit User
                </h1>
              </div>

              <div
                className="h-2 w-2 rounded-full animate-pulse"
                style={{ background: "var(--user-add-success-dot)" }}
              />
            </div>

            {/* Form / Loader Content */}
            <div className="p-6 sm:p-8">
              {isLoading ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 
                    className="w-8 h-8 animate-spin" 
                    style={{ color: "var(--user-add-accent)" }} 
                  />
                </div>
              ) : user ? (
                <UserForm
                  initialData={user}
                  onSubmit={handleUpdateUser}
                  isEditing={true}
                  canSubmit={canEditUser && !updateUserMutation.isPending}
                  locations={availableLocations}
                  isLoadingLocations={isLoadingLocations}
                />
              ) : (
                <p 
                  className="text-center font-medium"
                  style={{ color: "var(--user-form-subtext)" }}
                >
                  User not found.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}