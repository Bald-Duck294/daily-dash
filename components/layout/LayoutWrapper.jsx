"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import dynamic from "next/dynamic";
import AuthChecker from "./AuthChecker";

const Sidebar = dynamic(() => import("./Sidebar"), { ssr: false });

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  // Routes that get full-screen layout (no sidebar/header)
  const hideLayoutFor = ["/", "/login", "/register", "/stepper" , "/company-setup"];
  const shouldHideLayout = hideLayoutFor.includes(pathname);

  if (shouldHideLayout) {
    return <AuthChecker>{children}</AuthChecker>;
  }

  return (
    <AuthChecker>
      <div className="flex h-screen w-full bg-[var(--background)]">
        {/* Sidebar */}
        <Sidebar />

        {/* Main area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthChecker>
  );
}
