import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Wallet from "@/models/Wallet";
import Transaction from "@/models/transaction";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const type = body?.type;
    const amount = Number(body?.amount);
    const note = String(body?.note ?? "").trim();

    if (type !== "credit" && type !== "debit") {
      return NextResponse.json(
        { message: "Invalid transaction type." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { message: "Amount must be greater than zero." },
        { status: 400 }
      );
    }

    if (!note) {
      return NextResponse.json(
        { message: "A note is required for this adjustment." },
        { status: 400 }
      );
    }

    let wallet = await Wallet.findOne({
      walletType: "SYSTEM",
    });

    if (!wallet) {
      wallet = await Wallet.create({
        walletType: "SYSTEM",
        balance: 0,
        totalInflow: 0,
        totalOutflow: 0,
        pendingCredits: 0,
        pendingDebits: 0,
        currency: "NGN",
      });
    }

    // Prevent impossible debit requests
    if (type === "debit" && wallet.balance < amount) {
      return NextResponse.json(
        {
          message:
            "Insufficient wallet balance to create this debit request.",
        },
        { status: 400 }
      );
    }

    // Track pending requests
    if (type === "credit") {
      wallet.pendingCredits =
        (wallet.pendingCredits || 0) + amount;
    } else {
      wallet.pendingDebits =
        (wallet.pendingDebits || 0) + amount;
    }

    await wallet.save();

    const reference = `REQ-${Date.now()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const transaction = await Transaction.create({
      userId: "ADMIN_WALLET",
      type,
      category: "funding",
      amount,
      status: "pending",
      description: note,
      reference,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Adjustment request created successfully.",
        transaction,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Adjustment request error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}