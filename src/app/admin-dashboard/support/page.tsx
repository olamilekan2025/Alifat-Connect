"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Plus,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type SupportTicket = {
  _id: string;
  ticketNumber: string;
  subject: string;
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
  };
  assignedAdminId?: {
    _id: string;
    name?: string;
    firstname?: string;
    lastname?: string;
    email: string;
  };
  createdAt: string;
  lastMessageAt: string;
  messageCount: number;
};

type SupportStats = {
  totalTickets: number;
  openTickets: number;
  pendingTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  urgentTickets: number;
  avgResponseTime: number;
  avgResolutionTime: number;
};

export default function AdminSupportPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<SupportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [sort, setSort] = useState("newest");

  // Pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  });

  // UI state
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [page, status, priority, category, dateRange, sort]);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (page === 1) {
        fetchTickets();
      } else {
        setPage(1);
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [search]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "25");
      params.set("sort", sort);

      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (priority) params.set("priority", priority);
      if (category) params.set("category", category);
      if (dateRange) params.set("dateRange", dateRange);

      const res = await fetch(`/api/admin/support?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch tickets");
      }

      setTickets(data.tickets || []);
      setStats(data.stats || null);
      setPagination(data.pagination || pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tickets");
      setTickets([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950/40 dark:text-red-400";
      case "High":
        return "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-950/40 dark:text-orange-400";
      case "Medium":
        return "bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-950/40 dark:text-yellow-400";
      case "Low":
        return "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-400";
      default:
        return "bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-950/40 dark:text-gray-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-400";
      case "Pending":
        return "bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-950/40 dark:text-yellow-400";
      case "In Progress":
        return "bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-950/40 dark:text-purple-400";
      case "Resolved":
        return "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-950/40 dark:text-green-400";
      case "Closed":
        return "bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-950/40 dark:text-gray-400";
      default:
        return "bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-950/40 dark:text-gray-400";
    }
  };

  const getUserName = (user: SupportTicket["userId"]) => {
    return user.name || `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Unknown";
  };

  const getAdminName = (admin?: SupportTicket["assignedAdminId"]) => {
    if (!admin) return "Unassigned";
    return admin.name || `${admin.firstname || ""} ${admin.lastname || ""}`.trim() || admin.email;
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setPriority("");
    setCategory("");
    setDateRange("");
    setSort("newest");
    setPage(1);
  };

  if (loading && !stats) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            Loading support dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Support Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage customer support tickets and inquiries
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Ticket
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          <StatCard
            title="Total"
            value={stats.totalTickets}
            icon={<MessageSquare className="h-5 w-5" />}
            color="blue"
          />
          <StatCard
            title="Open"
            value={stats.openTickets}
            icon={<AlertCircle className="h-5 w-5" />}
            color="blue"
          />
          <StatCard
            title="Pending"
            value={stats.pendingTickets}
            icon={<Clock className="h-5 w-5" />}
            color="yellow"
          />
          <StatCard
            title="In Progress"
            value={stats.inProgressTickets}
            icon={<TrendingUp className="h-5 w-5" />}
            color="purple"
          />
          <StatCard
            title="Resolved"
            value={stats.resolvedTickets}
            icon={<CheckCircle2 className="h-5 w-5" />}
            color="green"
          />
          <StatCard
            title="Closed"
            value={stats.closedTickets}
            icon={<CheckCircle2 className="h-5 w-5" />}
            color="gray"
          />
          <StatCard
            title="Urgent"
            value={stats.urgentTickets}
            icon={<AlertCircle className="h-5 w-5" />}
            color="red"
          />
          <StatCard
            title="Avg Response"
            value={`${stats.avgResponseTime}m`}
            icon={<Clock className="h-5 w-5" />}
            color="cyan"
          />
        </div>
      )}

      {/* Filters */}
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
              <ChevronDown
                className={`ml-2 h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
              />
            </Button>

            {(search || status || priority || category || dateRange) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 grid gap-3 border-t pt-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-500">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                <option value="Open">Open</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-500">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                <option value="">All Priority</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-500">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                <option value="">All Categories</option>
                <option value="Airtime">Airtime</option>
                <option value="Data">Data</option>
                <option value="Electricity">Electricity</option>
                <option value="Cable TV">Cable TV</option>
                <option value="Wallet Funding">Wallet Funding</option>
                <option value="Transaction">Transaction</option>
                <option value="Account">Account</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-500">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => {
                  setDateRange(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-500">
                Sort By
              </label>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">Highest Priority</option>
                <option value="recently_updated">Recently Updated</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Tickets Table */}
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        {error ? (
          <div className="p-8 text-center text-red-500">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Ticket</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Subject</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Priority</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Assigned</th>
                  <th className="px-4 py-3 text-left">Updated</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-zinc-400">
                      Loading...
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-zinc-400">
                      No support tickets found
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr
                      key={ticket._id}
                      className="border-b transition hover:bg-muted/40"
                    >
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs font-semibold">
                          {ticket.ticketNumber}
                        </div>
                        <div className="text-xs text-zinc-400">
                          {ticket.messageCount} messages
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {getUserName(ticket.userId)}
                        </div>
                        <div className="text-xs text-zinc-400">
                          {ticket.userId.email}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="max-w-[200px] truncate text-sm">
                          {ticket.subject}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium dark:bg-zinc-800">
                          {ticket.category}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${getPriorityColor(
                            ticket.priority
                          )}`}
                        >
                          {ticket.priority}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(
                            ticket.status
                          )}`}
                        >
                          {ticket.status}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-xs">
                          {getAdminName(ticket.assignedAdminId)}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-xs text-zinc-400">
                          {new Date(ticket.lastMessageAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <Link href={`/admin-dashboard/support/${ticket._id}`}>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-xs text-zinc-400">
              Showing {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} tickets
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
    green: "bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400",
    yellow: "bg-yellow-50 text-yellow-600 dark:bg-yellow-950/50 dark:text-yellow-400",
    red: "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400",
    gray: "bg-gray-50 text-gray-600 dark:bg-gray-950/50 dark:text-gray-400",
    cyan: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400",
  };

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm transition hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          {title}
        </span>
        <div className={`rounded-xl p-2 ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
      </div>
      <div className="mt-3 text-2xl font-bold">{value}</div>
    </div>
  );
}
