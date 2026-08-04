"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

export function useChatSocket(enabled: boolean): Socket | null {
  const { status, data: session } = useSession();

  const socketRef = useRef<Socket | null>(null);

  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!enabled) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      return;
    }

    if (status !== "authenticated") {
      return;
    }

    // Prevent duplicate sockets
    if (socketRef.current) {
      return;
    }

    const defaultSocketUrl = window.location.origin;
    const envSocketUrl = process.env.NEXT_PUBLIC_SOCKET_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();
    const socketUrl =
      process.env.NODE_ENV === "production"
        ? envSocketUrl || defaultSocketUrl
        : defaultSocketUrl;

    if (
      process.env.NODE_ENV !== "production" &&
      envSocketUrl &&
      envSocketUrl !== defaultSocketUrl
    ) {
      console.warn(
        "Ignoring NEXT_PUBLIC_SOCKET_URL in development. Using current origin for Socket.IO:",
        defaultSocketUrl,
      );
    }

    console.log("Connecting Socket.IO:", socketUrl);
    console.log("Environment:", process.env.NODE_ENV);
    console.log("NEXT_PUBLIC_SOCKET_URL:", process.env.NEXT_PUBLIC_SOCKET_URL);
    console.log("NEXT_PUBLIC_SITE_URL:", process.env.NEXT_PUBLIC_SITE_URL);

 const instance = io(socketUrl, {
    path: "/socket.io",

    withCredentials: true,

    transports: ["websocket", "polling"],

    autoConnect: true,

    reconnection: true,

    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,

    timeout: 20000,

    auth: {
      session,
    },
});

    socketRef.current = instance;
    setSocket(instance);

    instance.on("connect", () => {
      console.log("✅ Socket connected");
      console.log("ID:", instance.id);
      console.log(
        "Transport:",
        instance.io.engine.transport.name
      );
    });

    instance.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    instance.on("connect_error", (err) => {
      console.error("Socket connection failed");
      console.error(err.message);
      console.error(err);
    });

    instance.io.on("reconnect_attempt", (attempt) => {
      console.log("Reconnect attempt:", attempt);
    });

    instance.io.on("reconnect", (attempt) => {
      console.log("Reconnected:", attempt);
    });

    return () => {
      instance.removeAllListeners();
      instance.disconnect();

      socketRef.current = null;
      setSocket(null);
    };
  }, [enabled, status, session]);

  return socket;
}