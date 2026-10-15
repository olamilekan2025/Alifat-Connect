import type { Request } from "express";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isAdmin: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}