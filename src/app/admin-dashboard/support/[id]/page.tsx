"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MessageSquare,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
  Paperclip,
  Send,
  MoreVertical,
  FileText,
  RefreshCw,
  Lock,
  Eye,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type SupportMessage = {
  _id: string;
  senderId: {
    _id: string;
    name?: string;
    firstname?: string;
    lastname?: string;
    email: string;
    image?: string;
  };
  senderType: "USER" | "ADMIN" | "SYSTEM";
  message: string;
  isInternal: boolean;
  attachments?: Array<{
    url: string;
    name: string;
    mimeType: string;
    size: number;
  }>;
  isRead: boolean;
  createdAt: string;
};

type SupportTicket = {
  _id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Open" | "Pending" | "In Progress" | "Resolved" | "Closed";
  userId: {
    _id: string;
    name?: string;
    firstname?: string;
    lastname?: string;
    email: string;
    phone?: string;
    walletBalance: number;
    emailVerified: boolean;
    referralCode?: string;
  };
  assignedAdminId?: {
    _id: string;
    name?: string;
    firstname?: string;
    lastname?: string;
    email: string;
  };
  transactionId?: string;
  transactionReference?: string;
  transactionType?: string;
  transactionAmount?: number;
  transactionStatus?: string;
  createdAt: string;
  lastMessageAt: string;
  messageCount: number;
  firstResponseAt?: string;
  resolvedAt?: string;
  closedAt?: string;
};

type Transaction = {
  _id: string;
  reference: string;
  type: "credit" | "debit";
  category?: string;
  amount: number;
  status: "pending" | "success" | "failed";
  network?: string;
  phone?: string;
  plan?: string;
  provider?: string;
  meterNumber?: string;
  meterType?: string;
  customerName?: string;
  token?: string;
  createdAt: string;
};

export default function TicketDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [ticketId, setTicketId] = useState<string>("");
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Message input
  const [message, setMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<Array<{ url: string; name: string; mimeType: string; size: number }>>([]);
  const [uploading, setUploading] = useState(false);

  // Ticket management
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    params.then((p) => {
      setTicketId(p.id);
      fetchTicketData(p.id);
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchTicketData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/admin/support/${id}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch ticket");
      }

      setTicket(data.ticket);
      setMessages(data.messages || []);
      setTransaction(data.transaction || null);

      setSelectedStatus(data.ticket?.status || "");
      setSelectedPriority(data.ticket?.priority || "");
      setSelectedAdmin(data.ticket?.assignedAdminId?._id || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Upload failed");
        }
        
        setAttachments((prev) => [
          ...prev,
          {
            url: data.url,
            name: file.name,
            mimeType: file.type,
            size: file.size,
          },
        ]);
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      alert(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
    if (!message.trim() || sending) return;

    try {
      setSending(true);

      const res = await fetch(`/api/admin/support/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          isInternal,
          attachments,
          reopenTicket: ticket?.status === "Closed",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setMessage("");
      setIsInternal(false);
      setAttachments([]);

      // Refresh ticket data
      await fetchTicketData(ticketId);
    } catch (err) {
      console.error("Error sending message:", err);
      alert(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const updateTicket = async (field: string, value: any) => {
    try {
      setUpdating(true);

      const res = await fetch(`/api/admin/support/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update ticket");
      }

      setTicket(data.ticket);

      if (field === "status") {
        setSelectedStatus(value);
      } else if (field === "priority") {
        setSelectedPriority(value);
      } else if (field === "assignedAdminId") {
        setSelectedAdmin(value);
      }
    } catch (err) {
      console.error("Error updating ticket:", err);
      alert(err instanceof Error ? err.message : "Failed to update ticket");
    } finally {
      setUpdating(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800";
      case "High":
        return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800";
      case "Medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800";
      case "Low":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/40 dark:text-gray-400 dark:border-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800";
      case "Pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800";
      case "In Progress":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800";
      case "Resolved":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800";
      case "Closed":
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/40 dark:text-gray-400 dark:border-gray-800";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/40 dark:text-gray-400 dark:border-gray-800";
    }
  };

  const getUserName = (user: SupportTicket["userId"]) => {
    return user.name || `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Unknown";
  };

  const getAdminName = (admin?: SupportTicket["assignedAdminId"]) => {
    if (!admin) return "Unassigned";
    return admin.name || `${admin.firstname || ""} ${admin.lastname || ""}`.trim() || admin.email;
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            Loading ticket details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          {error || "Ticket not found"}
        </p>
        <Link href="/admin-dashboard/support">
          <Button className="mt-4">Back to Support</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col gap-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin-dashboard/support">
            <Button size="sm" variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">{ticket.ticketNumber}</h1>
            <p className="text-sm text-zinc-500">{ticket.subject}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getPriorityColor(ticket.priority)}>
            {ticket.priority}
          </Badge>
          <Badge className={getStatusColor(ticket.status)}>
            {ticket.status}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Conversation Area */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border bg-card">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex gap-3 ${
                    msg.senderType === "ADMIN" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.senderType !== "ADMIN" && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={msg.senderId.image} />
                      <AvatarFallback>
                        {getUserName(ticket.userId).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`max-w-[70%] rounded-2xl p-3 ${
                      msg.isInternal
                        ? "bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800"
                        : msg.senderType === "ADMIN"
                        ? "bg-blue-500 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800"
                    }`}
                  >
                    {msg.isInternal && (
                      <div className="mb-1 flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                        <Lock className="h-3 w-3" />
                        Internal Note
                      </div>
                    )}

                    <div className="mb-1 text-xs font-medium">
                      {msg.senderType === "SYSTEM"
                        ? "System"
                        : msg.senderType === "ADMIN"
                        ? "You"
                        : getUserName(ticket.userId)}
                    </div>

                    <p className="text-sm">{msg.message}</p>

                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.attachments.map((att, idx) => (
                          <a
                            key={idx}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs underline"
                          >
                            <Paperclip className="h-3 w-3" />
                            {att.name}
                          </a>
                        ))}
                      </div>
                    )}

                    <div className="mt-1 text-[10px] opacity-70">
                      {new Date(msg.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {msg.senderType === "ADMIN" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <div className="border-t p-4">
            <div className="mb-2 flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="rounded"
                />
                <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400">
                  <Lock className="h-3 w-3" />
                  Internal Note
                </span>
              </label>
            </div>

            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-lg bg-zinc-100 px-2 py-1 text-sm dark:bg-zinc-800"
                  >
                    <Paperclip className="h-3 w-3" />
                    <span className="max-w-[150px] truncate">{att.name}</span>
                    <button
                      onClick={() => removeAttachment(idx)}
                      className="text-zinc-500 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <div className="flex-1">
                <Textarea
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="min-h-[80px] resize-none"
                  disabled={ticket.status === "Closed"}
                />
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading || ticket.status === "Closed"}
                />
                <label htmlFor="file-upload">
                  <Button
                    size="icon"
                    variant="outline"
                    type="button"
                    disabled={uploading || ticket.status === "Closed"}
                    asChild
                  >
                    <span>
                      {uploading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Paperclip className="h-4 w-4" />
                      )}
                    </span>
                  </Button>
                </label>
                <Button
                  onClick={sendMessage}
                  disabled={!message.trim() || sending || ticket.status === "Closed"}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {ticket.status === "Closed" && (
              <p className="mt-2 text-xs text-zinc-500">
                This ticket is closed. Reopen it to send messages.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden w-80 flex-col gap-4 overflow-y-auto lg:flex">
          {/* Customer Info */}
          <div className="rounded-2xl border bg-card p-4">
            <h3 className="mb-3 font-semibold">Customer Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-zinc-400" />
                <span>{getUserName(ticket.userId)}</span>
              </div>
              <div className="text-zinc-400">{ticket.userId.email}</div>
              {ticket.userId.phone && (
                <div className="text-zinc-400">{ticket.userId.phone}</div>
              )}
              <div className="flex items-center justify-between pt-2">
                <span className="text-zinc-400">Wallet Balance</span>
                <span className="font-medium">
                  ₦{ticket.userId.walletBalance.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Email Verified</span>
                {ticket.userId.emailVerified ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </div>

          {/* Ticket Info */}
          <div className="rounded-2xl border bg-card p-4">
            <h3 className="mb-3 font-semibold">Ticket Information</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Status</label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => updateTicket("status", value)}
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-xs text-zinc-400">Priority</label>
                <Select
                  value={selectedPriority}
                  onValueChange={(value) => updateTicket("priority", value)}
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-xs text-zinc-400">Category</label>
                <div className="text-sm">{ticket.category}</div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-zinc-400">Assigned To</label>
                <Select
                  value={selectedAdmin}
                  onValueChange={(value) =>
                    updateTicket("assignedAdminId", value || null)
                  }
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    <SelectItem value={ticket.assignedAdminId?._id || ""}>
                      {getAdminName(ticket.assignedAdminId)}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 pt-2 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Created</span>
                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated</span>
                  <span>{new Date(ticket.lastMessageAt).toLocaleDateString()}</span>
                </div>
                {ticket.firstResponseAt && (
                  <div className="flex justify-between">
                    <span>First Response</span>
                    <span>{new Date(ticket.firstResponseAt).toLocaleDateString()}</span>
                  </div>
                )}
                {ticket.resolvedAt && (
                  <div className="flex justify-between">
                    <span>Resolved</span>
                    <span>{new Date(ticket.resolvedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transaction Info */}
          {transaction && (
            <div className="rounded-2xl border bg-card p-4">
              <h3 className="mb-3 font-semibold">Transaction Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Reference</span>
                  <span className="font-mono">{transaction.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Type</span>
                  <span className="capitalize">{transaction.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Category</span>
                  <span className="capitalize">{transaction.category || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Amount</span>
                  <span className="font-medium">
                    ₦{transaction.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Status</span>
                  <Badge
                    className={
                      transaction.status === "success"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : transaction.status === "failed"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                    }
                  >
                    {transaction.status}
                  </Badge>
                </div>
                {transaction.network && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Network</span>
                    <span>{transaction.network}</span>
                  </div>
                )}
                {transaction.phone && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Phone</span>
                    <span>{transaction.phone}</span>
                  </div>
                )}
                <Link href={`/admin-dashboard/transactions`}>
                  <Button size="sm" variant="outline" className="mt-2 w-full">
                    <Eye className="mr-2 h-3 w-3" />
                    View Transaction
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
