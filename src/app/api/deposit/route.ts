import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { sendNotification } from "../../../lib/notification-service";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { userId, amount } = body;

    // TODO: your deposit logic here
    // e.g. update wallet balance

    await sendNotification({
      event: "deposit",
      userId,
      title: "💰 Deposit Successful",
      message: `You deposited ₦${amount}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}