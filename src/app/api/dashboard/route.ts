import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    // GET SESSION
    const session =
      await getServerSession(
        authOptions
      );

    // CHECK AUTH
    if (!session?.user?.email) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // CONNECT MONGODB
    const mongoose =
      await connectToDatabase();

    // GET DATABASE
    const db =
      mongoose.connection.db;

    // SAFETY CHECK
    if (!db) {
      return NextResponse.json(
        {
          message:
            "Database not connected",
        },
        {
          status: 500,
        }
      );
    }

    // FIND USER
    const user =
      await db.collection("users").findOne({
        email: session.user.email,
      });

    // USER NOT FOUND
    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    // FIND WALLET
    const wallet =
      await db
        .collection("wallets")
        .findOne({
          userId:
            user._id.toString(),
        });

    // GET TRANSACTIONS
    const transactions = await db
      .collection("transactions")
      .find({
        userId:
          user._id.toString(),
      })
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .toArray();

    // TOTAL TRANSACTIONS
    const totalTransactions =
      transactions.length;

    // SUCCESSFUL TRANSACTIONS
    const successfulTransactions =
      transactions.filter(
        (trx: any) =>
          trx.status ===
          "Successful"
      ).length;

    // SUCCESS RATE
    const successfulRate =
      totalTransactions > 0
        ? Math.round(
            (successfulTransactions /
              totalTransactions) *
              100
          )
        : 0;

    // FORMAT TRANSACTIONS
    const formattedTransactions =
      transactions.map((trx: any) => ({
        id:
          trx._id?.toString() ||
          "",

        title:
          trx.title ||
          "Transaction",

        amount: `₦${Number(
          trx.amount || 0
        ).toLocaleString()}`,

        status:
          trx.status ||
          "Pending",

        time: formatTimeAgo(
          trx.createdAt
        ),
      }));

    // RETURN RESPONSE
    return NextResponse.json({
   user: {
  name:
    user.name ||
    `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim() ||
    "User",

  email:
    user.email || "",

  membershipLevel:
    user.membershipLevel || "starter",
},

      wallet: {
        balance:
          wallet?.balance || 0,
      },

      stats: {
        totalTransactions,

        successfulRate,
      },

      transactions:
        formattedTransactions,
    });
  } catch (error) {
    console.error(
      "Dashboard API Error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

// FORMAT TIME
function formatTimeAgo(
  date: Date | string
) {
  if (!date) {
    return "Just now";
  }

  const now = new Date().getTime();

  const created = new Date(
    date
  ).getTime();

  const diff = Math.floor(
    (now - created) / 1000
  );

  if (diff < 60) {
    return `${diff} secs ago`;
  }

  if (diff < 3600) {
    return `${Math.floor(
      diff / 60
    )} mins ago`;
  }

  if (diff < 86400) {
    return `${Math.floor(
      diff / 3600
    )} hours ago`;
  }

  return `${Math.floor(
    diff / 86400
  )} days ago`;
}