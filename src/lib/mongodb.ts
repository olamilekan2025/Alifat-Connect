import mongoose, {
  Mongoose,
} from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is missing in .env.local"
  );
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseGlobal:
    | {
        conn: Mongoose | null;

        promise:
          | Promise<Mongoose>
          | null;
      }
    | undefined;
}

const cached =
  global.mongooseGlobal || {
    conn: null,
    promise: null,
  };

export async function connectToDatabase() {
  try {
    // RETURN EXISTING CONNECTION
    if (cached.conn) {
      return cached.conn;
    }

    // CREATE NEW CONNECTION
    if (!cached.promise) {
      cached.promise =
        mongoose.connect(
          MONGODB_URI!,
          {
            dbName:
              "alifat-connect-pay",

            bufferCommands: false,
          }
        );
    }

    // WAIT FOR CONNECTION
    cached.conn =
      await cached.promise;

    // SAVE CONNECTION GLOBALLY
    global.mongooseGlobal =
      cached;

    console.log(
      "MongoDB Connected Successfully"
    );

    return cached.conn;
  } catch (error) {
    console.error(
      "DATABASE ERROR:",
      error
    );

    throw new Error(
      "Database connection failed"
    );
  }
}