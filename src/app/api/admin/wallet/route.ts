import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Wallet from "@/models/Wallet";

export async function GET() {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    let wallet = await Wallet.findOne({
      walletType: "SYSTEM",
    }).lean();

    if (!wallet) {
      await Wallet.create({
        walletType: "SYSTEM",
        balance: 0,
        totalInflow: 0,
        totalOutflow: 0,
        pendingCredits: 0,
        pendingDebits: 0,
        currency: "NGN",
      });

      wallet = await Wallet.findOne({
        walletType: "SYSTEM",
      }).lean();
    }

    return NextResponse.json(
      {
        success: true,
        balance: wallet?.balance ?? 0,
        totalInflow: wallet?.totalInflow ?? 0,
        totalOutflow: wallet?.totalOutflow ?? 0,
        pendingCredits: wallet?.pendingCredits ?? 0,
        pendingDebits: wallet?.pendingDebits ?? 0,
        currency: wallet?.currency ?? "NGN",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Wallet fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load wallet.",
      },
      { status: 500 }
    );
  }
}