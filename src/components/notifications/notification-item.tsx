"use client";

import { formatNotificationTime, getNotificationIcon } from "@/lib/notifications/client";
import type { NotificationResponse } from "@/lib/notifications/client";
import {
  CheckCircle,
  XCircle,
  Clock,
  Wallet,
  CreditCard,
  Phone,
  Wifi,
  Zap,
  Tv,
  Book,
  Gift,
  Star,
  ShieldAlert,
  LogIn,
  Key,
  User,
  Info,
  UserPlus,
  UserCheck,
  Receipt,
  ArrowUp,
  MessageSquare,
  AlertTriangle,
  Bell,
  MessageCircle,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface NotificationItemProps {
  notification: NotificationResponse;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const iconMap: Record<string, any> = {
  CheckCircle,
  XCircle,
  Clock,
  Wallet,
  CreditCard,
  Phone,
  Wifi,
  Zap,
  Tv,
  Book,
  Gift,
  Star,
  ShieldAlert,
  LogIn,
  Key,
  User,
  Info,
  UserPlus,
  UserCheck,
  Receipt,
  ArrowUp,
  MessageSquare,
  AlertTriangle,
  Bell,
  MessageCircle,
  Check,
};

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const iconName = getNotificationIcon(notification.type);
  const Icon = iconMap[iconName] || Bell;
  const timeAgo = formatNotificationTime(notification.createdAt);

  return (
    <div
      className={`group relative flex gap-3 p-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
        !notification.isRead ? "bg-zinc-50 dark:bg-zinc-900/50" : ""
      }`}
    >
      {/* Icon */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          !notification.isRead
            ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
            : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm font-medium ${
              !notification.isRead
                ? "text-zinc-900 dark:text-white"
                : "text-zinc-600 dark:text-zinc-400"
            }`}
          >
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
          )}
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
          {notification.body}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
            {timeAgo}
          </span>

          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {!notification.isRead && onMarkAsRead && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onMarkAsRead(notification._id)}
              >
                <Check className="h-3 w-3" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-500 hover:text-red-600"
                onClick={() => onDelete(notification._id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
