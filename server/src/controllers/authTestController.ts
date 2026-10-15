import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/express";

/**
 * GET /api/v1/auth/me
 * Returns the authenticated user's information
 */
export async function getAuthenticatedUser(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        isAdmin: req.user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Get authenticated user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user information",
    });
  }
}
