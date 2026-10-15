"use client";

import { useSocket } from "./useSocket";

export function useChatSocket(enabled: boolean) {
  return useSocket(enabled);
}