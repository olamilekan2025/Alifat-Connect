"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

type Props = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function NotificationForm({
  onSuccess,
  onCancel,
}: Props) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");
  const [priority, setPriority] = useState("normal");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      alert("Title and message are required.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "/api/admin/notifications",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            title,
            message,
            audience,
            priority,
            status: "draft",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error ??
            "Failed to create notification."
        );
      }

      setTitle("");
      setMessage("");
      setAudience("all");
      setPriority("normal");

      onSuccess?.();
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Unexpected error.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div>
        <label className="mb-1 block text-sm font-medium">
          Title
        </label>
        <input
          className="w-full rounded-lg border p-2"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Message
        </label>
        <textarea
          rows={5}
          className="w-full rounded-lg border p-2"
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Audience
          </label>

          <select
            className="w-full rounded-lg border p-2"
            value={audience}
            onChange={(e) =>
              setAudience(e.target.value)
            }
          >
            <option value="all">
              All Users
            </option>
            <option value="verified">
              Verified Users
            </option>
            <option value="unverified">
              Unverified Users
            </option>
            <option value="admins">
              Admins
            </option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Priority
          </label>

          <select
            className="w-full rounded-lg border p-2"
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value)
            }
          >
            <option value="low">
              Low
            </option>
            <option value="normal">
              Normal
            </option>
            <option value="high">
              High
            </option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border px-4 py-2"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          Save Draft
        </button>
      </div>
    </form>
  );
}