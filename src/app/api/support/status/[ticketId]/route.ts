import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import SupportTicket from "@/models/SupportTicket";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      ticketId: string;
    }>;
  }
) {
  await connectToDatabase();

  const { ticketId } = await params;

  const ticket = await SupportTicket.findOne({
    ticketId,
  });

  if (!ticket) {
    return NextResponse.json(
      {
        error: "Ticket not found",
      },
      { status: 404 }
    );
  }

  return NextResponse.json(ticket);
}