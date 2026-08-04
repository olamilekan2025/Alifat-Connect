"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import { NotificationItem } from "./notification-item";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CheckCheck, Trash2, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface NotificationDropdownProps {
  role?: "user" | "admin";
}

export function NotificationDropdown({ role = "user" }: NotificationDropdownProps) {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
  } = useNotifications();

  const [open, setOpen] = useState(false);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleClearAll = async () => {
    await clearNotifications();
  };

  const notificationsPage = role === "admin" ? "/admin-dashboard/notifications" : "/dashboard/notifications";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative h-10 w-10 rounded-2xl border border-zinc-200 bg-white/90 shadow-sm transition-all hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 sm:h-11 sm:w-11"
        >
          <Bell className="h-4 w-4 text-zinc-700 dark:text-zinc-200" />

          {unreadCount > 0 && (
            <span className="absolute right-2.5 top-2.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
          )}

          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 rounded-2xl border border-zinc-200 bg-white p-0 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 p-3 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {unreadCount} unread
              </p>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleMarkAllAsRead}
              title="Mark all as read"
            >
              <CheckCheck className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="space-y-2 p-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 p-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <svg
                  className="h-6 w-6 text-zinc-400 dark:text-zinc-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">
                No notifications
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between border-t border-zinc-200 p-3 dark:border-zinc-800">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-red-500 hover:text-red-600"
              onClick={handleClearAll}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Clear all
            </Button>

            <Link href={notificationsPage} onClick={() => setOpen(false)}>
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                View all
                <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
