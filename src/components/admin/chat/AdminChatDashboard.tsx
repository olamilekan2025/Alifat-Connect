
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  MailOpen,
  Pin,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useChat } from "@/context/ChatContext";
import { ChatInput } from "@/components/chat/ChatInput";
import { MessageList } from "@/components/chat/MessageList";
import type { ChatConversation } from "../../../../types/chat";
import { cn } from "@/lib/utils";

export function AdminChatDashboard() {
  const {
    conversations,
    currentConversation,
    messages,
    onlineUsers,
    typing,
    loading,
    fetchConversations,
    selectConversation,
    markRead,
  } = useChat();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations({ status, search }).catch(() => {
      toast.error("Failed to load conversations");
    });
  }, [fetchConversations, search, status]);

  useEffect(() => {
    if (!currentConversation?._id) return;

    markRead(currentConversation._id).catch(() => undefined);
  }, [currentConversation?._id, markRead, messages.length]);

  const selectedTyping = currentConversation
    ? typing[currentConversation._id]
    : undefined;

  async function updateConversation(
    conversation: ChatConversation,
    action: "pin" | "resolve" | "delete",
  ) {
    const id = conversation._id;
    setUpdating(action);

    try {
      if (action === "delete") {
        const response = await fetch(`/api/chat/conversations/${id}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to delete conversation");
        }

        toast.success("Conversation deleted");
        await fetchConversations({ status, search });
        return;
      }

      const endpoint =
        action === "pin"
          ? `/api/chat/conversations/${id}/pin`
          : `/api/chat/conversations/${id}/resolve`;

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body:
          action === "pin"
            ? JSON.stringify({ isPinned: !conversation.isPinned })
            : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} conversation`);
      }

      if (action === "pin") {
        toast.success(
          conversation.isPinned
            ? "Conversation unpinned"
            : "Conversation pinned",
        );
      } else {
        toast.success("Conversation marked as resolved");
      }

      await fetchConversations({ status, search });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong",
      );
    } finally {
      setUpdating(null);
    }
  }

  async function handleMarkRead() {
    if (!currentConversation) return;

    setUpdating("read");

    try {
      await markRead(currentConversation._id);
      toast.success("Conversation marked as read");
    } catch {
      toast.error("Failed to mark conversation as read");
    } finally {
      setUpdating(null);
    }
  }

  const filtered = useMemo(() => conversations, [conversations]);

  return (
    <div className="flex h-[calc(100vh-5rem)] overflow-hidden border bg-background">
      <aside className="hidden w-96 shrink-0 border-r md:flex md:flex-col">
        <div className="space-y-3 border-b p-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or email"
              className="pl-9"
            />
          </label>

          <Tabs value={status} onValueChange={setStatus}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading &&
            Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="m-3 h-16" />
            ))}

          {!loading &&
            filtered.map((conversation) => {
              const user = conversation.user;
              const unread = conversation.unreadCount.admin;
              const active =
                currentConversation?._id === conversation._id;

              return (
                <button
                  key={conversation._id}
                  type="button"
                  className={cn(
                    "flex w-full items-start gap-3 border-b p-4 text-left hover:bg-muted",
                    active && "bg-muted",
                  )}
                  onClick={() => void selectConversation(conversation)}
                >
                  <span
                    className={cn(
                      "mt-1 h-2.5 w-2.5 rounded-full",
                      onlineUsers.has(user._id)
                        ? "bg-emerald-500"
                        : "bg-muted-foreground",
                    )}
                  />

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-medium">
                        {user.name || "Customer"}
                      </span>

                      {conversation.isPinned && (
                        <Pin className="h-3.5 w-3.5 fill-current" />
                      )}
                    </span>

                    <span className="block truncate text-sm text-muted-foreground">
                      {user.email}
                    </span>

                    <span className="block truncate text-xs text-muted-foreground">
                      {conversation.lastMessage}
                    </span>
                  </span>

                  {unread > 0 && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                      {unread}
                    </span>
                  )}
                </button>
              );
            })}
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        {currentConversation ? (
          <>
            <header className="flex h-16 items-center justify-between border-b px-4">
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {currentConversation.user.name || "Customer"}
                </p>

                <p className="truncate text-xs text-muted-foreground">
                  {onlineUsers.has(currentConversation.user._id)
                    ? "Online"
                    : "Offline"}{" "}
                  · {currentConversation.user.email}
                </p>
              </div>

              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={updating !== null}
                  onClick={() => void handleMarkRead()}
                  aria-label="Mark conversation as read"
                >
                  <MailOpen className="h-4 w-4" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  disabled={updating !== null}
                  onClick={() =>
                    void updateConversation(currentConversation, "pin")
                  }
                  aria-label={
                    currentConversation.isPinned
                      ? "Unpin conversation"
                      : "Pin conversation"
                  }
                >
                  <Pin
                    className={cn(
                      "h-4 w-4",
                      currentConversation.isPinned && "fill-current",
                    )}
                  />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  disabled={updating !== null}
                  onClick={() =>
                    void updateConversation(currentConversation, "resolve")
                  }
                  aria-label="Resolve conversation"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  disabled={updating !== null}
                  onClick={() =>
                    void updateConversation(currentConversation, "delete")
                  }
                  aria-label="Delete conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </header>

            <MessageList messages={messages} />

            {selectedTyping?.typing &&
              selectedTyping.role === "user" && (
                <div className="px-4 py-2 text-xs text-muted-foreground">
                  User is typing...
                </div>
              )}

            <ChatInput />
          </>
        ) : (
          <div className="grid flex-1 place-items-center text-sm text-muted-foreground">
            Select a conversation
          </div>
        )}
      </main>
    </div>
  );
}