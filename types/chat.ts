export type ChatRole = "user" | "admin";
export type ConversationStatus = "active" | "waiting" | "resolved";
export type MessageType = "text" | "image" | "pdf" | "file";

export interface ChatUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: ChatRole;
}

export interface ChatAttachment {
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface ChatMessage {
  _id: string;
  clientId?: string;
  conversationId: string;
  senderId: string;
  receiverId?: string;
  senderRole: ChatRole;
  message: string;
  messageType: MessageType;
  attachment?: ChatAttachment;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatConversation {
  _id: string;
  participants: string[];
  user: {
    _id: string;
    name?: string;
    email?: string;
  };
  admin?: {
    _id: string;
    name?: string;
    email?: string;
  };
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: {
    user: number;
    admin: number;
  };
  status: ConversationStatus;
  isPinned: boolean;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatNotification {
  _id: string;
  recipientId?: string;
  recipientRole?: ChatRole;
  conversationId?: string;
  messageId?: string;
  type: "admin_reply" | "message_read" | "new_conversation" | "new_message";
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}
