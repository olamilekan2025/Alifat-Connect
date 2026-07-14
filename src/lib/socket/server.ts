import type { Server, Socket } from "socket.io";
import { connectDB } from "@/lib/mongodb";
import {
  sanitizeMessage,
  serializeConversation,
  serializeMessage,
  serializeNotification,
  messageTypeFromMime,
} from "../chat-utils";
import { getSocketUser } from "../chat-auth";
import { Conversation } from "../../models/Conversation";
import { Message } from "../../models/Message";
import { Notification } from "../../models/Notification";
import type { ChatAttachment, ChatUser } from "../../../types/chat";

type SendMessagePayload = {
  clientId?: string;
  conversationId?: string;
  message?: string;
  attachment?: ChatAttachment;
};

const onlineUsers = new Map<string, Set<string>>();

function joinOnline(userId: string, socketId: string) {
  const sockets = onlineUsers.get(userId) || new Set<string>();
  sockets.add(socketId);
  onlineUsers.set(userId, sockets);
}

function leaveOnline(userId: string, socketId: string) {
  const sockets = onlineUsers.get(userId);
  if (!sockets) return;
  sockets.delete(socketId);
  if (!sockets.size) onlineUsers.delete(userId);
}

function isOnline(userId: string) {
  return onlineUsers.has(userId);
}

async function loadConversation(conversationId: string) {
  const conv = await Conversation.findById(conversationId)
    .populate("user", "name email")
    .populate("admin", "name email")
    .lean();

  if (!conv) return null;
  return serializeConversation(conv as Record<string, unknown>);
}

async function getOrCreateConversation(user: ChatUser) {
  let conversation = await Conversation.findOne({ user: user.id });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [user.id],
      user: user.id,
      status: "active",
      lastMessageTime: new Date(),
      unreadCount: { user: 0, admin: 0 },
    });

    await Notification.create({
      recipientRole: "admin",
      conversationId: conversation._id,
      type: "new_conversation",
      title: "New chat started",
      body: `${user.name || user.email || "A user"} started a conversation.`,
    });
  }

  return conversation;
}

async function canAccessConversation(user: ChatUser, conversationId: string) {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) return null;
  if (user.role === "admin") return conversation;
  return String(conversation.user) === user.id ? conversation : null;
}

export async function registerChatSocket(io: Server) {
  await connectDB();

  io.use(async (socket, next) => {
    try {
      const user = await getSocketUser(socket);
      if (!user?.id) return next(new Error("Unauthorized"));
      socket.data.user = user;
      next();
    } catch (error) {
      next(error as Error);
    }
  });

  io.on("connection", async (socket: Socket) => {
    const user = socket.data.user as ChatUser;

    joinOnline(user.id, socket.id);
    socket.join(`user:${user.id}`);
    if (user.role === "admin") socket.join("admins");

    io.to("admins").emit("presence:update", { userId: user.id, online: true });

    socket.on("conversation:join", async (conversationId?: string) => {
      const conversation =
        conversationId
          ? await canAccessConversation(user, conversationId)
          : await getOrCreateConversation(user);

      if (!conversation) return socket.emit("chat:error", "Conversation not found");

      socket.join(`conversation:${conversation._id}`);
      const populated = await loadConversation(String(conversation._id));
      if (!populated) return socket.emit("chat:error", "Failed to load conversation");
      socket.emit("conversation:ready", populated);
    });

    socket.on("conversation:list", async () => {
      try {
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

          const serialized = await loadConversation(String(conversation._id));
          if (!serialized) return socket.emit("conversation:list", { conversations: [], total: 0 });

          socket.emit("conversation:list", { conversations: [serialized], total: 1 });
          return;
        }

        const conversations = await Conversation.find({})
          .populate("user", "name email")
          .populate("admin", "name email")
          .sort({ isPinned: -1, lastMessageTime: -1, updatedAt: -1 })
          .lean();

        socket.emit("conversation:list", {
          conversations: conversations.map((conv) =>
            serializeConversation(conv as Record<string, unknown>),
          ),
          total: conversations.length,
        });
      } catch {
        socket.emit("chat:error", "Failed to load conversations");
      }
    });

    socket.on("message:send", async (payload: SendMessagePayload, ack?: (value: unknown) => void) => {
        console.log("✅ message:send received");
    console.log(payload);
      try {
        const conversation = payload.conversationId
          ? await canAccessConversation(user, payload.conversationId)
          : await getOrCreateConversation(user);

        if (!conversation) throw new Error("Conversation not found");

        socket.join(`conversation:${conversation._id}`);

        const cleanMessage = sanitizeMessage(payload.message || "");
        if (!cleanMessage && !payload.attachment) throw new Error("Message cannot be empty");

        const message = await Message.create({
          clientId: payload.clientId,
          conversationId: conversation._id,
          senderId: user.id,
          receiverId: user.role === "admin" ? conversation.user : conversation.admin,
          senderRole: user.role,
          message: cleanMessage,
          messageType: messageTypeFromMime(payload.attachment?.mimeType),
          attachment: payload.attachment,
          isRead: false,
        });

        const unreadPath = user.role === "admin" ? "unreadCount.user" : "unreadCount.admin";
        conversation.lastMessage = cleanMessage || payload.attachment?.name || "Attachment";
        conversation.lastMessageTime = new Date();
        conversation.status = user.role === "admin" ? "active" : "waiting";
        conversation.set(unreadPath, (conversation.get(unreadPath) || 0) + 1);

        if (user.role === "admin") {
          conversation.admin = user.id;
          conversation.set(
            "participants",
            Array.from(new Set([...conversation.participants.map(String), user.id])),
          );
        }

        await conversation.save();

        const savedMessage = await Message.findById(message._id).lean();
        if (!savedMessage) throw new Error("Failed to load saved message");

        const serializedMessage = serializeMessage(savedMessage as Record<string, unknown>);
        const populatedConversation = await loadConversation(String(conversation._id));
        if (!populatedConversation) throw new Error("Failed to load conversation");

        const recipientRoom = user.role === "admin" ? `user:${conversation.user}` : "admins";

        const notification = await Notification.create({
          recipientId: user.role === "admin" ? conversation.user : undefined,
          recipientRole: user.role === "admin" ? "user" : "admin",
          conversationId: conversation._id,
          messageId: message._id,
          type: user.role === "admin" ? "admin_reply" : "new_message",
          title: user.role === "admin" ? "Admin replied" : "New chat message",
          body: cleanMessage || payload.attachment?.name || "Attachment",
        });

        const serializedNotification = serializeNotification(
          notification.toObject() as Record<string, unknown>,
        );

        io.to(`conversation:${conversation._id}`).emit("message:new", serializedMessage);
        io.to(recipientRoom).emit("message:new", serializedMessage);
        io.to(`conversation:${conversation._id}`).emit("conversation:update", populatedConversation);
        io.to(recipientRoom).emit("conversation:update", populatedConversation);
        io.to(recipientRoom).emit("notification:new", serializedNotification);

        ack?.({ ok: true, message: serializedMessage, conversation: populatedConversation });
      } catch (error) {
        ack?.({
          ok: false,
          error: error instanceof Error ? error.message : "Failed to send message",
        });
      }
    });

    socket.on("typing:start", async ({ conversationId }: { conversationId: string }) => {
      const conversation = await canAccessConversation(user, conversationId);
      if (!conversation) return;
      socket.to(`conversation:${conversationId}`).emit("typing:update", {
        conversationId,
        userId: user.id,
        role: user.role,
        typing: true,
      });
    });

    socket.on("typing:stop", async ({ conversationId }: { conversationId: string }) => {
      const conversation = await canAccessConversation(user, conversationId);
      if (!conversation) return;
      socket.to(`conversation:${conversationId}`).emit("typing:update", {
        conversationId,
        userId: user.id,
        role: user.role,
        typing: false,
      });
    });

    socket.on("message:read", async ({ conversationId }: { conversationId: string }) => {
      const conversation = await canAccessConversation(user, conversationId);
      if (!conversation) return;

      await Message.updateMany(
        {
          conversationId,
          senderRole: user.role === "admin" ? "user" : "admin",
          isRead: false,
        },
        { $set: { isRead: true } },
      );

      conversation.set(`unreadCount.${user.role}`, 0);
      await conversation.save();

      const populatedConversation = await loadConversation(String(conversation._id));
      if (!populatedConversation) return;

      io.to(`conversation:${conversationId}`).emit("message:read", {
        conversationId,
        readerId: user.id,
        readerRole: user.role,
      });
      io.to(`conversation:${conversationId}`).emit("conversation:update", populatedConversation);
      io.to(user.role === "admin" ? "admins" : `user:${user.id}`).emit(
        "conversation:update",
        populatedConversation,
      );
    });

    socket.on("presence:list", () => {
      socket.emit("presence:list", Array.from(onlineUsers.keys()));
    });

    socket.on("disconnect", () => {
      leaveOnline(user.id, socket.id);
      io.to("admins").emit("presence:update", { userId: user.id, online: isOnline(user.id) });
    });
  });
}
