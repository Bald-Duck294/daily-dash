import {
  LayoutDashboard,
  Building2,
  List,
  FolderTree,
  FolderPlus,
  UserPlus,
  Users,
  UserCog,
  PlusCircle,
  Toilet,
  ClipboardList,
  MapPin,
  Building,
  MessageSquare,
  FileText,
  ShieldCheck,
  Award,
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
// export function getAdminMenu(companyId) {
//   return [
//     {
//       key: "dashboard",
//       label: "Dashboard",
//       simpleLabel: "Dashboard",
//       icon: LayoutDashboard,
//       href: `/clientDashboard/${companyId}`,
//       hasDropdown: false,
//       requiredPermission: "dashboard.view",
//     },
//     {
//       key: "users",
//       label: "Users",
//       simpleLabel: "Users",
//       icon: Users,
//       href: `/companies/${companyId}/users`,
//       hasDropdown: false,
//       requiredPermission: "users.view",
//     },
//     {
//       key: "assignments",
//       label: "Assignments",
//       simpleLabel: "Assignments",
//       icon: ClipboardList,
//       href: `/companies/${companyId}/assignments`,
//       hasDropdown: false,
//       requiredPermission: "assignments.view",
//     },
//   ];
// }

export function getAdminMenu(companyId) {
  return [
    {
      icon: Building,
      label: "Dashboard",
      href: `/clientDashboard/${companyId}`,
    },
    {
      icon: FolderTree,
      label: "Location Hierarchy",
      hasDropdown: true,
      key: "locationTypes",
      children: [
        {
          icon: List,
          label: "View Hierarchy",
          href: `/location-types?companyId=${companyId}`,
        },
        {
          icon: FolderPlus,
          label: "Add Hierarchy",
          href: `/location-types/add?companyId=${companyId}`,
        },
      ],
    },
    {
      icon: Toilet,
      label: "Washrooms",
      hasDropdown: true,
      key: "washrooms",
      children: [
        {
          icon: List,
          label: "Washrooms List",
          href: `/washrooms?companyId=${companyId}`,
        },
        {
          icon: PlusCircle,
          label: "Add Washroom",
          href: `/washrooms/add-location?companyId=${companyId}`,
        },
      ],
    },
    {
      icon: Users,
      label: "User Management",
      hasDropdown: true,
      key: "user-management",
      children: [
        {
          icon: List,
          label: "User List",
          href: `/users?companyId=${companyId}`,
        },
        {
          icon: UserPlus,
          label: "Add User",
          href: `/users/add?companyId=${companyId}`,
        },
      ],
    },
    {
      icon: ClipboardList,
      label: "User Mapping",
      hasDropdown: true,
      key: "cleaner-assignments",
      children: [
        {
          icon: List,
          label: "Mapped List",
          href: `/cleaner-assignments?companyId=${companyId}`,
        },
        {
          icon: UserCog,
          label: "Add Mapping",
          href: `/cleaner-assignments/add?companyId=${companyId}`,
        },
      ],
    },
    // {
    //   icon: ShieldCheck,
    //   label: "Role Management",
    //   hasDropdown: true,
    //   key: "role-management",
    //   children: [
    //     {
    //       icon: List,
    //       label: "Role List",
    //       href: "/role-management",
    //     },
    //     {
    //       icon: PlusCircle,
    //       label: "Add Role",
    //       href: "/role-management/add",
    //     },
    //   ],
    // },
    {
      icon: Building2,
      label: "Facility Companies",
      hasDropdown: true,
      key: "facility-companies",
      children: [
        {
          icon: List,
          label: "View List",
          href: `/facility-company?companyId=${companyId}`,
        },
        {
          icon: PlusCircle,
          label: "Add Facility",
          href: `/facility-company/add?companyId=${companyId}`,
        },
      ],
    },
    {
      icon: MapPin,
      label: "Locate On Map",
      href: `/locations?companyId=${companyId}`,
    },
    {
      icon: ClipboardList,
      label: "Cleaner Activity",
      href: `/cleaner-review?companyId=${companyId}`,
    },
    {
      icon: Building,
      label: "User Review",
      href: `/user-activity?companyId=${companyId}`,
    },
    {
      icon: FileText,
      label: "Reports",
      href: `/reports?companyId=${companyId}`,
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
