// import mongoose, {
//   Mongoose,
// } from "mongoose";

// const MONGODB_URI =
//   process.env.MONGODB_URI;

// if (!MONGODB_URI) {
//   throw new Error(
//     "MONGODB_URI is missing in .env.local"
//   );
// }

// declare global {
//   // eslint-disable-next-line no-var
//   var mongooseGlobal:
//     | {
//         conn: Mongoose | null;

//         promise:
//           | Promise<Mongoose>
//           | null;
//       }
//     | undefined;
// }

// const cached =
//   global.mongooseGlobal || {
//     conn: null,
//     promise: null,
//   };

// export async function connectToDatabase() {
//   try {
//     // RETURN EXISTING CONNECTION
//     if (cached.conn) {
//       return cached.conn;
//     }

//     // CREATE NEW CONNECTION
//     if (!cached.promise) {
//       cached.promise =
//         mongoose.connect(
//           MONGODB_URI!,
//           {
//             dbName:
//               "alifat-connect-pay",

//             bufferCommands: false,
//           }
//         );
//     }

//     // WAIT FOR CONNECTION
//     cached.conn =
//       await cached.promise;

//     // SAVE CONNECTION GLOBALLY
//     global.mongooseGlobal =
//       cached;

//     console.log(
//       "MongoDB Connected Successfully"
//     );

//     return cached.conn;
//   } catch (error) {
//     console.error(
//       "DATABASE ERROR:",
//       error
//     );

//     throw new Error(
//       "Database connection failed"
//     );
//   }
// }



import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is missing in .env.local");
}

// Proper global type
declare global {
  // eslint-disable-next-line no-var
  var mongooseGlobal:
    | {
        conn: Mongoose | null;
        promise: Promise<Mongoose> | null;
      }
    | undefined;
}

// FIX: ensure global object is properly initialized
const globalWithMongoose = global as typeof globalThis & {
  mongooseGlobal: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
};

if (!globalWithMongoose.mongooseGlobal) {
  globalWithMongoose.mongooseGlobal = {
    conn: null,
    promise: null,
  };
}

export async function connectToDatabase(): Promise<Mongoose> {
  const cached = globalWithMongoose.mongooseGlobal;

  // Return existing connection
  if (cached.conn) return cached.conn;

  // If a connection is already in-flight, await it
  if (cached.promise) {
    cached.conn = await cached.promise;
    return cached.conn;
  }

  if (!MONGODB_URI) {
    // (Note: we already throw at module-load, but keep this for safety)
    throw new Error("MONGODB_URI is missing. Check your .env.local");
  }

  // Create a new connection
  try {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "alifat-connect-pay",
      bufferCommands: false,
      // Fail fast so Next.js requests don't hang for 30-40s
      serverSelectionTimeoutMS: 10_000,

    });

    cached.conn = await cached.promise;
    console.log("✅ MongoDB Connected Successfully");
    return cached.conn;
  } catch (error) {
    // reset bad connection so next request retries cleanly
    cached.promise = null;
    cached.conn = null;

    console.error("❌ DATABASE ERROR (MongoDB connection failed):", error);

    // Surface actionable information
    throw new Error(
      "Database connection failed. Verify MongoDB Atlas URI and Network Access (IP allowlist / correct cluster / credentials)."
    );
  }
}
