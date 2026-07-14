
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

    const instance = io(socketUrl, {
      withCredentials: true,
      transports: ["polling", "websocket"],
      reconnection: true,
    });

    setSocket(instance);

    return () => {
      instance.disconnect();
      setSocket(null);
    };
  }, [enabled]);

  return socket;
}