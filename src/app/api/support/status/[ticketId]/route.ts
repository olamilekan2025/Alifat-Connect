import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import SupportTicket from "@/models/SupportTicket";

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: {
      ticketId: string;
    };
  }
) {
  await connectToDatabase();

  const ticket =
    await SupportTicket.findOne({
      ticketId: params.ticketId,
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