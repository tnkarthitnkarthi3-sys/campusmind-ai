"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";

type LogoutButtonProps = {
  className?: string;
  showLabel?: boolean;
};

export default function LogoutButton({
  className = "",
  showLabel = true,
}: LogoutButtonProps) {
  const [loggingOut, setLoggingOut] = useState(false);

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

      // Remove client-side cached auth information if any.
      try {
        sessionStorage.clear();
      } catch {
        // Ignore storage errors.
      }

      try {
        localStorage.removeItem("campusmind_user");
        localStorage.removeItem("campusmind_user_role");
      } catch {
        // Ignore storage errors.
      }

      // Replace history so the user cannot simply return to
      // the authenticated page using the browser Back button.
      window.location.replace("/login");
    } catch (error) {
      console.error("LOGOUT ERROR:", error);

      setLoggingOut(false);

      // Even if the API has a temporary issue, send the user
      // back to login instead of leaving them stuck.
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
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl",
        "border border-white/10 bg-white/[0.04]",
        "px-4 py-2.5 text-sm font-semibold text-white/80",
        "transition-all duration-200",
        "hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      ].join(" ")}
    >
      {loggingOut ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}

      {showLabel && (
        <span>{loggingOut ? "Logging out..." : "Logout"}</span>
      )}
    </button>
  );
}
