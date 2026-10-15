
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
import { setSocketIO } from "../notifications";

import type { ChatAttachment, ChatUser } from "../../../types/chat";

type SendMessagePayload = {
  clientId?: string;
  conversationId?: string;
  message?: string;
  attachment?: ChatAttachment;
};

type SocketAck = (value: {
  ok: boolean;
  message?: unknown;
  conversation?: unknown;
  error?: string;
}) => void;

const onlineUsers = new Map<string, Set<string>>();

function joinOnline(userId: string, socketId: string) {
  const sockets = onlineUsers.get(userId) ?? new Set<string>();

  sockets.add(socketId);
  onlineUsers.set(userId, sockets);
}

function leaveOnline(userId: string, socketId: string) {
  const sockets = onlineUsers.get(userId);

  if (!sockets) return;

  sockets.delete(socketId);

  if (sockets.size === 0) {
    onlineUsers.delete(userId);
  }
}

function isOnline(userId: string) {
  return onlineUsers.has(userId);
}

function isValidId(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

async function loadConversation(conversationId: string) {
  const conversation = await Conversation.findById(conversationId)
    .populate("user", "name email")
    .populate("admin", "name email")
    .lean();

  if (!conversation) return null;

  return serializeConversation(
    conversation as Record<string, unknown>,
  );
}

async function getOrCreateConversation(user: ChatUser) {
  let conversation = await Conversation.findOne({
    user: user.id,
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [user.id],
      user: user.id,
      status: "active",
      lastMessageTime: new Date(),
      unreadCount: {
        user: 0,
        admin: 0,
      },
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

async function canAccessConversation(
  user: ChatUser,
  conversationId: string,
) {
  if (!isValidId(conversationId)) return null;

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) return null;

  // Admins can access conversations from the admin dashboard.
  if (user.role === "admin") {
    return conversation;
  }

  // Regular users can only access their own conversations.
  return String(conversation.user) === user.id
    ? conversation
    : null;
}

export async function registerChatSocket(io: Server) {
  await connectDB();

  // Make the Socket.IO instance available to the notification service.
  setSocketIO(io);

  /*
   * Socket authentication middleware
   *
   * Authentication is verified on the server using the NextAuth token.
   * Never trust a user ID or role supplied by the client.
   * Never log session cookies or authentication tokens.
   */
  io.use(async (socket, next) => {
    try {
      const user = await getSocketUser(socket);

      if (!user?.id) {
        return next(new Error("Unauthorized"));
      }

      if (user.role !== "admin" && user.role !== "user") {
        return next(new Error("Unauthorized"));
      }

      socket.data.user = user;

      return next();
    } catch (error) {
      console.error(
        "Socket authentication failed:",
        error instanceof Error ? error.message : "Unknown error",
      );

      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket: Socket) => {
    const user = socket.data.user as ChatUser | undefined;

    // The middleware should prevent unauthenticated connections.
    // This is an additional defensive check.
    if (!user?.id) {
      socket.disconnect(true);
      return;
    }

    joinOnline(user.id, socket.id);

    socket.join(`user:${user.id}`);

    if (user.role === "admin") {
      socket.join("admins");
    }

    io.to("admins").emit("presence:update", {
      userId: user.id,
      online: true,
    });

    /*
     * Join an existing conversation, or create one for a regular user.
     */
    socket.on(
      "conversation:join",
      async (conversationId?: string) => {
        try {
          let conversation;

          if (conversationId) {
            conversation = await canAccessConversation(
              user,
              conversationId,
            );
          } else {
            if (user.role === "admin") {
              socket.emit(
                "chat:error",
                "Select a conversation before joining.",
              );
              return;
            }

            conversation = await getOrCreateConversation(user);
          }

          if (!conversation) {
            socket.emit("chat:error", "Conversation not found");
            return;
          }

          socket.join(`conversation:${conversation._id}`);

          const populatedConversation = await loadConversation(
            String(conversation._id),
          );

          if (!populatedConversation) {
            socket.emit(
              "chat:error",
              "Failed to load conversation",
            );
            return;
          }

          socket.emit(
            "conversation:ready",
            populatedConversation,
          );
        } catch (error) {
          console.error(
            "Failed to join conversation:",
            error instanceof Error ? error.message : "Unknown error",
          );

          socket.emit(
            "chat:error",
            "Failed to join conversation",
          );
        }
      },
    );

    /*
     * Load conversations for users and admins.
     */
    socket.on("conversation:list", async () => {
      try {
        if (user.role !== "admin") {
          const conversation = await getOrCreateConversation(user);

          const serializedConversation = await loadConversation(
            String(conversation._id),
          );

          if (!serializedConversation) {
            socket.emit("conversation:list", {
              conversations: [],
              total: 0,
            });
            return;
          }

          socket.emit("conversation:list", {
            conversations: [serializedConversation],
            total: 1,
          });

          return;
        }

        const conversations = await Conversation.find({})
          .populate("user", "name email")
          .populate("admin", "name email")
          .sort({
            isPinned: -1,
            lastMessageTime: -1,
            updatedAt: -1,
          })
          .lean();

        socket.emit("conversation:list", {
          conversations: conversations.map((conversation) =>
            serializeConversation(
              conversation as Record<string, unknown>,
            ),
          ),
          total: conversations.length,
        });
      } catch (error) {
        console.error(
          "Failed to load conversations:",
          error instanceof Error ? error.message : "Unknown error",
        );

        socket.emit(
          "chat:error",
          "Failed to load conversations",
        );
      }
    });

    /*
     * Send a message.
     */
    socket.on(
      "message:send",
      async (
        payload: SendMessagePayload,
        ack?: SocketAck,
      ) => {
        try {
          if (!payload || typeof payload !== "object") {
            ack?.({
              ok: false,
              error: "Invalid message payload",
            });
            return;
          }

          let conversation;

          if (payload.conversationId) {
            conversation = await canAccessConversation(
              user,
              payload.conversationId,
            );
          } else {
            if (user.role === "admin") {
              ack?.({
                ok: false,
                error: "Select a conversation before sending a message",
              });
              return;
            }

            conversation = await getOrCreateConversation(user);
          }

          if (!conversation) {
            ack?.({
              ok: false,
              error: "Conversation not found",
            });
            return;
          }

          const cleanMessage = sanitizeMessage(
            payload.message || "",
          );

          if (!cleanMessage && !payload.attachment) {
            ack?.({
              ok: false,
              error: "Message cannot be empty",
            });
            return;
          }

          // Join only after verifying conversation access.
          socket.join(`conversation:${conversation._id}`);

          const message = await Message.create({
            clientId: payload.clientId,
            conversationId: conversation._id,
            senderId: user.id,
            receiverId:
              user.role === "admin"
                ? conversation.user
                : conversation.admin,
            senderRole: user.role,
            message: cleanMessage,
            messageType: messageTypeFromMime(
              payload.attachment?.mimeType,
            ),
            attachment: payload.attachment,
            isRead: false,
          });

          const unreadPath =
            user.role === "admin"
              ? "unreadCount.user"
              : "unreadCount.admin";

          conversation.lastMessage =
            cleanMessage ||
            payload.attachment?.name ||
            "Attachment";

          conversation.lastMessageTime = new Date();

          conversation.status =
            user.role === "admin" ? "active" : "waiting";

          conversation.set(
            unreadPath,
            (conversation.get(unreadPath) || 0) + 1,
          );

          if (user.role === "admin") {
            conversation.admin = user.id;

            const participants = Array.isArray(
              conversation.participants,
            )
              ? conversation.participants.map(String)
              : [];

            conversation.set(
              "participants",
              Array.from(
                new Set([...participants, user.id]),
              ),
            );
          }

          await conversation.save();

          const savedMessage = await Message.findById(
            message._id,
          ).lean();

          if (!savedMessage) {
            throw new Error("Failed to load saved message");
          }

          const serializedMessage = serializeMessage(
            savedMessage as Record<string, unknown>,
          );

          const populatedConversation = await loadConversation(
            String(conversation._id),
          );

          if (!populatedConversation) {
            throw new Error("Failed to load conversation");
          }

          const recipientRoom =
            user.role === "admin"
              ? `user:${conversation.user}`
              : "admins";

          const notification = await Notification.create({
            recipientId:
              user.role === "admin"
                ? conversation.user
                : undefined,
            recipientRole:
              user.role === "admin" ? "user" : "admin",
            conversationId: conversation._id,
            messageId: message._id,
            type:
              user.role === "admin"
                ? "admin_reply"
                : "new_message",
            title:
              user.role === "admin"
                ? "Admin replied"
                : "New chat message",
            body:
              cleanMessage ||
              payload.attachment?.name ||
              "Attachment",
          });

          const serializedNotification = serializeNotification(
            notification.toObject() as Record<string, unknown>,
          );

          const conversationRoom =
            `conversation:${conversation._id}`;

          // Deliver the message and conversation update to participants.
          io.to(conversationRoom).emit(
            "message:new",
            serializedMessage,
          );

          io.to(recipientRoom).emit(
            "message:new",
            serializedMessage,
          );

          io.to(conversationRoom).emit(
            "conversation:update",
            populatedConversation,
          );

          io.to(recipientRoom).emit(
            "conversation:update",
            populatedConversation,
          );

          io.to(recipientRoom).emit(
            "notification:new",
            serializedNotification,
          );

          ack?.({
            ok: true,
            message: serializedMessage,
            conversation: populatedConversation,
          });
        } catch (error) {
          console.error(
            "Failed to send chat message:",
            error instanceof Error ? error.message : "Unknown error",
          );

          ack?.({
            ok: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to send message",
          });
        }
      },
    );

    /*
     * Typing indicators.
     */
    socket.on(
      "typing:start",
      async ({
        conversationId,
      }: {
        conversationId: string;
      }) => {
        try {
          if (!isValidId(conversationId)) return;

          const conversation = await canAccessConversation(
            user,
            conversationId,
          );

          if (!conversation) return;

          socket
            .to(`conversation:${conversationId}`)
            .emit("typing:update", {
              conversationId,
              userId: user.id,
              role: user.role,
              typing: true,
            });
        } catch (error) {
          console.error(
            "Typing start failed:",
            error instanceof Error ? error.message : "Unknown error",
          );
        }
      },
    );

    socket.on(
      "typing:stop",
      async ({
        conversationId,
      }: {
        conversationId: string;
      }) => {
        try {
          if (!isValidId(conversationId)) return;

          const conversation = await canAccessConversation(
            user,
            conversationId,
          );

          if (!conversation) return;

          socket
            .to(`conversation:${conversationId}`)
            .emit("typing:update", {
              conversationId,
              userId: user.id,
              role: user.role,
              typing: false,
            });
        } catch (error) {
          console.error(
            "Typing stop failed:",
            error instanceof Error ? error.message : "Unknown error",
          );
        }
      },
    );

    /*
     * Read receipts and unread-count updates.
     */
    socket.on(
      "message:read",
      async ({
        conversationId,
      }: {
        conversationId: string;
      }) => {
        try {
          if (!isValidId(conversationId)) return;

          const conversation = await canAccessConversation(
            user,
            conversationId,
          );

          if (!conversation) return;

          await Message.updateMany(
            {
              conversationId,
              senderRole:
                user.role === "admin" ? "user" : "admin",
              isRead: false,
            },
            {
              $set: {
                isRead: true,
              },
            },
          );

          conversation.set(`unreadCount.${user.role}`, 0);

          await conversation.save();

          const populatedConversation = await loadConversation(
            String(conversation._id),
          );

          if (!populatedConversation) return;

          io.to(`conversation:${conversationId}`).emit(
            "message:read",
            {
              conversationId,
              readerId: user.id,
              readerRole: user.role,
            },
          );

          io.to(`conversation:${conversationId}`).emit(
            "conversation:update",
            populatedConversation,
          );

          io.to(
            user.role === "admin"
              ? "admins"
              : `user:${user.id}`,
          ).emit(
            "conversation:update",
            populatedConversation,
          );
        } catch (error) {
          console.error(
            "Marking messages as read failed:",
            error instanceof Error ? error.message : "Unknown error",
          );
        }
      },
    );

    /*
     * Return currently connected users.
     */
    socket.on("presence:list", () => {
      socket.emit(
        "presence:list",
        Array.from(onlineUsers.keys()),
      );
    });

    /*
     * Handle disconnections and update presence.
     */
    socket.on("disconnect", () => {
      leaveOnline(user.id, socket.id);

      io.to("admins").emit("presence:update", {
        userId: user.id,
        online: isOnline(user.id),
      });
    });
  });

  /*
   * Payment update events for the admin dashboard.
   */
  return {
    emitPaymentUpdate: (
      paymentData: Record<string, unknown>,
    ) => {
      io.to("admins").emit(
        "payment:update",
        paymentData,
      );
    },

    emitPaymentApproved: (
      paymentData: Record<string, unknown>,
    ) => {
      io.to("admins").emit(
        "payment:approved",
        paymentData,
      );
    },

    emitPaymentRejected: (
      paymentData: Record<string, unknown>,
    ) => {
      io.to("admins").emit(
        "payment:rejected",
        paymentData,
      );
    },
  };
}
