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
  Layers3,
  BarChart3,
  Map,
  ListChecks,
  Activity,
  Wrench,
} from "lucide-react";

/* ---------------- SUPERADMIN (NO COMPANY) ---------------- */
// export function getSuperadminMainMenu() {
//   return [
//     {
//       key: "dashboard",
//       label: "Dashboard",
//       simpleLabel: "Dashboard",
//       icon: LayoutDashboard,
//       href: "/dashboard",
//       hasDropdown: false,
//       requiredPermission: "dashboard.view",
//     },
//     {
//       key: "companies",
//       label: "Companies",
//       simpleLabel: "Companies",
//       icon: Building,
//       href: "/companies",
//       hasDropdown: false,
//       requiredPermission: "companies.view",
//     },
//   ];
// }

export function getSuperadminMainMenu() {
  return [
    {
      icon: BarChart3,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: Building2,
      label: "Organizations",
      href: "/companies",
    },
    {
      icon: Award,
      label: "Score Management",
      href: "/score-management",
    },
    {
      icon: ShieldCheck,
      label: "Role Management",
      hasDropdown: true,
      key: "role-management",
      children: [
        {
          icon: List,
          label: "Role List",
          href: "/role-management",
        },
        {
          icon: PlusCircle,
          label: "Add Role",
          href: "/role-management/add",
        },
      ],
    },
    {
      icon: Users,
      label: "All Users",
      hasDropdown: true,
      key: "all-users",
      children: [
        {
          icon: List,
          label: "Superadmin",
          href: "/roles/superadmin",
        },
        {
          icon: List,
          label: "Admin",
          href: "/roles/admin",
        },
        {
          icon: List,
          label: "Cleaner",
          href: "/roles/cleaner",
        },
        // {
        //   icon: List,
        //   label: "Superadmin",
        //   href: "/role/superadmin",
        // },
      ],
    },
  ];
}
/* ---------------- SUPERADMIN (INSIDE COMPANY) ---------------- */
// export function getSuperadminCompanyMenu(companyId) {
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
//       key: "management",
//       label: "Management",
//       icon: Users,
//       hasDropdown: true,
//       requiredPermission: "users.view",
//       children: [
//         {
//           label: "Users",
//           href: `/companies/${companyId}/users`,
//           requiredPermission: "users.view",
//         },
//         {
//           label: "Admins",
//           href: `/companies/${companyId}/admins`,
//           requiredPermission: "admins.view",
//         },
//       ],
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
//     {
//       key: "settings",
//       label: "Settings",
//       simpleLabel: "Settings",
//       icon: Settings,
//       href: `/companies/${companyId}/settings`,
//       hasDropdown: false,
//       requiredPermission: "settings.view",
//     },
//   ];
// }

export function getSuperadminCompanyMenu(companyId) {
  return [
    {
      icon: BarChart3,
      label: "Main Dashboard",
      href: "/dashboard",
    },
    {
      icon: LayoutDashboard,
      label: "Client Dashboard",
      href: `/clientDashboard/${companyId}`,
    },
    {
      icon: Layers3,
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
      icon: Wrench,
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
      icon: UserCog,
      label: "User Mapping",
      hasDropdown: true,
      key: "userMapping",
      children: [
        {
          icon: List,
          label: "Mapped List",
          href: `/userMapping?companyId=${companyId}`,
        },
        {
          icon: ListChecks,
          label: "Add Mapping",
          href: `/userMapping/add?companyId=${companyId}`,
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
      icon: Activity,
      label: "Cleaner Activity",
      href: `/cleaner-review?companyId=${companyId}`,
    },
    {
      icon: MessageSquare,
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
      icon: BarChart3,
      label: "Dashboard",
      href: `/clientDashboard/${companyId}`,
    },
    {
      icon: Layers3,
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
      icon: Wrench,
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
      icon: UserCog,
      label: "User Mapping",
      hasDropdown: true,
      key: "user-mapping",
      children: [
        {
          icon: List,
          label: "Mapped List",
          href: `/userMapping?companyId=${companyId}`,
        },
        {
          icon: ListChecks,
          label: "Add Mapping",
          href: `/userMapping/add?companyId=${companyId}`,
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
      icon: Activity,
      label: "Cleaner Activity",
      href: `/cleaner-review?companyId=${companyId}`,
    },
    {
      icon: MessageSquare,
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
export const getFullCompanyMenuTemplate = (companyId) => [
  {
    icon: BarChart3,
    label: "Dashboard",
    simpleLabel: "Dashboard",
    requiredPermission: "dashboard.view",
    href: `/clientDashboard/${companyId}`,
  },
  {
    icon: Layers3,
    label: "Location Hierarchy",
    simpleLabel: "Location Hierarchy",
    requiredPermission: "location_types.view",
    key: "locationTypes",
    children: [
      {
        icon: List,
        label: "View Hierarchy",
        requiredPermission: "location_types.view",
        href: `/location-types?companyId=${companyId}`,
      },
      {
        icon: FolderPlus,
        label: "Add Hierarchy",
        requiredPermission: "location_types.add",
        href: `/location-types/add?companyId=${companyId}`,
      },
    ],
  },
  {
    icon: Wrench,
    label: "Washroom Management",
    simpleLabel: "Washrooms",
    requiredPermission: "locations.view",
    key: "washrooms",
    children: [
      {
        icon: List,
        label: "Washrooms List",
        requiredPermission: "locations.view",
        href: `/washrooms?companyId=${companyId}`,
      },
      {
        icon: PlusCircle,
        label: "Add Washroom",
        requiredPermission: "locations.add",
        href: `/washrooms/add-location?companyId=${companyId}`,
      },
    ],
  },
  {
    icon: Users,
    label: "User Management",
    simpleLabel: "Users",
    requiredPermission: "users.view",
    key: "user-management",
    children: [
      {
        icon: List,
        label: "User List",
        requiredPermission: "users.view",
        href: `/users?companyId=${companyId}`,
      },
      {
        icon: UserPlus,
        label: "Add User",
        requiredPermission: "users.add",
        href: `/users/add?companyId=${companyId}`,
      },
    ],
  },
  {
    icon: UserCog,
    label: "User Mapping",
    simpleLabel: "User Mapping",
    requiredPermission: "assignments.view",
    key: "userMapping",
    children: [
      {
        icon: List,
        label: "Mapped List",
        requiredPermission: "assignments.view",
        href: `/userMapping?companyId=${companyId}`,
      },
      {
        icon: PlusCircle,
        label: "Add Mapping",
        requiredPermission: "assignments.add",
        href: `/userMapping/add?companyId=${companyId}`,
      },
    ],
  },
  {
    icon: Building2,
    label: "Facility Companies",
    simpleLabel: "Facility Companies",
    requiredPermission: "facility_companies.view",
    key: "facility-companies",
    children: [
      {
        icon: List,
        label: "View List",
        requiredPermission: "facility_companies.view",
        href: `/facility-company?companyId=${companyId}`,
      },
      {
        icon: PlusCircle,
        label: "Add Facility",
        requiredPermission: "facility_companies.add",
        href: `/facility-company/add?companyId=${companyId}`,
      },
    ],
  },
  {
    icon: MapPin,
    label: "Locate On Map",
    simpleLabel: "Locate On Map",
    requiredPermission: "locations.view",
    href: `/locations?companyId=${companyId}`,
  },
  {
    icon: Activity,
    label: "Cleaner Activity",
    simpleLabel: "Cleaner Activity",
    requiredPermission: "cleaner_reviews.view",
    href: `/cleaner-review?companyId=${companyId}`,
  },
  {
    icon: MessageSquare,
    label: "User Review",
    simpleLabel: "User Review",
    requiredPermission: "cleaner_reviews.view",
    href: `/user-activity?companyId=${companyId}`,
  },
  {
    icon: FileText,
    label: "Reports",
    simpleLabel: "Reports",
    requiredPermission: "reports.view",
    href: `/reports?companyId=${companyId}`,
  },
];
