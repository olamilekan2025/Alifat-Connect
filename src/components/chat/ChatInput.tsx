"use client";

import {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { ImagePlus, Loader2, Paperclip, Send, Smile } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useChat } from "../../context/ChatContext";
import { useChatUpload } from "../../hooks/useChatUpload";
import type { ChatAttachment } from "../../../types/chat";

export function ChatInput() {
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<ChatAttachment>();
  const [sending, setSending] = useState(false);

  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const { currentConversation, sendMessage, emitTyping } = useChat();
  const { upload, uploading } = useChatUpload();

  const canSend =
    !sending &&
    !uploading &&
    Boolean(currentConversation) &&
    Boolean(message.trim() || attachment);

  useEffect(() => {
    return () => {
      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
      }

      if (currentConversation) {
        emitTyping(currentConversation._id, false);
      }
    };
  }, [currentConversation, emitTyping]);

  function stopTyping() {
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }

    if (currentConversation) {
      emitTyping(currentConversation._id, false);
    }
  }

  function onEmoji(emoji: EmojiClickData) {
    setMessage((value) => `${value}${emoji.emoji}`);
  }

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const uploaded = await upload(file);

    if (uploaded) {
      setAttachment(uploaded);
    }

    event.target.value = "";
  }

  function onChange(value: string) {
    setMessage(value);

    if (!currentConversation) {
      return;
    }

    emitTyping(currentConversation._id, true);

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }

    typingTimer.current = setTimeout(() => {
      emitTyping(currentConversation._id, false);
      typingTimer.current = null;
    }, 900);
  }

  async function onSubmit() {
    if (!canSend) {
      return;
    }

    setSending(true);

    try {
      const sent = await sendMessage({
        message: message.trim(),
        attachment,
      });

      // Keep the text and attachment if the socket/server rejected the send.
      if (!sent) {
        return;
      }

      setMessage("");
      setAttachment(undefined);
      stopTyping();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  }

  return (
    <footer className="border-t p-3">
      {attachment && (
        <div className="mb-2 flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
          <span className="truncate">{attachment.name}</span>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={sending}
            onClick={() => setAttachment(undefined)}
          >
            Remove
          </Button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={onFile}
        />

        <Button
          type="button"
          size="icon"
          variant="ghost"
          disabled={uploading || sending}
          onClick={() => fileRef.current?.click()}
          aria-label="Attach file"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Paperclip className="h-4 w-4" />
          )}
        </Button>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          disabled={uploading || sending}
          onClick={() => fileRef.current?.click()}
          aria-label="Upload image"
        >
          <ImagePlus className="h-4 w-4" />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              disabled={sending}
              aria-label="Add emoji"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>

          <PopoverContent align="end" className="w-auto border-0 p-0">
            <EmojiPicker onEmojiClick={onEmoji} />
          </PopoverContent>
        </Popover>

        <Textarea
          value={message}
          disabled={sending}
          onChange={(event) => onChange(event.target.value)}
          onBlur={stopTyping}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void onSubmit();
            }
          }}
          placeholder={
            currentConversation
              ? "Type a message"
              : "Opening chat..."
          }
          className="max-h-28 min-h-10 resize-none"
        />

        <Button
          type="button"
          size="icon"
          disabled={!canSend}
          onClick={() => void onSubmit()}
          aria-label="Send message"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </footer>
  );
}