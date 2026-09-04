"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCheck,
  ExternalLink,
} from "lucide-react";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  async function loadNotifications() {
    try {
      setLoading(true);

      const response = await fetch("/api/notifications", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setNotifications((data.notifications || []).slice(0, 5));
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("NOTIFICATION_BELL_LOAD_ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  async function markRead(id: string) {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          action: "mark-read",
          notificationId: id,
        }),
      });

      if (!response.ok) return;

      setNotifications((items) =>
        items.map((item) =>
          item.id === id
            ? { ...item, read: true }
            : item
        )
      );

      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (error) {
      console.error("NOTIFICATION_MARK_READ_ERROR:", error);
    }
  }

  async function markAllRead() {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          action: "mark-all-read",
        }),
      });

      if (!response.ok) return;

      setNotifications((items) =>
        items.map((item) => ({
          ...item,
          read: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("NOTIFICATION_MARK_ALL_ERROR:", error);
    }
  }

  useEffect(() => {
    loadNotifications();

    const interval = window.setInterval(
      loadNotifications,
      30000
    );

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  function formatTime(value: string) {
    const date = new Date(value);
    const now = new Date();

    const diff =
      Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "Just now";

    if (diff < 3600) {
      return `${Math.floor(diff / 60)}m ago`;
    }

    if (diff < 86400) {
      return `${Math.floor(diff / 3600)}h ago`;
    }

    if (diff < 604800) {
      return `${Math.floor(diff / 86400)}d ago`;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  }

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
      >
        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-[18px] text-white shadow-lg">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 z-50 mt-3 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl shadow-black/40">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Notifications
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${
                      unreadCount === 1 ? "" : "s"
                    }`
                  : "You're all caught up"}
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 transition hover:text-blue-300"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Content */}
          <div className="max-h-[390px] overflow-y-auto">
            {loading ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Bell className="mx-auto h-8 w-8 text-slate-700" />

                <p className="mt-3 text-sm font-medium text-slate-400">
                  No notifications
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  New academic updates will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-b border-slate-800 px-4 py-4 transition hover:bg-slate-900 ${
                    notification.read
                      ? ""
                      : "bg-blue-500/[0.04]"
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Status */}
                    <div
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                        notification.read
                          ? "bg-slate-700"
                          : "bg-blue-500"
                      }`}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-white">
                          {notification.title}
                        </h4>

                        <span className="shrink-0 text-[10px] text-slate-600">
                          {formatTime(
                            notification.createdAt
                          )}
                        </span>
                      </div>

                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                        {notification.message}
                      </p>

                      <div className="mt-2 flex items-center gap-3">
                        {!notification.read && (
                          <button
                            type="button"
                            onClick={() =>
                              markRead(notification.id)
                            }
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300"
                          >
                            <Check className="h-3 w-3" />
                            Mark read
                          </button>
                        )}

                        {notification.link && (
                          <Link
                            href={notification.link}
                            onClick={() =>
                              setOpen(false)
                            }
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300"
                          >
                            Open
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-800 p-3">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}