// import dotenv from "dotenv";

// dotenv.config({
//   path: ".env.local",
//   override: true,
// });

// // Fallback for development if .env.local doesn't exist
// if (!process.env.NEXTAUTH_SECRET) {
//   process.env.NEXTAUTH_SECRET = "dev-secret-change-in-production";
//   console.warn("⚠️  Using fallback NEXTAUTH_SECRET. Set this in .env.local for production!");
// }

// // console.log("Mongo URI:", process.env.MONGODB_URI);

// import { createServer } from "http";
// import next from "next";
// import { Server } from "socket.io";
// import { registerChatSocket } from "./src/lib/socket/server";

// declare global {
//   var paymentSocketEmitters: {
//     emitPaymentApproved: (data: Record<string, unknown>) => void;
//     emitPaymentRejected: (data: Record<string, unknown>) => void;
//     emitPaymentUpdate: (data: Record<string, unknown>) => void;
//   } | null;
// }

// const dev = process.env.NODE_ENV !== "production";
// const hostname = "0.0.0.0";
// const port = Number(process.env.PORT || 3000);

// const app = next({ dev, hostname, port });
// const handler = app.getRequestHandler();

// app.prepare().then(async () => {
//   const httpServer = createServer(handler);

// const io = new Server(httpServer, {
//   path: "/socket.io",

//   cors: {
//     origin: process.env.NODE_ENV === "production"
//       ? (process.env.NEXT_PUBLIC_SITE_URL ? [process.env.NEXT_PUBLIC_SITE_URL] : true)
//       : ["http://localhost:3000", "http://127.0.0.1:3000", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"],
//     credentials: true,
//   },

//   transports: ["websocket", "polling"],
// });

//   const socketEmitters = await registerChatSocket(io);

//   // Set global reference for payment API endpoints
//   global.paymentSocketEmitters = socketEmitters;

//   httpServer.listen(port, "0.0.0.0", () => {
//   console.log("================================");
//   console.log("Socket.IO Server Started");
//   console.log(`Environment: ${process.env.NODE_ENV}`);
//   console.log(`Port: ${port}`);
//   console.log("================================");
// });
// });

import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
  override: true,
});

declare global {
  var paymentSocketEmitters: {
    emitPaymentApproved: (data: Record<string, unknown>) => void;
    emitPaymentRejected: (data: Record<string, unknown>) => void;
    emitPaymentUpdate: (data: Record<string, unknown>) => void;
  } | null;
}

async function startServer() {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error(
      "NEXTAUTH_SECRET is missing from .env.local",
    );
  }

  // Load application modules after environment variables are loaded.
  const { createServer } = await import("node:http");
  const next = (await import("next")).default;
  const { Server } = await import("socket.io");
  const { registerChatSocket } = await import(
    "./src/lib/socket/server"
  );

  const dev = process.env.NODE_ENV !== "production";
  const hostname = "0.0.0.0";
  const port = Number(process.env.PORT || 3000);

  const app = next({
    dev,
    hostname,
    port,
  });

  await app.prepare();

  const httpServer = createServer(app.getRequestHandler());

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  const io = new Server(httpServer, {
    path: "/socket.io",

    cors: {
      origin: dev
        ? [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
          ]
        : siteUrl
          ? [siteUrl]
          : [],
      credentials: true,
    },

    transports: ["websocket", "polling"],
  });

  const socketEmitters = await registerChatSocket(io);

  // Make payment event emitters available to API routes.
  global.paymentSocketEmitters = socketEmitters;

  httpServer.listen(port, hostname, () => {
    console.log("================================");
    console.log("Socket.IO Server Started");
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Port: ${port}`);
    console.log("================================");
  });
}

startServer().catch((error: unknown) => {
  console.error(
    "Server startup failed:",
    error instanceof Error ? error.message : error,
  );

  process.exitCode = 1;
});
