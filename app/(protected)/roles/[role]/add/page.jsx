  // app/(protected)/roles/[role]/add/page.jsx
  import AddRoleContainer from "@/features/roles/containers/AddRole.container.jsx";

  export default function Page({ params }) {
    return <AddRoleContainer role={params.role} />;
  }
