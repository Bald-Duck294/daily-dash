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
      let menuTemplate = getFullCompanyMenuTemplate(companyId);
      if (user.role_id === 6) {
        menuTemplate = menuTemplate.filter(
          (item) => item.key !== "locationTypes",
        );
      }
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
          className="fixed top-[0.6rem] left-[0.5rem] z-[60] p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:shadow-xl hover:shadow-cyan-300/50 lg:hidden transition-all duration-300 hover:scale-[1.05]"
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
