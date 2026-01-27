import {
  LayoutDashboard,
  Building,
  Users,
  ClipboardList,
  Settings,
} from "lucide-react";

/* ---------------- SUPERADMIN (NO COMPANY) ---------------- */
export function getSuperadminMainMenu() {
  return [
    {
      key: "dashboard",
      label: "Dashboard",
      simpleLabel: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      hasDropdown: false,
      requiredPermission: "dashboard.view",
    },
    {
      key: "companies",
      label: "Companies",
      simpleLabel: "Companies",
      icon: Building,
      href: "/companies",
      hasDropdown: false,
      requiredPermission: "companies.view",
    },
  ];
}

/* ---------------- SUPERADMIN (INSIDE COMPANY) ---------------- */
export function getSuperadminCompanyMenu(companyId) {
  return [
    {
      key: "dashboard",
      label: "Dashboard",
      simpleLabel: "Dashboard",
      icon: LayoutDashboard,
      href: `/clientDashboard/${companyId}`,
      hasDropdown: false,
      requiredPermission: "dashboard.view",
    },
    {
      key: "management",
      label: "Management",
      icon: Users,
      hasDropdown: true,
      requiredPermission: "users.view",
      children: [
        {
          label: "Users",
          href: `/companies/${companyId}/users`,
          requiredPermission: "users.view",
        },
        {
          label: "Admins",
          href: `/companies/${companyId}/admins`,
          requiredPermission: "admins.view",
        },
      ],
    },
    {
      key: "assignments",
      label: "Assignments",
      simpleLabel: "Assignments",
      icon: ClipboardList,
      href: `/companies/${companyId}/assignments`,
      hasDropdown: false,
      requiredPermission: "assignments.view",
    },
    {
      key: "settings",
      label: "Settings",
      simpleLabel: "Settings",
      icon: Settings,
      href: `/companies/${companyId}/settings`,
      hasDropdown: false,
      requiredPermission: "settings.view",
    },
  ];
}

/* ---------------- COMPANY ADMIN ---------------- */
export function getAdminMenu(companyId) {
  return [
    {
      key: "dashboard",
      label: "Dashboard",
      simpleLabel: "Dashboard",
      icon: LayoutDashboard,
      href: `/clientDashboard/${companyId}`,
      hasDropdown: false,
      requiredPermission: "dashboard.view",
    },
    {
      key: "users",
      label: "Users",
      simpleLabel: "Users",
      icon: Users,
      href: `/companies/${companyId}/users`,
      hasDropdown: false,
      requiredPermission: "users.view",
    },
    {
      key: "assignments",
      label: "Assignments",
      simpleLabel: "Assignments",
      icon: ClipboardList,
      href: `/companies/${companyId}/assignments`,
      hasDropdown: false,
      requiredPermission: "assignments.view",
    },
  ];
}

/* ---------------- FULL TEMPLATE (PERMISSION-BASED ROLES) ---------------- */
export function getFullCompanyMenuTemplate(companyId) {
  return [
    {
      key: "dashboard",
      label: "Dashboard",
      simpleLabel: "Dashboard",
      icon: LayoutDashboard,
      href: `/clientDashboard/${companyId}`,
      hasDropdown: false,
      requiredPermission: "dashboard.view",
    },
    {
      key: "users",
      label: "Users",
      simpleLabel: "Users",
      icon: Users,
      href: `/companies/${companyId}/users`,
      hasDropdown: false,
      requiredPermission: "users.view",
    },
    {
      key: "assignments",
      label: "Assignments",
      simpleLabel: "Assignments",
      icon: ClipboardList,
      href: `/companies/${companyId}/assignments`,
      hasDropdown: false,
      requiredPermission: "assignments.view",
    },
    {
      key: "settings",
      label: "Settings",
      simpleLabel: "Settings",
      icon: Settings,
      href: `/companies/${companyId}/settings`,
      hasDropdown: false,
      requiredPermission: "settings.view",
    },
  ];
}
