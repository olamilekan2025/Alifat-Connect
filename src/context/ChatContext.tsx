"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { useChatSocket } from "../hooks/useChatSocket";
import { serializeMessage } from "../lib/chat-utils";
import type {
  ChatConversation,
  ChatMessage,
  ChatNotification,
  ChatRole,
} from "../../types/chat";

type TypingState = Record<string, { role: ChatRole; typing: boolean }>;

type State = {
  conversations: ChatConversation[];
  currentConversation?: ChatConversation;
  messages: ChatMessage[];
  onlineUsers: Set<string>;
  typing: TypingState;
  notifications: ChatNotification[];
  unreadTotal: number;
  loading: boolean;
};

type Action =
  | { type: "SET_LOADING"; loading: boolean }
  | {
      type: "SET_CONVERSATIONS";
      conversations: ChatConversation[];
      viewerRole: ChatRole;
    }
  | { type: "SET_CURRENT"; conversation?: ChatConversation }
  | { type: "SET_MESSAGES"; messages: ChatMessage[] }
  | { type: "ADD_MESSAGE"; message: ChatMessage }
  | { type: "REPLACE_OPTIMISTIC"; clientId: string; message: ChatMessage }
  | { type: "REMOVE_OPTIMISTIC"; clientId: string }
  | {
      type: "UPSERT_CONVERSATION";
      conversation: ChatConversation;
      viewerRole: ChatRole;
    }
  | { type: "SET_ONLINE"; userId: string; online: boolean }
  | { type: "SET_ONLINE_LIST"; userIds: string[] }
  | {
      type: "SET_TYPING";
      conversationId: string;
      role: ChatRole;
      typing: boolean;
    }
  | { type: "ADD_NOTIFICATION"; notification: ChatNotification }
  | {
      type: "MARK_READ";
      conversationId: string;
      readerRole: ChatRole;
      viewerRole: ChatRole;
    };

const initialState: State = {
  conversations: [],
  messages: [],
  onlineUsers: new Set<string>(),
  typing: {},
  notifications: [],
  unreadTotal: 0,
  loading: false,
};

function sortConversations(conversations: ChatConversation[]) {
  return [...conversations].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }

    return (
      new Date(b.lastMessageTime || b.updatedAt || 0).getTime() -
      new Date(a.lastMessageTime || a.updatedAt || 0).getTime()
    );
  });
}

function unreadFor(conversations: ChatConversation[], role: ChatRole) {
  return conversations.reduce(
    (total, conversation) =>
      total + (conversation.unreadCount?.[role] || 0),
    0,
  );
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.loading };

    case "SET_CONVERSATIONS": {
      const conversations = sortConversations(action.conversations);

      return {
        ...state,
        conversations,
        unreadTotal: unreadFor(conversations, action.viewerRole),
      };
    }

    case "SET_CURRENT":
      return {
        ...state,
        currentConversation: action.conversation,
        messages: [],
      };

    case "SET_MESSAGES":
      return {
        ...state,
        messages: action.messages,
      };

    case "ADD_MESSAGE": {
      const currentId = state.currentConversation?._id;

      // Do not display a message from another conversation in the open chat.
      if (!currentId || currentId !== action.message.conversationId) {
        return state;
      }

      const exists = state.messages.some(
        (message) =>
          message._id === action.message._id ||
          (message.clientId &&
            message.clientId === action.message.clientId),
      );

      if (exists) {
        return state;
      }

      return {
        ...state,
        messages: [...state.messages, action.message],
      };
    }

    case "REPLACE_OPTIMISTIC":
      return {
        ...state,
        messages: state.messages.map((message) =>
          message.clientId === action.clientId ? action.message : message,
        ),
      };

    case "REMOVE_OPTIMISTIC":
      return {
        ...state,
        messages: state.messages.filter(
          (message) => message.clientId !== action.clientId,
        ),
      };

    case "UPSERT_CONVERSATION": {
      const exists = state.conversations.some(
        (conversation) => conversation._id === action.conversation._id,
      );

      const conversations = sortConversations(
        exists
          ? state.conversations.map((conversation) =>
              conversation._id === action.conversation._id
                ? action.conversation
                : conversation,
            )
          : [action.conversation, ...state.conversations],
      );

      return {
        ...state,
        conversations,
        currentConversation:
          state.currentConversation?._id === action.conversation._id
            ? action.conversation
            : state.currentConversation,
        unreadTotal: unreadFor(conversations, action.viewerRole),
      };
    }

    case "SET_ONLINE": {
      const onlineUsers = new Set(state.onlineUsers);

      if (action.online) {
        onlineUsers.add(action.userId);
      } else {
        onlineUsers.delete(action.userId);
      }

      return { ...state, onlineUsers };
    }

    case "SET_ONLINE_LIST":
      return {
        ...state,
        onlineUsers: new Set(action.userIds),
      };

    case "SET_TYPING":
      return {
        ...state,
        typing: {
          ...state.typing,
          [action.conversationId]: {
            role: action.role,
            typing: action.typing,
          },
        },
      };

    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.notification, ...state.notifications],
      };

    case "MARK_READ": {
      const conversations = state.conversations.map((conversation) =>
        conversation._id === action.conversationId
          ? {
              ...conversation,
              unreadCount: {
                ...conversation.unreadCount,
                [action.readerRole]: 0,
              },
            }
          : conversation,
      );

      return {
        ...state,
        conversations,
        currentConversation:
          state.currentConversation?._id === action.conversationId
            ? {
                ...state.currentConversation,
                unreadCount: {
                  ...state.currentConversation.unreadCount,
                  [action.readerRole]: 0,
                },
              }
            : state.currentConversation,
        messages: state.messages.map((message) =>
          message.conversationId === action.conversationId &&
          message.senderRole !== action.readerRole
            ? { ...message, isRead: true }
            : message,
        ),
        unreadTotal: unreadFor(conversations, action.viewerRole),
      };
    }

    default:
      return state;
  }
}

type ChatContextValue = State & {
  connected: boolean;
  fetchConversations: (params?: {
    status?: string;
    search?: string;
  }) => Promise<void>;
  selectConversation: (conversation: ChatConversation) => Promise<void>;
  sendMessage: (payload: {
    message: string;
    attachment?: ChatMessage["attachment"];
  }) => Promise<boolean>;
  markRead: (conversationId: string) => Promise<void>;
  emitTyping: (conversationId: string, typing: boolean) => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [connected, setConnected] = useState(false);

  const enabled = status === "authenticated";
  const socket = useChatSocket(enabled);

  const myId = (session?.user as { id?: string })?.id || "";
  const myRole = ((session?.user as { role?: ChatRole })?.role ||
    "user") as ChatRole;

  const currentConversationIdRef = useRef<string | undefined>(undefined);
  const messagesRequestRef = useRef(0);

  useEffect(() => {
    currentConversationIdRef.current = state.currentConversation?._id;
  }, [state.currentConversation?._id]);

  const fetchConversations = useCallback(
    async (params?: { status?: string; search?: string }) => {
      const wantsSocketOnly = !params?.status && !params?.search;

      if (wantsSocketOnly && socket?.connected) {
        socket.emit("conversation:list");
        return;
      }

      dispatch({ type: "SET_LOADING", loading: true });

      try {
        const query = new URLSearchParams();

        if (params?.status && params.status !== "all") {
          query.set("status", params.status);
        }

        if (params?.search) {
          query.set("search", params.search);
        }

        const response = await fetch(
          `/api/chat/conversations?${query.toString()}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load conversations");
        }

        dispatch({
          type: "SET_CONVERSATIONS",
          conversations: data.conversations || [],
          viewerRole: myRole,
        });
      } finally {
        dispatch({ type: "SET_LOADING", loading: false });
      }
    },
    [myRole, socket],
  );

  const selectConversation = useCallback(
    async (conversation: ChatConversation) => {
      const requestId = ++messagesRequestRef.current;

      dispatch({ type: "SET_CURRENT", conversation });

      if (socket?.connected) {
        socket.emit("conversation:join", conversation._id);
      }

      const fail = (reason?: unknown) => {
        if (reason) console.error("selectConversation failed:", reason);
        toast.error("Failed to load conversation messages");
      };

      try {
        // Production issue guard:
        // `/api/chat/conversations/[conversationId]/messages` rejects non-ObjectId values (400).
        // Sometimes the conversation payload can be stale/serialized differently in production.
        const rawId = (conversation as any)?._id;
        const id = String(rawId);
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

        if (!isValidObjectId) {
          console.error("Invalid conversation _id for messages endpoint:", {
            conversationId: rawId,
            conversation,
          });

          // Retry flow: reload conversations so we can re-select with a valid id.
          // This avoids hard-failing in prod when the client initially received a malformed payload.
          try {
            await fetchConversations();
          } catch (e) {
            console.error("Retry fetchConversations failed:", e);
          }

          const current = state.conversations.find(
            (c) => String(c._id) === id || String((c as any)?._id) === String(rawId),
          );

          const retryId = current ? String((current as any)._id) : id;
          if (!/^[0-9a-fA-F]{24}$/.test(retryId)) {
            // Still invalid.
            fail({ type: "invalid_id", id, retryId });
            return;
          }

          const response = await fetch(
            `/api/chat/conversations/${retryId}/messages`,
          );

          const text = await response.text();
          let data: any = null;
          try {
            data = text ? JSON.parse(text) : null;
          } catch {
            data = null;
          }

          if (!response.ok) {
            console.error("Failed to load messages endpoint:", {
              status: response.status,
              conversationId: retryId,
              body: data?.error || text,
            });
            throw new Error(data?.error || "Failed to load messages");
          }

          if (requestId !== messagesRequestRef.current) return;

          dispatch({ type: "SET_MESSAGES", messages: data?.messages || [] });
          return;
        }

        const response = await fetch(`/api/chat/conversations/${id}/messages`);

        // Try to read response text for better prod debugging (may be JSON or plain).
        const text = await response.text();

        let data: any = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          data = null;
        }

        if (!response.ok) {
          console.error("Failed to load messages endpoint:", {
            status: response.status,
            conversationId: id,
            body: data?.error || text,
          });
          throw new Error(data?.error || "Failed to load messages");
        }

        // Ignore a slow response from a previously selected conversation.
        if (requestId !== messagesRequestRef.current) {
          return;
        }

        dispatch({
          type: "SET_MESSAGES",
          messages: data?.messages || [],
        });
      } catch (error) {
        console.error("Failed to load messages:", error);
        fail(error);
      }
    },
    // Note: we intentionally depend on `fetchConversations` and `state.conversations`
    // because the retry flow needs the latest conversation ids.
    [fetchConversations, socket, state.conversations],
  );

  const sendMessage = useCallback(
    async ({
      message,
      attachment,
    }: {
      message: string;
      attachment?: ChatMessage["attachment"];
    }): Promise<boolean> => {
      const conversation = state.currentConversation;

      if (!conversation) {
        toast.error("Opening chat. Please try again.");
        return false;
      }

      if (!socket?.connected) {
        toast.error("Chat is reconnecting. Please try again.");
        return false;
      }

      const clientId = crypto.randomUUID();

      const optimisticMessage: ChatMessage = {
        _id: `optimistic:${clientId}`,
        clientId,
        conversationId: conversation._id,
        senderId: myId,
        senderRole: myRole,
        receiverId: undefined,
        message,
        messageType: attachment?.mimeType?.startsWith("image/")
          ? "image"
          : attachment
            ? "file"
            : "text",
        attachment,
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dispatch({
        type: "ADD_MESSAGE",
        message: optimisticMessage,
      });

      return new Promise<boolean>((resolve) => {
        let complete = false;
        let timeoutId: number | undefined;

        const finish = (sent: boolean) => {
          if (complete) return;

          complete = true;

          if (timeoutId !== undefined) {
            window.clearTimeout(timeoutId);
          }

          resolve(sent);
        };

        timeoutId = window.setTimeout(() => {
          dispatch({ type: "REMOVE_OPTIMISTIC", clientId });
          toast.error("Message timed out. Please try again.");
          finish(false);
        }, 15_000);

        socket.emit(
          "message:send",
          {
            clientId,
            conversationId: conversation._id,
            message,
            attachment,
          },
          (ack: any) => {
            if (!ack?.ok || !ack.message) {
              dispatch({ type: "REMOVE_OPTIMISTIC", clientId });
              toast.error(ack?.error || "Failed to send message");
              finish(false);
              return;
            }

            dispatch({
              type: "REPLACE_OPTIMISTIC",
              clientId,
              message: ack.message,
            });

            if (ack.conversation) {
              dispatch({
                type: "UPSERT_CONVERSATION",
                conversation: ack.conversation,
                viewerRole: myRole,
              });
            }

            finish(true);
          },
        );
      });
    },
    [myId, myRole, socket, state.currentConversation],
  );

  const markRead = useCallback(
    async (conversationId: string) => {
      try {
        const response = await fetch(
          `/api/chat/conversations/${conversationId}/read`,
          { method: "POST" },
        );

        if (!response.ok) {
          throw new Error("Failed to mark messages as read");
        }

        if (socket?.connected) {
          socket.emit("message:read", { conversationId });
        }

        dispatch({
          type: "MARK_READ",
          conversationId,
          readerRole: myRole,
          viewerRole: myRole,
        });
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    },
    [myRole, socket],
  );

  const emitTyping = useCallback(
    (conversationId: string, typing: boolean) => {
      if (!socket?.connected) return;

      socket.emit(typing ? "typing:start" : "typing:stop", {
        conversationId,
      });
    },
    [socket],
  );

  // Register all socket events before requesting the conversation list.
  useEffect(() => {
    if (!socket) {
      setConnected(false);
      return;
    }

    const onConnect = () => {
      setConnected(true);
      socket.emit("presence:list");
      socket.emit("conversation:list");

      const conversationId = currentConversationIdRef.current;

      if (conversationId) {
        socket.emit("conversation:join", conversationId);
      }
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const onConnectError = (error: Error) => {
      setConnected(false);
      console.error("Chat socket connection failed:", error.message);
    };

    const onConversationList = (payload: {
      conversations?: ChatConversation[];
    }) => {
      dispatch({
        type: "SET_CONVERSATIONS",
        conversations: payload.conversations || [],
        viewerRole: myRole,
      });
    };

    const onConversationReady = (conversation: ChatConversation) => {
      dispatch({
        type: "UPSERT_CONVERSATION",
        conversation,
        viewerRole: myRole,
      });
    };

    const onMessageNew = (message: ChatMessage) => {
      const normalized = serializeMessage(
        message as unknown as Record<string, unknown>,
      );

      dispatch({ type: "ADD_MESSAGE", message: normalized });

      if (normalized.senderId !== myId) {
        toast.message("New chat message");
      }
    };

    const onMessageRead = ({
      conversationId,
      readerRole,
    }: {
      conversationId: string;
      readerRole: ChatRole;
    }) => {
      dispatch({
        type: "MARK_READ",
        conversationId,
        readerRole,
        viewerRole: myRole,
      });
    };

    const onConversationUpdate = (conversation: ChatConversation) => {
      dispatch({
        type: "UPSERT_CONVERSATION",
        conversation,
        viewerRole: myRole,
      });
    };

    const onTypingUpdate = (payload: {
      conversationId: string;
      role: ChatRole;
      typing: boolean;
    }) => {
      dispatch({ type: "SET_TYPING", ...payload });
    };

    const onPresenceUpdate = ({
      userId,
      online,
    }: {
      userId: string;
      online: boolean;
    }) => {
      dispatch({ type: "SET_ONLINE", userId, online });
    };

    const onPresenceList = (userIds: string[]) => {
      dispatch({ type: "SET_ONLINE_LIST", userIds });
    };

    const onNotification = (notification: ChatNotification) => {
      dispatch({ type: "ADD_NOTIFICATION", notification });
      toast(notification.title, { description: notification.body });
    };

    const onChatError = (message: string) => {
      toast.error(message || "Chat error");
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("conversation:list", onConversationList);
    socket.on("conversation:ready", onConversationReady);
    socket.on("message:new", onMessageNew);
    socket.on("message:read", onMessageRead);
    socket.on("conversation:update", onConversationUpdate);
    socket.on("typing:update", onTypingUpdate);
    socket.on("presence:update", onPresenceUpdate);
    socket.on("presence:list", onPresenceList);
    socket.on("notification:new", onNotification);
    socket.on("chat:error", onChatError);

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("conversation:list", onConversationList);
      socket.off("conversation:ready", onConversationReady);
      socket.off("message:new", onMessageNew);
      socket.off("message:read", onMessageRead);
      socket.off("conversation:update", onConversationUpdate);
      socket.off("typing:update", onTypingUpdate);
      socket.off("presence:update", onPresenceUpdate);
      socket.off("presence:list", onPresenceList);
      socket.off("notification:new", onNotification);
      socket.off("chat:error", onChatError);
    };
  }, [myId, myRole, socket]);

  useEffect(() => {
    if (!enabled || socket) return;

    fetchConversations().catch(() => {
      toast.error("Unable to load chat");
    });
  }, [enabled, fetchConversations, socket]);

  const value = useMemo<ChatContextValue>(
    () => ({
      ...state,
      connected,
      fetchConversations,
      selectConversation,
      sendMessage,
      markRead,
      emitTyping,
    }),
    [
      connected,
      emitTyping,
      fetchConversations,
      markRead,
      selectConversation,
      sendMessage,
      state,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }

  return context;
}