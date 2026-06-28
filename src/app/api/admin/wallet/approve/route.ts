import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Wallet from "@/models/Wallet";
import Transaction from "@/models/transaction";

export async function PATCH(req: NextRequest) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, action } = await req.json();

    if (!id) {
      return NextResponse.json(
        { message: "Transaction ID is required." },
        { status: 400 }
      );
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { message: "Invalid action." },
        { status: 400 }
      );
    }

   const requestTicket = await Transaction.findOneAndUpdate(
  {
    _id: id,
    status: "pending",
  },
  {
    $set: { status: "processing" },
  },
  {
    new: true,
  }
);

    if (!requestTicket) {
      return NextResponse.json(
        {
          message:
            "Request not found or has already been processed.",
        },
        { status: 404 }
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
      });
    }

    // Reject request
    if (action === "reject") {
      if (requestTicket.type === "credit") {
        wallet.pendingCredits = Math.max(
          0,
          (wallet.pendingCredits || 0) - requestTicket.amount
        );
      }

      if (requestTicket.type === "debit") {
        wallet.pendingDebits = Math.max(
          0,
          (wallet.pendingDebits || 0) - requestTicket.amount
        );
      }

      await wallet.save();

      requestTicket.status = "failed";
    requestTicket.set({
  status: "failed",
  rejectionReason:
    "Rejected by administrator",
  approvedAt: new Date(),
  approvedBy:
    session.user.email ||
    session.user.name ||
    "Admin",
});

await requestTicket.save();

      await requestTicket.save();

      return NextResponse.json({
        success: true,
        message: "Request rejected successfully.",
      });
    }

    // Approve request
    if (requestTicket.type === "credit") {
      wallet.balance += requestTicket.amount;
      wallet.totalInflow += requestTicket.amount;

      wallet.pendingCredits = Math.max(
        0,
        (wallet.pendingCredits || 0) - requestTicket.amount
      );
    } else if (requestTicket.type === "debit") {
      if (wallet.balance < requestTicket.amount) {
        return NextResponse.json(
          {
            message:
              "Insufficient wallet balance for this debit.",
          },
          { status: 400 }
        );
      }

      wallet.balance -= requestTicket.amount;
      wallet.totalOutflow += requestTicket.amount;

      wallet.pendingDebits = Math.max(
        0,
        (wallet.pendingDebits || 0) - requestTicket.amount
      );
    }

    await wallet.save();

    requestTicket.status = "success";
  requestTicket.set({
  status: "success",
  approvedAt: new Date(),
  approvedBy:
    session.user.email ||
    session.user.name ||
    "Admin",
});

await requestTicket.save();

    await requestTicket.save();

    return NextResponse.json({
      success: true,
      message: "Request approved successfully.",
      wallet: {
        balance: wallet.balance,
        totalInflow: wallet.totalInflow,
        totalOutflow: wallet.totalOutflow,
        pendingCredits: wallet.pendingCredits,
        pendingDebits: wallet.pendingDebits,
      },
    });
  } catch (error) {
    console.error("Wallet approval error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}