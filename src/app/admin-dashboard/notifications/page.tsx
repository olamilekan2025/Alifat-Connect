"use client";

import { useMemo, useState } from "react";
import { useNotifications } from "@/context/NotificationContext";
import { NotificationItem } from "@/components/notifications/notification-item";
import { Button } from "@/components/ui/button";
import { CheckCheck, Trash2, BellOff, Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Filter = "all" | "unread";

export default function AdminNotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
  } = useNotifications();

  const [filter, setFilter] = useState<Filter>("all");

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

  const visibleNotifications = useMemo(
    () =>
      filter === "unread"
        ? notifications.filter((n) => !n.isRead)
        : notifications,
    [notifications, filter]
  );

  return (
    <div className="mx-auto space-y-8 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {loading
              ? "Loading updates…"
              : unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "You're all caught up"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-9 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-9 text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      {!loading && notifications.length > 0 && (
        <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50/60 p-0.5 dark:border-zinc-800 dark:bg-zinc-900/60">
          {(["all", "unread"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors",
                filter === f
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
              )}
            >
              {f === "all" ? "All" : "Unread"}
              {f === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 text-xs text-zinc-400 dark:text-zinc-500">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-1">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex gap-3 rounded-xl border border-zinc-100 p-4 dark:border-zinc-800/60"
            >
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2 py-0.5">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : visibleNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 py-24 text-center dark:border-zinc-800">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800/80">
            {filter === "unread" ? (
              <Bell className="h-6 w-6 text-zinc-400 dark:text-zinc-500" strokeWidth={1.75} />
            ) : (
              <BellOff className="h-6 w-6 text-zinc-400 dark:text-zinc-500" strokeWidth={1.75} />
            )}
          </div>
          <h3 className="text-base font-medium text-zinc-900 dark:text-white">
            {filter === "unread" ? "Nothing unread" : "No notifications"}
          </h3>
          <p className="mt-1 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
            {filter === "unread"
              ? "New notifications will show up here as they arrive."
              : "You'll see updates here as they come in."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200 dark:divide-zinc-800/60 dark:border-zinc-800">
          {visibleNotifications.map((notification) => (
            <div
              key={notification._id}
              className={cn(
                "group relative transition-colors",
                !notification.isRead
                  ? "bg-zinc-50/70 dark:bg-zinc-900/40"
                  : "bg-white dark:bg-transparent",
                "hover:bg-zinc-50 dark:hover:bg-zinc-900/70"
              )}
            >
              {!notification.isRead && (
                <span className="absolute left-0 top-0 h-full w-0.5 bg-zinc-900 dark:bg-white" />
              )}
              <NotificationItem
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}