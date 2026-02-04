/* eslint-disable react-hooks/immutability */
// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { useSelector } from "react-redux";
// import toast, { Toaster } from "react-hot-toast";
// import {
//   Plus,
//   Edit,
//   Trash2,
//   Users,
//   Search,
//   Eye,
//   Filter,
//   TrendingUp,
//   Building2,
//   MapPin,
//   Shield,
//   UserCog,
//   Briefcase,
//   HardHat,
//   LucideDog,
// } from "lucide-react";
// import { UsersApi } from "@/features/users/users.api";
// import { useRouter } from "next/navigation";

// import { useCompanyId } from "@/providers/CompanyProvider";
// import { usePermissions } from "@/shared/hooks/usePermission";
// import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
// import { MODULES } from "@/shared/constants/permissions";

// const ROLE_HIERARCHY = {
//   2: { name: "Admin", level: 2, icon: Shield, color: "blue" },
//   3: { name: "Supervisor", level: 4, icon: UserCog, color: "green" },
//   5: { name: "Cleaner", level: 5, icon: HardHat, color: "gray" },
//   6: { name: "Zonal Admin", level: 3, icon: MapPin, color: "purple" },
//   7: { name: "Facility Supervisor", level: 4, icon: Users, color: "teal" },
//   8: { name: "Facility Admin", level: 3, icon: Building2, color: "indigo" },
// };

// // Role hierarchy definition (removed User and Superadmin)
// // const ROLE_HIERARCHY = {
// //   2: { name: 'Admin', level: 2, icon: Briefcase, color: 'blue' },
// //   3: { name: 'Supervisor', level: 3, icon: UserCog, color: 'green' },
// //   5: { name: 'Cleaner', level: 5, icon: HardHat, color: 'gray' },
// //   6: { name: 'Demo users', level: 6, icon: LucideDog, color: 'orange' }
// // };

// const TableRowSkeleton = () => (
//   <tr className="animate-pulse">
//     {[...Array(4)].map((_, i) => (
//       <td key={i} className="p-4">
//         <div className="h-4 bg-slate-200 rounded" />
//       </td>
//     ))}
//   </tr>
// );

// const CardSkeleton = () => (
//   <div className="animate-pulse p-4 bg-white mb-4 rounded-lg shadow">
//     <div className="h-4 bg-slate-200 rounded w-2/3 mb-2" />
//     <div className="h-3 bg-slate-100 rounded w-1/3 mb-2" />
//     <div className="h-4 bg-slate-200 rounded w-2/3 mb-4" />
//     <div className="flex gap-2">
//       <div className="h-8 w-16 bg-slate-200 rounded" />
//       <div className="h-8 w-16 bg-slate-100 rounded" />
//     </div>
//   </div>
// );

// const StatCardSkeleton = () => (
//   <div className="animate-pulse bg-white p-6 rounded-xl shadow-md border border-slate-200">
//     <div className="flex items-center justify-between">
//       <div className="flex-1">
//         <div className="h-4 bg-slate-200 rounded w-20 mb-2" />
//         <div className="h-8 bg-slate-300 rounded w-12 mb-2" />
//         <div className="h-3 bg-slate-100 rounded w-24" />
//       </div>
//       <div className="w-12 h-12 bg-slate-200 rounded-lg" />
//     </div>
//   </div>
// );

// export default function UsersPage() {
//   useRequirePermission(MODULES.USERS);

//   // ✅ ADD: Permission checks
//   const { canAdd, canUpdate, canDelete } = usePermissions();
//   const canAddUser = canAdd(MODULES.USERS);
//   const canEditUser = canUpdate(MODULES.USERS);
//   const canDeleteUser = canDelete(MODULES.USERS);

//   const [users, setUsers] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedRole, setSelectedRole] = useState("all");

//   const currentUser = useSelector((state) => state.auth.user);
//   const { companyId } = useCompanyId();
//   const router = useRouter();

//   const currentUserRoleId = parseInt(currentUser?.role_id || 4);

//   // Calculate role statistics
//   const roleStats = useCallback(() => {
//     const stats = {};
//     Object.keys(ROLE_HIERARCHY).forEach((roleId) => {
//       stats[roleId] = users.filter(
//         (u) => parseInt(u.role_id || u.role?.id) === parseInt(roleId),
//       ).length;
//     });
//     return stats;
//   }, [users]);

//   // ✅ FIXED: Filter users by role - exclude superadmins (role_id 1) and users (role_id 4)
//   // const filterUsersByRole = useCallback((allUsers) => {
//   //   if (!currentUser || !currentUser.role_id) return allUsers;

//   //   return allUsers.filter(user => {
//   //     const userRoleId = parseInt(user.role_id || user.role?.id || 4);

//   //     //  Exclude superadmins (role_id 1) and regular users (role_id 4)
//   //     if (userRoleId === 1 || userRoleId === 4) {
//   //       return false;
//   //     }

//   //     // Only show roles that exist in ROLE_HIERARCHY (2, 3, 5)
//   //     if (!ROLE_HIERARCHY[userRoleId]) {
//   //       return false;
//   //     }

//   //     // ✅ If current user is Superadmin (role_id 1), show all valid roles
//   //     if (currentUserRoleId === 1) {
//   //       return true;
//   //     }

//   //     // ✅ For other roles, apply hierarchy: show users with equal or lower authority
//   //     const userRoleLevel = ROLE_HIERARCHY[userRoleId]?.level || 999;
//   //     const currentUserRoleLevel = ROLE_HIERARCHY[currentUserRoleId]?.level || 999;

//   //     return userRoleLevel >= currentUserRoleLevel;
//   //   });
//   // }, [currentUser, currentUserRoleId]);

//   const filterUsersByRole = useCallback(
//     (allUsers) => {
//       if (!currentUser || !currentUser.role_id) return allUsers;

//       return allUsers.filter((user) => {
//         const userRoleId = parseInt(user.role_id || user.role?.id, 10);

//         // ✅ Exclude superadmins (1) and reserved (4)
//         if (userRoleId === 1 || userRoleId === 4) return false;

//         // ✅ Only show roles defined in ROLE_HIERARCHY (2, 3, 5, 6, 7, 8)
//         if (!ROLE_HIERARCHY[userRoleId]) return false;

//         // ✅ Superadmin sees all
//         if (currentUserRoleId === 1) return true;

//         // ✅ Admin sees all in their company
//         if (currentUserRoleId === 2) return true;

//         // ✅ Other roles: Show same role or lower hierarchy
//         const userRoleLevel = ROLE_HIERARCHY[userRoleId]?.level || 999;
//         const currentUserRoleLevel =
//           ROLE_HIERARCHY[currentUserRoleId]?.level || 999;

//         // Show users of same level or lower
//         return userRoleLevel >= currentUserRoleLevel;
//       });
//     },
//     [currentUser, currentUserRoleId],
//   );

//   // Filter users by search
//   const filterUsersBySearch = useCallback((allUsers, term) => {
//     if (!term) return allUsers;
//     return allUsers.filter(
//       (user) =>
//         user.name.toLowerCase().includes(term.toLowerCase()) ||
//         (user.email && user.email.toLowerCase().includes(term.toLowerCase())) ||
//         (user.phone && user.phone.includes(term)),
//     );
//   }, []);

//   const fetchUsers = useCallback(async () => {
//     if (!companyId) {
//       setIsLoading(false);
//       return;
//     }
//     setIsLoading(true);
//     try {
//       const response = await UsersApi.getAllUsers(companyId);
//       console.log("Fetched users:", response.data);
//       if (response.success) {
//         const roleFilteredUsers = filterUsersByRole(response.data);
//         console.log("After role filter:", roleFilteredUsers); // ✅ Debug log
//         setUsers(roleFilteredUsers);
//         applyFilters(roleFilteredUsers, searchTerm, selectedRole);
//       } else {
//         toast.error(response.error || "Failed to fetch users.");
//       }
//     } catch (error) {
//       console.error("Error fetching users:", error);
//       toast.error("Failed to fetch users.");
//     }
//     setIsLoading(false);
//   }, [companyId, filterUsersByRole, searchTerm, selectedRole]);

//   const applyFilters = useCallback(
//     (userList, search, role) => {
//       let filtered = [...userList];

//       // Apply role filter
//       if (role !== "all") {
//         filtered = filtered.filter(
//           (u) => parseInt(u.role_id || u.role?.id) === parseInt(role),
//         );
//       }

//       // Apply search filter
//       filtered = filterUsersBySearch(filtered, search);

//       setFilteredUsers(filtered);
//     },
//     [filterUsersBySearch],
//   );

//   useEffect(() => {
//     fetchUsers();
//   }, [fetchUsers]);

//   useEffect(() => {
//     applyFilters(users, searchTerm, selectedRole);
//   }, [searchTerm, selectedRole, users, applyFilters]);

//   const canManageUser = (targetUser) => {
//     // Superadmin can manage all users
//     if (currentUserRoleId === 1) return true;

//     const targetUserRoleId = parseInt(
//       targetUser.role_id || targetUser.role?.id || 4,
//     );
//     const targetUserRoleLevel = ROLE_HIERARCHY[targetUserRoleId]?.level || 999;
//     const currentUserRoleLevel =
//       ROLE_HIERARCHY[currentUserRoleId]?.level || 999;

//     return targetUserRoleLevel >= currentUserRoleLevel;
//   };

//   const getRoleDisplayName = (user) => {
//     const roleId = parseInt(user.role_id || user.role?.id || 4);
//     return ROLE_HIERARCHY[roleId]?.name || user.role?.name || "Unknown Role";
//   };

//   const getRoleColorClass = (user) => {
//     const roleId = parseInt(user.role_id || user.role?.id || 4);
//     const colorMap = {
//       blue: "text-blue-700 bg-blue-100 border-blue-200",
//       green: "text-green-700 bg-green-100 border-green-200",
//       gray: "text-gray-700 bg-gray-100 border-gray-200",
//     };
//     const color = ROLE_HIERARCHY[roleId]?.color || "gray";
//     return colorMap[color] || "text-indigo-700 bg-indigo-100 border-indigo-200";
//   };

//   const getStatCardColor = (color) => {
//     const colorMap = {
//       blue: "from-blue-500 to-blue-600",
//       green: "from-green-500 to-green-600",
//       gray: "from-gray-500 to-gray-600",
//     };
//     return colorMap[color] || "from-indigo-500 to-indigo-600";
//   };

//   const handleDelete = (user) => {
//     if (!canManageUser(user)) {
//       toast.error("You don't have permission to delete this user.");
//       return;
//     }
//     toast(
//       (t) => (
//         <div className="flex flex-col items-center gap-4 p-4">
//           <p className="font-semibold text-center">
//             Are you sure you want to delete {user.name}?
//           </p>
//           <div className="flex gap-4">
//             <button
//               onClick={() => {
//                 toast.dismiss(t.id);
//                 performDelete(user.id);
//               }}
//               className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
//             >
//               Delete
//             </button>
//             <button
//               onClick={() => toast.dismiss(t.id)}
//               className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       ),
//       { duration: 6000 },
//     );
//   };

//   const performDelete = async (id) => {
//     const toastId = toast.loading("Deleting user...");
//     const response = await UsersApi.deleteUser(id);
//     if (response.success) {
//       toast.success("User deleted successfully!", { id: toastId });
//       fetchUsers();
//     } else {
//       toast.error(response.error || "Failed to delete user.", { id: toastId });
//     }
//   };

//   const stats = roleStats();

//   return (
//     <>
//       <Toaster position="top-center" reverseOrder={false} />
//       <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
//         <div className="max-w-7xl mx-auto">
//           {/* Header */}
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fadeIn">
//             <div className="flex items-center gap-3">
//               <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
//                 <Users className="w-7 h-7 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
//                   User Management
//                 </h1>
//                 <p className="text-sm text-slate-600 mt-1">
//                   Manage all user roles and permissions
//                 </p>
//               </div>
//             </div>
//             {canAddUser && (
//               <a
//                 href={`/users/add?companyId=${companyId}`}
//                 className="inline-flex items-center gap-2 px-5 py-2.5 font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer"
//               >
//                 <Plus size={20} />
//                 Add User
//               </a>
//             )}
//           </div>

//           {/* Stats Cards - Compact Grid */}
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
//             {/* Total Users - Spans 2 columns on mobile */}
//             <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-indigo-500 to-indigo-600 p-4 rounded-lg shadow-md text-white">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs opacity-90">Total Users</p>
//                   <p className="text-2xl font-bold mt-1">{users.length}</p>
//                 </div>
//                 <Users className="w-8 h-8 opacity-80" />
//               </div>
//             </div>

//             {/* Role Cards - Only show roles with users */}
//             {Object.entries(ROLE_HIERARCHY)
//               .filter(([roleId]) => stats[roleId] > 0)
//               .map(([roleId, roleData]) => {
//                 const Icon = roleData.icon;
//                 const count = stats[roleId] || 0;

//                 return (
//                   <div
//                     key={roleId}
//                     onClick={() =>
//                       setSelectedRole(selectedRole === roleId ? "all" : roleId)
//                     }
//                     className={`p-4 rounded-lg shadow-md cursor-pointer transition-all duration-200 hover:shadow-lg ${
//                       selectedRole === roleId
//                         ? `bg-${roleData.color}-600 text-white ring-2 ring-${roleData.color}-400`
//                         : "bg-white hover:bg-gray-50"
//                     }`}
//                   >
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p
//                           className={`text-xs ${selectedRole === roleId ? "text-white opacity-90" : "text-gray-600"}`}
//                         >
//                           {roleData.name}
//                         </p>
//                         <p
//                           className={`text-2xl font-bold mt-1 ${selectedRole === roleId ? "text-white" : "text-gray-800"}`}
//                         >
//                           {count}
//                         </p>
//                       </div>
//                       <Icon
//                         className={`w-6 h-6 ${selectedRole === roleId ? "text-white opacity-80" : "text-gray-400"}`}
//                       />
//                     </div>
//                   </div>
//                 );
//               })}
//           </div>

//           {/* Filters Section */}
//           <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 mb-6 animate-fadeIn">
//             <div className="flex flex-col lg:flex-row gap-4">
//               {/* Search Bar */}
//               <div className="flex-1 relative">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
//                 <input
//                   type="text"
//                   placeholder="Search by name, email, or phone..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-11 pr-4 py-2.5 text-md border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
//                 />
//               </div>

//               {/* Role Filter Pills */}
//               <div className="flex flex-wrap gap-2 items-center">
//                 <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
//                   <Filter size={16} />
//                   <span className="hidden sm:inline">Filter:</span>
//                 </div>
//                 <button
//                   onClick={() => setSelectedRole("all")}
//                   className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
//                     selectedRole === "all"
//                       ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md"
//                       : "bg-slate-100 text-slate-700 hover:bg-slate-200"
//                   }`}
//                 >
//                   All Users
//                 </button>
//                 {Object.entries(ROLE_HIERARCHY).map(([roleId, roleData]) => {
//                   const count = stats[roleId] || 0;
//                   if (count === 0) return null;

//                   return (
//                     <button
//                       key={roleId}
//                       onClick={() => setSelectedRole(roleId)}
//                       className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
//                         selectedRole === roleId
//                           ? `bg-${roleData.color}-600 text-white shadow-md`
//                           : `bg-${roleData.color}-100 text-${roleData.color}-700 hover:bg-${roleData.color}-200`
//                       }`}
//                     >
//                       {roleData.name}s
//                       <span
//                         className={`px-2 py-0.5 rounded-full text-xs ${
//                           selectedRole === roleId
//                             ? "bg-white/20"
//                             : `bg-${roleData.color}-200`
//                         }`}
//                       >
//                         {count}
//                       </span>
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

//           {/* Table View - Desktop */}
//           <div className="hidden sm:block animate-fadeIn">
//             <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
//               <div className="overflow-x-auto">
//                 <table className="w-full text-left">
//                   <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
//                     <tr>
//                       <th className="p-4 text-sm font-semibold text-slate-700">
//                         Name
//                       </th>
//                       <th className="p-4 text-sm font-semibold text-slate-700">
//                         Email
//                       </th>
//                       <th className="p-4 text-sm font-semibold text-slate-700">
//                         Role
//                       </th>
//                       <th className="p-4 text-sm font-semibold text-slate-700">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {isLoading ? (
//                       Array.from({ length: 5 }).map((_, i) => (
//                         <TableRowSkeleton key={i} />
//                       ))
//                     ) : filteredUsers.length > 0 ? (
//                       filteredUsers.map((user, index) => (
//                         <tr
//                           key={user.id}
//                           className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-150 animate-slideUp"
//                           style={{ animationDelay: `${index * 50}ms` }}
//                         >
//                           <td className="p-4">
//                             <div className="flex items-center gap-3">
//                               <div
//                                 className={`w-10 h-10 rounded-full bg-gradient-to-br ${getStatCardColor(ROLE_HIERARCHY[parseInt(user.role_id || user.role?.id)]?.color)} flex items-center justify-center text-white font-semibold shadow-md`}
//                               >
//                                 {user.name.charAt(0).toUpperCase()}
//                               </div>
//                               <div>
//                                 <div className="font-semibold text-slate-800">
//                                   {user.name}
//                                 </div>
//                                 {user.phone && (
//                                   <div className="text-xs text-slate-500">
//                                     {user.phone}
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
//                           </td>
//                           <td className="p-4 text-slate-600">
//                             {user.email || "N/A"}
//                           </td>
//                           <td className="p-4">
//                             <span
//                               className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${getRoleColorClass(user)}`}
//                             >
//                               {getRoleDisplayName(user)}
//                             </span>
//                           </td>
//                           <td className="p-4">
//                             <div className="flex items-center gap-2">
//                               <button
//                                 onClick={() =>
//                                   router.push(
//                                     `/users/view/${user.id}?companyId=${companyId}`,
//                                   )
//                                 }
//                                 className="p-2 cursor-pointer text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-all duration-200 hover:scale-110"
//                                 title="View User"
//                               >
//                                 <Eye size={16} />
//                               </button>
//                               {canManageUser(user) && canEditUser && (
//                                 <button
//                                   onClick={() =>
//                                     router.push(
//                                       `/users/${user.id}?companyId=${companyId}`,
//                                     )
//                                   }
//                                   className="flex-1 cursor-pointer p-2.5 text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100 transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm"
//                                 >
//                                   <Edit size={16} />
//                                   Edit
//                                 </button>
//                               )}
//                               {canManageUser(user) && canDeleteUser && (
//                                 <button
//                                   onClick={() => handleDelete(user)}
//                                   className="cursor-pointer p-2.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200"
//                                 >
//                                   <Trash2 size={16} />
//                                 </button>
//                               )}
//                             </div>
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td
//                           colSpan="4"
//                           className="text-center py-16 text-slate-500"
//                         >
//                           <div className="flex flex-col items-center gap-3">
//                             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
//                               <Users className="w-10 h-10 text-slate-400" />
//                             </div>
//                             <p className="font-semibold text-lg text-slate-700">
//                               {searchTerm || selectedRole !== "all"
//                                 ? "No users found"
//                                 : "No users found"}
//                             </p>
//                             <p className="text-sm">
//                               {searchTerm || selectedRole !== "all"
//                                 ? "Try adjusting your filters or search term."
//                                 : 'Click "Add User" to get started.'}
//                             </p>
//                           </div>
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>

//           {/* Mobile Card View */}
//           <div className="block sm:hidden">
//             {isLoading ? (
//               Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
//             ) : filteredUsers.length > 0 ? (
//               filteredUsers.map((user, index) => (
//                 <div
//                   key={user.id}
//                   className="mb-4 p-4 bg-white rounded-xl shadow-md border border-slate-200 hover:shadow-lg transition-all duration-200 animate-slideUp"
//                   style={{ animationDelay: `${index * 50}ms` }}
//                 >
//                   <div className="flex items-start gap-3 mb-3">
//                     <div
//                       className={`w-12 h-12 rounded-full bg-gradient-to-br ${getStatCardColor(ROLE_HIERARCHY[parseInt(user.role_id || user.role?.id)]?.color)} flex items-center justify-center text-white font-semibold shadow-md text-lg`}
//                     >
//                       {user.name.charAt(0).toUpperCase()}
//                     </div>
//                     <div className="flex-1">
//                       <div className="font-semibold text-slate-800 text-lg">
//                         {user.name}
//                       </div>
//                       {user.phone && (
//                         <div className="text-xs text-slate-500 mt-0.5">
//                           {user.phone}
//                         </div>
//                       )}
//                       <span
//                         className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full border ${getRoleColorClass(user)}`}
//                       >
//                         {getRoleDisplayName(user)}
//                       </span>
//                     </div>
//                   </div>
//                   <div className="text-slate-600 text-sm mb-3">
//                     {user.email || "N/A"}
//                   </div>
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() =>
//                         router.push(
//                           `/users/view/${user.id}?companyId=${companyId}`,
//                         )
//                       }
//                       className="flex-1 p-2.5 cursor-pointer text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm"
//                     >
//                       <Eye size={16} />
//                       View
//                     </button>
//                     {canManageUser(user) && (
//                       <>
//                         <button
//                           onClick={() =>
//                             router.push(
//                               `/users/${user.id}?companyId=${companyId}`,
//                             )
//                           }
//                           className="flex-1 cursor-pointer p-2.5 text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100 transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm"
//                         >
//                           <Edit size={16} />
//                           Edit
//                         </button>
//                         <button
//                           onClick={() => handleDelete(user)}
//                           className="cursor-pointer p-2.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200"
//                         >
//                           <Trash2 size={16} />
//                         </button>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="text-center py-12 text-slate-500 bg-white rounded-xl shadow-md p-8">
//                 <div className="flex flex-col items-center gap-3">
//                   <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
//                     <Users className="w-10 h-10 text-slate-400" />
//                   </div>
//                   <p className="font-semibold text-lg text-slate-700">
//                     {searchTerm || selectedRole !== "all"
//                       ? "No users found"
//                       : "No users found"}
//                   </p>
//                   <p className="text-sm">
//                     {searchTerm || selectedRole !== "all"
//                       ? "Try adjusting your filters or search term."
//                       : 'Click "Add User" to get started.'}
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Summary Footer */}
//           <div className="mt-6 p-4 bg-white rounded-lg border border-slate-200 shadow-sm animate-fadeIn">
//             <div className="flex items-center justify-between text-sm text-slate-600">
//               <span className="font-medium">
//                 Showing{" "}
//                 <span className="text-indigo-600 font-bold">
//                   {filteredUsers.length}
//                 </span>{" "}
//                 of <span className="font-bold">{users.length}</span> users
//                 {selectedRole !== "all" &&
//                   ` • Filtered by ${ROLE_HIERARCHY[selectedRole]?.name}`}
//               </span>
//               {searchTerm && (
//                 <button
//                   onClick={() => setSearchTerm("")}
//                   className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
//                 >
//                   Clear search
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Add custom animations */}
//       <style jsx global>{`
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//           }
//           to {
//             opacity: 1;
//           }
//         }

//         @keyframes slideUp {
//           from {
//             opacity: 0;
//             transform: translateY(20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         .animate-fadeIn {
//           animation: fadeIn 0.5s ease-out;
//         }

//         .animate-slideUp {
//           animation: slideUp 0.4s ease-out forwards;
//           opacity: 0;
//         }
//       `}</style>
//     </>
//   );
// }

// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { useSelector } from "react-redux";
// import toast, { Toaster } from "react-hot-toast";
// import {
//   Plus,
//   Edit,
//   Trash2,
//   Users,
//   Search,
//   Eye,
//   Filter,
//   Shield,
//   UserCog,
//   Briefcase,
//   HardHat,
//   MapPin,
//   Building2,
// } from "lucide-react";
// import { UsersApi } from "@/features/users/users.api";
// import { useRouter } from "next/navigation";

// import { useCompanyId } from "@/providers/CompanyProvider";
// import { usePermissions } from "@/shared/hooks/usePermission";
// import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
// import { MODULES } from "@/shared/constants/permissions";

// const ROLE_HIERARCHY = {
//   2: { name: "Admin", level: 2, icon: Shield, color: "blue" },
//   3: { name: "Supervisor", level: 4, icon: UserCog, color: "teal" },
//   5: { name: "Cleaner", level: 5, icon: HardHat, color: "orange" },
//   6: { name: "Zonal Admin", level: 3, icon: MapPin, color: "purple" },
//   7: { name: "Facility Supv", level: 4, icon: Users, color: "teal" },
//   8: { name: "Facility Admin", level: 3, icon: Building2, color: "indigo" },
// };

// const TableRowSkeleton = () => (
//   <tr className="animate-pulse">
//     {[...Array(4)].map((_, i) => (
//       <td key={i} className="p-4">
//         <div className="h-4 bg-slate-200 rounded" />
//       </td>
//     ))}
//   </tr>
// );

// const CardSkeleton = () => (
//   <div className="animate-pulse p-4 bg-white mb-4 rounded-lg shadow">
//     <div className="h-4 bg-slate-200 rounded w-2/3 mb-2" />
//     <div className="h-3 bg-slate-100 rounded w-1/3 mb-2" />
//     <div className="h-4 bg-slate-200 rounded w-2/3 mb-4" />
//     <div className="flex gap-2">
//       <div className="h-8 w-16 bg-slate-200 rounded" />
//       <div className="h-8 w-16 bg-slate-100 rounded" />
//     </div>
//   </div>
// );

// export default function UsersPage() {
//   useRequirePermission(MODULES.USERS);

//   const { canAdd, canUpdate, canDelete } = usePermissions();
//   const canAddUser = canAdd(MODULES.USERS);
//   const canEditUser = canUpdate(MODULES.USERS);
//   const canDeleteUser = canDelete(MODULES.USERS);

//   const [users, setUsers] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedRole, setSelectedRole] = useState("all");

//   const currentUser = useSelector((state) => state.auth.user);
//   const { companyId } = useCompanyId();
//   const router = useRouter();

//   const currentUserRoleId = parseInt(currentUser?.role_id || 4);

//   const roleStats = useCallback(() => {
//     const stats = {};
//     Object.keys(ROLE_HIERARCHY).forEach((roleId) => {
//       stats[roleId] = users.filter(
//         (u) => parseInt(u.role_id || u.role?.id) === parseInt(roleId),
//       ).length;
//     });
//     return stats;
//   }, [users]);

//   const filterUsersByRole = useCallback(
//     (allUsers) => {
//       if (!currentUser || !currentUser.role_id) return allUsers;

//       return allUsers.filter((user) => {
//         const userRoleId = parseInt(user.role_id || user.role?.id, 10);
//         if (userRoleId === 1 || userRoleId === 4) return false;
//         if (!ROLE_HIERARCHY[userRoleId]) return false;
//         if (currentUserRoleId === 1) return true;
//         if (currentUserRoleId === 2) return true;

//         const userRoleLevel = ROLE_HIERARCHY[userRoleId]?.level || 999;
//         const currentUserRoleLevel =
//           ROLE_HIERARCHY[currentUserRoleId]?.level || 999;
//         return userRoleLevel >= currentUserRoleLevel;
//       });
//     },
//     [currentUser, currentUserRoleId],
//   );

//   const filterUsersBySearch = useCallback((allUsers, term) => {
//     if (!term) return allUsers;
//     return allUsers.filter(
//       (user) =>
//         user.name.toLowerCase().includes(term.toLowerCase()) ||
//         (user.email && user.email.toLowerCase().includes(term.toLowerCase())) ||
//         (user.phone && user.phone.includes(term)),
//     );
//   }, []);

//   const fetchUsers = useCallback(async () => {
//     if (!companyId) {
//       setIsLoading(false);
//       return;
//     }
//     setIsLoading(true);
//     try {
//       const response = await UsersApi.getAllUsers(companyId);
//       if (response.success) {
//         const roleFilteredUsers = filterUsersByRole(response.data);
//         setUsers(roleFilteredUsers);
//         applyFilters(roleFilteredUsers, searchTerm, selectedRole);
//       } else {
//         toast.error(response.error || "Failed to fetch users.");
//       }
//     } catch (error) {
//       console.error("Error fetching users:", error);
//       toast.error("Failed to fetch users.");
//     }
//     setIsLoading(false);
//   }, [companyId, filterUsersByRole, searchTerm, selectedRole]);

//   const applyFilters = useCallback(
//     (userList, search, role) => {
//       let filtered = [...userList];

//       if (role !== "all") {
//         filtered = filtered.filter(
//           (u) => parseInt(u.role_id || u.role?.id) === parseInt(role),
//         );
//       }

//       filtered = filterUsersBySearch(filtered, search);
//       setFilteredUsers(filtered);
//     },
//     [filterUsersBySearch],
//   );

//   useEffect(() => {
//     fetchUsers();
//   }, [fetchUsers]);

//   useEffect(() => {
//     applyFilters(users, searchTerm, selectedRole);
//   }, [searchTerm, selectedRole, users, applyFilters]);

//   const canManageUser = (targetUser) => {
//     if (currentUserRoleId === 1) return true;

//     const targetUserRoleId = parseInt(
//       targetUser.role_id || targetUser.role?.id || 4,
//     );
//     const targetUserRoleLevel = ROLE_HIERARCHY[targetUserRoleId]?.level || 999;
//     const currentUserRoleLevel =
//       ROLE_HIERARCHY[currentUserRoleId]?.level || 999;

//     return targetUserRoleLevel >= currentUserRoleLevel;
//   };

//   const getRoleDisplayName = (user) => {
//     const roleId = parseInt(user.role_id || user.role?.id || 4);
//     return ROLE_HIERARCHY[roleId]?.name || user.role?.name || "Unknown Role";
//   };

//   const getRoleColorClass = (user) => {
//     const roleId = parseInt(user.role_id || user.role?.id || 4);
//     const colorMap = {
//       blue: "text-blue-700 bg-blue-50 border-blue-200",
//       teal: "text-teal-700 bg-teal-50 border-teal-200",
//       orange: "text-orange-700 bg-orange-50 border-orange-200",
//       purple: "text-purple-700 bg-purple-50 border-purple-200",
//       indigo: "text-indigo-700 bg-indigo-50 border-indigo-200",
//     };
//     const color = ROLE_HIERARCHY[roleId]?.color || "gray";
//     return colorMap[color] || "text-gray-700 bg-gray-50 border-gray-200";
//   };

//   const handleDelete = (user) => {
//     if (!canManageUser(user)) {
//       toast.error("You don't have permission to delete this user.");
//       return;
//     }
//     toast(
//       (t) => (
//         <div className="flex flex-col items-center gap-4 p-4">
//           <p className="font-semibold text-center">
//             Are you sure you want to delete {user.name}?
//           </p>
//           <div className="flex gap-4">
//             <button
//               onClick={() => {
//                 toast.dismiss(t.id);
//                 performDelete(user.id);
//               }}
//               className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
//             >
//               Delete
//             </button>
//             <button
//               onClick={() => toast.dismiss(t.id)}
//               className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       ),
//       { duration: 6000 },
//     );
//   };

//   const performDelete = async (id) => {
//     const toastId = toast.loading("Deleting user...");
//     const response = await UsersApi.deleteUser(id);
//     if (response.success) {
//       toast.success("User deleted successfully!", { id: toastId });
//       fetchUsers();
//     } else {
//       toast.error(response.error || "Failed to delete user.", { id: toastId });
//     }
//   };

//   const stats = roleStats();

//   return (
//     <>
//       <Toaster position="top-center" reverseOrder={false} />
//       <div className="p-4 sm:p-6 md:p-8 bg-slate-50 min-h-screen">
//         <div className="max-w-7xl mx-auto">
//           {/* Header Card */}
//           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//               <div className="flex items-center gap-4">
//                 <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center">
//                   <Shield className="w-7 h-7 text-slate-700" />
//                 </div>
//                 <div>
//                   <h1 className="text-2xl font-bold text-slate-900">
//                     USER MANAGEMENT
//                   </h1>
//                   <p className="text-sm text-slate-500 uppercase tracking-wide mt-0.5">
//                     Manage all user roles and permissions
//                   </p>
//                 </div>
//               </div>
//               {canAddUser && (
//                 <a
//                   href={`/users/add?companyId=${companyId}`}
//                   className="inline-flex items-center gap-2 px-5 py-2.5 font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-md hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 cursor-pointer uppercase"
//                 >
//                   <Plus size={18} strokeWidth={2.5} />
//                   Add User
//                 </a>
//               )}
//             </div>
//           </div>

//           {/* Stats Cards Row */}
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 mb-6">
//             {/* Total Users Card */}
//             <button
//               onClick={() => setSelectedRole("all")}
//               className={`group relative overflow-hidden rounded-xl p-3 transition-all duration-200 ease-out cursor-pointer text-left border ${
//                 selectedRole === "all"
//                   ? "bg-gradient-to-br from-orange-500 to-orange-600 border-orange-700 text-white shadow-md"
//                   : "bg-white border-slate-200 text-slate-900 hover:border-orange-500 hover:shadow-sm"
//               }`}
//             >
//               <div className="relative z-10">
//                 <div className="flex items-center justify-between mb-1">
//                   <p
//                     className={`text-[10px] font-bold uppercase tracking-wider ${
//                       selectedRole === "all"
//                         ? "text-white opacity-90"
//                         : "text-slate-600"
//                     }`}
//                   >
//                     Total Users
//                   </p>
//                   <div
//                     className={`p-1 rounded ${
//                       selectedRole === "all" ? "bg-white/10" : "bg-slate-100"
//                     }`}
//                   >
//                     <Users
//                       className={`h-3.5 w-3.5 ${
//                         selectedRole === "all" ? "text-white" : "text-slate-500"
//                       }`}
//                     />
//                   </div>
//                 </div>
//                 <p
//                   className={`text-xl font-black ${
//                     selectedRole === "all" ? "text-white" : "text-slate-900"
//                   }`}
//                 >
//                   {users.length}
//                 </p>
//               </div>
//               {selectedRole === "all" && (
//                 <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-white/5 rounded-full"></div>
//               )}
//             </button>

//             {/* Admin */}
//             {stats[2] > 0 && (
//               <button
//                 onClick={() =>
//                   setSelectedRole(selectedRole === "2" ? "all" : "2")
//                 }
//                 className={`group relative overflow-hidden rounded-xl p-3 transition-all duration-200 ease-out cursor-pointer text-left border ${
//                   selectedRole === "2"
//                     ? "bg-gradient-to-br from-blue-500 to-blue-600 border-blue-700 text-white shadow-md"
//                     : "bg-white border-slate-200 text-slate-900 hover:border-blue-500 hover:shadow-sm"
//                 }`}
//               >
//                 <div className="relative z-10">
//                   <div className="flex items-center justify-between mb-1">
//                     <p
//                       className={`text-[10px] font-bold uppercase tracking-wider ${
//                         selectedRole === "2"
//                           ? "text-white opacity-90"
//                           : "text-slate-600"
//                       }`}
//                     >
//                       Admin
//                     </p>
//                     <div
//                       className={`p-1 rounded ${
//                         selectedRole === "2" ? "bg-white/10" : "bg-slate-100"
//                       }`}
//                     >
//                       <Shield
//                         className={`h-3.5 w-3.5 ${
//                           selectedRole === "2" ? "text-white" : "text-slate-500"
//                         }`}
//                       />
//                     </div>
//                   </div>
//                   <p
//                     className={`text-xl font-black ${
//                       selectedRole === "2" ? "text-white" : "text-slate-900"
//                     }`}
//                   >
//                     {stats[2]}
//                   </p>
//                 </div>
//                 {selectedRole === "2" && (
//                   <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-white/5 rounded-full"></div>
//                 )}
//               </button>
//             )}

//             {/* Supervisor */}
//             {stats[3] > 0 && (
//               <button
//                 onClick={() =>
//                   setSelectedRole(selectedRole === "3" ? "all" : "3")
//                 }
//                 className={`group relative overflow-hidden rounded-xl p-3 transition-all duration-200 ease-out cursor-pointer text-left border ${
//                   selectedRole === "3"
//                     ? "bg-gradient-to-br from-teal-500 to-teal-600 border-teal-700 text-white shadow-md"
//                     : "bg-white border-slate-200 text-slate-900 hover:border-teal-500 hover:shadow-sm"
//                 }`}
//               >
//                 <div className="relative z-10">
//                   <div className="flex items-center justify-between mb-1">
//                     <p
//                       className={`text-[10px] font-bold uppercase tracking-wider ${
//                         selectedRole === "3"
//                           ? "text-white opacity-90"
//                           : "text-slate-600"
//                       }`}
//                     >
//                       Supervisor
//                     </p>
//                     <div
//                       className={`p-1 rounded ${
//                         selectedRole === "3" ? "bg-white/10" : "bg-slate-100"
//                       }`}
//                     >
//                       <UserCog
//                         className={`h-3.5 w-3.5 ${
//                           selectedRole === "3" ? "text-white" : "text-slate-500"
//                         }`}
//                       />
//                     </div>
//                   </div>
//                   <p
//                     className={`text-xl font-black ${
//                       selectedRole === "3" ? "text-white" : "text-slate-900"
//                     }`}
//                   >
//                     {stats[3]}
//                   </p>
//                 </div>
//                 {selectedRole === "3" && (
//                   <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-white/5 rounded-full"></div>
//                 )}
//               </button>
//             )}

//             {/* Cleaner */}
//             {stats[5] > 0 && (
//               <button
//                 onClick={() =>
//                   setSelectedRole(selectedRole === "5" ? "all" : "5")
//                 }
//                 className={`group relative overflow-hidden rounded-xl p-3 transition-all duration-200 ease-out cursor-pointer text-left border ${
//                   selectedRole === "5"
//                     ? "bg-gradient-to-br from-amber-500 to-amber-600 border-amber-700 text-white shadow-md"
//                     : "bg-white border-slate-200 text-slate-900 hover:border-amber-500 hover:shadow-sm"
//                 }`}
//               >
//                 <div className="relative z-10">
//                   <div className="flex items-center justify-between mb-1">
//                     <p
//                       className={`text-[10px] font-bold uppercase tracking-wider ${
//                         selectedRole === "5"
//                           ? "text-white opacity-90"
//                           : "text-slate-600"
//                       }`}
//                     >
//                       Cleaner
//                     </p>
//                     <div
//                       className={`p-1 rounded ${
//                         selectedRole === "5" ? "bg-white/10" : "bg-slate-100"
//                       }`}
//                     >
//                       <Users
//                         className={`h-3.5 w-3.5 ${
//                           selectedRole === "5" ? "text-white" : "text-slate-500"
//                         }`}
//                       />
//                     </div>
//                   </div>
//                   <p
//                     className={`text-xl font-black ${
//                       selectedRole === "5" ? "text-white" : "text-slate-900"
//                     }`}
//                   >
//                     {stats[5]}
//                   </p>
//                 </div>
//                 {selectedRole === "5" && (
//                   <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-white/5 rounded-full"></div>
//                 )}
//               </button>
//             )}

//             {/* Zonal Admin */}
//             {stats[6] > 0 && (
//               <button
//                 onClick={() =>
//                   setSelectedRole(selectedRole === "6" ? "all" : "6")
//                 }
//                 className={`group relative overflow-hidden rounded-xl p-3 transition-all duration-200 ease-out cursor-pointer text-left border ${
//                   selectedRole === "6"
//                     ? "bg-gradient-to-br from-purple-500 to-purple-600 border-purple-700 text-white shadow-md"
//                     : "bg-white border-slate-200 text-slate-900 hover:border-purple-500 hover:shadow-sm"
//                 }`}
//               >
//                 <div className="relative z-10">
//                   <div className="flex items-center justify-between mb-1">
//                     <p
//                       className={`text-[10px] font-bold uppercase tracking-wider ${
//                         selectedRole === "6"
//                           ? "text-white opacity-90"
//                           : "text-slate-600"
//                       }`}
//                     >
//                       Zonal Admin
//                     </p>
//                     <div
//                       className={`p-1 rounded ${
//                         selectedRole === "6" ? "bg-white/10" : "bg-slate-100"
//                       }`}
//                     >
//                       <MapPin
//                         className={`h-3.5 w-3.5 ${
//                           selectedRole === "6" ? "text-white" : "text-slate-500"
//                         }`}
//                       />
//                     </div>
//                   </div>
//                   <p
//                     className={`text-xl font-black ${
//                       selectedRole === "6" ? "text-white" : "text-slate-900"
//                     }`}
//                   >
//                     {stats[6]}
//                   </p>
//                 </div>
//                 {selectedRole === "6" && (
//                   <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-white/5 rounded-full"></div>
//                 )}
//               </button>
//             )}

//             {/* Facility Supv */}
//             {stats[7] > 0 && (
//               <button
//                 onClick={() =>
//                   setSelectedRole(selectedRole === "7" ? "all" : "7")
//                 }
//                 className={`group relative overflow-hidden rounded-xl p-3 transition-all duration-200 ease-out cursor-pointer text-left border ${
//                   selectedRole === "7"
//                     ? "bg-gradient-to-br from-cyan-500 to-cyan-600 border-cyan-700 text-white shadow-md"
//                     : "bg-white border-slate-200 text-slate-900 hover:border-cyan-500 hover:shadow-sm"
//                 }`}
//               >
//                 <div className="relative z-10">
//                   <div className="flex items-center justify-between mb-1">
//                     <p
//                       className={`text-[10px] font-bold uppercase tracking-wider ${
//                         selectedRole === "7"
//                           ? "text-white opacity-90"
//                           : "text-slate-600"
//                       }`}
//                     >
//                       Facility Supv
//                     </p>
//                     <div
//                       className={`p-1 rounded ${
//                         selectedRole === "7" ? "bg-white/10" : "bg-slate-100"
//                       }`}
//                     >
//                       <Users
//                         className={`h-3.5 w-3.5 ${
//                           selectedRole === "7" ? "text-white" : "text-slate-500"
//                         }`}
//                       />
//                     </div>
//                   </div>
//                   <p
//                     className={`text-xl font-black ${
//                       selectedRole === "7" ? "text-white" : "text-slate-900"
//                     }`}
//                   >
//                     {stats[7]}
//                   </p>
//                 </div>
//                 {selectedRole === "7" && (
//                   <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-white/5 rounded-full"></div>
//                 )}
//               </button>
//             )}

//             {/* Facility Admin */}
//             {stats[8] > 0 && (
//               <button
//                 onClick={() =>
//                   setSelectedRole(selectedRole === "8" ? "all" : "8")
//                 }
//                 className={`group relative overflow-hidden rounded-xl p-3 transition-all duration-200 ease-out cursor-pointer text-left border ${
//                   selectedRole === "8"
//                     ? "bg-gradient-to-br from-indigo-500 to-indigo-600 border-indigo-700 text-white shadow-md"
//                     : "bg-white border-slate-200 text-slate-900 hover:border-indigo-500 hover:shadow-sm"
//                 }`}
//               >
//                 <div className="relative z-10">
//                   <div className="flex items-center justify-between mb-1">
//                     <p
//                       className={`text-[10px] font-bold uppercase tracking-wider ${
//                         selectedRole === "8"
//                           ? "text-white opacity-90"
//                           : "text-slate-600"
//                       }`}
//                     >
//                       Facility Admin
//                     </p>
//                     <div
//                       className={`p-1 rounded ${
//                         selectedRole === "8" ? "bg-white/10" : "bg-slate-100"
//                       }`}
//                     >
//                       <Building2
//                         className={`h-3.5 w-3.5 ${
//                           selectedRole === "8" ? "text-white" : "text-slate-500"
//                         }`}
//                       />
//                     </div>
//                   </div>
//                   <p
//                     className={`text-xl font-black ${
//                       selectedRole === "8" ? "text-white" : "text-slate-900"
//                     }`}
//                   >
//                     {stats[8]}
//                   </p>
//                 </div>
//                 {selectedRole === "8" && (
//                   <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-white/5 rounded-full"></div>
//                 )}
//               </button>
//             )}
//           </div>

//           {/* Search Bar */}
//           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
//             <div className="relative">
//               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
//               <input
//                 type="text"
//                 placeholder="SEARCH T"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-12 pr-4 py-3 text-sm border-0 focus:ring-0 focus:outline-none placeholder:text-slate-400 placeholder:font-medium"
//               />
//             </div>
//           </div>

//           {/* Filter Pills */}
//           <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
//             <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 uppercase tracking-wide">
//               <Filter size={16} />
//               <span>Filter:</span>
//             </div>
//             <button
//               onClick={() => setSelectedRole("all")}
//               className={`px-4 py-2 rounded-lg font-semibold text-xs uppercase tracking-wide transition-all duration-200 whitespace-nowrap ${
//                 selectedRole === "all"
//                   ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
//                   : "bg-slate-200 text-slate-700 hover:bg-slate-300"
//               }`}
//             >
//               All Users
//             </button>
//             {Object.entries(ROLE_HIERARCHY).map(([roleId, roleData]) => {
//               const count = stats[roleId] || 0;
//               if (count === 0) return null;

//               return (
//                 <button
//                   key={roleId}
//                   onClick={() => setSelectedRole(roleId)}
//                   className={`px-4 py-2 rounded-lg font-semibold text-xs uppercase tracking-wide transition-all duration-200 whitespace-nowrap ${
//                     selectedRole === roleId
//                       ? `bg-slate-700 text-white shadow-md`
//                       : `bg-slate-200 text-slate-700 hover:bg-slate-300`
//                   }`}
//                 >
//                   {roleData.name}s {count}
//                 </button>
//               );
//             })}
//           </div>

//           {/* Table - Desktop */}
//           <div className="hidden md:block">
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//               <table className="w-full">
//                 <thead>
//                   <tr className="border-b border-slate-200 bg-slate-50">
//                     <th className="text-left p-4 text-xs font-bold text-slate-700 uppercase tracking-wide">
//                       Staff Member
//                     </th>
//                     <th className="text-left p-4 text-xs font-bold text-slate-700 uppercase tracking-wide">
//                       Contact Info
//                     </th>
//                     <th className="text-left p-4 text-xs font-bold text-slate-700 uppercase tracking-wide">
//                       Permission Level
//                     </th>
//                     <th className="text-left p-4 text-xs font-bold text-slate-700 uppercase tracking-wide">
//                       Action
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {isLoading ? (
//                     Array.from({ length: 5 }).map((_, i) => (
//                       <TableRowSkeleton key={i} />
//                     ))
//                   ) : filteredUsers.length > 0 ? (
//                     filteredUsers.map((user, index) => (
//                       <tr
//                         key={user.id}
//                         className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
//                       >
//                         <td className="p-4">
//                           <div className="flex items-center gap-3">
//                             <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm">
//                               {user.name.charAt(0).toUpperCase()}
//                             </div>
//                             <div>
//                               <div className="font-semibold text-slate-900">
//                                 {user.name}
//                               </div>
//                               <div className="text-xs text-slate-500">
//                                 ID: #{user.id}
//                               </div>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="p-4">
//                           <div className="text-sm text-slate-900">
//                             {user.email || "N/A"}
//                           </div>
//                           <div className="text-xs text-slate-500">
//                             {user.phone || "N/A"}
//                           </div>
//                         </td>
//                         <td className="p-4">
//                           <span
//                             className={`inline-flex px-3 py-1 text-xs font-bold uppercase tracking-wide rounded border ${getRoleColorClass(user)}`}
//                           >
//                             {getRoleDisplayName(user)}
//                           </span>
//                         </td>
//                         <td className="p-4">
//                           <div className="flex items-center gap-2">
//                             <button
//                               onClick={() =>
//                                 router.push(
//                                   `/users/${user.id}?companyId=${companyId}`,
//                                 )
//                               }
//                               className="p-2 cursor-pointer text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
//                               title="View"
//                             >
//                               <Eye size={18} />
//                             </button>
//                             {canManageUser(user) && canEditUser && (
//                               <button
//                                 onClick={() =>
//                                   router.push(
//                                     `/users/${user.id}/edit?companyId=${companyId}`,
//                                   )
//                                 }
//                                 className="p-2 cursor-pointer text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
//                                 title="Edit"
//                               >
//                                 <Edit size={18} />
//                               </button>
//                             )}
//                             {canManageUser(user) && canDeleteUser && (
//                               <button
//                                 onClick={() => handleDelete(user)}
//                                 className="p-2 cursor-pointer text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                                 title="Delete"
//                               >
//                                 <Trash2 size={18} />
//                               </button>
//                             )}
//                           </div>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td
//                         colSpan="4"
//                         className="text-center py-12 text-slate-500"
//                       >
//                         <div className="flex flex-col items-center gap-3">
//                           <Users className="w-12 h-12 text-slate-300" />
//                           <p className="font-semibold text-slate-700">
//                             No users found
//                           </p>
//                         </div>
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Footer */}
//             <div className="mt-4 text-center text-sm text-slate-500">
//               Showing{" "}
//               <span className="font-semibold">{filteredUsers.length}</span> of{" "}
//               <span className="font-semibold">{users.length}</span> users
//             </div>
//           </div>

//           {/* Mobile Card View */}
//           <div className="block md:hidden">
//             {isLoading ? (
//               Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
//             ) : filteredUsers.length > 0 ? (
//               filteredUsers.map((user) => (
//                 <div
//                   key={user.id}
//                   className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4"
//                 >
//                   <div className="flex items-start gap-3 mb-3">
//                     <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold">
//                       {user.name.charAt(0).toUpperCase()}
//                     </div>
//                     <div className="flex-1">
//                       <div className="font-semibold text-slate-900">
//                         {user.name}
//                       </div>
//                       <div className="text-xs text-slate-500">
//                         ID: #{user.id}
//                       </div>
//                       <span
//                         className={`inline-flex mt-2 px-2.5 py-1 text-xs font-bold uppercase tracking-wide rounded border ${getRoleColorClass(user)}`}
//                       >
//                         {getRoleDisplayName(user)}
//                       </span>
//                     </div>
//                   </div>
//                   <div className="text-sm text-slate-900 mb-1">
//                     {user.email || "N/A"}
//                   </div>
//                   <div className="text-xs text-slate-500 mb-3">
//                     {user.phone || "N/A"}
//                   </div>
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() =>
//                         router.push(
//                           `/users/view/${user.id}?companyId=${companyId}`,
//                         )
//                       }
//                       className="flex-1 p-2 cursor-pointer text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
//                     >
//                       <Eye size={16} />
//                       View
//                     </button>
//                     {canManageUser(user) && canEditUser && (
//                       <button
//                         onClick={() =>
//                           router.push(
//                             `/users/${user.id}?companyId=${companyId}`,
//                           )
//                         }
//                         className="flex-1 cursor-pointer p-2 text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
//                       >
//                         <Edit size={16} />
//                         Edit
//                       </button>
//                     )}
//                     {canManageUser(user) && canDeleteUser && (
//                       <button
//                         onClick={() => handleDelete(user)}
//                         className="cursor-pointer p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
//                       >
//                         <Trash2 size={16} />
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
//                 <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
//                 <p className="font-semibold text-slate-700">No users found</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Search,
  Eye,
  Shield,
  UserCog,
  HardHat,
  MapPin,
  Building2,
  LayoutGrid,
  List,
} from "lucide-react";
import { UsersApi } from "@/features/users/users.api";
import { useRouter } from "next/navigation";

import { useCompanyId } from "@/providers/CompanyProvider";
import { usePermissions } from "@/shared/hooks/usePermission";
import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { MODULES } from "@/shared/constants/permissions";

// 1. Updated Hierarchy with Color Classes
const ROLE_HIERARCHY = {
  2: {
    name: "Admin",
    level: 2,
    icon: Shield,
    color: "blue",
    // Light mode active state
    activeClass:
      "bg-gradient-to-br from-blue-500 to-blue-600 border-blue-600 text-white shadow-blue-200",
    iconColor: "text-blue-100",
  },
  3: {
    name: "Supervisor",
    level: 4,
    icon: UserCog,
    color: "teal",
    activeClass:
      "bg-gradient-to-br from-teal-500 to-teal-600 border-teal-600 text-white shadow-teal-200",
    iconColor: "text-teal-100",
  },
  5: {
    name: "Cleaner",
    level: 5,
    icon: HardHat,
    color: "orange",
    activeClass:
      "bg-gradient-to-br from-orange-500 to-orange-600 border-orange-600 text-white shadow-orange-200",
    iconColor: "text-orange-100",
  },
  6: {
    name: "Zonal Admin",
    level: 3,
    icon: MapPin,
    color: "purple",
    activeClass:
      "bg-gradient-to-br from-purple-500 to-purple-600 border-purple-600 text-white shadow-purple-200",
    iconColor: "text-purple-100",
  },
  7: {
    name: "Facility Supv",
    level: 4,
    icon: Users,
    color: "cyan", // Changed to cyan for differentiation
    activeClass:
      "bg-gradient-to-br from-cyan-500 to-cyan-600 border-cyan-600 text-white shadow-cyan-200",
    iconColor: "text-cyan-100",
  },
  8: {
    name: "Facility Admin",
    level: 3,
    icon: Building2,
    color: "indigo",
    activeClass:
      "bg-gradient-to-br from-indigo-500 to-indigo-600 border-indigo-600 text-white shadow-indigo-200",
    iconColor: "text-indigo-100",
  },
};

const TableRowSkeleton = () => (
  <tr className="animate-pulse border-b border-slate-100 dark:border-slate-800">
    {[...Array(4)].map((_, i) => (
      <td key={i} className="p-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
      </td>
    ))}
  </tr>
);

const CardSkeleton = () => (
  <div className="animate-pulse p-4 bg-white dark:bg-slate-800 rounded-2xl shadow border border-slate-200 dark:border-slate-700">
    <div className="flex gap-4 items-center mb-4">
      <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-full" />
      <div className="flex-1">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-2" />
        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-1/3" />
      </div>
    </div>
    <div className="h-8 bg-slate-100 dark:bg-slate-700 rounded w-full mt-4" />
  </div>
);

export default function UsersPage() {
  useRequirePermission(MODULES.USERS);

  const { canAdd, canUpdate, canDelete } = usePermissions();
  const canAddUser = canAdd(MODULES.USERS);
  const canEditUser = canUpdate(MODULES.USERS);
  const canDeleteUser = canDelete(MODULES.USERS);

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState("all");
  const [viewMode, setViewMode] = useState("table");


  useEffect(() => {
    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth < 768; // md breakpoint
      if (isMobile) {
        setViewMode("grid");
      }
    }
  }, []);
  
  const currentUser = useSelector((state) => state.auth.user);
  const { companyId } = useCompanyId();
  const router = useRouter();

  const currentUserRoleId = parseInt(currentUser?.role_id || 4);

  // --- Logic Helpers ---

  const roleStats = useCallback(() => {
    const stats = {};
    Object.keys(ROLE_HIERARCHY).forEach((roleId) => {
      stats[roleId] = users.filter(
        (u) => parseInt(u.role_id || u.role?.id) === parseInt(roleId),
      ).length;
    });
    return stats;
  }, [users]);

  const filterUsersByRole = useCallback(
    (allUsers) => {
      if (!currentUser || !currentUser.role_id) return allUsers;

      return allUsers.filter((user) => {
        const userRoleId = parseInt(user.role_id || user.role?.id, 10);
        if (userRoleId === 1 || userRoleId === 4) return false;
        if (!ROLE_HIERARCHY[userRoleId]) return false;
        if (currentUserRoleId === 1) return true;
        if (currentUserRoleId === 2) return true;

        const userRoleLevel = ROLE_HIERARCHY[userRoleId]?.level || 999;
        const currentUserRoleLevel =
          ROLE_HIERARCHY[currentUserRoleId]?.level || 999;
        return userRoleLevel >= currentUserRoleLevel;
      });
    },
    [currentUser, currentUserRoleId],
  );

  const filterUsersBySearch = useCallback((allUsers, term) => {
    if (!term) return allUsers;
    return allUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(term.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(term.toLowerCase())) ||
        (user.phone && user.phone.includes(term)),
    );
  }, []);

  const fetchUsers = useCallback(async () => {
    if (!companyId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await UsersApi.getAllUsers(companyId);
      if (response.success) {
        const roleFilteredUsers = filterUsersByRole(response.data);
        setUsers(roleFilteredUsers);
        applyFilters(roleFilteredUsers, searchTerm, selectedRole);
      } else {
        toast.error(response.error || "Failed to fetch users.");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users.");
    }
    setIsLoading(false);
  }, [companyId, filterUsersByRole, searchTerm, selectedRole]);

  const applyFilters = useCallback(
    (userList, search, role) => {
      let filtered = [...userList];

      if (role !== "all") {
        filtered = filtered.filter(
          (u) => parseInt(u.role_id || u.role?.id) === parseInt(role),
        );
      }

      filtered = filterUsersBySearch(filtered, search);
      setFilteredUsers(filtered);
    },
    [filterUsersBySearch],
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    applyFilters(users, searchTerm, selectedRole);
  }, [searchTerm, selectedRole, users, applyFilters]);

  // --- UI Helpers ---

  const canManageUser = (targetUser) => {
    if (currentUserRoleId === 1) return true;
    const targetUserRoleId = parseInt(
      targetUser.role_id || targetUser.role?.id || 4,
    );
    const targetUserRoleLevel = ROLE_HIERARCHY[targetUserRoleId]?.level || 999;
    const currentUserRoleLevel =
      ROLE_HIERARCHY[currentUserRoleId]?.level || 999;
    return targetUserRoleLevel >= currentUserRoleLevel;
  };

  const getRoleDisplayName = (user) => {
    const roleId = parseInt(user.role_id || user.role?.id || 4);
    return ROLE_HIERARCHY[roleId]?.name || user.role?.name || "Unknown Role";
  };

  const getRoleColorClass = (user) => {
    const roleId = parseInt(user.role_id || user.role?.id || 4);
    const colorMap = {
      blue: "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700",
      teal: "text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-700",
      orange:
        "text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700",
      purple:
        "text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700",
      indigo:
        "text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700",
      cyan: "text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-900/30 border-cyan-200 dark:border-cyan-700",
    };
    const color = ROLE_HIERARCHY[roleId]?.color || "gray";
    return (
      colorMap[color] ||
      "text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600"
    );
  };

  const handleDelete = (user) => {
    if (!canManageUser(user)) {
      toast.error("You don't have permission to delete this user.");
      return;
    }
    toast(
      (t) => (
        <div className="flex flex-col items-center gap-4 p-4 dark:text-slate-200">
          <p className="font-semibold text-center">
            Are you sure you want to delete {user.name}?
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                performDelete(user.id);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 dark:bg-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 6000, className: "dark:bg-slate-800 dark:text-white" },
    );
  };

  const performDelete = async (id) => {
    const toastId = toast.loading("Deleting user...");
    const response = await UsersApi.deleteUser(id);
    if (response.success) {
      toast.success("User deleted successfully!", { id: toastId });
      fetchUsers();
    } else {
      toast.error(response.error || "Failed to delete user.", { id: toastId });
    }
  };

  const stats = roleStats();

  // --- Render Components ---

  const UserCard = ({ user }) => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-all duration-300 group cursor-pointer relative overflow-hidden">
      {/* Top Line Hover Effect (restored) */}
      <div className="absolute top-0 left-0 w-full h-1 bg-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
              {user.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ID: #{user.id}
            </p>
          </div>
        </div>

        {/* Role Badge */}
        <span
          className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${getRoleColorClass(user)}`}
        >
          {getRoleDisplayName(user)}
        </span>
      </div>

      <div className="space-y-2 mb-5">
        <div className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <div className="w-8 text-xs font-semibold uppercase text-slate-400">
            Email
          </div>
          <span className="truncate">{user.email || "N/A"}</span>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <div className="w-8 text-xs font-semibold uppercase text-slate-400">
            Phone
          </div>
          <span>{user.phone || "N/A"}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() =>
            router.push(`/users/view/${user.id}?companyId=${companyId}`)
          }
          className="flex-1 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-xs hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 transition-colors flex items-center justify-center gap-2"
        >
          <Eye size={14} /> View
        </button>

        {canManageUser(user) && (
          <div className="flex gap-2">
            {canEditUser && (
              <button
                onClick={() =>
                  router.push(`/users/${user.id}/edit?companyId=${companyId}`)
                }
                className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors"
                title="Edit"
              >
                <Edit size={16} />
              </button>
            )}
            {canDeleteUser && (
              <button
                onClick={() => handleDelete(user)}
                className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0E14] transition-colors duration-300 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center border border-orange-100 dark:border-orange-800/50">
                  <Shield className="w-7 h-7 text-orange-600 dark:text-orange-500" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    USER MANAGEMENT
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                    Manage roles, permissions, and staff access
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {canAddUser && (
                  <a
                    href={`/users/add?companyId=${companyId}`}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all duration-200 active:scale-95"
                  >
                    <Plus size={18} strokeWidth={3} />
                    ADD NEW USER
                  </a>
                )}

                <a
                  href={`/userMapping?companyId=${companyId}`}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all duration-200 active:scale-95"
                >
                  <Plus size={18} strokeWidth={3} />
                  Assign
                </a>
              </div>

            </div>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
            {/* Total Users Card */}
            <button
              onClick={() => setSelectedRole("all")}
              className={`group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 cursor-pointer text-left border ${selectedRole === "all"
                ? "bg-slate-800 dark:bg-slate-700 border-slate-700 text-white shadow-md ring-2 ring-slate-700 dark:ring-slate-600"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-sm"
                }`}
            >
              <div className="flex justify-between items-start mb-2">
                <Users
                  className={`w-5 h-5 ${selectedRole === "all" ? "text-orange-400" : "text-slate-400"}`}
                />
                {selectedRole === "all" && (
                  <div className="h-2 w-2 rounded-full bg-orange-400" />
                )}
              </div>
              <p className="text-2xl font-black">{users.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                Total Users
              </p>
            </button>

            {/* Dynamic Role Cards */}
            {Object.entries(ROLE_HIERARCHY).map(([roleId, roleData]) => {
              if ((stats[roleId] || 0) === 0) return null;
              const Icon = roleData.icon;
              const isSelected = selectedRole === roleId;

              // Apply specific role color in Light Mode, default to dark in Dark Mode
              const activeClasses = isSelected
                ? `${roleData.activeClass} dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:from-transparent dark:to-transparent`
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-sm";

              return (
                <button
                  key={roleId}
                  onClick={() => setSelectedRole(isSelected ? "all" : roleId)}
                  className={`group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 cursor-pointer text-left border ${activeClasses}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <Icon
                      className={`w-5 h-5 ${isSelected ? "text-white dark:text-orange-400" : "text-slate-400"}`}
                    />
                    {isSelected && (
                      <div className="h-2 w-2 rounded-full bg-white/40 dark:bg-orange-400" />
                    )}
                  </div>
                  <p className="text-2xl font-black">{stats[roleId]}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-90 truncate">
                    {roleData.name}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Filters & Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>

            {/* View Toggle */}
            <div className="flex p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shrink-0">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2.5 rounded-lg transition-all ${viewMode === "table"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  } hidden md:block`}
                title="List View"
              >
                <List size={20} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 rounded-lg transition-all ${viewMode === "grid"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                title="Grid View"
              >
                <LayoutGrid size={20} />
              </button>
            </div>
          </div>

          {/* Content Area */}
          {isLoading ? (
            <div
              className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
            >
              {viewMode === "grid" ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <table className="w-full">
                    <tbody>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <TableRowSkeleton key={i} />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : filteredUsers.length > 0 ? (
            <>
              {/* Grid View (Visible on Mobile OR when toggled) */}
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${viewMode === "table" ? "hidden md:hidden" : ""}`}
              >
                {filteredUsers.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>

              {/* Table View (Desktop Only) */}
              {viewMode === "table" && (
                <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-left">
                        <th className="p-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Staff Member
                        </th>
                        <th className="p-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Contact Info
                        </th>
                        <th className="p-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Permission Level
                        </th>
                        <th className="p-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredUsers.map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                        >
                          <td className="p-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-sm border border-slate-200 dark:border-slate-700">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-slate-100">
                                  {user.name}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-500">
                                  ID: #{user.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                              {user.email || "N/A"}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                              {user.phone || "N/A"}
                            </div>
                          </td>
                          <td className="p-5">
                            <span
                              className={`inline-flex px-3 py-1 text-xs font-bold uppercase tracking-wide rounded border ${getRoleColorClass(user)}`}
                            >
                              {getRoleDisplayName(user)}
                            </span>
                          </td>
                          <td className="p-5 text-right">
                            <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() =>
                                  router.push(
                                    `/users/view/${user.id}?companyId=${companyId}`,
                                  )
                                }
                                className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-orange-500 hover:border-orange-200 transition-all shadow-sm"
                              >
                                <Eye size={16} />
                              </button>
                              {canManageUser(user) && (
                                <>
                                  {canEditUser && (
                                    <button
                                      onClick={() =>
                                        router.push(
                                          `/users/${user.id}/edit?companyId=${companyId}`,
                                        )
                                      }
                                      className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                                    >
                                      <Edit size={16} />
                                    </button>
                                  )}
                                  {canDeleteUser && (
                                    <button
                                      onClick={() => handleDelete(user)}
                                      className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                No users found
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Try adjusting your filters or search terms.
              </p>
            </div>
          )}

          {/* Footer Count */}
          {!isLoading && filteredUsers.length > 0 && (
            <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
              Showing{" "}
              <span className="text-slate-900 dark:text-white font-bold">
                {filteredUsers.length}
              </span>{" "}
              of{" "}
              <span className="text-slate-900 dark:text-white font-bold">
                {users.length}
              </span>{" "}
              staff members
            </div>
          )}
        </div>
      </div>
    </>
  );
}
