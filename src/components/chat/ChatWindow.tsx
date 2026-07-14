"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useChat } from "../../context/ChatContext";
import { ChatInput } from "@/components/chat/ChatInput";
import { MessageList } from "../../components/chat/MessageList";

export function ChatWindow() {
  const { currentConversation, messages, typing, markRead } = useChat();
  const [search, setSearch] = useState("");

  const visibleMessages = useMemo(() => {
    if (!search.trim()) return messages;
    const needle = search.toLowerCase();
    return messages.filter((message) => message.message.toLowerCase().includes(needle));
  }, [messages, search]);

  useEffect(() => {
    if (!currentConversation?._id) return;
    markRead(currentConversation._id).catch(() => undefined);
  }, [currentConversation?._id, markRead, messages.length]);

  const typingState = currentConversation ? typing[currentConversation._id] : undefined;

  return (
    <div className="flex h-[calc(100%-3.5rem)] flex-col">
      <div className="border-b p-3">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search messages"
            className="pl-9"
          />
        </label>
      </div>
      <MessageList messages={visibleMessages} />
      {typingState?.typing && typingState.role === "admin" && (
        <div className="px-4 py-2 text-xs text-muted-foreground">Admin is typing...</div>
      )}
    <ChatInput />
    </div>
  );
}

