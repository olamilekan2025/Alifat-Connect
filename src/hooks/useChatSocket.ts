
"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useChatSocket(enabled: boolean): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!enabled) {
      setSocket(null);
      return;
    }

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;

  console.log("Connecting socket to:", socketUrl);

const instance = io(socketUrl, {
  withCredentials: true,
  transports: ["websocket"],
  reconnection: true,
});

instance.on("connect", () => {
  console.log("SOCKET CONNECTED", instance.id);
});

instance.on("connect_error", (err) => {
  console.error("SOCKET ERROR", err);
});

instance.on("disconnect", (reason) => {
  console.log("SOCKET DISCONNECTED", reason);
});

    setSocket(instance);

    return () => {
      instance.disconnect();
      setSocket(null);
    };
  }, [enabled]);

  return socket;
}