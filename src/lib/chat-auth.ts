import { getServerSession } from "next-auth";
// import type { NextApiRequest } from "next";
// import { getToken } from "next-auth/jwt";
import type { Socket } from "socket.io";

import { authOptions } from "@/lib/auth";
import type { ChatUser } from "../../types/chat";

type ChatToken = {
  sub?: string;
  name?: unknown;
  email?: unknown;
  role?: unknown;
};

export async function requireChatUser(): Promise<ChatUser> {
  const session = await getServerSession(authOptions);
  const user = session?.user as ChatUser | undefined;

  if (!user?.id) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role === "admin" ? "admin" : "user",
  };
}

export function requireAdmin(user: ChatUser) {
  if (user.role !== "admin") {
    throw new Response("Forbidden", { status: 403 });
  }
}

export async function getSocketUser(
  socket: Socket,
): Promise<ChatUser | null> {
  const cookie = socket.request.headers.cookie;

  if (!cookie) {
    return null;
  }

  const baseUrl =
    process.env.NEXTAUTH_URL ||
    `http://localhost:${process.env.PORT || 3000}`;

  try {
    const response = await fetch(`${baseUrl}/api/auth/session`, {
      headers: {
        cookie,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const session = (await response.json()) as {
      user?: {
        id?: string;
        name?: string | null;
        email?: string | null;
        role?: string;
      };
    };

    const user = session.user;

    if (!user?.id) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role === "admin" ? "admin" : "user",
    };
  } catch (error) {
    console.error("Socket session validation failed:", error);
    return null;
  }
}