import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
// conversationId is a string; mongoose accepts string IDs, so no objectId helper needed
import { requireAdmin, requireChatUser } from "../../../../../../lib/chat-auth";
import { Conversation } from "../../../../../../models/Conversation";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  await connectDB();

  const { conversationId } = await params;

  const user = await requireChatUser(req);
  requireAdmin(user);

  const conversation = await Conversation.findByIdAndUpdate(
    conversationId,
    {
      $set: {
        status: "resolved",
        resolvedAt: new Date(),
      },
    },
    { new: true }
  );

  if (!conversation) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ conversation });
}