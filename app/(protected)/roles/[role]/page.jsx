// app/(protected)/roles/[role]/page.jsx
"use client";

import { useParams } from "next/navigation";
import RolesListContainer from "@/features/roles/containers/RolesList.container";

export default function Page() {
  const { role } = useParams();
  return <RolesListContainer role={role} />;
}
