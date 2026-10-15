"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

export function useSocket(enabled: boolean): Socket | null {
  const { data: session, status } = useSession();

  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!enabled || status !== "authenticated") {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    if (socketRef.current) {
      return;
    }

    const defaultSocketUrl = window.location.origin;

    const configuredUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL?.trim() ||
      process.env.NEXT_PUBLIC_SITE_URL?.trim();

    const socketUrl =
      process.env.NODE_ENV === "production"
        ? configuredUrl || defaultSocketUrl
        : defaultSocketUrl;

    const instance = io(socketUrl, {
      path: "/socket.io",
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 30000,
      auth: {
        session: session,
      },
    });

    socketRef.current = instance;
    setSocket(instance);

    instance.on("connect", () => {
      console.info("✅ Socket connected successfully.");
    });

    instance.on("disconnect", (reason) => {
      console.info("⚠️ Socket disconnected:", reason);
    });

    instance.on("connect_error", (error) => {
      console.error("❌ Socket connection failed:", error.message);
      console.error("Connection error details:", {
        message: error.message,
        description: (error as any).description,
        context: (error as any).context,
      });
    });

    return () => {
      instance.disconnect();

      if (socketRef.current === instance) {
        socketRef.current = null;
      }

      setSocket((current) => (current === instance ? null : current));
    };
  }, [enabled, status]);

  return socket;
}
