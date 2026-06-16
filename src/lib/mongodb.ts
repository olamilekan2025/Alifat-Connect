import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is missing in your environment variables."
  );
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached =
  global.mongooseCache ??
  {
    conn: null,
    promise: null,
  };

global.mongooseCache = cached;

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!, {
      dbName: "alifat-connect-pay",
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    });
  }

  try {
    cached.conn = await cached.promise;

    mongoose.set("strictQuery", true);

    console.log("✅ MongoDB Connected Successfully");

    return cached.conn;
  } catch (error) {
    cached.conn = null;
    cached.promise = null;

    console.error(
      "❌ MongoDB connection error:",
      error
    );

    throw error;
  }
}