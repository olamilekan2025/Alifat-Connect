"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  Search,
  SlidersHorizontal,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Download,
  Copy,
  Check,
  Eye,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X,
  ChevronDown,
  StickyNote,
  MapPin,
  Monitor,
} from "lucide-react";

// ==========================
// DB schema-aligned types
// ==========================
type DbTransactionType = "credit" | "debit";
type DbTransactionStatus = "pending" | "success" | "failed";
type DbTransactionCategory =
  | "airtime"
  | "data"
  | "transfer"
  | "funding"
  | "withdrawal";

type DbTransaction = {
  userId: string;
  type: DbTransactionType;
  category?: DbTransactionCategory;
  amount: number;
  status: DbTransactionStatus;
  description?: string;
  network?: string;
  phone?: string;
  plan?: string;
  reference?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

type DbUser = {
  firstname?: string;
  lastname?: string;
  name?: string;
  email?: string;
  phone?: string;
};

type ApiTransaction = (DbTransaction & {
  _id?: string;
}) & {
  id?: string;
  user?: DbUser | null;
};

type UiStatus = "SUCCESS" | "PENDING" | "FAILED";

type UiType =
  | "Deposit"
  | "Withdrawal"
  | "Transfer"
  | "Bill Payment"
  | "Airtime"
  | "Data"
  | "Subscription";

function toUiStatus(status: DbTransactionStatus): UiStatus {
  if (status === "success") return "SUCCESS";
  if (status === "pending") return "PENDING";
  return "FAILED";
}

function toUiType(tx: ApiTransaction): UiType {
  const category = tx.category;
  if (category === "airtime") return "Airtime";
  if (category === "data") return "Data";
  if (category === "transfer") return "Transfer";
  if (category === "withdrawal") return "Withdrawal";
  if (category === "funding") return "Subscription";

  // Fallback based on credit/debit
  return tx.type === "credit" ? "Deposit" : "Withdrawal";
}

function formatDate(value?: string | Date): string {
  if (!value) return "N/A";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleString();
}

function StatusBadge({ status }: { status: UiStatus }) {
  const blueprints: Record<UiStatus, string> = {
    SUCCESS:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400",
    PENDING:
      "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400",
    FAILED:
      "bg-rose-50 text-rose-700 ring-rose-600/10 dark:bg-rose-950/40 dark:text-rose-400",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold tracking-wide ring-1 ring-inset ${blueprints[status]}`}
    >
      {status}
    </span>
  );
}

export default function PremiumAdminTransactions() {
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [selectedTxn, setSelectedTxn] = useState<ApiTransaction | null>(null);

  const [summary, setSummary] = useState({
    totalTransactions: 0,
    successfulCount: 0,
    pendingCount: 0,
    failedCount: 0,
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const [page, setPage] = useState(1);
  const limit = 20;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // summary and transactions are set after a successful fetch below
  // Fetch data
  useEffect(() => {
    let ignore = false;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));

        if (searchQuery.trim()) params.set("search", searchQuery.trim());

        // Route expects lowercase for DB schema values.
        // filterStatus UI uses SUCCESS/PENDING/FAILED.
        if (filterStatus) {
          const s = String(filterStatus).toLowerCase();
          if (["success", "pending", "failed"].includes(s))
            params.set("status", s);
        }

        // Map UI type -> DB type/category expected by route.
        if (filterType) {
          const t = String(filterType);

          // credit/debit
          if (t === "Deposit") params.set("type", "credit");
          if (t === "Withdrawal") params.set("type", "debit");

          // categories
          if (t === "Airtime") params.set("category", "airtime");
          if (t === "Data") params.set("category", "data");
          if (t === "Transfer") params.set("category", "transfer");
          if (t === "Subscription") params.set("category", "funding");
          if (t === "Bill Payment") params.set("category", "funding");
        }

        if (minAmount) params.set("minAmount", minAmount);
        if (maxAmount) params.set("maxAmount", maxAmount);

        const res = await fetch(`/api/admin/transactions?${params.toString()}`);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();

        if (ignore) return;
        if (!data?.success) throw new Error(data?.message || "Failed to fetch");

        setTransactions(
          Array.isArray(data.transactions) ? data.transactions : [],
        );

        setSummary({
          totalTransactions: data.totalTransactions ?? 0,
          successfulCount: data.summary?.successfulCount ?? 0,
          pendingCount: data.summary?.pendingCount ?? 0,
          failedCount: data.summary?.failedCount ?? 0,
        });
      } catch (e) {
        if (ignore) return;
        setError(
          e instanceof Error ? e.message : "Failed to fetch transactions",
        );
        setTransactions([]);
      } finally {
        if (ignore) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      ignore = true;
    };
  }, [page, limit, searchQuery, filterType, filterStatus]);

  // In-memory min/max filter (API route currently doesn't support these)
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const amt = t.amount;
      const matchMin = minAmount ? amt >= Number(minAmount) : true;
      const matchMax = maxAmount ? amt <= Number(maxAmount) : true;
      return matchMin && matchMax;
    });
  }, [transactions, minAmount, maxAmount]);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleExport = (format: "CSV" | "EXCEL" | "PDF") => {
    alert(`Exporting ${filteredTransactions.length} items to ${format}.`);
  };

  const uiStatus = selectedTxn ? toUiStatus(selectedTxn.status) : null;

  return (
    <div className="min-h-screen bg-white p-4 font-sans text-slate-900 dark:bg-black dark:text-slate-50 md:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Transaction Intelligence Workspace
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track, filter, audit, and authorize enterprise assets and cash
            flows.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => handleExport("CSV")}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-white/30 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-black dark:text-slate-300 dark:hover:bg-black"
          >
            <Download className="h-3.5 w-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={() => handleExport("EXCEL")}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-white/30 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-black dark:text-slate-300 dark:hover:bg-black"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Excel</span>
          </button>

          <button
            onClick={() => handleExport("PDF")}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-white/30 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-black dark:text-slate-300 dark:hover:bg-black"
          >
            <Download className="h-3.5 w-3.5" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Total Transacted Volume
      </span>
      <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
        <DollarSign className="h-5 w-5" />
      </div>
    </div>
  <div className="mt-4">
  <h3 className="text-2xl font-bold tracking-tight text-cyan-600 dark:text-cyan-400 md:text-3xl">
    {summary.totalTransactions.toLocaleString()}
  </h3>

  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
    Total transactions processed on the platform.
  </p>
</div>
  </div>

  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Successful Dispatches
      </span>
      <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
        <CheckCircle2 className="h-5 w-5" />
      </div>
    </div>
    <div className="mt-4">
      <h3 className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 md:text-3xl">
  {summary.successfulCount.toLocaleString()}
</h3>
      <p className="mt-1 text-xs text-slate-500">
  Successfully completed transactions.
</p>
    </div>
  </div>

  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Pending Escrow / Outbox
      </span>
      <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
        <Clock className="h-5 w-5" />
      </div>
    </div>
    <div className="mt-4">
     <h3 className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 md:text-3xl">
  {summary.pendingCount.toLocaleString()}
</h3>
      <p className="mt-1 text-xs text-slate-500">
  Transactions awaiting processing.
</p>
    </div>
  </div>

  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Failed / Flagged
      </span>
      <div className="rounded-xl bg-rose-50 p-2.5 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
        <XCircle className="h-5 w-5" />
      </div>
    </div>
    <div className="mt-4">
    <h3 className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 md:text-3xl">
  {summary.failedCount.toLocaleString()}
</h3>
     <p className="mt-1 text-xs text-rose-600">
  Transactions that could not be completed.
</p>
    </div>
  </div>
</div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Query by reference, user, phone..."
              value={searchQuery}
              onChange={(e) => {
                setPage(1);
                setSearchQuery(e.target.value);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white dark:border-white/10 dark:bg-black dark:focus:border-blue-500 dark:focus:bg-black"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium shadow-sm transition ${
                showFilters
                  ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950/40"
                  : "border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-black dark:hover:bg-black"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Advanced Filter</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${showFilters ? "rotate-180" : ""}`}
              />
            </button>

            {(searchQuery ||
              filterType ||
              filterStatus ||
              minAmount ||
              maxAmount) && (
              <button
                onClick={() => {
                  setPage(1);
                  setSearchQuery("");
                  setFilterType("");
                  setFilterStatus("");
                  setMinAmount("");
                  setMaxAmount("");
                }}
                className="text-xs font-semibold text-rose-500 hover:underline"
              >
                Clear Context Filters
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 dark:border-white/10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                Transaction Profile Group
              </label>
              <select
                value={filterType}
                onChange={(e) => {
                  setPage(1);
                  setFilterType(e.target.value);
                }}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs outline-none dark:border-white/10 dark:bg-black"
              >
                <option value="">All Standard Vectors</option>
                <option value="Deposit">Deposit</option>
                <option value="Withdrawal">Withdrawal</option>
                <option value="Transfer">Transfer</option>
                <option value="Airtime">Airtime</option>
                <option value="Data">Data</option>
                <option value="Subscription">Subscription</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                Status Vector State
              </label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setPage(1);
                  setFilterStatus(e.target.value);
                }}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs outline-none dark:border-white/10 dark:bg-black"
              >
                <option value="">All Status Matrices</option>
                <option value="SUCCESS">🟢 Success</option>
                <option value="PENDING">🟡 Pending</option>
                <option value="FAILED">🔴 Failed</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                Floor Amount (Min)
              </label>
              <input
                type="number"
                placeholder="₦ Min"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs outline-none dark:border-white/10 dark:bg-black"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                Ceiling Amount (Max)
              </label>
              <input
                type="number"
                placeholder="₦ Max"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs outline-none dark:border-white/10 dark:bg-black"
              />
            </div>
          </div>
        )}
      </div>








      <div className="flex flex-col gap-6 lg:flex-row items-start">
        <div className="w-full flex-1 transition-all duration-300">
<div className="hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-black md:block overflow-hidden">
            <table className="w-full border-collapse text-left text-sm">
<thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:bg-black dark:text-slate-400">
                <tr className="border-b border-black dark:border-white">
                  <th className="p-4">User Ecosystem</th>
                  <th className="p-4">Transaction Identification</th>
                  <th className="p-4">Vector / Method</th>
                  <th className="p-4 text-right">Accounting Structure</th>
                  <th className="p-4 text-center">System Status</th>
                  <th className="p-4 text-center">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-rose-500">
                      {error}
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((txn) => {
                    const status = toUiStatus(txn.status);
                    const uiType = toUiType(txn);

                    return (
                      <tr
                        key={
                          txn.id ||
                          txn._id ||
                          txn.reference ||
                          String(txn.createdAt)
                        }
                        onClick={() => setSelectedTxn(txn)}
                        className={`cursor-pointer transition duration-150 hover:bg-slate-50/80 dark:hover:bg-black/20 dark:border-white/20 dark:hover:bg-zinc-900 ${
                          selectedTxn?.reference === txn.reference &&
                          selectedTxn?.userId === txn.userId
                            ? "bg-blue-50/60 dark:bg-black"
                            : ""
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 border rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 dark:bg-black dark:border-white/30 dark:text-slate-300">
                              {(
                                txn.user?.name ||
                                txn.user?.firstname ||
                                "?"
                              ).charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {txn.user?.name ||
                                  `${txn.user?.firstname || ""} ${txn.user?.lastname || ""}`.trim() ||
                                  "Unknown User"}
                              </p>
                              <p className="text-xs text-slate-400">
                                {txn.user?.email || "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="font-mono text-xs text-slate-700 dark:text-slate-300 font-semibold">
                            {txn.id || txn._id || txn.reference || "—"}
                          </div>
                          <div className="text-xs text-slate-400">
                            {txn.reference || "—"}
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-900 dark:text-white">
                            {uiType === "Deposit" ||
                            uiType === "Airtime" ||
                            uiType === "Subscription" ? (
                              <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <ArrowUpRight className="h-3.5 w-3.5 text-amber-500" />
                            )}
                            {uiType}
                          </span>
                          <p className="text-xs text-slate-400">
                            {txn.category || "—"}
                          </p>
                        </td>

                        <td className="p-4 text-right">
                          <div className="font-bold text-slate-900 dark:text-white">
                            ₦{txn.amount.toLocaleString()}
                          </div>
                          <div className="text-xs text-slate-400">
                            {txn.description || "—"}
                          </div>
                        </td>

                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <StatusBadge status={status} />
                          </div>
                        </td>

                        <td
                          className="p-4 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedTxn(txn)}
                              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-black  text-slate-400 hover:text-slate-700"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleCopy(
                                  String(
                                    txn.reference || txn.id || txn._id || "",
                                  ),
                                  txn.reference || txn.id || txn._id || "copy",
                                )
                              }
                              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700"
                            >
                              {copiedId &&
                              copiedId ===
                                (txn.reference || txn.id || txn._id) ? (
                                <Check className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}

                {!loading && !error && filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No transactions match current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile view (simplified) */}
          <div className="space-y-3 md:hidden">
            {filteredTransactions.map((txn) => {
              const status = toUiStatus(txn.status);
              const uiType = toUiType(txn);

              return (
                <div
                  key={
                    txn.id || txn._id || txn.reference || String(txn.createdAt)
                  }
                  onClick={() => setSelectedTxn(txn)}
                  className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition active:scale-[0.99] dark:border-zinc-800 dark:bg-black ${
                    selectedTxn?.reference === txn.reference &&
                    selectedTxn?.userId === txn.userId
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 dark:bg-black dark:text-slate-400">
                        {(txn.user?.name || txn.user?.firstname || "?").charAt(
                          0,
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {txn.user?.name ||
                            `${txn.user?.firstname || ""} ${txn.user?.lastname || ""}`.trim() ||
                            "Unknown User"}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {txn.reference || txn.id || txn._id || "—"}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={status} />
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-2.5 dark:border-zinc-800">
                    <div>
                      <span className="text-xs text-slate-400 block">Type</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {uiType}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">
                        Amount
                      </span>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        ₦{txn.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between rounded-xl bg-white p-4 border border-slate-200 dark:border-zinc-800 dark:bg-black text-sm">
            <span className="text-xs font-medium text-slate-400">
              Showing {filteredTransactions.length} transactions
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className={`p-1.5 rounded-lg border border-slate-100 ${page <= 1 ? "opacity-40" : ""} dark:border-zinc-800`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                {page}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {selectedTxn && (
          <div className="w-full lg:w-[420px] shrink-0 sticky top-4 border border-slate-200 bg-white rounded-2xl shadow-xl dark:border-zinc-800 dark:bg-black overflow-hidden transition-all duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-white bg-slate-50/50 dark:bg-black">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Audit Specification Ledger
                </h3>
                <p className="text-[11px] font-mono text-slate-400">
                  {selectedTxn.reference ||
                    selectedTxn.id ||
                    selectedTxn._id ||
                    "—"}
                </p>
              </div>
              <button
                onClick={() => setSelectedTxn(null)}
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-900 text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="text-center py-4 bg-slate-50 rounded-xl dark:bg-black border border-slate-100 dark:border-zinc-800">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Captured Amount
                </span>
                <h2 className="text-3xl font-black mt-1 text-slate-900 dark:text-white">
                  ₦{selectedTxn.amount.toLocaleString()}
                </h2>
                <div className="mt-2.5 flex justify-center">
                  {uiStatus && <StatusBadge status={uiStatus} />}
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Accounting Audit Parameters
                </h4>

                <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-zinc-800">
                  <span className="text-slate-400">Payment Reference</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    {selectedTxn.reference || "—"}
                    <Copy
                      className="h-3 w-3 cursor-pointer text-slate-400 hover:text-slate-600"
                      onClick={() =>
                        handleCopy(selectedTxn.reference || "", "ref")
                      }
                    />
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-zinc-800">
                  <span className="text-slate-400">Transaction Category</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedTxn.category || "—"}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-zinc-800">
                  <span className="text-slate-400">Transaction Type</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedTxn.type}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-zinc-800">
                  <span className="text-slate-400">Description</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {selectedTxn.description || "—"}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-zinc-800">
                  <span className="text-slate-400">Plan</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {selectedTxn.plan || "—"}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Ecosystem Identity Profile
                </h4>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-black border border-slate-100 dark:border-zinc-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Legal Entity Name</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedTxn.user?.name ||
                        `${selectedTxn.user?.firstname || ""} ${selectedTxn.user?.lastname || ""}`.trim() ||
                        "Unknown User"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Communication Email</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {selectedTxn.user?.email || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Telephony Line</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {selectedTxn.user?.phone || "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Network Layer Audit Metadata
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-black p-2 rounded-lg dark:bg-slate-950/20 border border-slate-100 dark:border-zinc-800">
                    <span className="text-slate-400 block mb-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Network
                    </span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                      {selectedTxn.network || "N/A"}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg dark:bg-black border border-slate-100 dark:border-zinc-800">
                    <span className="text-slate-400 block mb-0.5 flex items-center gap-1">
                      <Monitor className="h-3 w-3" /> Phone
                    </span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                      {selectedTxn.phone || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <StickyNote className="h-3.5 w-3.5" />
                  <span>Audit Timestamps</span>
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Created</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {formatDate(selectedTxn.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Updated</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {formatDate(selectedTxn.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/20 grid grid-cols-1 gap-2">
                <button
                  className="w-full rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-500 cursor-not-allowed"
                  onClick={() =>
                    alert(
                      "Sensitive actions are not implemented for this DB schema.",
                    )
                  }
                >
                  Sensitive actions disabled
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
