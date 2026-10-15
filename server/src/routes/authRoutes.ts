import { Router } from "express";

import {
  registerUser,
  verifyUserEmail,
  resendVerificationCode,
  checkEmailVerification,
} from "../controllers/authController";

import {
  forgotPassword,
  resetPassword,
} from "../controllers/passwordController";

import { getAuthenticatedUser } from "../controllers/authTestController";
import { authenticate } from "../middleware/auth";

const router = Router();

// Registration and email verification
router.post("/register", registerUser);
router.post("/verify-email", verifyUserEmail);
router.post("/resend-verification", resendVerificationCode);
router.post("/check-email-verification", checkEmailVerification);

// Password reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Authenticated user endpoint
router.get("/me", authenticate, getAuthenticatedUser);

export default router;
