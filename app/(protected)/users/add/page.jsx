// "use client";

// import { useRouter } from "next/navigation";
// import toast, { Toaster } from "react-hot-toast";
// import { ArrowLeft } from "lucide-react";

// import UserForm from "../components/UserForm";

// import { UsersApi } from "@/features/users/users.api";

// import { useCompanyId } from "@/providers/CompanyProvider";
// import { usePermissions } from "@/shared/hooks/usePermission";
// import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
// import { MODULES } from "@/shared/constants/permissions";

// export default function AddUserPage() {
//   const router = useRouter();
//   const { companyId } = useCompanyId();

//   // ✅ Page protection
//   useRequirePermission(MODULES.USERS);

//   // ✅ Permission check
//   const { canAdd } = usePermissions();
//   const canAddUser = canAdd(MODULES.USERS);

//   console.log(companyId, "companyId from add user");

//   const handleAddUser = async (formData) => {
//     const toastId = toast.loading("Creating user...");
//     const response = await UsersApi.createUser(formData, companyId);

//     if (response.success) {
//       toast.success("User created successfully!", { id: toastId });
//       router.push(`/users?companyId=${companyId}`);
//     } else {
//       toast.error(response.error || "Failed to create user.", { id: toastId });
//     }
//   };

//   return (
//     <>
//       <Toaster position="top-center" />
//       <div className="p-4 sm:p-6 md:p-8 bg-slate-50 min-h-screen">
//         <div className="max-w-2xl mx-auto">
//           <button
//             onClick={() => window.history.back()}
//             className="cursor-pointer flex items-center gap-2 mb-6 text-sm font-semibold text-slate-600 hover:text-slate-800"
//           >
//             <ArrowLeft size={18} />
//             Back to Users
//           </button>
//           <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md">
//             <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6">
//               Add New User
//             </h1>

//             {/* ✅ PASS canAddUser to form */}
//             <UserForm
//               onSubmit={handleAddUser}
//               canSubmit={canAddUser} // ✅ Changed from canEdit to canSubmit
//             />
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

"use client";

import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

import UserForm from "../components/UserForm";
import { UsersApi } from "@/features/users/users.api";
import { useCompanyId } from "@/providers/CompanyProvider";
import { usePermissions } from "@/shared/hooks/usePermission";
import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { MODULES } from "@/shared/constants/permissions";

export default function AddUserPage() {
  const router = useRouter();
  const { companyId } = useCompanyId();

  useRequirePermission(MODULES.USERS);

  const { canAdd } = usePermissions();
  const canAddUser = canAdd(MODULES.USERS);

  const handleAddUser = async (formData) => {
    const toastId = toast.loading("Creating user...");
    const response = await UsersApi.createUser(formData, companyId);

    if (response.success) {
      toast.success("User created successfully!", { id: toastId });
      router.push(`/users?companyId=${companyId}`);
    } else {
      toast.error(response.error || "Failed to create user.", { id: toastId });
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="p-4 sm:p-6 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => router.back()}
            className="cursor-pointer flex items-center gap-2 mb-6 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>

          {/* Card with mint green header */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200">
            {/* Header Section - Mint Green */}
            {/* <div className="bg-gradient-to-r from-teal-100 to-emerald-100 px-6 sm:px-8 py-5 border-b border-teal-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <svg
                    className="w-5 h-5 text-teal-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                  Add New User
                </h1>
                <div className="ml-auto">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                </div>
              </div>
            </div> */}

            <div class="bg-[#CBF3F0] px-6 sm:px-8 py-5 border-b  border-[#CBF3F1] flex justify-between items-center">
              <div class="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-user-plus text-[#FF9F1C]"
                  aria-hidden="true"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <line x1="19" x2="19" y1="8" y2="14"></line>
                  <line x1="22" x2="16" y1="11" y2="11"></line>
                </svg>
                <h1 class="text-lg sm:text-xl font-extrabold tracking-tight text-[#0f0f0f]">
                  Add New User
                </h1>
              </div>
              {/* <div class="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-user-plus text-[#FF9F1C]"
                  aria-hidden="true"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <line x1="19" x2="19" y1="8" y2="14"></line>
                  <line x1="22" x2="16" y1="11" y2="11"></line>
                </svg>
                <h1 class="text-lg sm:text-xl font-extrabold tracking-tight text-[#0f0f0f]">
                  Add New User
                </h1>
              </div> */}
              <div class="h-2 w-2 rounded-full bg-[#28C76F] animate-pulse"></div>
            </div>
            {/* Form Content */}
            <div className="p-6 sm:p-8">
              <UserForm onSubmit={handleAddUser} canSubmit={canAddUser} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
