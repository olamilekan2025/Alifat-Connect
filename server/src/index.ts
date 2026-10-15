import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import express from "express";
import cors from "cors";

import { connectToDatabase } from "../../src/lib/mongodb";
import apiRouter from "./routes";

const app = express();

const PORT = Number(process.env.API_PORT || 5000);

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.NEXT_PUBLIC_SITE_URL,
].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Mount all API routes.
app.use("/api/v1", apiRouter);

// Health check.
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Alifat Connect Express API is running",
    timestamp: new Date().toISOString(),
  });
});

async function startServer(): Promise<void> {
  try {
    await connectToDatabase();

    app.listen(PORT, "0.0.0.0", () => {
      console.log("----------------------------------");
      console.log("Alifat Connect Express API started");
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`Port: ${PORT}`);
      console.log(`Health: http://localhost:${PORT}/api/health`);
      console.log(`API v1: http://localhost:${PORT}/api/v1`);
      console.log("----------------------------------");
    });
  } catch (error: unknown) {
    console.error("Failed to start Express API:", error);
    process.exit(1);
  }
}

void startServer();