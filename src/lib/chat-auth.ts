import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import type { Socket } from "socket.io";

import type { ChatUser } from "../../types/chat";

export async function requireChatUser(
  request: NextRequest
): Promise<ChatUser> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) {
    throw new Error("Unauthorized");
  }

  return {
    id: String(token.id),
    name: String(token.name ?? ""),
    email: String(token.email ?? ""),
    role: token.role === "admin" ? "admin" : "user",
  };
}

export function requireAdmin(user: ChatUser) {
  if (user.role !== "admin") {
    throw new Error("Forbidden");
  }
}

export async function getSocketUser(
  socket: Socket
): Promise<ChatUser | null> {
  try {
    console.log("==================================");
    console.log("SOCKET AUTH");
    console.log("==================================");

    console.log("Handshake Headers:");
    console.log(socket.handshake.headers);

    console.log("Request Headers:");
    console.log(socket.request.headers);

    console.log("Auth Data:");
    console.log(socket.handshake.auth);

    // First try to get session from auth object (sent by client)
    const session = socket.handshake.auth.session;
    if (session?.user) {
      const user: ChatUser = {
        id: String(session.user.id),
        name: String(session.user.name ?? ""),
        email: String(session.user.email ?? ""),
        role: session.user.role === "admin" ? "admin" : "user",
      };

      console.log("✅ Socket Authenticated from auth");
      console.log(user);

      return user;
    }

    // Fallback to token from cookies
    const token = await getToken({
      req: socket.request as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    console.log("Decoded Token:");
    console.log(token);

    if (!token?.id) {
      console.log("❌ No authenticated user found");
      return null;
    }

    const user: ChatUser = {
      id: String(token.id),
      name: String(token.name ?? ""),
      email: String(token.email ?? ""),
      role: token.role === "admin" ? "admin" : "user",
    };

    console.log("✅ Socket Authenticated from token");
    console.log(user);

    return user;
  } catch (error) {
    console.error("❌ Socket Authentication Error");
    console.error(error);
    return null;
  }
}