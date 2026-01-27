// components/layout/Sidebar.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCompanyId } from "@/providers/CompanyProvider";
import {
  getSuperadminMainMenu,
  getSuperadminCompanyMenu,
  getAdminMenu,
  getFullCompanyMenuTemplate,
} from "@/shared/config/menuConfig";
import { filterMenuByPermissions } from "@/shared/utils/menuFilter";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  const { user } = useSelector((state) => state.auth || {});
  const router = useRouter();
  const pathname = usePathname();
  const { companyId, hasCompanyContext } = useCompanyId();

  /* ---------------- MENU LOGIC ---------------- */
  const getMenuItems = () => {
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
      const template = getFullCompanyMenuTemplate(companyId);
      return filterMenuByPermissions(template, user.role.permissions);
    }

    return [];
  };

  const menuItems = getMenuItems();

  /* ---------------- HELPERS ---------------- */
  const isRouteActive = (href) => {
    if (!href) return false;
    return pathname.startsWith(href);
  };

  /* ---------------- MOBILE ---------------- */
  
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [setSidebarOpen]);

  /* ---------------- ACTIONS ---------------- */
  const toggleSidebar = () => setSidebarOpen((v) => !v);

  const toggleDropdown = (key) => {
    setOpenDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    router.push("/login");
  };

  /* ---------------- RENDER ---------------- */
  return (
    <>
      {/* Mobile Toggle */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-3 left-4 z-[60] p-2 rounded-lg bg-indigo-600 text-white lg:hidden"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={18} />}
        </button>
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen flex flex-col
          bg-slate-900 text-gray-200 shadow-2xl
          transition-all duration-300
          ${sidebarOpen ? "w-64" : "w-16"}
          ${isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
          {sidebarOpen && <h1 className="font-semibold">Dashboard</h1>}
          {!isMobile && (
            <button onClick={toggleSidebar}>
              {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
            </button>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 p-2 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isRouteActive(item.href);
              const isOpen = openDropdowns[item.key];

              // Dropdown
              if (item.hasDropdown) {
                return (
                  <li key={item.key}>
                    <button
                      onClick={() => toggleDropdown(item.key)}
                      className={`group flex items-center w-full px-3 py-2 rounded-md
                        ${isActive ? "bg-indigo-600 text-white" : "hover:bg-slate-800"}
                      `}
                    >
                      <Icon size={20} />
                      {sidebarOpen && (
                        <>
                          <span className="ml-3 flex-1 text-left">
                            {item.label}
                          </span>
                          {isOpen ? <ChevronUp /> : <ChevronDown />}
                        </>
                      )}

                      {/* Tooltip when collapsed */}
                      {!sidebarOpen && (
                        <span className="absolute left-16 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                          {item.label}
                        </span>
                      )}
                    </button>

                    {sidebarOpen && isOpen && (
                      <ul className="ml-6 mt-1 space-y-1">
                        {item.children?.map((child) => {
                          const ChildIcon = child.icon;
                          return (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-slate-800"
                              >
                                <ChildIcon size={16} />
                                <span className="ml-2">{child.label}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              }

              // Normal link
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`group flex items-center px-3 py-2 rounded-md
                      ${isActive ? "bg-indigo-600 text-white" : "hover:bg-slate-800"}
                    `}
                  >
                    <Icon size={20} />
                    {sidebarOpen && <span className="ml-3">{item.label}</span>}

                    {/* Tooltip when collapsed */}
                    {!sidebarOpen && (
                      <span className="absolute left-16 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-700 p-3">
          <button
            onClick={handleLogout}
            className="group flex items-center w-full px-3 py-2 rounded-md hover:bg-red-600"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="ml-3">Logout</span>}
            {!sidebarOpen && (
              <span className="absolute left-16 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100">
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
