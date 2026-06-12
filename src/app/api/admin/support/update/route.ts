import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import SupportTicket from "@/models/SupportTicket";

export async function PATCH(
  request: Request
) {
  await connectToDatabase();

  const {
    ticketId,
    status,
    adminReply,
  } = await request.json();

  const ticket =
    await SupportTicket.findOneAndUpdate(
      { ticketId },
      {
        status,
        adminReply,
      },
      {
        new: true,
      }
    );

  return NextResponse.json({
    success: true,
    ticket,
  });
}