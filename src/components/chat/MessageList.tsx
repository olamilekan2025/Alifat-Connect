"use client";

import { useEffect, useMemo, useRef } from "react";
import { format, isSameDay } from "date-fns";
import { Check, CheckCheck, FileText } from "lucide-react";
import { useSession } from "next-auth/react";
import type { ChatMessage } from "../../../types/chat";
import { cn } from "@/lib/utils";

export function MessageList({ messages }: { messages: ChatMessage[] }) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { data: session } = useSession();
  const myId = (session?.user as { id?: string })?.id;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const rows = useMemo(() => {
    return messages.flatMap((message, index) => {
      const previous = messages[index - 1];
      const showDate =
        !previous ||
        !isSameDay(new Date(previous.createdAt), new Date(message.createdAt));
      return showDate
        ? [{ type: "date" as const, date: message.createdAt }, message]
        : [message];
    });
  }, [messages]);

  return (
    <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
      {messages.length === 0 && (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          No messages yet. Start the conversation!
        </div>
      )}
      {rows.map((row) => {
        if ("type" in row) {
          return (
            <div key={`date:${row.date}`} className="flex justify-center">
              <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                {format(new Date(row.date), "MMM d, yyyy")}
              </span>
            </div>
          );
        }

        const mine = row.senderId === myId;
        return (
          <article
            key={row._id}
            className={cn("flex", mine ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[82%] rounded-lg px-3 py-2 text-sm",
                mine ? "bg-primary text-primary-foreground" : "bg-muted",
              )}
            >
              {row.attachment?.mimeType?.startsWith("image/") && (
                <a href={row.attachment.url} target="_blank" rel="noreferrer">
                  <img
                    src={row.attachment.url}
                    alt={row.attachment.name}
                    className="mb-2 max-h-48 rounded-md object-contain"
                  />
                </a>
              )}
              {row.attachment &&
                !row.attachment.mimeType?.startsWith("image/") && (
                  <a
                    href={row.attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mb-2 flex items-center gap-2 underline"
                  >
                    <FileText className="h-4 w-4" />
                    {row.attachment.name}
                  </a>
                )}
              {row.message && (
                <p className="whitespace-pre-wrap break-words">{row.message}</p>
              )}
              <div
  className={cn(
    "mt-1 flex items-center justify-end gap-1 text-[11px]",
    mine ? "text-primary-foreground/75" : "text-muted-foreground",
  )}
>
  <time>{format(new Date(row.createdAt), "h:mm a")}</time>

  {mine &&
    (row.isRead ? (
      <CheckCheck
        className="h-3.5 w-3.5 text-sky-400"
        aria-label="Read"
      />
    ) : (
      <Check
        className="h-3.5 w-3.5"
        aria-label="Sent"
      />
    ))}
</div>
            </div>
          </article>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
