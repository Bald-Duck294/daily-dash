// components/auth/ClientAuthGuard.jsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClientAuthGuard({ children }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.replace("/login");
    }
  }, []);

  return children;
}
