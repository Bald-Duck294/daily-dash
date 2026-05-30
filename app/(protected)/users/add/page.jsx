"use client";

import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

import UserForm from "../components/UserForm";
import { useCompanyId } from "@/providers/CompanyProvider";
import { usePermissions } from "@/shared/hooks/usePermission";
import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { MODULES } from "@/shared/constants/permissions";

// TanStack Query hooks
import { useCreateUser } from "@/features/users/users.queries";
// ✅ IMPORT THE OPTIMIZED DROPDOWN HOOK
import { useDropdownLocations } from "@/features/dropdownList/dropdownlist.query"; 

export default function AddUserPage() {
  const router = useRouter();
  const { companyId } = useCompanyId();

  useRequirePermission(MODULES.USERS);

  const { canAdd } = usePermissions();
  const canAddUser = canAdd(MODULES.USERS);

  // Initialize the mutation
  const createUserMutation = useCreateUser();

  // ✅ FETCH LOCATIONS FOR THE FORM DROPDOWN
  const { data: locationsResponse = [], isLoading: isLoadingLocations } = useDropdownLocations(companyId);

  // Safely extract the array to pass to the form
  const availableLocations = Array.isArray(locationsResponse)
    ? locationsResponse
    : (locationsResponse?.data || []);

  const handleAddUser = async (formData) => {
    const toastId = toast.loading("Creating user...");
    
    try {
      // Execute the mutation using mutateAsync so we can await its completion
      await createUserMutation.mutateAsync({ data: formData, companyId });

      toast.success("User created successfully!", { id: toastId });
      router.push(`/users?companyId=${companyId}`);
    } catch (error) {
      // The custom hook throws the error, so we catch it here to update the toast
      toast.error(error.message || "Failed to create user.", { id: toastId });
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div
        className="p-4 sm:p-6 md:p-8 min-h-screen"
        style={{ background: "var(--user-add-bg)" }}
      >
        <div className="max-w-3xl mx-auto">
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
          </button>

          {/* Card with header */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "var(--user-add-surface)",
              border: "1px solid var(--user-add-border)",
              boxShadow: "var(--user-add-shadow)",
            }}
          >
            {/* Header */}
            <div
              className="px-6 sm:px-8 py-5 flex justify-between items-center"
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
                  className="text-lg sm:text-xl font-extrabold tracking-tight"
                  style={{ color: "var(--user-add-title)" }}
                >
                  Add New User
                </h1>
              </div>

              <div
                className="h-2 w-2 rounded-full animate-pulse"
                style={{ background: "var(--user-add-success-dot)" }}
              />
            </div>

            {/* Form */}
            <div className="p-6 sm:p-8">
              {/* ✅ PASS LOCATIONS AND LOADING STATE DOWN AS PROPS */}
              <UserForm 
                onSubmit={handleAddUser} 
                canSubmit={canAddUser && !createUserMutation.isPending} 
                locations={availableLocations}
                isLoadingLocations={isLoadingLocations}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}