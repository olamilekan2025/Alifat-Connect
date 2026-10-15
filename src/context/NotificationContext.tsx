"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import type {
  NotificationResponse,
  NotificationRecipientRole,
} from "@/lib/notifications/client";
import { useSocket } from "@/hooks/useSocket";

type State = {
  notifications: NotificationResponse[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
};

type Action =
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_NOTIFICATIONS"; notifications: NotificationResponse[] }
  | { type: "ADD_NOTIFICATION"; notification: NotificationResponse }
  | { type: "UPDATE_NOTIFICATION"; notification: NotificationResponse }
  | { type: "REMOVE_NOTIFICATION"; notificationId: string }
  | { type: "SET_UNREAD_COUNT"; count: number }
  | { type: "MARK_AS_READ"; notificationId: string }
  | { type: "MARK_ALL_AS_READ" };

const initialState: State = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.loading };

    case "SET_ERROR":
      return { ...state, error: action.error, loading: false };

    case "SET_NOTIFICATIONS":
      return {
        ...state,
        notifications: action.notifications,
        loading: false,
      };

    case "ADD_NOTIFICATION": {
      const exists = state.notifications.some(
        (n) => n._id === action.notification._id
      );

      if (exists) {
        return state;
      }

      return {
        ...state,
        notifications: [action.notification, ...state.notifications],
        unreadCount: state.unreadCount + (action.notification.isRead ? 0 : 1),
      };
    }

    case "UPDATE_NOTIFICATION": {
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n._id === action.notification._id ? action.notification : n
        ),
      };
    }

    case "REMOVE_NOTIFICATION": {
      const notification = state.notifications.find(
        (n) => n._id === action.notificationId
      );

      return {
        ...state,
        notifications: state.notifications.filter(
          (n) => n._id !== action.notificationId
        ),
        unreadCount: notification && !notification.isRead
          ? state.unreadCount - 1
          : state.unreadCount,
      };
    }

    case "SET_UNREAD_COUNT":
      return { ...state, unreadCount: action.count };

    case "MARK_AS_READ": {
      const notification = state.notifications.find(
        (n) => n._id === action.notificationId
      );

      if (!notification || notification.isRead) {
        return state;
      }

      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n._id === action.notificationId
            ? { ...n, isRead: true, readAt: new Date() }
            : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    }

    case "MARK_ALL_AS_READ": {
      return {
        ...state,
        notifications: state.notifications.map((n) => ({
          ...n,
          isRead: true,
          readAt: new Date(),
        })),
        unreadCount: 0,
      };
    }

    default:
      return state;
  }
}

type NotificationContextValue = State & {
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue | null>(
  null
);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [state, dispatch] = useReducer(reducer, initialState);
  const socket = useSocket(true);

  const enabled = status === "authenticated";
  const userRole = (session?.user?.role as NotificationRecipientRole) || "user";
  const userId = session?.user?.id;

  // Refresh notifications function
  const refreshNotifications = useCallback(async () => {
    if (!userId || !userRole) return;

    dispatch({ type: "SET_LOADING", loading: true });
    dispatch({ type: "SET_ERROR", error: null });

    try {
      const response = await fetch(
        userRole === "admin"
          ? `/api/admin/notifications`
          : `/api/notifications`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();

      dispatch({ type: "SET_NOTIFICATIONS", notifications: data.notifications });
      dispatch({ type: "SET_UNREAD_COUNT", count: data.unreadCount });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      dispatch({
        type: "SET_ERROR",
        error: error instanceof Error ? error.message : "Failed to load notifications",
      });
    }
  }, [userId, userRole]);

  // Fetch notifications on mount and when session changes
  useEffect(() => {
    if (!enabled || !userId) {
      dispatch({ type: "SET_NOTIFICATIONS", notifications: [] });
      dispatch({ type: "SET_UNREAD_COUNT", count: 0 });
      return;
    }

    refreshNotifications();
  }, [enabled, userId, userRole, refreshNotifications]);

  // Listen for new notifications via shared socket
  useEffect(() => {
    if (!socket || !enabled) {
      return;
    }

    const handleNewNotification = (notification: NotificationResponse) => {
      dispatch({ type: "ADD_NOTIFICATION", notification });

      // Show toast for new notification
      toast(notification.title, {
        description: notification.body,
        icon: "🔔",
      });
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, [socket, enabled]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!userId || !userRole) return;

    try {
      const response = await fetch(
        userRole === "admin"
          ? `/api/admin/notifications/${notificationId}/read`
          : `/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      dispatch({ type: "MARK_AS_READ", notificationId });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  }, [userId, userRole]);

  const markAllAsRead = useCallback(async () => {
    if (!userId || !userRole) return;

    try {
      const response = await fetch(
        userRole === "admin"
          ? `/api/admin/notifications/read-all`
          : `/api/notifications/read-all`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      dispatch({ type: "MARK_ALL_AS_READ" });
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  }, [userId, userRole]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!userId || !userRole) return;

    try {
      const response = await fetch(
        userRole === "admin"
          ? `/api/admin/notifications/${notificationId}`
          : `/api/notifications/${notificationId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }

      dispatch({ type: "REMOVE_NOTIFICATION", notificationId });
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  }, [userId, userRole]);

  const clearNotifications = useCallback(async () => {
    if (!userId || !userRole) return;

    try {
      const response = await fetch(
        userRole === "admin"
          ? `/api/admin/notifications/clear`
          : `/api/notifications/clear`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to clear notifications");
      }

      dispatch({ type: "SET_NOTIFICATIONS", notifications: [] });
      dispatch({ type: "SET_UNREAD_COUNT", count: 0 });
      toast.success("All notifications cleared");
    } catch (error) {
      console.error("Error clearing notifications:", error);
      toast.error("Failed to clear notifications");
    }
  }, [userId, userRole]);

  const value: NotificationContextValue = {
    ...state,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}
