"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function Header({ title = "Dashboard" }) {
  const [theme, setTheme] = useState("dark");

  // Sync theme on load
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  return (
    <header
      className="
    sticky top-0 z-30 h-14
    flex items-center justify-between
    px-4 sm:px-6
    border-b border-black/10
    bg-[var(--background)] text-[var(--foreground)]
    ml-0 lg:ml-64
  "
    >

      {/* Left: Page title */}
      <h1 className="text-base sm:text-lg font-semibold tracking-tight ">
        {title}
      </h1>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center h-9 w-9 rounded-md
          hover:bg-black/5 transition"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun size={18} />
          ) : (
            <Moon size={18} />
          )}
        </button>
      </div>
    </header>
  );
}
