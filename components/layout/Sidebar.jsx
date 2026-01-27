"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { useCompanyId } from "@/providers/CompanyProvider";
import {
  getSuperadminMainMenu,
  getSuperadminCompanyMenu,
  getAdminMenu,
  getFullCompanyMenuTemplate,
} from "@/shared/config/menuConfig";
import { filterMenuByPermissions } from "@/shared/utils/menuFilter";
import { logout } from "@/features/auth/auth.slice.js";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  const { user } = useSelector((state) => state.auth);
  console.log("User in Sidebar:", user);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const { companyId, hasCompanyContext } = useCompanyId();

  /* ---------------- MOBILE DETECTION ---------------- */

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);


  /* ---------------- MENU LOGIC ---------------- */
  const menuItems = useMemo(() => {
    if (!user) return [];

    if (user.role_id === 1 && !hasCompanyContext) {
      return getSuperadminMainMenu();
    }

    if (user.role_id === 1 && hasCompanyContext) {
      return getSuperadminCompanyMenu(companyId);
    }

    if (user.role_id === 2 && hasCompanyContext) {
      return getAdminMenu(companyId);
    }

    if (hasCompanyContext && user.role?.permissions) {
      const template = getFullCompanyMenuTemplate(companyId);
      return filterMenuByPermissions(template, user.role.permissions);
    }

    return [];
  }, [user, hasCompanyContext, companyId]);

  const isRouteActive = (href) =>
    href ? pathname.startsWith(href) : false;

  const toggleDropdown = (key) => {
    setOpenDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    router.replace("/login");
  };
  if (!mounted) {
    // render a static placeholder to match server
    return (
      <aside className="fixed top-0 left-0 h-screen w-16 bg-[var(--sidebar-bg)]" />
    );
  }


  return (
    <>
      {/* Mobile Toggle */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="fixed top-3 left-4 z-[60] p-2 rounded-lg
            bg-[var(--sidebar-active)] text-white lg:hidden"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={18} />}
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen flex flex-col
          bg-[var(--sidebar-bg)]
          text-[var(--sidebar-text)]
          border-r border-[var(--sidebar-border)]
          transition-all duration-300
          ${sidebarOpen ? "w-64" : "w-16"}
          ${isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--sidebar-border)]">
          {sidebarOpen && <h1 className="font-semibold truncate">Dashboard</h1>}
          {!isMobile && (
            <button onClick={() => setSidebarOpen((v) => !v)}>
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

              if (item.hasDropdown) {
                return (
                  <li key={item.key}>
                    <button
                      onClick={() => toggleDropdown(item.key)}
                      className={`
                        flex items-center w-full px-3 py-2 rounded-md
                        ${isActive
                          ? "bg-[var(--sidebar-active)] text-white"
                          : "hover:bg-[var(--sidebar-hover)]"}
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
                    </button>

                    {sidebarOpen && isOpen && (
                      <ul className="ml-6 mt-1 space-y-1">
                        {item.children?.map((child) => {
                          const ChildIcon = child.icon;
                          return (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-[var(--sidebar-hover)]"
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

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center px-3 py-2 rounded-md
                      ${isActive
                        ? "bg-[var(--sidebar-active)] text-white"
                        : "hover:bg-[var(--sidebar-hover)]"}
                    `}
                  >
                    <Icon size={20} />
                    {sidebarOpen && <span className="ml-3">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-[var(--sidebar-border)] p-3">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 rounded-md
              hover:bg-red-600 hover:text-white"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
