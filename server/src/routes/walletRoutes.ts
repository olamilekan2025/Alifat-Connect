
import { Router } from "express";
import {
  getWallet,
  fundWallet,
  withdrawWallet,
} from "../controllers/walletController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, getWallet);
router.post("/fund", authenticate, fundWallet);
router.post("/withdraw", authenticate, withdrawWallet);

export default router;
