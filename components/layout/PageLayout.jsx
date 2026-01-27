"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function PageLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar takes its own width */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content sits immediately next to sidebar */}
      <div className="flex flex-col flex-1 min-h-screen bg-[var(--background)]">
        <Header title="Dashboard" />

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
