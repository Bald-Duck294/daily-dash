/* eslint-disable react-hooks/set-state-in-effect */
// "use client";

// import { useMemo, useState, useEffect } from "react";
// import toast from "react-hot-toast";

// import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
// import { usePermissions } from "@/shared/hooks/usePermission";
// import { MODULES } from "@/shared/constants/permissions";

// import { useGetUsersByRole } from "@/features/users/users.queries";

// import RoleHeader from "@/features/roles/components/RoleHeader";
// import RoleTable from "@/features/roles/components/RoleTable";
// import RoleEmptyState from "@/features/roles/components/RoleEmptyState";
// import RoleLoading from "@/features/roles/components/RoleLoading";

// const ROLE_ID_MAP = {
//   superadmin: 1,
//   admin: 2,
//   supervisor: 3,
//   user: 4,
//   cleaner: 5,
// };

// export default function RolesListContainer({ role }) {
//   useRequirePermission(MODULES.USERS);

//   const roleId = ROLE_ID_MAP[role];
//   const { canAdd, canView, canUpdate, canDelete } = usePermissions();
//   const [search, setSearch] = useState("");

//   /* ===============================
//      TANSTACK FETCH
//   ================================ */

//   const {
//     data: users = [],
//     isLoading,
//     isError,
//     error,
//   } = useGetUsersByRole(roleId);

//   /* ===============================
//      ERROR HANDLING (SAFE)
//   ================================ */

//   useEffect(() => {
//     if (isError) {
//       toast.error(error?.message || "Failed to fetch users");
//     }
//   }, [isError, error]);

//   /* ===============================
//      SEARCH FILTER
//   ================================ */

//   const filteredUsers = useMemo(() => {
//     if (!search) return users;

//     const q = search.toLowerCase();

//     return users.filter(
//       (u) =>
//         u.name?.toLowerCase().includes(q) ||
//         u.email?.toLowerCase().includes(q) ||
//         u.phone?.includes(q)
//     );
//   }, [users, search]);

//   /* ===============================
//      LOADING STATE
//   ================================ */

//   if (isLoading) return <RoleLoading />;

//   return (
//     <>
//       <RoleHeader
//         role={role}
//         search={search}
//         onSearch={setSearch}
//         canAdd={canAdd(MODULES.USERS)}
//       />

//       {filteredUsers.length === 0 ? (
//         <RoleEmptyState
//           role={role}
//           canAdd={canAdd(MODULES.USERS)}
//         />
//       ) : (
//         <RoleTable
//           users={filteredUsers}
//           role={role}
//           permissions={{
//             canView: canView(MODULES.USERS),
//             canEdit: canUpdate(MODULES.USERS),
//             canDelete: canDelete(MODULES.USERS),
//           }}
//         />
//       )}
//     </>
//   );
// }


"use client";

import { useMemo, useState, useEffect } from "react";
import toast from "react-hot-toast";

import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { usePermissions } from "@/shared/hooks/usePermission";
import { MODULES } from "@/shared/constants/permissions";
import { useGetUsersByRole } from "@/features/users/users.queries";

import RoleHeader from "@/features/roles/components/RoleHeader";
import RoleTable from "@/features/roles/components/RoleTable";
import RoleEmptyState from "@/features/roles/components/RoleEmptyState";
import RoleLoading from "@/features/roles/components/RoleLoading";

const ROLE_ID_MAP = {
  superadmin: 1,
  admin: 2,
  supervisor: 3,
  user: 4,
  cleaner: 5,
};

export default function RolesListContainer({ role }) {
  useRequirePermission(MODULES.USERS);

  const roleId = ROLE_ID_MAP[role];
  const { canAdd, canView, canUpdate, canDelete } = usePermissions();

  /* ===============================
     PAGINATION & SEARCH STATE
  ================================ */
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  /* ===============================
     TANSTACK FETCH
  ================================ */
  const {
    data: responseData, 
    isLoading,
    isError,
    error,
    isFetching,
  } = useGetUsersByRole(roleId, null, page, PAGE_SIZE);

  // Safely extract data and meta
  const users = responseData?.data ?? [];
 const meta = responseData?.pagination ?? { totalPages: 0, currentPage: 1, totalCount: 0 };

  /* ===============================
     ERROR HANDLING
  ================================ */
  useEffect(() => {
    if (isError) {
      toast.error(error?.message || "Failed to fetch users");
    }
  }, [isError, error]);

  // Reset to page 1 if search changes (optional but recommended UX)
  useEffect(() => {
    setPage(1);
  }, [search]);

  /* ===============================
     HANDLERS
  ================================ */
  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

function getPageNumbers(currentPage, totalPages) {
  let pages = [];
  for (let i = 1; i <= totalPages; i++) {
    // Show first, last, and 2 pages around the current page
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }
  return pages;
}

  /* ===============================
     LOADING
  ================================ */
  if (isLoading) return <RoleLoading />;

  return (
    <>
      <RoleHeader
        role={role}
        search={search}
        onSearch={setSearch}
        canAdd={canAdd(MODULES.USERS)}
      />

      {/* Loading Overlay */}
      {isFetching && <div className="text-sm text-center py-2">Loading...</div>}

      {users.length === 0 ? (
        <RoleEmptyState role={role} canAdd={canAdd(MODULES.USERS)} />
      ) : (
        <>
          <RoleTable
            users={users} // Pass paginated users directly
            role={role}
            permissions={{
              canView: canView(MODULES.USERS),
              canEdit: canUpdate(MODULES.USERS),
              canDelete: canDelete(MODULES.USERS),
            }}
          />

          {/* Pagination Controls */}
          {meta.totalPages > 1 && (
           <div className="flex items-center justify-between pt-6 border-t mt-4">
    <span className="text-sm text-gray-500">
      Page {meta.currentPage} of {meta.totalPages} ({meta.totalCount} total)
    </span>

    <div className="flex gap-1">
      {/* Previous */}
      <button
        disabled={meta.currentPage === 1 || isFetching}
        onClick={() => handlePageChange(meta.currentPage - 1)}
        className="px-3 py-1 border rounded-md disabled:opacity-50 text-sm"
      >
        Prev
      </button>

      {/* Page Numbers */}
      {getPageNumbers(meta.currentPage, meta.totalPages).map((pageNumber, index) => (
        <button
          key={index}
          disabled={pageNumber === '...' || isFetching}
          onClick={() => pageNumber !== '...' && handlePageChange(pageNumber)}
          className={`px-3 py-1 border rounded-md text-sm transition-colors ${
            pageNumber === meta.currentPage
              ? "bg-blue-600 text-white border-blue-600" // Active style
              : pageNumber === '...' 
                ? "border-none cursor-default" 
                : "hover:bg-gray-100"
          }`}
        >
          {pageNumber}
        </button>
      ))}

      {/* Next */}
      <button
        disabled={meta.currentPage === meta.totalPages || isFetching}
        onClick={() => handlePageChange(meta.currentPage + 1)}
        className="px-3 py-1 border rounded-md disabled:opacity-50 text-sm"
      >
        Next
      </button>
    </div>
           </div>
         )}
        </>
      )}
    </>
  );
}