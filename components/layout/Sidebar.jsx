// version 1
// // src/components/Sidebar.jsx
// "use client";

// import React, { useState, useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { useRouter, usePathname } from "next/navigation";
// import { logout } from "@/features/auth/auth.slice";
// import {
//   Activity,
//   BarChart3,
//   Layers3,
//   ListChecks,
//   LogOut,
//   Map,
//   MapPin,
//   Menu,
//   MenuSquare,
//   MessageSquare,
//   Plus,
//   X,
//   Users,
//   Wrench,
//   Settings,
//   ChevronRight,
//   ChevronLeft,
//   ChevronUp,
//   Building,
//   ChevronDown,
// } from "lucide-react";
// import Link from "next/link";
// import {
//   getSuperadminMainMenu,
//   getSuperadminCompanyMenu,
//   getAdminMenu,
//   getFullCompanyMenuTemplate,
// } from "@/shared/config/menuConfig";
// import { filterMenuByPermissions } from "@/shared/utils/menuFilter";
// import { useCompanyId } from "@/providers/CompanyProvider";

// const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
//   const [openDropdowns, setOpenDropdowns] = useState({});
//   const [isMobile, setIsMobile] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);

//   const { user } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const pathname = usePathname();

//   const { companyId, hasCompanyContext } = useCompanyId();

//   const getMenuItems = () => {
//     // CASE 1: Superadmin on main dashboard (no company context)
//     if (user?.role_id === 1 && !hasCompanyContext) {
//       return getSuperadminMainMenu();
//     }

//     // CASE 2: Superadmin inside company
//     if (user?.role_id === 1 && hasCompanyContext) {
//       return getSuperadminCompanyMenu(companyId);
//     }

//     // CASE 3: Company Admin (role_id: 2)
//     if (user?.role_id === 2 && hasCompanyContext) {
//       return getAdminMenu(companyId);
//     }

//     // CASE 4: Other roles (permission-based filtering)
//     if (hasCompanyContext && user?.role?.permissions) {
//       const menuTemplate = getFullCompanyMenuTemplate(companyId);
//       const filteredMenu = filterMenuByPermissions(
//         menuTemplate,
//         user.role.permissions,
//       );

//       // ✅ FIX: Always add Dashboard link at the top for other roles
//       const dashboardItem = {
//         icon: Building, // Import this from lucide-react
//         label: "Dashboard",
//         href: `/clientDashboard/${companyId}`,
//         hasDropdown: false,
//       };

//       // Check if Dashboard already exists in filtered menu
//       const hasDashboard = filteredMenu.some(
//         (item) => item.href === `/clientDashboard/${companyId}`,
//       );

//       // If Dashboard not in filtered menu, add it at the beginning
//       if (!hasDashboard) {
//         return [dashboardItem, ...filteredMenu];
//       }

//       return filteredMenu;
//     }

//     // Fallback: Empty menu
//     return [];
//   };
//   const menuItems = getMenuItems();

//   // ✅ Route Active Check
//   const isRouteActive = (href) => {
//     if (!href) return false;
//     if (href === "/dashboard" && pathname === "/dashboard") return true;
//     if (
//       href.startsWith("/clientDashboard/") &&
//       pathname.startsWith("/clientDashboard/")
//     )
//       return true;
//     const [basePath] = href.split("?");
//     return pathname.startsWith(basePath);
//   };

//   // ✅ Dropdown Active Check
//   const isDropdownActive = (children) => {
//     if (!children) return false;
//     return children.some((child) => isRouteActive(child.href));
//   };

//   // ✅ Auto-open active dropdowns
//   useEffect(() => {
//     const newOpenDropdowns = {};

//     menuItems.forEach((item) => {
//       if (item.hasDropdown && item.children) {
//         const isActive = isDropdownActive(item.children);
//         if (isActive) {
//           newOpenDropdowns[item.key] = true;
//         }
//       }
//     });

//     setOpenDropdowns((prev) => ({ ...prev, ...newOpenDropdowns }));
//   }, [pathname, companyId]);

//   // ✅ Mobile Detection
//   useEffect(() => {
//     const checkMobile = () => {
//       const mobile = window.innerWidth < 1024;
//       setIsMobile(mobile);
//       if (mobile) setSidebarOpen(false);
//     };
//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, [setSidebarOpen]);

//   // ✅ Toggle Sidebar
//   const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

//   // ✅ Toggle Dropdown
//   const toggleDropdown = (key) => {
//     if (!sidebarOpen && !isHovered) {
//       setSidebarOpen(true);
//       setTimeout(() => {
//         setOpenDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
//       }, 150);
//     } else {
//       setOpenDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
//     }
//   };

//   // ✅ Logout
//   const handleLogout = () => {
//     dispatch(logout());
//     router.push("/login");
//   };

//   // ✅ Hover Handlers (Desktop Only)
//   const handleMouseEnter = () => {
//     if (!isMobile) {
//       setIsHovered(true);
//       setSidebarOpen(true);
//     }
//   };

//   const handleMouseLeave = () => {
//     if (!isMobile) {
//       setIsHovered(false);
//       setSidebarOpen(false);
//     }
//   };

//   // ✅ CSS Classes
//   const commonLinkClasses =
//     "flex items-center px-3 py-3 rounded-md cursor-pointer relative overflow-hidden transition-all duration-200";

//   const getActiveLinkClasses = (href, isChild = false) => {
//     const isActive = isRouteActive(href);

//     if (isActive) {
//       return `${commonLinkClasses} ${
//         isChild
//           ? "bg-slate-700 text-white border-l-2 border-indigo-500"
//           : "bg-indigo-600 text-white shadow-lg"
//       }`;
//     }

//     return `${commonLinkClasses} ${
//       isChild
//         ? "text-gray-400 hover:bg-slate-700 hover:text-white"
//         : "text-gray-300 hover:bg-indigo-600 hover:text-white"
//     }`;
//   };

//   const getDropdownButtonClasses = (item) => {
//     const isActive = isDropdownActive(item.children);
//     const isOpen = openDropdowns[item.key];

//     if (isActive) {
//       return `${commonLinkClasses} bg-slate-800 text-white border-l-2 border-indigo-500`;
//     }

//     if (isOpen) {
//       return `${commonLinkClasses} bg-slate-800 text-white`;
//     }

//     return `${commonLinkClasses} text-gray-300 hover:bg-indigo-600 hover:text-white`;
//   };

//   return (
//     <>
//       {/* Mobile Toggle Button */}
//       {isMobile && (
//         <button
//           onClick={toggleSidebar}
//           className="fixed top-2 left-4 z-[60] p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg lg:hidden transition-all duration-200"
//         >
//           {sidebarOpen ? <X size={20} /> : <Menu size={15} />}
//         </button>
//       )}

//       {/* Sidebar */}
//       <div
//         onMouseEnter={handleMouseEnter}
//         onMouseLeave={handleMouseLeave}
//         className={`fixed lg:static top-0 left-0 h-full flex flex-col bg-slate-900 text-gray-200 shadow-2xl transition-all duration-300 ease-in-out z-50
//           ${sidebarOpen ? "w-64" : "w-16"}
//           ${isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"}
//         `}
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800 min-h-[60px]">
//           {sidebarOpen && (
//             <h1 className="text-lg font-semibold text-white tracking-wide transition-opacity duration-300">
//               Dashboard
//             </h1>
//           )}
//           {!isMobile && (
//             <button
//               onClick={toggleSidebar}
//               className="p-2 rounded-lg hover:bg-slate-700 transition-all duration-200"
//             >
//               {sidebarOpen ? (
//                 <ChevronLeft
//                   size={20}
//                   className="text-gray-300 cursor-pointer"
//                 />
//               ) : (
//                 <ChevronRight
//                   size={20}
//                   className="text-gray-300 cursor-pointer"
//                 />
//               )}
//             </button>
//           )}
//         </div>

//         {/* Navigation */}
//         <nav
//           className="flex-1 overflow-y-auto p-3 mt-2"
//           style={{
//             scrollbarWidth: "none",
//             msOverflowStyle: "none",
//           }}
//         >
//           <style jsx>{`
//             nav::-webkit-scrollbar {
//               display: none;
//             }
//           `}</style>

//           <ul className="space-y-1">
//             {menuItems.map((item, index) => {
//               const IconComponent = item.icon;
//               const isDropdownOpen = openDropdowns[item.key];

//               // ✅ Dropdown Menu
//               if (item.hasDropdown) {
//                 return (
//                   <li key={index} className="group">
//                     <button
//                       onClick={() => toggleDropdown(item.key)}
//                       className={`${getDropdownButtonClasses(item)} w-full ${
//                         !sidebarOpen ? "justify-center" : ""
//                       }`}
//                     >
//                       <IconComponent size={20} className="flex-shrink-0" />
//                       {sidebarOpen && (
//                         <>
//                           <span className="ml-3 font-medium flex-1 text-left">
//                             {item.label}
//                           </span>
//                           <div className="ml-auto">
//                             {isDropdownOpen ? (
//                               <ChevronUp size={16} />
//                             ) : (
//                               <ChevronDown size={16} />
//                             )}
//                           </div>
//                         </>
//                       )}
//                       {!sidebarOpen && (
//                         <div className="absolute left-16 bg-slate-800 text-white px-2 py-1 rounded-md text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50">
//                           {item.label}
//                         </div>
//                       )}
//                     </button>
//                     {sidebarOpen && (
//                       <div
//                         className={`overflow-hidden transition-all duration-300 ease-in-out ${
//                           isDropdownOpen ? "max-h-60" : "max-h-0"
//                         }`}
//                       >
//                         <ul className="ml-6 mt-1 space-y-1 border-l border-slate-700 pl-3">
//                           {item.children?.map((child, childIndex) => {
//                             const ChildIcon = child.icon;
//                             return (
//                               <li key={childIndex}>
//                                 <Link
//                                   href={child.href}
//                                   onClick={() => {
//                                     if (isMobile) setSidebarOpen(false);
//                                   }}
//                                   className={`w-full flex items-center px-2 py-2 rounded-md transition-all duration-200 text-sm ${getActiveLinkClasses(
//                                     child.href,
//                                     true,
//                                   )}`}
//                                 >
//                                   <ChildIcon
//                                     size={16}
//                                     className="flex-shrink-0"
//                                   />
//                                   <span className="ml-2">{child.label}</span>
//                                 </Link>
//                               </li>
//                             );
//                           })}
//                         </ul>
//                       </div>
//                     )}
//                   </li>
//                 );
//               }

//               // ✅ Regular Menu Items (Direct Links)
//               return (
//                 <li key={index} className="group">
//                   <Link
//                     href={item.href}
//                     onClick={() => {
//                       if (isMobile) setSidebarOpen(false);
//                     }}
//                     className={`${getActiveLinkClasses(item.href)} ${
//                       !sidebarOpen ? "justify-center" : ""
//                     }`}
//                   >
//                     <IconComponent size={20} className="flex-shrink-0" />
//                     {sidebarOpen && (
//                       <span className="ml-3 font-medium">{item.label}</span>
//                     )}
//                     {!sidebarOpen && (
//                       <div className="absolute left-16 bg-slate-800 text-white px-2 py-1 rounded-md text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50">
//                         {item.label}
//                       </div>
//                     )}
//                   </Link>
//                 </li>
//               );
//             })}
//           </ul>
//         </nav>

//         {/* Footer - Logout */}
//         <div className="border-t border-slate-700 bg-slate-800">
//           <div className="p-4">
//             <button
//               onClick={handleLogout}
//               className={`cursor-pointer w-full flex items-center px-3 py-2 rounded-md text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200
//                 ${!sidebarOpen ? "justify-center" : ""}
//               `}
//             >
//               <LogOut size={20} />
//               {sidebarOpen && <span className="ml-3 font-medium">Logout</span>}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Mobile Overlay */}
//       {sidebarOpen && isMobile && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-40"
//           onClick={toggleSidebar}
//         />
//       )}
//     </>
//   );
// };

// export default Sidebar;

//version 2
// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { useRouter, usePathname } from "next/navigation";
// import { logout } from "@/features/auth/auth.slice";
// import {
//   ChevronLeft,
//   ChevronRight,
//   ChevronDown,
//   ChevronUp,
//   LogOut,
//   Menu,
//   X,
//   Building,
//   Users,
//   MapPin,
//   Activity,
//   MessageSquare,
//   MenuSquare,
//   Layers3,
//   Wrench,
//   Settings,
// } from "lucide-react";
// import Link from "next/link";
// import {
//   getSuperadminMainMenu,
//   getSuperadminCompanyMenu,
//   getAdminMenu,
//   getFullCompanyMenuTemplate,
// } from "@/shared/config/menuConfig";
// import { filterMenuByPermissions } from "@/shared/utils/menuFilter";
// import { useCompanyId } from "@/providers/CompanyProvider";
// import Image from "next/image";

// const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
//   const [openDropdowns, setOpenDropdowns] = useState({});
//   const [isMobile, setIsMobile] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);
//   const [collapsed, setCollapsed] = useState(false);

//   const { user } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const pathname = usePathname();
//   const { companyId, hasCompanyContext } = useCompanyId();

//   const sidebarRef = useRef(null);

//   const getMenuItems = () => {
//     if (user?.role_id === 1 && !hasCompanyContext) {
//       return getSuperadminMainMenu();
//     }

//     if (user?.role_id === 1 && hasCompanyContext) {
//       return getSuperadminCompanyMenu(companyId);
//     }

//     if (user?.role_id === 2 && hasCompanyContext) {
//       return getAdminMenu(companyId);
//     }

//     if (hasCompanyContext && user?.role?.permissions) {
//       const menuTemplate = getFullCompanyMenuTemplate(companyId);
//       const filteredMenu = filterMenuByPermissions(
//         menuTemplate,
//         user.role.permissions,
//       );

//       const dashboardItem = {
//         icon: Building,
//         label: "Dashboard",
//         href: `/clientDashboard/${companyId}`,
//         hasDropdown: false,
//       };

//       const hasDashboard = filteredMenu.some(
//         (item) => item.href === `/clientDashboard/${companyId}`,
//       );

//       if (!hasDashboard) {
//         return [dashboardItem, ...filteredMenu];
//       }

//       return filteredMenu;
//     }

//     return [];
//   };

//   const menuItems = getMenuItems();

//   const isRouteActive = (href) => {
//     if (!href) return false;
//     if (href === "/dashboard" && pathname === "/dashboard") return true;
//     if (
//       href.startsWith("/clientDashboard/") &&
//       pathname.startsWith("/clientDashboard/")
//     )
//       return true;
//     const [basePath] = href.split("?");
//     return pathname.startsWith(basePath);
//   };

//   const isDropdownActive = (children) => {
//     if (!children) return false;
//     return children.some((child) => isRouteActive(child.href));
//   };

//   useEffect(() => {
//     const newOpenDropdowns = {};

//     menuItems.forEach((item) => {
//       if (item.hasDropdown && item.children) {
//         const isActive = isDropdownActive(item.children);
//         if (isActive) {
//           newOpenDropdowns[item.key] = true;
//         }
//       }
//     });

//     setOpenDropdowns((prev) => ({ ...prev, ...newOpenDropdowns }));
//   }, [pathname, companyId]);

//   useEffect(() => {
//     const checkMobile = () => {
//       const mobile = window.innerWidth < 1024;
//       setIsMobile(mobile);
//       if (mobile) setSidebarOpen(false);
//     };
//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, [setSidebarOpen]);

//   const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
//   const toggleCollapse = () => setCollapsed(!collapsed);

//   const toggleDropdown = (key) => {
//     if (!sidebarOpen && !isHovered) {
//       setSidebarOpen(true);
//       setTimeout(() => {
//         setOpenDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
//       }, 150);
//     } else {
//       setOpenDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
//     }
//   };

//   const handleLogout = () => {
//     dispatch(logout());
//     router.push("/login");
//   };

//   const handleMouseEnter = () => {
//     if (!isMobile) {
//       setIsHovered(true);
//       setSidebarOpen(true);
//     }
//   };

//   const handleMouseLeave = () => {
//     if (!isMobile) {
//       setIsHovered(false);
//       setSidebarOpen(false);
//     }
//   };

//   // Click outside to close
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
//         if (isMobile) setSidebarOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [isMobile, setSidebarOpen]);

//   const commonLinkClasses =
//     "flex items-center px-4 py-3 rounded-2xl cursor-pointer relative overflow-hidden transition-all duration-300 group hover:bg-white/60 backdrop-blur-sm";

//   const getActiveLinkClasses = (href, isChild = false) => {
//     const isActive = isRouteActive(href);

//     if (isActive) {
//       return `${commonLinkClasses} bg-gradient-to-r from-white to-slate-50 border-l-4 border-cyan-500 shadow-lg shadow-cyan-100/50 text-slate-900 font-black scale-[1.02]`;
//     }

//     return `${commonLinkClasses} text-slate-600 hover:text-slate-900 hover:shadow-md hover:shadow-cyan-100/30 hover:translate-x-1`;
//   };

//   const getDropdownButtonClasses = (item) => {
//     const isActive = isDropdownActive(item.children);
//     const isOpen = openDropdowns[item.key];

//     if (isActive) {
//       return `${commonLinkClasses} bg-gradient-to-r from-white to-slate-50 border-l-4 border-cyan-500 shadow-lg shadow-cyan-100/50 text-slate-900 font-black`;
//     }

//     if (isOpen) {
//       return `${commonLinkClasses} bg-white/80 backdrop-blur-sm text-slate-900 font-black shadow-md shadow-cyan-50/50`;
//     }

//     return `${commonLinkClasses} text-slate-600 hover:text-slate-900 hover:shadow-md hover:shadow-cyan-100/30 hover:translate-x-1`;
//   };

//   return (
//     <>
//       {/* Mobile Toggle Button */}
//       {isMobile && (
//         <button
//           onClick={toggleSidebar}
//           className="fixed top-4 left-4 z-[60] p-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-600 hover:to-teal-600 shadow-xl shadow-cyan-200/50 lg:hidden transition-all duration-300 hover:scale-110"
//         >
//           {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
//         </button>
//       )}

//       {/* Sidebar */}
//       <div
//         ref={sidebarRef}
//         onMouseEnter={handleMouseEnter}
//         onMouseLeave={handleMouseLeave}
//         className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out ${
//           sidebarOpen || isHovered || !isMobile
//             ? "translate-x-0"
//             : "-translate-x-full"
//         } ${collapsed ? "w-20" : "w-72"} bg-gradient-to-b from-[#e0f2f1] to-[#d0e8e6] border-r border-cyan-200/50 shadow-2xl shadow-cyan-200/30 backdrop-blur-xl`}
//       >
//         {/* Header */}
//         <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-white/50 bg-white/90 backdrop-blur-xl shadow-sm min-h-[80px]">
//           {collapsed ? (
//             <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-400 shadow-lg">
//               <Image
//                 src="/image/dashboard img.png"
//                 alt="Logo"
//                 width={24}
//                 height={24}
//                 unoptimized
//               />
//             </div>
//           ) : (
//             <>
//               <div className="flex items-center gap-3">
//                 <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-cyan-100/50">
//                   <Image
//                     src="/image/dashboard img.png"
//                     alt="Logo"
//                     width={32}
//                     height={32}
//                     unoptimized
//                   />
//                 </div>
//                 <div>
//                   <p className="text-xs font-black uppercase tracking-widest text-cyan-600">
//                     Admin Console
//                   </p>
//                   <p className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text text-transparent">
//                     Safai
//                   </p>
//                 </div>
//               </div>
//             </>
//           )}
//           {!isMobile && (
//             <button
//               onClick={toggleCollapse}
//               className="p-3 rounded-2xl hover:bg-white/60 hover:shadow-md transition-all duration-300 border border-white/50 hover:scale-110 hover:rotate-180"
//             >
//               {collapsed ? (
//                 <ChevronRight size={20} className="text-slate-600" />
//               ) : (
//                 <ChevronLeft size={20} className="text-slate-600" />
//               )}
//             </button>
//           )}
//         </div>

//         {/* Navigation */}
//         <nav className="flex-1 overflow-y-auto p-4 mt-4 space-y-4 scrollbar-hide">
//           <ul className="space-y-2">
//             {menuItems.map((item, index) => {
//               const IconComponent = item.icon;
//               const isDropdownOpen = openDropdowns[item.key];

//               if (item.hasDropdown) {
//                 return (
//                   <li key={index} className="group">
//                     <button
//                       onClick={() => toggleDropdown(item.key)}
//                       className={`${getDropdownButtonClasses(item)} ${!collapsed ? "justify-between" : "justify-center"} w-full`}
//                     >
//                       <div className="flex items-center gap-3">
//                         <IconComponent size={20} className="flex-shrink-0" />
//                         {!collapsed && (
//                           <span className="font-bold text-sm">
//                             {item.label}
//                           </span>
//                         )}
//                       </div>
//                       {!collapsed && (
//                         <ChevronDown
//                           size={18}
//                           className={`transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
//                         />
//                       )}
//                       {!collapsed && (
//                         <div className="absolute left-full top-1/2 -translate-y-1/2 bg-white/90 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap ml-2 border border-cyan-100">
//                           {item.label}
//                         </div>
//                       )}
//                     </button>
//                     {collapsed || !isDropdownOpen ? null : (
//                       <div
//                         className={`overflow-hidden transition-all duration-300 ${isDropdownOpen ? "max-h-96 animate-in slide-in-from-top-2" : "max-h-0"}`}
//                       >
//                         <ul className="ml-8 mt-3 space-y-1 border-l-3 border-cyan-200/50 pl-4">
//                           {item.children?.map((child, childIndex) => {
//                             const ChildIcon = child.icon;
//                             return (
//                               <li key={childIndex}>
//                                 <Link
//                                   href={child.href}
//                                   onClick={() =>
//                                     isMobile && setSidebarOpen(false)
//                                   }
//                                   className={`${getActiveLinkClasses(child.href, true)} justify-start text-xs py-2.5 px-3`}
//                                 >
//                                   {ChildIcon && (
//                                     <ChildIcon
//                                       size={16}
//                                       className="flex-shrink-0 ml-1"
//                                     />
//                                   )}
//                                   <span>{child.label}</span>
//                                 </Link>
//                               </li>
//                             );
//                           })}
//                         </ul>
//                       </div>
//                     )}
//                   </li>
//                 );
//               }

//               return (
//                 <li key={index} className="group">
//                   <Link
//                     href={item.href}
//                     onClick={() => isMobile && setSidebarOpen(false)}
//                     className={`${getActiveLinkClasses(item.href)} ${collapsed ? "justify-center" : "justify-start"}`}
//                   >
//                     <IconComponent size={20} className="flex-shrink-0" />
//                     {!collapsed && (
//                       <span className="font-bold text-sm ml-3">
//                         {item.label}
//                       </span>
//                     )}
//                     {!collapsed && (
//                       <div className="absolute left-full top-1/2 -translate-y-1/2 bg-white/90 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap ml-2 border border-cyan-100">
//                         {item.label}
//                       </div>
//                     )}
//                   </Link>
//                 </li>
//               );
//             })}
//           </ul>
//         </nav>

//         {/* Footer */}
//         <div className="sticky bottom-0 p-6 border-t border-white/50 bg-white/90 backdrop-blur-xl shadow-2xl shadow-cyan-100/30">
//           <div className="rounded-3xl p-4 bg-gradient-to-r from-white/60 to-slate-50/60 border border-white/60 hover:bg-white/80 hover:shadow-2xl hover:shadow-cyan-200/50 transition-all duration-300 group">
//             <Link
//               href="/dashboard/settings"
//               className="flex items-center gap-3 w-full"
//               onClick={() => isMobile && setSidebarOpen(false)}
//             >
//               <div
//                 className={`h-12 w-12 flex-shrink-0 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white font-black text-sm shadow-xl border border-white/30 ${collapsed ? "h-10 w-10 text-xs" : ""}`}
//               >
//                 TI
//               </div>
//               {!collapsed && (
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-black text-slate-900 truncate">
//                     Test Intern
//                   </p>
//                   <p className="text-xs font-bold text-cyan-600 uppercase tracking-wider">
//                     Admin
//                   </p>
//                 </div>
//               )}
//               {!collapsed && (
//                 <Settings className="h-5 w-5 text-slate-500 group-hover:rotate-90 group-hover:text-cyan-500 transition-all duration-300" />
//               )}
//             </Link>
//           </div>

//           <button
//             onClick={handleLogout}
//             className={`${commonLinkClasses} mt-4 justify-center bg-gradient-to-r from-rose-50 to-rose-100 hover:from-rose-100 hover:to-rose-200 text-rose-600 hover:text-rose-700 border border-rose-200 hover:border-rose-300 hover:shadow-lg hover:shadow-rose-100/50 font-black py-3.5 rounded-3xl`}
//           >
//             <LogOut size={20} />
//             {!collapsed && <span className="ml-3">Logout</span>}
//           </button>
//         </div>
//       </div>

//       {/* Mobile Overlay */}
//       {sidebarOpen && isMobile && (
//         <div
//           className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
//           onClick={toggleSidebar}
//         />
//       )}

//       {/* Custom Scrollbar Hide */}
//       <style jsx global>{`
//         .scrollbar-hide {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }
//         .scrollbar-hide::-webkit-scrollbar {
//           display: none;
//         }
//       `}</style>
//     </>
//   );
// };

// export default Sidebar;

// //version 3

//----------------------------------------------version 4 ----------------------------------

// "use client";

// import React, { useEffect, useMemo, useState, useRef } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { useRouter, usePathname } from "next/navigation";
// import { logout } from "@/features/auth/auth.slice";
// import Link from "next/link";
// import Image from "next/image";
// import {
//   Activity,
//   BarChart3,
//   Layers3,
//   ListChecks,
//   LogOut,
//   Map,
//   MapPin,
//   Menu,
//   MenuSquare,
//   MessageSquare,
//   Plus,
//   X,
//   Users,
//   Wrench,
//   Settings,
//   ChevronRight,
//   ChevronDown,
//   Building,
//   ChevronLeft,
// } from "lucide-react";
// import {
//   getSuperadminMainMenu,
//   getSuperadminCompanyMenu,
//   getAdminMenu,
//   getFullCompanyMenuTemplate,
// } from "@/shared/config/menuConfig";
// import { filterMenuByPermissions } from "@/shared/utils/menuFilter";
// import { useCompanyId } from "@/providers/CompanyProvider";

// const Sidebar = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [openDropdowns, setOpenDropdowns] = useState({});
//   const [isMobile, setIsMobile] = useState(false);
//   const [collapsed, setCollapsed] = useState(false);

//   const sidebarRef = useRef(null);

//   const { user } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const pathname = usePathname();
//   const toggleCollapse = () => setCollapsed(!collapsed);

//   const { companyId, hasCompanyContext } = useCompanyId();

//   // Memoize menu items to prevent infinite loop
//   const menuItems = useMemo(() => {
//     if (user?.role_id === 1 && !hasCompanyContext) {
//       return getSuperadminMainMenu();
//     }
//     if (user?.role_id === 1 && hasCompanyContext) {
//       return getSuperadminCompanyMenu(companyId);
//     }
//     if (user?.role_id === 2 && hasCompanyContext) {
//       return getAdminMenu(companyId);
//     }
//     if (hasCompanyContext && user?.role?.permissions) {
//       const menuTemplate = getFullCompanyMenuTemplate(companyId);
//       const filteredMenu = filterMenuByPermissions(
//         menuTemplate,
//         user.role.permissions,
//       );
//       const dashboardItem = {
//         icon: Building,
//         label: "Dashboard",
//         href: `/clientDashboard/${companyId}`,
//         hasDropdown: false,
//       };
//       const hasDashboard = filteredMenu.some(
//         (item) => item.href === `/clientDashboard/${companyId}`,
//       );
//       if (!hasDashboard) return [dashboardItem, ...filteredMenu];
//       return filteredMenu;
//     }
//     return [];
//   }, [user?.role_id, user?.role?.permissions, hasCompanyContext, companyId]);

//   // Route active check
//   // const isRouteActive = (href) => {
//   //   if (!href) return false;
//   //   if (href === "/dashboard" && pathname === "/dashboard") return true;
//   //   if (
//   //     href.startsWith("/clientDashboard/") &&
//   //     pathname.startsWith("/clientDashboard/")
//   //   )
//   //     return true;
//   //   const [basePath] = href.split("?");
//   //   return pathname.startsWith(basePath);
//   // };

//   // const isRouteActive = (href) => {
//   //   if (!href) return false;

//   //   // Remove query params for comparison
//   //   const [basePath] = href.split("?");

//   //   // Superadmin dashboard - exact match only
//   //   if (basePath === "/dashboard") {
//   //     return pathname === "/dashboard";
//   //   }

//   //   // Client dashboard - exact match OR nested routes
//   //   if (basePath.startsWith("/clientDashboard/")) {
//   //     return pathname === basePath || pathname.startsWith(basePath + "/");
//   //   }

//   //   // Query param routes - match base path only
//   //   const currentBasePath = pathname.split("?")[0];
//   //   return (
//   //     pathname === href ||
//   //     currentBasePath === basePath ||
//   //     pathname.startsWith(basePath + "/")
//   //   );
//   // };

//   // const isRouteActive = (href) => {
//   //   if (!href) return false;

//   //   // Exact match FIRST (catches Dashboard perfectly)
//   //   if (pathname === href) return true;

//   //   const [basePath] = href.split("?");
//   //   const [currentBase] = pathname.split("?");
//   //   console.log(href, "href");
//   //   console.log(pathname, "pathname");
//   //   console.log(basePath, "base path");
//   //   // Superadmin dashboard
//   //   if (basePath === "/dashboard") {
//   //     return pathname === "/dashboard";
//   //   }

//   //   // Client dashboard nested
//   //   if (basePath.startsWith("/clientDashboard/")) {
//   //     return pathname.startsWith(basePath + "/");
//   //   }

//   //   // Others
//   //   return currentBase === basePath || pathname.startsWith(basePath + "/");
//   // };

//   const isRouteActive = (href) => {
//     if (!href) return false;

//     const [basePath] = href.split("?");

//     const active = pathname === basePath || pathname.startsWith(basePath + "/");

//     if (active) {
//       console.log("ACTIVE MATCH:", {
//         pathname,
//         href,
//         basePath,
//       });
//     }

//     return active;
//   };
//   useEffect(() => {
//     console.log("CURRENT PATH:", pathname);
//   }, [pathname]);

//   // Dropdown active check
//   const isDropdownActive = (children) => {
//     if (!children) return false;
//     return children.some((child) => isRouteActive(child.href));
//   };

//   // Auto-open active dropdowns - Fixed dependency
//   useEffect(() => {
//     const newOpenDropdowns = {};
//     menuItems.forEach((item) => {
//       if (item.hasDropdown && item.children) {
//         const isActive = isDropdownActive(item.children);
//         if (isActive) {
//           newOpenDropdowns[item.key] = true;
//         }
//       }
//     });

//     // Only update if there are changes
//     if (Object.keys(newOpenDropdowns).length > 0) {
//       setOpenDropdowns((prev) => {
//         const hasChanges = Object.keys(newOpenDropdowns).some(
//           (key) => !prev[key],
//         );
//         return hasChanges ? { ...prev, ...newOpenDropdowns } : prev;
//       });
//     }
//   }, [pathname, companyId]); // Remove menuItems from dependencies

//   // Mobile detection
//   useEffect(() => {
//     const checkMobile = () => {
//       const mobile = window.innerWidth < 1024;
//       setIsMobile(mobile);
//       if (mobile) setSidebarOpen(false);
//     };
//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   // Click outside handler for mobile
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         sidebarRef.current &&
//         !sidebarRef.current.contains(event.target) &&
//         isMobile &&
//         sidebarOpen
//       ) {
//         setSidebarOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [isMobile, sidebarOpen]);

//   // Hover handlers for desktop
//   const handleMouseEnter = () => {
//     if (!isMobile) {
//       setSidebarOpen(true);
//     }
//   };

//   const handleMouseLeave = () => {
//     if (!isMobile) {
//       setSidebarOpen(false);
//     }
//   };

//   // Toggle sidebar manually
//   const toggleSidebar = () => {
//     setSidebarOpen((prev) => !prev);
//   };

//   // Toggle dropdown
//   const toggleDropdown = (key) => {
//     setOpenDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
//   };

//   // Logout handler
//   const handleLogout = () => {
//     dispatch(logout());
//     router.push("/login");
//   };

//   return (
//     <>
//       {/* Mobile Toggle Button */}
//       {isMobile && (
//         <button
//           onClick={toggleSidebar}
//           className="fixed top-4 left-4 z-[60] p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:shadow-xl hover:shadow-cyan-300/50 lg:hidden transition-all duration-300 hover:scale-[1.05]"
//         >
//           {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
//         </button>
//       )}

//       <aside
//         ref={sidebarRef}
//         onMouseEnter={handleMouseEnter}
//         onMouseLeave={handleMouseLeave}
//         className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col
//         ${sidebarOpen ? "w-72" : "w-20"}
//         bg-[#e0f2f1] dark:bg-slate-800 border-r border-[#d0e8e6] dark:border-slate-700
//         shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)]
//         transition-all duration-300
//         ${isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"}`}
//       >
//         {/* HEADER */}
//         <div className="sticky top-0 z-10 flex h-16 items-center gap-3 px-4 border-b border-[#d0e8e6] dark:border-slate-700 bg-[#e0f2f1]/90 dark:bg-slate-800/90 backdrop-blur-md">
//           {sidebarOpen ? (
//             <>
//               {/* <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm border border-[#d0e8e6] dark:border-slate-600">
//                 <Image
//                   src="/image/dashboard img.png"
//                   alt="Logo"
//                   width={28}
//                   height={28}
//                   unoptimized
//                 />
//               </div> */}
//               <div className="flex-1 min-w-0">
//                 <p className="text-[10px] font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
//                   Admin Console
//                 </p>
//                 <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
//                   Safai
//                 </p>
//               </div>
//             </>
//           ) : (
//             <div className="flex-shrink-0 mx-auto">
//               {/* <Image
//                 src="/image/dashboard img.png"
//                 alt="Logo"
//                 width={28}
//                 height={28}
//                 unoptimized
//               /> */}
//             </div>
//           )}
//           {/* {!isMobile && sidebarOpen && (
//             <button
//               onClick={toggleSidebar}
//               className="ml-auto h-8 w-8 rounded-lg hover:bg-white/60 flex items-center justify-center transition-transform duration-300 border border-[#d0e8e6] rotate-180"
//             >
//               <ChevronRight className="h-4 w-4 text-slate-600" />
//             </button>
//           )} */}

//           {!isMobile && (
//             <button
//               onClick={toggleSidebar}
//               className="ml-auto h-8 w-8 rounded-lg hover:bg-white/60 flex items-center justify-center transition-transform duration-300 border border-[#d0e8e6] rotate-180"
//             >
//               {sidebarOpen ? (
//                 <ChevronLeft className="cursor-pointer h-4 w-4 text-slate-600" />
//               ) : (
//                 <ChevronRight className="cursor-pointerh-4 w-4 text-slate-600" />
//               )}
//             </button>
//           )}
//         </div>

//         {/* NAV SECTION */}
//         <div className="flex-1 px-3 py-4 space-y-4 overflow-y-auto scrollbar-hide dark:scrollbar-hide">
//           {menuItems.map((item, index) => {
//             const Icon = item.icon;
//             const hasActiveChild = item.children?.some((child) =>
//               isRouteActive(child.href),
//             );
//             const isDropdownOpen = openDropdowns[item.key];

//             // Dropdown menu items
//             if (item.hasDropdown && item.children) {
//               return (
//                 <div key={item.key || index} className="space-y-1">
//                   <button
//                     onClick={() => toggleDropdown(item.key)}
//                     className={`flex w-full items-center rounded-2xl px-4 py-2.5 text-sm font-bold transition-all nav-item ${hasActiveChild ? "nav-item-active" : ""} ${!sidebarOpen ? "justify-center" : ""}`}
//                   >
//                     <Icon className="h-5 w-5 flex-shrink-0" />
//                     {sidebarOpen && (
//                       <>
//                         <span className="flex-1 text-left truncate ml-3 font-black">
//                           {item.label}
//                         </span>
//                         <ChevronDown
//                           className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
//                         />
//                       </>
//                     )}
//                   </button>
//                   {sidebarOpen && isDropdownOpen && (
//                     <div className="ml-9 space-y-1 border-l-2 border-[#d0e8e6] dark:border-slate-700 pl-4 animate-in slide-in-from-top-1 duration-200">
//                       {item.children.map((child, childIndex) => {
//                         const ChildIcon = child.icon;
//                         return (
//                           <Link
//                             key={child.href || childIndex}
//                             href={child.href}
//                             onClick={() => isMobile && setSidebarOpen(false)}
//                             className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${isRouteActive(child.href) ? "nav-item-active" : "text-slate-500 hover:text-cyan-600 hover:translate-x-1"}`}
//                           >
//                             {ChildIcon && (
//                               <ChildIcon size={14} className="flex-shrink-0" />
//                             )}
//                             {child.label}
//                           </Link>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               );
//             }

//             // Regular menu items
//             return (
//               <Link
//                 key={item.href || index}
//                 href={item.href}
//                 onClick={() => isMobile && setSidebarOpen(false)}
//                 className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-bold transition-all nav-item ${isRouteActive(item.href) ? "nav-item-active" : ""} ${!sidebarOpen ? "justify-center" : ""}`}
//               >
//                 <Icon className="h-5 w-5 flex-shrink-0" />
//                 {sidebarOpen && <span className="truncate">{item.label}</span>}
//               </Link>
//             );
//           })}
//         </div>

//         {/* FOOTER */}
//         <div className="sticky bottom-0 p-4 border-t border-[#d0e8e6] dark:border-slate-700 bg-[#e0f2f1]/90 dark:bg-slate-800/90 backdrop-blur-md space-y-3">
//           <div className="rounded-[20px] p-3 bg-white/40 dark:bg-slate-700/60 border border-white/60 dark:border-slate-600 hover:bg-white/60 dark:hover:bg-slate-600/80 transition-colors">
//             <Link
//               href="/dashboard/settings"
//               onClick={() => isMobile && setSidebarOpen(false)}
//               className="flex items-center gap-3 group"
//             >
//               <div
//                 className={`flex-shrink-0 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-black shadow-sm ${!sidebarOpen ? "h-8 w-8 text-[10px]" : "h-9 w-9 text-xs"}`}
//               >
//                 TI
//               </div>
//               {sidebarOpen && (
//                 <div className="flex-1 min-w-0 overflow-hidden">
//                   <p className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">
//                     Test Intern
//                   </p>
//                   <p className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase">
//                     Admin
//                   </p>
//                 </div>
//               )}
//               {sidebarOpen && (
//                 <Settings className="h-4 w-4 text-slate-400 group-hover:rotate-90 transition-transform" />
//               )}
//             </Link>
//           </div>
//           <button
//             onClick={handleLogout}
//             className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-900 px-4 py-3 text-sm font-black text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-700 hover:bg-rose-100 dark:hover:bg-rose-800 hover:shadow-sm transition-all group"
//           >
//             <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
//             {sidebarOpen && <span>Logout</span>}
//           </button>
//         </div>

//         {/* STYLES */}
//         {/* <style jsx>{`
//           .nav-item {
//             color: #475569;
//           }
//           .nav-item:hover {
//             background-color: rgba(255, 255, 255, 0.5);
//             transform: translateX(2px);
//           }
//           .nav-item-active {
//             background: linear-gradient(135deg, #ffffff, #e8f5f4) !important;
//             color: #000000 !important;
//             border-left: 4px solid #06b6d4;
//             border-right: 1px solid #d0e8e6;
//             border-top: 1px solid #d0e8e6;
//             border-bottom: 1px solid #d0e8e6;
//             box-shadow: 2px 2px 8px rgba(6, 182, 212, 0.15);
//           }
//           .scrollbar-hide::-webkit-scrollbar {
//             display: none;
//           }
//           .scrollbar-hide {
//             -ms-overflow-style: none;
//             scrollbar-width: none;
//           }
//         `}</style> */}
//         <style jsx global>{`
//           .nav-item {
//             color: #475569;
//           }
//           .nav-item:hover {
//             background-color: rgba(255, 255, 255, 0.5) !important;
//             transform: translateX(2px) !important;
//           }
//           .nav-item-active {
//             background: linear-gradient(135deg, #ffffff, #e8f5f4) !important;
//             color: #000000 !important;
//             border-left: 4px solid #06b6d4 !important;
//             border-right: 1px solid #d0e8e6 !important;
//             border-top: 1px solid #d0e8e6 !important;
//             border-bottom: 1px solid #d0e8e6 !important;
//             box-shadow: 2px 2px 8px rgba(6, 182, 212, 0.15) !important;
//             border-radius: 16px !important; /* Override rounded-2xl */
//           }
//           .scrollbar-hide::-webkit-scrollbar {
//             display: none;
//           }
//           .scrollbar-hide {
//             -ms-overflow-style: none;
//             scrollbar-width: none;
//           }
//         `}</style>
//       </aside>

//       {/* Mobile Overlay */}
//       {sidebarOpen && isMobile && (
//         <div
//           className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}
//     </>
//   );
// };

// export default Sidebar;

/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/preserve-manual-memoization */

"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { logout } from "@/features/auth/auth.slice";
import Link from "next/link";
import Image from "next/image";

import {
  LogOut,
  Menu,
  X,
  Settings,
  ChevronRight,
  ChevronDown,
  Building,
  ChevronLeft,
  User,
} from "lucide-react";
import {
  getSuperadminMainMenu,
  getSuperadminCompanyMenu,
  getAdminMenu,
  getFullCompanyMenuTemplate,
} from "@/shared/config/menuConfig";
import { filterMenuByPermissions } from "@/shared/utils/menuFilter";
import { useCompanyId } from "@/providers/CompanyProvider";

const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const sidebarRef = useRef(null);

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const toggleCollapse = () => setCollapsed(!collapsed);

  const { companyId, hasCompanyContext } = useCompanyId();

  // Memoize menu items to prevent infinite loop
  const menuItems = useMemo(() => {
    if (user?.role_id === 1 && !hasCompanyContext) {
      return getSuperadminMainMenu();
    }
    if (user?.role_id === 1 && hasCompanyContext) {
      return getSuperadminCompanyMenu(companyId);
    }
    if (user?.role_id === 2 && hasCompanyContext) {
      return getAdminMenu(companyId);
    }
    if (hasCompanyContext && user?.role?.permissions) {
      const menuTemplate = getFullCompanyMenuTemplate(companyId);
      const filteredMenu = filterMenuByPermissions(
        menuTemplate,
        user.role.permissions,
      );
      const dashboardItem = {
        icon: Building,
        label: "Dashboard",
        href: `/clientDashboard/${companyId}`,
        hasDropdown: false,
      };
      const hasDashboard = filteredMenu.some(
        (item) => item.href === `/clientDashboard/${companyId}`,
      );
      if (!hasDashboard) return [dashboardItem, ...filteredMenu];
      return filteredMenu;
    }
    return [];
  }, [user?.role_id, user?.role?.permissions, hasCompanyContext, companyId]);

  const getRoleText = (roleId) => {
    switch (roleId) {
      case 1:
        return "Super Admin";
      case 2:
        return "Admin";
      case 3:
        return "Supervisor";
      case 4:
        return "User";
      case 5:
        return "Cleaner";
      case 6:
        return "Zonal Admin";
      case 7:
        return "Facility Supervisor";
      case 8:
        return "Facility Admin";
      default:
        return "User";
    }
  };

  const userRole = getRoleText(user?.role_id);

  // Route active check
  // const isRouteActive = (href) => {
  //   if (!href) return false;
  //   if (href === "/dashboard" && pathname === "/dashboard") return true;
  //   if (
  //     href.startsWith("/clientDashboard/") &&
  //     pathname.startsWith("/clientDashboard/")
  //   )
  //     return true;
  //   const [basePath] = href.split("?");
  //   return pathname.startsWith(basePath);
  // };

  // const isRouteActive = (href) => {
  //   if (!href) return false;

  //   // Remove query params for comparison
  //   const [basePath] = href.split("?");

  //   // Superadmin dashboard - exact match only
  //   if (basePath === "/dashboard") {
  //     return pathname === "/dashboard";
  //   }

  //   // Client dashboard - exact match OR nested routes
  //   if (basePath.startsWith("/clientDashboard/")) {
  //     return pathname === basePath || pathname.startsWith(basePath + "/");
  //   }

  //   // Query param routes - match base path only
  //   const currentBasePath = pathname.split("?")[0];
  //   return (
  //     pathname === href ||
  //     currentBasePath === basePath ||
  //     pathname.startsWith(basePath + "/")
  //   );
  // };

  // const isRouteActive = (href) => {
  //   if (!href) return false;

  //   // Exact match FIRST (catches Dashboard perfectly)
  //   if (pathname === href) return true;

  //   const [basePath] = href.split("?");
  //   const [currentBase] = pathname.split("?");
  //   console.log(href, "href");
  //   console.log(pathname, "pathname");
  //   console.log(basePath, "base path");
  //   // Superadmin dashboard
  //   if (basePath === "/dashboard") {
  //     return pathname === "/dashboard";
  //   }

  //   // Client dashboard nested
  //   if (basePath.startsWith("/clientDashboard/")) {
  //     return pathname.startsWith(basePath + "/");
  //   }

  //   // Others
  //   return currentBase === basePath || pathname.startsWith(basePath + "/");
  // };

  const isRouteActive = (href) => {
    if (!href) return false;

    const [basePath] = href.split("?");

    const active = pathname === basePath || pathname.startsWith(basePath + "/");

    // if (active) {
    //   console.log("ACTIVE MATCH:", {
    //     pathname,
    //     href,
    //     basePath,
    //   });
    // }

    return active;
  };
  // useEffect(() => {
  //   console.log("CURRENT PATH:", pathname);
  // }, [pathname]);

  // Dropdown active check
  const isDropdownActive = (children) => {
    if (!children) return false;
    return children.some((child) => isRouteActive(child.href));
  };

  // Auto-open active dropdowns - Fixed dependency
  useEffect(() => {
    const newOpenDropdowns = {};
    menuItems.forEach((item) => {
      if (item.hasDropdown && item.children) {
        const isActive = isDropdownActive(item.children);
        if (isActive) {
          newOpenDropdowns[item.key] = true;
        }
      }
    });

    // Only update if there are changes
    if (Object.keys(newOpenDropdowns).length > 0) {
      setOpenDropdowns((prev) => {
        const hasChanges = Object.keys(newOpenDropdowns).some(
          (key) => !prev[key],
        );
        return hasChanges ? { ...prev, ...newOpenDropdowns } : prev;
      });
    }
  }, [pathname, companyId]); // Remove menuItems from dependencies

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Click outside handler for mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        isMobile &&
        sidebarOpen
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, sidebarOpen]);

  // Hover handlers for desktop
  const handleMouseEnter = () => {
    if (!isMobile) {
      setSidebarOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  };

  // Toggle sidebar manually
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Toggle dropdown
  const toggleDropdown = (key) => {
    setOpenDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Logout handler
  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-[60] p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:shadow-xl hover:shadow-cyan-300/50 lg:hidden transition-all duration-300 hover:scale-[1.05]"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      <aside
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ background: "var(--sidebar-bg)" }}
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col
        ${sidebarOpen ? "w-72" : "w-20"}
           text-[var(--sidebar-text)]
          border-r border-[var(--sidebar-border)]
        transition-all duration-300
        ${isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"}`}
      >
        {/* HEADER */}
        <div
          className="sticky top-0 z-10 flex h-16 items-center gap-3 px-4 border-b backdrop-blur-md"
          style={{
            background:
              "color-mix(in srgb, var(--sidebar-bg) 90%, transparent)",
            borderColor: "var(--sidebar-border)",
          }}
        >
          {sidebarOpen ? (
            <>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[10px] font-black uppercase tracking-widest"
                  style={{ color: "var(--primary)" }}
                >
                  Admin Console
                </p>
                <p
                  className="text-sm font-bold truncate"
                  style={{ color: "var(--sidebar-text)" }}
                >
                  Safai
                </p>
              </div>
            </>
          ) : (
            <div className="flex-shrink-0 mx-auto" />
          )}

          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="ml-auto h-8 w-8 rounded-lg flex items-center justify-center transition-transform duration-300 border"
              style={{
                borderColor: "var(--sidebar-border)",
                color: "var(--sidebar-muted)",
              }}
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* NAV SECTION */}
        <div className="flex-1 px-3 py-4 space-y-4 overflow-y-auto scrollbar-hide dark:scrollbar-hide">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const hasActiveChild = item.children?.some((child) =>
              isRouteActive(child.href),
            );
            const isDropdownOpen = openDropdowns[item.key];

            // Dropdown menu items
            if (item.hasDropdown && item.children) {
              return (
                <div key={item.key || index} className="space-y-1">
                  <button
                    onClick={() => toggleDropdown(item.key)}
                    className={`flex w-full items-center rounded-2xl px-4 py-2.5 text-sm font-bold transition-all nav-item ${hasActiveChild ? "nav-item-active" : ""} ${!sidebarOpen ? "justify-center" : ""}`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left truncate ml-3 font-black">
                          {item.label}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                        />
                      </>
                    )}
                  </button>
                  {sidebarOpen && isDropdownOpen && (
                    <div className="ml-9 space-y-1 border-l-2 border-[#d0e8e6] dark:border-slate-700 pl-4 animate-in slide-in-from-top-1 duration-200">
                      {item.children.map((child, childIndex) => {
                        const ChildIcon = child.icon;
                        return (
                          <Link
                            key={child.href || childIndex}
                            href={child.href}
                            onClick={() => isMobile && setSidebarOpen(false)}
                            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${isRouteActive(child.href) ? "nav-item-active" : "text-slate-500 hover:text-cyan-600 hover:translate-x-1"}`}
                          >
                            {ChildIcon && (
                              <ChildIcon size={14} className="flex-shrink-0" />
                            )}
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Regular menu items
            return (
              <Link
                key={item.href || index}
                href={item.href}
                onClick={() => isMobile && setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-bold transition-all nav-item ${isRouteActive(item.href) ? "nav-item-active" : ""} ${!sidebarOpen ? "justify-center" : ""}`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* FOOTER */}
        <div
          className="sticky bottom-0 p-4 border-t backdrop-blur-md space-y-3"
          style={{
            background:
              "color-mix(in srgb, var(--sidebar-bg) 90%, transparent)",
            borderColor: "var(--sidebar-border)",
          }}
        >
          {/* User Card */}
          <div
            className="rounded-[20px] p-3 border transition-colors"
            style={{
              background: "color-mix(in srgb, var(--surface) 60%, transparent)",
              borderColor: "var(--border)",
            }}
          >
            <Link
              href={`/settings/${user?.id}`}
              onClick={() => isMobile && setSidebarOpen(false)}
              className="flex items-center gap-3 group"
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 rounded-xl flex items-center justify-center font-black shadow-sm
        ${!sidebarOpen ? "h-8 w-8 text-[10px]" : "h-9 w-9 text-xs"}`}
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                }}
              >
                <User />
              </div>

              {/* User Info */}
              {sidebarOpen && user && (
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p
                    className="text-sm font-black truncate"
                    style={{ color: "var(--foreground)" }}
                    title={user.name}
                  >
                    {user.name || "Guest"}
                  </p>

                  <p
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: "var(--primary)" }}
                  >
                    {userRole}
                  </p>
                </div>
              )}

              {sidebarOpen && (
                <Settings
                  className="h-4 w-4 transition-transform group-hover:rotate-90"
                  style={{ color: "var(--muted-foreground)" }}
                />
              )}
            </Link>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black border transition-all group"
            style={{
              background: "color-mix(in srgb, #dc2626 12%, transparent)",
              color: "#dc2626",
              borderColor: "color-mix(in srgb, #dc2626 30%, transparent)",
            }}
          >
            <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>

        {/* STYLES */}
        {/* <style jsx>{`
          .nav-item {
            color: #475569;
          }
          .nav-item:hover {
            background-color: rgba(255, 255, 255, 0.5);
            transform: translateX(2px);
          }
          .nav-item-active {  
            background: linear-gradient(135deg, #ffffff, #e8f5f4) !important;
            color: #000000 !important;
            border-left: 4px solid #06b6d4;
            border-right: 1px solid #d0e8e6;
            border-top: 1px solid #d0e8e6;
            border-bottom: 1px solid #d0e8e6;
            box-shadow: 2px 2px 8px rgba(6, 182, 212, 0.15);
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style> */}
        <style jsx global>{`
          .nav-item {
            color: #475569;
          }
          .nav-item:hover {
            background-color: rgba(255, 255, 255, 0.5) !important;
            transform: translateX(2px) !important;
          }
          .nav-item-active {
            background: linear-gradient(135deg, #ffffff, #e8f5f4) !important;
            color: #000000 !important;
            border-left: 4px solid #06b6d4 !important;
            border-right: 1px solid #d0e8e6 !important;
            border-top: 1px solid #d0e8e6 !important;
            border-bottom: 1px solid #d0e8e6 !important;
            box-shadow: 2px 2px 8px rgba(6, 182, 212, 0.15) !important;
            border-radius: 16px !important; /* Override rounded-2xl */
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
