import DOMPurify from "isomorphic-dompurify";
import type { ChatConversation, ChatMessage, ChatNotification } from "../../types/chat";

export function sanitizeMessage(value: string) {
  return DOMPurify.sanitize(value.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).slice(0, 4000);
}

export function serializeMessage(msg: Record<string, unknown>): ChatMessage {
  return {
    _id: String(msg._id),
    clientId: msg.clientId as string | undefined,
    conversationId: String(msg.conversationId),
    senderId: String(msg.senderId),
    receiverId: msg.receiverId ? String(msg.receiverId) : undefined,
    senderRole: msg.senderRole as ChatMessage["senderRole"],
    message: (msg.message as string) || "",
    messageType: (msg.messageType as ChatMessage["messageType"]) || "text",
    attachment: msg.attachment as ChatMessage["attachment"],
    isRead: Boolean(msg.isRead),
    createdAt: msg.createdAt
      ? new Date(msg.createdAt as string | Date).toISOString()
      : new Date().toISOString(),
    updatedAt: msg.updatedAt
      ? new Date(msg.updatedAt as string | Date).toISOString()
      : new Date().toISOString(),
  };
}

export function serializeConversation(conv: Record<string, unknown>): ChatConversation {
  const user = conv.user as Record<string, unknown> | null | undefined;
  const admin = conv.admin as Record<string, unknown> | null | undefined;

  return {
    _id: String(conv._id),
    participants: ((conv.participants as unknown[]) || []).map((p) => String(p)),
    user: {
      _id: String(user?._id),
      name: user?.name as string | undefined,
      email: user?.email as string | undefined,
    },
    admin: admin
      ? {
          _id: String(admin._id),
          name: admin.name as string | undefined,
          email: admin.email as string | undefined,
        }
      : undefined,
    lastMessage: conv.lastMessage as string | undefined,
    lastMessageTime: conv.lastMessageTime
      ? new Date(conv.lastMessageTime as string | Date).toISOString()
      : undefined,
    unreadCount:
      (conv.unreadCount as ChatConversation["unreadCount"]) || ({ user: 0, admin: 0 } as const),
    status: (conv.status as ChatConversation["status"]) || "active",
    isPinned: Boolean(conv.isPinned),
    resolvedAt: conv.resolvedAt
      ? new Date(conv.resolvedAt as string | Date).toISOString()
      : undefined,
    createdAt: conv.createdAt
      ? new Date(conv.createdAt as string | Date).toISOString()
      : new Date().toISOString(),
    updatedAt: conv.updatedAt
      ? new Date(conv.updatedAt as string | Date).toISOString()
      : new Date().toISOString(),
  };
}

export function serializeNotification(n: Record<string, unknown>): ChatNotification {
  return {
    _id: String(n._id),
    recipientId: n.recipientId ? String(n.recipientId) : undefined,
    recipientRole: n.recipientRole as ChatNotification["recipientRole"],
    conversationId: n.conversationId ? String(n.conversationId) : undefined,
    messageId: n.messageId ? String(n.messageId) : undefined,
    type: n.type as ChatNotification["type"],
    title: (n.title as string) || "",
    body: (n.body as string) || "",
    isRead: Boolean(n.isRead),
    createdAt: n.createdAt
      ? new Date(n.createdAt as string | Date).toISOString()
      : new Date().toISOString(),
  };
}

// Keep this utility client-safe: do NOT import mongoose here.
// Validate a MongoDB ObjectId by format (24 hex chars).
const objectIdHexRegexp = /^[0-9a-fA-F]{24}$/;
export function objectId(value: string) {
  if (!objectIdHexRegexp.test(value)) {
    throw new Response("Invalid id", { status: 400 });
  }
  return value;
}

export function isAllowedUpload(file: File) {
  const allowed = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "application/pdf"]);
  return allowed.has(file.type) && file.size <= 10 * 1024 * 1024;
}

export function messageTypeFromMime(mimeType?: string) {
  if (!mimeType) return "text";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  return "file";
}


