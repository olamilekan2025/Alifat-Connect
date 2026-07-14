import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin, requireChatUser } from "../../../../lib/chat-auth";
import { Conversation } from "../../../../models/Conversation";

export async function GET(req: NextRequest) {
  await connectDB();
  const user = await requireChatUser();
  const search = req.nextUrl.searchParams.get("search") || "";
  const status = req.nextUrl.searchParams.get("status");
  const page = Math.max(Number(req.nextUrl.searchParams.get("page") || 1), 1);
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") || 30), 100);

  if (user.role !== "admin") {
    let conversation = await Conversation.findOne({ user: user.id });
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [user.id],
        user: user.id,
        status: "active",
        lastMessageTime: new Date(),
        unreadCount: { user: 0, admin: 0 },
      });
    }

    const populated = await Conversation.findById(conversation._id)
      .populate("user", "name email")
      .populate("admin", "name email")
      .lean();

    // Serialize conversation to ensure proper ObjectId to string conversion
    const serializedConversation = {
      ...populated,
      _id: String(populated._id),
      user: populated.user ? { ...populated.user, _id: String(populated.user._id) } : null,
      admin: populated.admin ? { ...populated.admin, _id: String(populated.admin._id) } : null,
      participants: populated.participants?.map((p: any) => String(p)) || [],
    };

    return NextResponse.json({ conversations: [serializedConversation], total: 1 });
  }

  requireAdmin(user);

  const query: Record<string, unknown> = {};
  if (status && status !== "all") {
    if (status === "open") {
      query.status = { $in: ["active", "waiting"] };
    } else {
      query.status = status;
    }
  }

  if (search) {
    const matching = await Conversation.find(query)
      .populate({
        path: "user",
        select: "name email",
        match: {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        },
      })
      .populate("admin", "name email")
      .sort({ isPinned: -1, lastMessageTime: -1, updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const conversations = matching.filter(
      (conversation: unknown) => !!(conversation as any).user
    );
    
    // Serialize conversations for admin
    const serializedConversations = conversations.map(conv => ({
      ...conv,
      _id: String(conv._id),
      user: conv.user ? { ...conv.user, _id: String(conv.user._id) } : null,
      admin: conv.admin ? { ...conv.admin, _id: String(conv.admin._id) } : null,
      participants: conv.participants?.map((p: any) => String(p)) || [],
    }));
    
    return NextResponse.json({ conversations: serializedConversations, total: serializedConversations.length });
  }

  const [conversations, total] = await Promise.all([
    Conversation.find(query)
      .populate("user", "name email")
      .populate("admin", "name email")
      .sort({ isPinned: -1, lastMessageTime: -1, updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Conversation.countDocuments(query),
  ]);

  // Serialize conversations for admin
  const serializedConversations = conversations.map(conv => ({
    ...conv,
    _id: String(conv._id),
    user: conv.user ? { ...conv.user, _id: String(conv.user._id) } : null,
    admin: conv.admin ? { ...conv.admin, _id: String(conv.admin._id) } : null,
    participants: conv.participants?.map((p: any) => String(p)) || [],
  }));

  return NextResponse.json({ conversations: serializedConversations, total });
}
