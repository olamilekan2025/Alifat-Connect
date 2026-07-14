import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { objectId } from "../../../../../../lib/chat-utils";
import { requireChatUser } from "../../../../../../lib/chat-auth";
import { Conversation } from "../../../../../../models/Conversation";
import { Message } from "../../../../../../models/Message";
import { Notification } from "../../../../../../models/Notification";

export async function POST(
  _: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  await connectDB();

  const { conversationId: id } = await params;

  const user = await requireChatUser();
  const conversationId = objectId(id);
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.role !== "admin" && String(conversation.user) !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await Message.updateMany(
    { conversationId, senderRole: user.role === "admin" ? "user" : "admin", isRead: false },
    { $set: { isRead: true } }
  );

  if (user.role === "admin") conversation.unreadCount.admin = 0;
  else conversation.unreadCount.user = 0;
  await conversation.save();

  if (user.role === "admin") {
    await Notification.create({
      recipientId: conversation.user,
      conversationId,
      type: "message_read",
      title: "Message read",
      body: "Admin has read your message."
    });
  }

  return NextResponse.json({ ok: true });
}

