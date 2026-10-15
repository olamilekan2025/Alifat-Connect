
import { Router } from "express";
import { getUserCount } from "../controllers/userController";
import {
  getUserProfile,
  getUserSettings,
  updateUserSettings,
} from "../controllers/userController";
import { requireDevApiKey } from "../middleware/devApiKey";
import { authenticate } from "../middleware/auth";

const router = Router();

// Public endpoints (with dev API key protection)
router.get("/count", requireDevApiKey, getUserCount);

// Authenticated user endpoints
router.get("/profile", authenticate, getUserProfile);
router.get("/settings", authenticate, getUserSettings);
router.put("/settings", authenticate, updateUserSettings);

export default router;
