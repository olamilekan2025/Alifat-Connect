import type { Request, Response, NextFunction } from "express";
import { getToken } from "next-auth/jwt";
import type { AuthenticatedRequest } from "../types/express";

const SESSION_COOKIE_NAMES = [
  "__Secure-next-auth.session-token",
  "next-auth.session-token",
];

/**
 * Extract session token from cookies
 */
function getSessionToken(req: Request): string | null {
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";").map((c) => c.trim());

  for (const cookieName of SESSION_COOKIE_NAMES) {
    const cookie = cookies.find((c) => c.startsWith(`${cookieName}=`));
    if (cookie) {
      return cookie.substring(cookieName.length + 1);
    }
  }

  return null;
}

/**
 * Authentication middleware for Express
 * Verifies NextAuth JWT session and attaches user to request
 */
export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const secret = process.env.NEXTAUTH_SECRET;

    if (!secret) {
      console.error("NEXTAUTH_SECRET is not configured");
      res.status(500).json({
        success: false,
        message: "Authentication is not configured",
      });
      return;
    }

    // Try to get token using next-auth/jwt's getToken
    // This automatically handles cookie extraction and JWT verification
    const token = await getToken({
      req: req as any,
      secret,
    });

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    // Extract user information from token
    const userId = typeof token.id === "string" ? token.id : typeof token.sub === "string" ? token.sub : "";
    const email = typeof token.email === "string" ? token.email : "";
    const name = typeof token.name === "string" ? token.name : "";
    const role = typeof token.role === "string" ? token.role : "user";

    if (!userId || !email) {
      res.status(401).json({
        success: false,
        message: "Invalid session",
      });
      return;
    }

    // Attach user to request
    req.user = {
      id: userId,
      email,
      name,
      role,
      isAdmin: role === "admin",
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
}

/**
 * Admin-only middleware
 * Checks if authenticated user has admin role
 */
export async function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // First ensure user is authenticated
  await authenticate(req, res, async (err) => {
    if (err) return next(err);

    if (!req.user || !req.user.isAdmin) {
      res.status(403).json({
        success: false,
        message: "Forbidden: Admin access required",
      });
      return;
    }

    next();
  });
}

/**
 * Optional authentication middleware
 * Attaches user if authenticated, but doesn't require it
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const secret = process.env.NEXTAUTH_SECRET;

    if (!secret) {
      next();
      return;
    }

    const token = await getToken({
      req: req as any,
      secret,
    });

    if (token) {
      const userId = typeof token.id === "string" ? token.id : typeof token.sub === "string" ? token.sub : "";
      const email = typeof token.email === "string" ? token.email : "";
      const name = typeof token.name === "string" ? token.name : "";
      const role = typeof token.role === "string" ? token.role : "user";

      if (userId && email) {
        req.user = {
          id: userId,
          email,
          name,
          role,
          isAdmin: role === "admin",
        };
      }
    }

    next();
  } catch (error) {
    // Don't fail the request if optional auth fails
    console.error("Optional authentication error:", error);
    next();
  }
}
