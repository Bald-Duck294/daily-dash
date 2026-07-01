"use client";

import { use } from "react";
import RoleDetailsContainer from "@/features/roles/containers/RoleDetails.container";

export default function Page({ params }) {
  // Safely unwrap the params Promise
  const { role, id } = use(params);

  return <RoleDetailsContainer role={role} id={id} />;
}