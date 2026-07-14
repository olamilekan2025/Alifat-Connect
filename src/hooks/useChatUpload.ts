"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { ChatAttachment } from "../../types/chat";

export function useChatUpload() {
  const [uploading, setUploading] = useState(false);

  async function upload(file: File): Promise<ChatAttachment | null> {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/chat/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      return data.attachment;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  }

  return { upload, uploading };
}

