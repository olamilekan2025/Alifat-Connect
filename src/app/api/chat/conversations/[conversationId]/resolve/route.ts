import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { objectId } from "../../../../../../lib/chat-utils";
import { requireAdmin, requireChatUser } from "../../../../../../lib/chat-auth";
import { Conversation } from "../../../../../../models/Conversation";

export async function PATCH(
  _: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  await connectDB();

  const { conversationId } = await params;

  const user = await requireChatUser();
  requireAdmin(user);

  const conversation = await Conversation.findByIdAndUpdate(
    objectId(conversationId),
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