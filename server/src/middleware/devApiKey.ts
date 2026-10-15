
import type { Request, Response, NextFunction } from "express";

export function requireDevApiKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const expectedKey = process.env.EXPRESS_DEV_API_KEY;
  const providedKey = req.header("x-dev-api-key");

  if (
    process.env.NODE_ENV === "production" ||
    !expectedKey ||
    !providedKey ||
    providedKey !== expectedKey
  ) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
    return;
  }

  next();
}
