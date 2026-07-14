import mongoose from "mongoose";

mongoose.set("strictQuery", true);

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached =
  global.mongooseCache ||
  {
    conn: null,
    promise: null,
  };

global.mongooseCache = cached;

export async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is missing. Add it to your .env.local file."
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "alifat-connect-pay",
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log("✅ MongoDB Connected");
    return cached.conn;
  } catch (error) {
    cached.conn = null;
    cached.promise = null;
    console.error("❌ MongoDB Connection Error:", error);
    throw error;
  }
}

export const connectDB = connectToDatabase;