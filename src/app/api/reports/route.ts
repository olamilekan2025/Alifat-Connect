import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

import Transaction from "@/models/transaction";

export async function GET() {
  try {
    await connectToDatabase();

    const session =
      await getServerSession(
        authOptions
      );

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const transactions = (
      await Transaction.find({
        userId: session.user.id,
      })
        .sort({
          createdAt: -1,
        })
        .lean()
    ).map((tx: any) => ({
      ...tx,
      _id: tx._id.toString(),
    }));

    const totalSpent =
      transactions
        .filter(
          (tx) =>
            tx.type ===
              "debit" &&
            tx.status ===
              "success"
        )
        .reduce(
          (sum, tx) =>
            sum + tx.amount,
          0
        );

    const totalFunded =
      transactions
        .filter(
          (tx) =>
            tx.type ===
              "credit" &&
            tx.status ===
              "success"
        )
        .reduce(
          (sum, tx) =>
            sum + tx.amount,
          0
        );

    const successful =
      transactions.filter(
        (tx) =>
          tx.status ===
          "success"
      ).length;

    const failed =
      transactions.filter(
        (tx) =>
          tx.status ===
          "failed"
      ).length;

    const pending =
      transactions.filter(
        (tx) =>
          tx.status ===
          "pending"
      ).length;

    const airtime =
      transactions
        .filter(
          (tx) =>
            tx.category ===
              "airtime" &&
            tx.status ===
              "success"
        )
        .reduce(
          (sum, tx) =>
            sum + tx.amount,
          0
        );

    const data =
      transactions
        .filter(
          (tx) =>
            tx.category ===
              "data" &&
            tx.status ===
              "success"
        )
        .reduce(
          (sum, tx) =>
            sum + tx.amount,
          0
        );

    const transfer =
      transactions
        .filter(
          (tx) =>
            tx.category ===
              "transfer" &&
            tx.status ===
              "success"
        )
        .reduce(
          (sum, tx) =>
            sum + tx.amount,
          0
        );

    const funding =
      transactions
        .filter(
          (tx) =>
            tx.category ===
              "funding" &&
            tx.status ===
              "success"
        )
        .reduce(
          (sum, tx) =>
            sum + tx.amount,
          0
        );

    const withdrawal =
      transactions
        .filter(
          (tx) =>
            tx.category ===
              "withdrawal" &&
            tx.status ===
              "success"
        )
        .reduce(
          (sum, tx) =>
            sum + tx.amount,
          0
        );

        

    return NextResponse.json({
      totalSpent,
      totalFunded,
      successful,
      failed,
      pending,
      airtime,
      data,
      transfer,
      funding,
      withdrawal,

      transactions:
        transactions.slice(
          0,
          20
        ),
    });
  } catch (error) {
    console.error(
      "Reports API Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch reports",
      },
      {
        status: 500,
      }
    );
  }
}