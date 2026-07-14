import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { objectId } from "../../../../../lib/chat-utils";
import { requireAdmin, requireChatUser } from "../../../../../lib/chat-auth";
import { Message } from "../../../../../models/Message";

import { NextRequest } from "next/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ messageid: string }> },
) {
  await connectDB();
  const user = await requireChatUser();
  requireAdmin(user);

  const { messageid } = await params;
  const deleted = await Message.findByIdAndDelete(objectId(messageid));
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

