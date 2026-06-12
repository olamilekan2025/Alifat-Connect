import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import SupportTicket from "@/models/SupportTicket";

export async function GET() {
  await connectToDatabase();

  const tickets =
    await SupportTicket.find()
      .sort({
        createdAt: -1,
      });

  return NextResponse.json({
    tickets,
  });
}