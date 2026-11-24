import {
  LayoutDashboard,
  Building2,
  List,
  FolderPlus,
  UserPlus,
  Users,
  UserCog,
  UserCheck,
  PlusCircle,
  MapPin,
  MessageSquare,
  FileText,
  ShieldCheck,
  Award,
  Layers3,
  BarChart3,
  ListChecks,
  Activity,
  Wrench,
  AlertCircle,
  Cog,
  CameraIcon,
  Scale,
  BookOpen,
  AlertTriangle,
  Sliders,
  ClipboardList,
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
      label: "Threshold & Escalation",
      href: "/sla-management",
    },
    {
      icon: Scale,
      label: "SLA Feature Management",
      href: "/sla-rules-management",
    },
    {
      icon: Sliders,
      label: "Feature Management",
      href: "/feature-management",
    },
    {
      icon: ShieldCheck,
      label: "Role Management",
      href: "/role-management",
      key: "role-management",
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
    {
      icon: AlertCircle,
      label: "System Limits",
      href: "/system-limits",
    },
    {
      icon: AlertCircle,
      label: "Service Request",
      href: "/serviceRequest",
    },
    {
      icon: CameraIcon,
      label: "Photo Gallary",
      href: "/photo",
    },
    {
      icon: MessageSquare,
      label: "Feedback Form",
      href: "/feedback",
    },
    {
      icon: MessageSquare,
      label: "Review Management",
      hasDropdown: true,
      key: "review-management",
      children: [
        {
          icon: List,
          label: "Cleaner Activity",
          href: "/review-management/cleaner-activity",
        },
        {
          icon: MessageSquare,
          label: "User Reviews",
          href: "/review-management/user-reviews",
        },
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

export function getSuperadminCompanyMenu(
  companyId,
  isCompanySlaActive = false,
) {
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
      key: "locationTypes",
      href: `/location-types?companyId=${companyId}`,
    },
    {
      icon: Wrench,
      label: "Washrooms",
      key: "washrooms",
      href: `/washrooms?companyId=${companyId}`,
    },
    {
      icon: Users,
      label: "User Management",
      key: "user-management",
      href: `/users?companyId=${companyId}`,
    },
    {
      icon: UserCog,
      label: "User Mapping",
      key: "userMapping",
      href: `/userMapping?companyId=${companyId}`,
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
      key: "facility-companies",
      href: `/facility-company?companyId=${companyId}`,
    },
    // {
    //   icon: Building2,
    //   label: "Shifts",
    //   hasDropdown: true,
    //   key: "Shifts",
    //   children: [
    //     {
    //       icon: List,
    //       label: "View List",
    //       href: `/shifts?companyId=${companyId}`,
    //     },
    //     {
    //       icon: PlusCircle,
    //       label: "Add shift",
    //       href: `/shifts/add?companyId=${companyId}`,
    //     },
    //     {
    //       icon: PlusCircle,
    //       label: "Shift Management",
    //       href: `/shifts/assignment?companyId=${companyId}`,
    //     },
    //   ],
    // },
    {
      icon: MapPin,
      label: "Locate On Map",
      href: `/locations?companyId=${companyId}`,
    },
    {
      icon: Activity,
      label: "Cleaner Activity",
      href: `/cleaners?companyId=${companyId}`,
    },
    {
      icon: ClipboardList,
      label: "Cleaning Tasks",
      key: "cleaning-tasks",
      href: `/cleaning-tasks?companyId=${companyId}`,
    },
    {
      icon: ShieldCheck,
      label: "Threshold & Escalation",
      hasDropdown: true,
      key: "sla-management",
      children: [
        {
          icon: Cog,
          label: "Threshold Configuration",
          href: `/sla-management?companyId=${companyId}`,
        },
        {
          icon: List,
          label: "Escalation Logs",
          href: `/sla-logs?companyId=${companyId}`,
        },
      ],
    },
    {
      icon: Scale,
      label: "SLA Management",
      key: "sla-rules",
      hasDropdown: true,
      children: [
        {
          icon: BookOpen,
          label: "Rule Books & Ledger",
          href: `/sla-penalty?companyId=${companyId}`,
        },
        {
          icon: AlertTriangle,
          label: "Disputes",
          href: `/sla-penalty/disputes?companyId=${companyId}`,
        },
      ],
    },
    {
      icon: UserCheck,
      label: "Attendance",
      href: `/attendance?companyId=${companyId}`,
    },
    {
      icon: Cog,
      label: "Dynamic Configuration",
      href: `/configurations?companyId=${companyId}`,
    },
    {
      icon: MessageSquare,
      label: "User Review",
      key: "user-review-menu",
      href: `/users/review?companyId=${companyId}`,
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

export function getAdminMenu(companyId, isCompanySlaActive = false) {
  return [
    {
      icon: BarChart3,
      label: "Dashboard",
      href: `/clientDashboard/${companyId}`,
    },
    {
      icon: Layers3,
      label: "Location Hierarchy",
      key: "locationTypes",
      href: `/location-types?companyId=${companyId}`,
    },
    {
      icon: Wrench,
      label: "Washrooms",
      key: "washrooms",
      href: `/washrooms?companyId=${companyId}`,
    },
    {
      icon: Users,
      label: "User Management",
      key: "user-management",
      href: `/users?companyId=${companyId}`,
    },
    {
      icon: UserCog,
      label: "User Mapping",
      key: "user-mapping",
      href: `/userMapping?companyId=${companyId}`,
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
      key: "facility-companies",
      href: `/facility-company?companyId=${companyId}`,
    },

    // {
    //   icon: Building2,
    //   label: "Shifts",
    //   hasDropdown: true,
    //   key: "Shifts",
    //   children: [
    //     {
    //       icon: List,
    //       label: "View List",
    //       href: `/shifts?companyId=${companyId}`,
    //     },
    //     {
    //       icon: PlusCircle,
    //       label: "Add shift",
    //       href: `/shifts/add?companyId=${companyId}`,
    //     },
    //     {
    //       icon: PlusCircle,
    //       label: "Shift Management",
    //       href: `/shifts/assignment?companyId=${companyId}`,
    //     },
    //   ],
    // },

    {
      icon: MapPin,
      label: "Locate On Map",
      href: `/locations?companyId=${companyId}`,
    },
    {
      icon: Activity,
      label: "Cleaner Activity",
      href: `/cleaners?companyId=${companyId}`,
    },
    {
      icon: ClipboardList,
      label: "Cleaning Tasks",
      key: "cleaning-tasks",
      href: `/cleaning-tasks?companyId=${companyId}`,
    },
    {
      icon: ShieldCheck,
      label: "Threshold & Escalation",
      hasDropdown: true,
      key: "sla-management",
      children: [
        {
          icon: Cog,
          label: "Threshold Configuration",
          href: `/sla-management?companyId=${companyId}`,
        },
        {
          icon: List,
          label: "Escalation Logs",
          href: `/sla-logs?companyId=${companyId}`,
        },
      ],
    },
    {
      icon: Scale,
      label: "SLA Management",
      key: "sla-rules",
      hasDropdown: true,
      children: [
        {
          icon: BookOpen,
          label: "Rule Books & Ledger",
          href: `/sla-penalty?companyId=${companyId}`,
        },
        {
          icon: AlertTriangle,
          label: "Disputes",
          href: `/sla-penalty/disputes?companyId=${companyId}`,
        },
      ],
    },
    {
      icon: UserCheck,
      label: "Attendance",
      href: `/attendance?companyId=${companyId}`,
    },
    {
      icon: Cog,
      label: "Dynamic Configuration",
      href: `/configurations?companyId=${companyId}`,
    },
    {
      icon: MessageSquare,
      label: "User Review",
      key: "company-admin-user-review-menu",
      href: `/users/review?companyId=${companyId}`,
    },
    {
      icon: FileText,
      label: "Reports",
      href: `/reports?companyId=${companyId}`,
    },
  ];
}
/* ---------------- FULL TEMPLATE (PERMISSION-BASED ROLES) ---------------- */
export const getFullCompanyMenuTemplate = (
  companyId,
  isCompanySlaActive = false,
) => [
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
    href: `/location-types?companyId=${companyId}`,
  },
  {
    icon: Wrench,
    label: "Washrooms",
    simpleLabel: "Washrooms",
    requiredPermission: "locations.view",
    key: "washrooms",
    href: `/washrooms?companyId=${companyId}`,
  },
  {
    icon: Users,
    label: "User Management",
    simpleLabel: "User Management",
    requiredPermission: "users.view",
    key: "user-management",
    href: `/users?companyId=${companyId}`,
  },
  {
    icon: UserCog,
    label: "User Mapping",
    simpleLabel: "User Mapping",
    requiredPermission: "assignments.view",
    key: "userMapping",
    href: `/userMapping?companyId=${companyId}`,
  },
  {
    icon: Building2,
    label: "Facility Companies",
    simpleLabel: "Facility Companies",
    requiredPermission: "facility_companies.view",
    key: "facility-companies",
    href: `/facility-company?companyId=${companyId}`,
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
    href: `/cleaners?companyId=${companyId}`,
  },
  {
    icon: ClipboardList,
    label: "Cleaning Tasks",
    simpleLabel: "Cleaning Tasks",
    key: "cleaning-tasks",
    href: `/cleaning-tasks?companyId=${companyId}`,
  },
  {
    icon: ShieldCheck,
    label: "Threshold & Escalation",
    simpleLabel: "Threshold & Escalation",
    requiredPermission: "sla_management.view",
    key: "sla-management",
    hasDropdown: true,
    children: [
      {
        icon: Cog,
        label: "Threshold Configuration",
        simpleLabel: "Threshold Configuration",
        requiredPermission: "sla_management.view",
        href: `/sla-management?companyId=${companyId}`,
      },
      {
        icon: List,
        label: "Escalation Logs",
        simpleLabel: "Escalation Logs",
        requiredPermission: "sla_management.view",
        href: `/sla-logs?companyId=${companyId}`,
      },
    ],
  },
  {
    icon: Scale,
    label: "SLA Management",
    simpleLabel: "SLA Management",
    requiredPermission: ["sla_management.view", "cleaner_reviews.view", "cleaner_reviews.manage"],
    key: "sla-rules",
    hasDropdown: true,
    children: [
      {
        icon: BookOpen,
        label: "Rule Books & Ledger",
        simpleLabel: "Rule Books & Ledger",
        href: `/sla-penalty?companyId=${companyId}`,
      },
      {
        icon: AlertTriangle,
        label: "Disputes",
        simpleLabel: "Disputes",
        href: `/sla-penalty/disputes?companyId=${companyId}`,
      },
    ],
  },
  {
    icon: UserCheck,
    label: "Attendance",
    href: `/attendance?companyId=${companyId}`,
  },
  {
    icon: Cog,
    label: "Dynamic Configuration",
    simpleLabel: "Dynamic Configuration",
    requiredPermission: "configurations.view",
    href: `/configurations?companyId=${companyId}`,
  },
  {
    icon: MessageSquare,
    label: "User Review",
    simpleLabel: "User Review",
    requiredPermission: "cleaner_reviews.view",
    href: `/users/review?companyId=${companyId}`,
  },
  {
    icon: FileText,
    label: "Reports",
    simpleLabel: "Reports",
    requiredPermission: "reports.view",
    href: `/reports?companyId=${companyId}`,
  },
];
