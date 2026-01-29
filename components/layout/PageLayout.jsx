"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function PageLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content */}
      {/* <div
        className={`
          flex flex-col min-h-screen
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? "ml-64" : "ml-16"}
        `}
      > */}

      <div
        className={`
          flex flex-col min-h-screen
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? "ml-64" : "ml-16"}
          max-[786px]:ml-0

        `}
      >
        <Header title="Dashboard" sidebarOpen={sidebarOpen} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
