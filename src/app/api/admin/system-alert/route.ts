import { NextRequest, NextResponse } from "next/server";
import { sendNotification } from "@/lib/notification-service";

export async function POST(req: NextRequest) {
  const body = await req.json();

  await sendNotification({
    event: "system",
    title: body.title,
    message: body.message,
  });

  return NextResponse.json({ success: true });
}