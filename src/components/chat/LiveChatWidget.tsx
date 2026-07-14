"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChat } from "../../context/ChatContext";
import { ChatWindow } from "@/components/chat/ChatWindow";

export function LiveChatWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const { conversations, currentConversation, selectConversation, unreadTotal, connected } = useChat();

  useEffect(() => {
    if (!open || currentConversation || !conversations[0]) return;
    selectConversation(conversations[0]);
  }, [conversations, currentConversation, open, selectConversation]);

  if (!open) {
    return (
      <Button
        type="button"
        size="lg"
        className="fixed bottom-5 right-5 z-50 h-14 gap-2 rounded-full px-5 shadow-lg"
        onClick={() => setOpen(true)}
      >
        <MessageCircle className="h-5 w-5" />
        Live Chat
        {unreadTotal > 0 && (
          <span className="ml-1 rounded-full bg-destructive px-2 py-0.5 text-xs text-destructive-foreground">
            {unreadTotal}
          </span>
        )}
      </Button>
    );
  }

  return (
    <section
      className={cn(
        "fixed bottom-5 right-5 z-50 w-[calc(100vw-2.5rem)] overflow-hidden rounded-lg border bg-background shadow-2xl sm:w-[420px]",
        minimized ? "h-14" : "h-[min(680px,calc(100vh-2.5rem))]"
      )}
      aria-label="Live chat"
    >
      <header className="flex h-14 items-center justify-between border-b px-4">
        <div>
          <p className="text-sm font-semibold">Support Chat</p>
          <p className="text-xs text-muted-foreground">{connected ? "Online" : "Reconnecting..."}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={() => setMinimized((value) => !value)}>
            <Minus className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </header>
      {!minimized && <ChatWindow />}
    </section>
  );
}

