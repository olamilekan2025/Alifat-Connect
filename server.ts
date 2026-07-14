import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
  override: true,
});

// console.log("Mongo URI:", process.env.MONGODB_URI);

import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { registerChatSocket } from "./src/lib/socket/server";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = Number(process.env.PORT || 3000);

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(async () => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin:
        process.env.NEXT_PUBLIC_APP_URL ??
        `http://${hostname}:${port}`,
      credentials: true,
    },
  });

  await registerChatSocket(io);

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});