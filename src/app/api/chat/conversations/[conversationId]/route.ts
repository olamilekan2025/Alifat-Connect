import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { objectId } from "../../../../../lib/chat-utils";
import { requireAdmin, requireChatUser } from "../../../../../lib/chat-auth";
import { Conversation } from "../../../../../models/Conversation";
import { Message } from "../../../../../models/Message";
import { Notification } from "../../../../../models/Notification";

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  await connectDB();

  const { conversationId: id } = await params;

  const user = await requireChatUser();
  requireAdmin(user);

  const conversationId = objectId(id);

  const deleted = await Conversation.findByIdAndDelete(conversationId);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await Message.deleteMany({ conversationId });
  await Notification.deleteMany({ conversationId });

  return NextResponse.json({ ok: true });
}

