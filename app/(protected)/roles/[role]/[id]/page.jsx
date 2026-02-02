"use client";

import RoleDetailsContainer from "@/features/roles/containers/RoleDetails.container";

export default function Page({ params }) {
  const { role, id } = params;

  return <RoleDetailsContainer role={role} id={id} />;
}
