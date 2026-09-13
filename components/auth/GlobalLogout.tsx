"use client";

import { useEffect, useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";

export default function GlobalLogout() {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  // Do not show logout on authentication pages
  const hiddenPaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];

  const shouldHide = hiddenPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (shouldHide) {
    return null;
  }

  async function handleLogout() {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      try {
        sessionStorage.clear();
      } catch {}

      try {
        localStorage.removeItem("campusmind_user");
        localStorage.removeItem("campusmind_user_role");
      } catch {}

      window.location.replace("/login");
    } catch (error) {
      console.error("GLOBAL LOGOUT ERROR:", error);

      // Even if the request fails, send the user to login.
      setLoggingOut(false);
      window.location.replace("/login");
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loggingOut}
      aria-label="Logout"
      title="Logout"
      className="fixed right-5 top-5 z-[9999] inline-flex items-center gap-2 rounded-xl border border-white/15 bg-slate-950/90 px-4 py-2.5 text-sm font-bold text-white shadow-xl backdrop-blur-xl transition-all duration-200 hover:border-red-400/40 hover:bg-red-500/15 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loggingOut ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}

      <span>{loggingOut ? "Logging out..." : "Logout"}</span>
    </button>
  );
}
