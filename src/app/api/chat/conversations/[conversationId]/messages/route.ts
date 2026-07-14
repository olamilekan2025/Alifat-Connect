import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { objectId, serializeMessage } from "../../../../../../lib/chat-utils";
import { requireChatUser } from "../../../../../../lib/chat-auth";
import { Conversation } from "../../../../../../models/Conversation";
import { Message } from "../../../../../../models/Message";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  await connectDB();

  const { conversationId: id } = await params;

  const user = await requireChatUser();
  const conversationId = objectId(id);
  const cursor = req.nextUrl.searchParams.get("cursor");
  const search = req.nextUrl.searchParams.get("search") || "";
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") || 30), 100);

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.role !== "admin" && String(conversation.user) !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const query: Record<string, unknown> = { conversationId };
  if (cursor) query.createdAt = { $lt: new Date(cursor) };
  if (search) query.$text = { $search: search };

  const messages = await Message.find(query).sort({ createdAt: -1 }).limit(limit + 1);
  const hasMore = messages.length > limit;
  const page = messages.slice(0, limit).reverse();

  const serializedMessages = page.map((msg) =>
    serializeMessage(msg.toObject() as Record<string, unknown>),
  );

  return NextResponse.json({
    messages: serializedMessages,
    nextCursor: hasMore ? messages[limit - 1].createdAt : null
  });
}

