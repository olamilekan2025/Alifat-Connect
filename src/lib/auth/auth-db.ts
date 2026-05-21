import { ObjectId, Db } from "mongodb";

import { connectToDatabase } from "@/lib/mongodb";

export type MongoId =
  | string
  | ObjectId;

async function getDb(): Promise<Db> {
  const mongoose =
    await connectToDatabase();

  const db =
    mongoose.connection.db;

  if (!db) {
    throw new Error(
      "Database connection failed"
    );
  }

  return db;
}

export async function getUserByEmail(
  email: string
) {
  const db = await getDb();

  return db.collection("users").findOne({
    email:
      email.toLowerCase(),
  });
}

export async function setEmailVerified(
  email: string
) {
  const db = await getDb();

  await db.collection("users").updateOne(
    {
      email:
        email.toLowerCase(),
    },
    {
      $set: {
        emailVerified: true,

        emailVerifiedAt:
          new Date(),
      },
    }
  );
}

export async function markUsedById(
  collection: string,
  id: MongoId
) {
  const db = await getDb();

  const objectId =
    typeof id === "string"
      ? new ObjectId(id)
      : id;

  await db
    .collection(collection)
    .updateOne(
      {
        _id: objectId,
      },
      {
        $set: {
          usedAt:
            new Date(),
        },
      }
    );
}