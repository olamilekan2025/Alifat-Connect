import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
  override: true,
});

// Fallback for development if .env.local doesn't exist
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = "dev-secret-change-in-production";
  console.warn("⚠️  Using fallback NEXTAUTH_SECRET. Set this in .env.local for production!");
}

// console.log("Mongo URI:", process.env.MONGODB_URI);

import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { registerChatSocket } from "./src/lib/socket/server";

declare global {
  var paymentSocketEmitters: {
    emitPaymentApproved: (data: Record<string, unknown>) => void;
    emitPaymentRejected: (data: Record<string, unknown>) => void;
    emitPaymentUpdate: (data: Record<string, unknown>) => void;
  } | null;
}

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = Number(process.env.PORT || 3000);

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(async () => {
  const httpServer = createServer(handler);

const io = new Server(httpServer, {
  path: "/socket.io",

  cors: {
    origin: process.env.NODE_ENV === "production"
      ? ["https://alifat-connect-production.up.railway.app"]
      : ["http://localhost:3000", "http://127.0.0.1:3000", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"],
    credentials: true,
  },

  transports: ["websocket", "polling"],
});

  const socketEmitters = await registerChatSocket(io);

  // Set global reference for payment API endpoints
  global.paymentSocketEmitters = socketEmitters;

  httpServer.listen(port, "0.0.0.0", () => {
  console.log("================================");
  console.log("Socket.IO Server Started");
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Port: ${port}`);
  console.log("================================");
});
});