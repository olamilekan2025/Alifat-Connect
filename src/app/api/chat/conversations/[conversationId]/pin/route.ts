import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { serializeConversation } from "../../../../../../lib/chat-utils";
import { requireAdmin, requireChatUser } from "../../../../../../lib/chat-auth";
import { Conversation } from "../../../../../../models/Conversation";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  await connectDB();

  const { conversationId } = await params;

  const user = await requireChatUser();
  requireAdmin(user);

  const { isPinned } = await req.json();

  const conversation = await Conversation.findByIdAndUpdate(
    conversationId,
    {
      $set: {
        isPinned: Boolean(isPinned),
      },
    },
    { new: true }
  )
    .populate("user", "name email")
    .populate("admin", "name email")
    .lean();

  if (!conversation) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    conversation: serializeConversation(conversation as Record<string, unknown>),
  });
}