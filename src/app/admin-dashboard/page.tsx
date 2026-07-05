"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Wallet,
  Shield,
  ArrowUpRight,
  Clock3,
  XCircle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type TransactionItem = {
  _id: string;
  reference: string;
  category: string;
  amount: number;
  status: "success" | "pending" | "failed";
  createdAt?: string;
};

type AdminStats = {
  totalUsers: number;
  totalAdmins: number;
  verifiedUsers: number;

  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;

  totalWalletBalance: number;
  totalRevenue: number;

  recentTransactions: TransactionItem[];
};

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [search, setSearch] = useState("");
  const term = search.trim().toLowerCase();
  const [sortBy, setSortBy] = useState<"date" | "amount" | "status">("date");

  const [currentPage, setCurrentPage] = useState<number>(1);

  const [dateFilter, setDateFilter] = useState<
    "today" | "7days" | "30days" | "all"
  >("all");

  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(
    null,
  );

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/admin/stats")
        .then((res) => res.json())
        .then((data) => setStats(data));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const filteredTransactions = [...(stats?.recentTransactions ?? [])]
    .filter((trx) => {
      const term = search.toLowerCase();

      return (
        trx.reference?.toLowerCase().includes(term) ||
        trx.category?.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "amount":
          return b.amount - a.amount;

        case "status":
          return String(a.status).localeCompare(String(b.status));

        default:
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
      }
    });

  const recentTransactions = filteredTransactions.slice(0, 5);
  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-8 p-2 md:p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-2xl font-bold">Recent Transactions</h2>

          <p className="text-sm text-muted-foreground">
            Monitor the latest platform activity in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search reference or service..."
            className="w-64"
          />

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "date" | "amount" | "status")
            }
            className="
    rounded-lg
    border
    border-zinc-300
    bg-white
    px-3
    py-2
    text-sm
    text-zinc-900
    dark:border-zinc-700
    dark:bg-zinc-900
    dark:text-white
  "
          >
            <option value="date">Sort by Date</option>

            <option value="amount">Sort by Amount</option>

            <option value="status">Sort by Status</option>
          </select>

          <Button variant="outline">Export CSV</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-5 grid-cols-3  md:grid-cols-4 ">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={<Users className="h-5 w-5" />}
            valueClassName="text-blue-600 dark:text-blue-400"
        />

        <StatCard
          title="Administrators"
          value={stats?.totalAdmins ?? 0}
          icon={<Shield className="h-5 w-5" />}
            valueClassName="text-violet-600 dark:text-violet-400"
        />

        <StatCard
          title="Revenue"
          value={`₦${Number(stats?.totalRevenue ?? 0).toLocaleString()}`}
          icon={<TrendingUp className="h-5 w-5" />}
            valueClassName="text-emerald-600 dark:text-emerald-400"
        />

        <StatCard
          title="Wallet Balance"
          value={`₦${Number(stats?.totalWalletBalance ?? 0).toLocaleString()}`}
          icon={<Wallet className="h-5 w-5" />}
            valueClassName="text-amber-600 dark:text-amber-400"
          
        />

        <StatCard
          title="Transactions"
          value={stats?.totalTransactions ?? 0}
          icon={<ArrowUpRight className="h-5 w-5" />}
           valueClassName="text-cyan-600 dark:text-cyan-400"
        />

        <StatCard
          title="Successful"
          value={stats?.successfulTransactions ?? 0}
          icon={<CheckCircle2 className="h-5 w-5" />}
          valueClassName="text-green-600 dark:text-green-400"
        />

        <StatCard
          title="Pending"
          value={stats?.pendingTransactions ?? 0}
          icon={<Clock3 className="h-5 w-5" />}
          valueClassName="text-yellow-500 dark:text-yellow-400"
        />

        <StatCard
          title="Failed"
          value={stats?.failedTransactions ?? 0}
          icon={<XCircle className="h-5 w-5" />}
          valueClassName="text-red-600 dark:text-red-400"
        />
      </div>

      <div className="justify-end flex">
        {/* <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm text-muted-foreground">Total</p>
          <h3 className="text-2xl font-bold">{stats?.totalTransactions}</h3>
        </div>

        <div className="rounded-2xl border p-4">
          <p className="text-sm text-muted-foreground">Success</p>
          <h3 className="text-2xl font-bold text-green-600">
            {stats?.successfulTransactions}
          </h3>
        </div>

        <div className="rounded-2xl border p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <h3 className="text-2xl font-bold text-yellow-600">
            {stats?.pendingTransactions}
          </h3>
        </div>

        <div className="rounded-2xl border p-4">
          <p className="text-sm text-muted-foreground">Failed</p>
          <h3 className="text-2xl font-bold text-red-600">
            {stats?.failedTransactions}
          </h3>
        </div> */}
       <Link
  href="/admin-dashboard/transactions"
  className="group inline-flex items-center font-medium text-primary transition-colors hover:text-primary/80"
>
  <span className="border-b border-dashed border-transparent transition-all duration-200 group-hover:border-current">
    View All Transactions
  </span>
</Link>
      </div>
      {/* Table */}

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <table className="w-full">
          <thead className="border-b border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
            <tr className="text-left">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                Reference
              </th>

              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                Service
              </th>

              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                Amount
              </th>

              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                Status
              </th>

              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                Date
              </th>

              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {recentTransactions.length ? (
              recentTransactions.map((trx) => (
                <tr
                  key={trx._id}
                  className="
  border-b
  border-zinc-200
  transition-colors
  hover:bg-zinc-100
  dark:border-zinc-800
  dark:hover:bg-zinc-900
"
                >
                  <td className="px-6 py-4 font-mono text-sm font-medium">
                    {trx.reference}
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                      {trx.category || "General"}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-semibold">
                    ₦{Number(trx.amount).toLocaleString()}
                  </td>

                  <td className="px-6 py-4">
                    {trx.status === "success" && (
                      <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-600">
                        Success
                      </span>
                    )}

                    {trx.status === "pending" && (
                      <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-600">
                        Pending
                      </span>
                    )}

                    {trx.status === "failed" && (
                      <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-600">
                        Failed
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {trx.createdAt
                      ? new Date(trx.createdAt).toLocaleString()
                      : "-"}
                  </td>

                  <td className="px-6 py-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedTransaction(trx)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-muted-foreground"
                >
                  No recent transactions available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          {/* Modal Card */}
          <div
            className="
        relative w-full max-w-lg
  rounded-2xl
  border border-zinc-200
  bg-white
  p-6
  shadow-2xl
  backdrop-blur-xl
  dark:border-zinc-800
  dark:bg-zinc-950/95
        animate-in fade-in zoom-in-95 duration-200
      "
          >
            {/* Header */}
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">Transaction Details</h2>
                <p className="text-xs text-muted-foreground">
                  Review transaction information
                </p>
              </div>

              {/* Close X */}
              <button
                onClick={() => setSelectedTransaction(null)}
                className="
  rounded-lg
  p-2
  text-zinc-500
  transition
  hover:bg-red-500
  hover:text-white
  dark:text-white
  dark:hover:bg-zinc-800
  dark:hover:text-white
"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-medium">
                  {selectedTransaction.reference}
                </span>
              </div>

              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">
                  {selectedTransaction.category}
                </span>
              </div>

              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold text-foreground">
                  ₦{Number(selectedTransaction.amount).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>

                <span
                  className={`
              rounded-full px-3 py-1 text-xs font-medium
              ${
                selectedTransaction.status === "success"
                  ? "bg-green-500/10 text-green-600"
                  : selectedTransaction.status === "pending"
                    ? "bg-yellow-500/10 text-yellow-600"
                    : "bg-red-500/10 text-red-600"
              }
            `}
                >
                  {selectedTransaction.status}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setSelectedTransaction(null)}
                className="
            rounded-xl px-5
            bg-primary hover:bg-primary/90
            text-white shadow-md
          "
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  valueClassName?: string;
};

function StatCard({ title, value, icon, valueClassName = "" }: StatCardProps) {
  return (
    <div className="rounded-2xl border  bg-card p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:rounded-3xl md:p-6">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-yellow-500/10 p-2 text-yellow-600 md:rounded-2xl md:p-3">
          <div className="[&>svg]:h-[15px] [&>svg]:w-[15px] md:[&>svg]:h-5 md:[&>svg]:w-5">
            {icon}
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground md:mt-5 md:text-sm">
        {title}
      </p>

      <h2
        className={`mt-1 text-lg font-black tracking-tight md:mt-2 md:text-3xl ${valueClassName}`}
      >
        {value}
      </h2>
    </div>
  );
}
