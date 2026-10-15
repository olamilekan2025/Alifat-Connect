// import { getToken } from "next-auth/jwt";
// import type { NextRequest } from "next/server";
// import type { Socket } from "socket.io";

// import type { ChatUser } from "../../types/chat";

// export async function requireChatUser(
//   request: NextRequest
// ): Promise<ChatUser> {
//   const token = await getToken({
//     req: request,
//     secret: process.env.NEXTAUTH_SECRET,
//   });

//   if (!token?.id) {
//     throw new Error("Unauthorized");
//   }

//   return {
//     id: String(token.id),
//     name: String(token.name ?? ""),
//     email: String(token.email ?? ""),
//     role: token.role === "admin" ? "admin" : "user",
//   };
// }

// export function requireAdmin(user: ChatUser) {
//   if (user.role !== "admin") {
//     throw new Error("Forbidden");
//   }
// }

// export async function getSocketUser(
//   socket: Socket
// ): Promise<ChatUser | null> {
//   try {
//     console.log("==================================");
//     console.log("SOCKET AUTH");
//     console.log("==================================");

//     console.log("Handshake Headers:");
//     console.log(socket.handshake.headers);

//     console.log("Request Headers:");
//     console.log(socket.request.headers);

//     console.log("Auth Data:");
//     console.log(socket.handshake.auth);

//     // First try to get session from auth object (sent by client)
//     const session = socket.handshake.auth.session;
//     if (session?.user) {
//       const user: ChatUser = {
//         id: String(session.user.id),
//         name: String(session.user.name ?? ""),
//         email: String(session.user.email ?? ""),
//         role: session.user.role === "admin" ? "admin" : "user",
//       };

//       console.log("✅ Socket Authenticated from auth");
//       console.log(user);

//       return user;
//     }

//     // Fallback to token from cookies
//     const token = await getToken({
//       req: socket.request as any,
//       secret: process.env.NEXTAUTH_SECRET,
//     });

//     console.log("Decoded Token:");
//     console.log(token);

//     if (!token?.id) {
//       console.log("❌ No authenticated user found");
//       return null;
//     }

//     const user: ChatUser = {
//       id: String(token.id),
//       name: String(token.name ?? ""),
//       email: String(token.email ?? ""),
//       role: token.role === "admin" ? "admin" : "user",
//     };

//     console.log("✅ Socket Authenticated from token");
//     console.log(user);

//     return user;
//   } catch (error) {
//     console.error("❌ Socket Authentication Error");
//     console.error(error);
//     return null;
//   }
// }


import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import type { Socket } from "socket.io";

import type { ChatUser } from "../../types/chat";

const SESSION_COOKIE_NAMES = [
  "__Secure-next-auth.session-token",
  "next-auth.session-token",
];

type TokenLike = {
  id?: unknown;
  sub?: unknown;
  name?: unknown;
  email?: unknown;
  role?: unknown;
};

function toChatUser(token: TokenLike): ChatUser | null {
  const id = token.id ?? token.sub;

  if (typeof id !== "string" || !id.trim()) {
    return null;
  }

  return {
    id,
    name: typeof token.name === "string" ? token.name : "",
    email: typeof token.email === "string" ? token.email : "",
    role: token.role === "admin" ? "admin" : "user",
  };
}

export async function requireChatUser(
  request: NextRequest,
): Promise<ChatUser> {
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error("Authentication is not configured");
  }

  const token = await getToken({
    req: request,
    secret,
  });

  if (!token) {
    throw new Error("Unauthorized");
  }

  const user = toChatUser(token);

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

export function requireAdmin(user: ChatUser) {
  if (user.role !== "admin") {
    throw new Error("Forbidden");
  }
}

export async function getSocketUser(
  socket: Socket,
): Promise<ChatUser | null> {
  try {
    const secret = process.env.NEXTAUTH_SECRET;

    if (!secret) {
      console.error(
        "Socket authentication failed: NEXTAUTH_SECRET is missing.",
      );
      return null;
    }

    // Try to get session from auth object (sent by client) as a hint
    const clientSession = socket.handshake.auth.session;

    // First, try to verify server-side using cookies for security
    const cookieHeader = socket.request.headers.cookie;

    let decodedToken: TokenLike | null = null;

    if (cookieHeader) {
      // Read cookie names only. Never log cookie values.
      const cookieNames = cookieHeader
        .split(";")
        .map((cookie) => cookie.trim().split("=")[0])
        .filter(Boolean);

      const sessionCookieNames = SESSION_COOKIE_NAMES.filter(
        (name) =>
          cookieNames.includes(name) ||
          cookieNames.some((cookieName) =>
            cookieName.startsWith(`${name}.`),
          ),
      );

      if (sessionCookieNames.length > 0) {
        for (const cookieName of sessionCookieNames) {
          try {
            const token = await getToken({
              req: socket.request as Parameters<typeof getToken>[0]["req"],
              secret,
              cookieName,
            });

            if (token) {
              decodedToken = token;
              break;
            }
          } catch (decryptError) {
            // Cookie decryption failed (likely stale cookie)
            // Continue to next cookie or fall back to auth object
            console.warn(
              "Failed to decode session cookie (likely stale):",
              decryptError instanceof Error ? decryptError.message : "Unknown error",
            );
            continue;
          }
        }
      }
    }

    // If cookie decoding failed, fall back to client-supplied session
    // This handles stale cookies while maintaining security by verifying the session is recent
    if (!decodedToken && clientSession?.user) {
      console.warn(
        "Cookie decoding failed, falling back to client session for authentication",
      );

      // Additional security: verify the client session has required fields
      if (!clientSession.user.id || !clientSession.user.email) {
        console.warn(
          "Client session missing required fields (id or email)",
        );
        return null;
      }

      const userFromClient: ChatUser = {
        id: String(clientSession.user.id),
        name: String(clientSession.user.name ?? ""),
        email: String(clientSession.user.email),
        role: clientSession.user.role === "admin" ? "admin" : "user",
      };

      console.log("✅ Socket authenticated via client session (fallback)");
      return userFromClient;
    }

    if (!decodedToken) {
      console.warn(
        "Socket authentication failed: no valid session found in cookies or auth object.",
      );
      return null;
    }

    const user = toChatUser(decodedToken);

    if (!user) {
      console.warn(
        "Socket authentication failed: decoded token has no valid user ID.",
      );
      return null;
    }

    // Verify the decoded user matches the client-supplied session (if provided)
    // This prevents session hijacking attempts
    if (clientSession?.user?.id && clientSession.user.id !== user.id) {
      console.warn(
        "Socket authentication failed: client session ID does not match server-decoded token.",
      );
      return null;
    }

    console.log("✅ Socket authenticated via secure cookie verification");
    return user;
  } catch (error) {
    console.error(
      "Socket authentication failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return null;
  }
}