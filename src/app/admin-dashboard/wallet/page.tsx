"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet as WalletIcon, 
  RefreshCw, 
  Download, 
  Search, 
  Filter, 
  PlusCircle, 
  MinusCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText 
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

type Wallet = {
  balance: number;
  totalInflow: number;
  totalOutflow: number;
  pendingCredits: number;
  pendingDebits: number;
  currency: string;
};

type Transaction = {
  _id: string;
  type: "credit" | "debit";
  amount: number;
  reference: string;
  status: "pending" | "success" | "failed";
  createdAt: string;
  description?: string;
  requestedBy?: string;
  approvedBy?: string;
};

type ChartData = {
  date: string;
  Inflow: number;
  Outflow: number;
};

export default function AdminWalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals & Action States
  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"credit" | "debit">("credit");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchData = async () => {
    setRefreshing(true);
    try {
    const [walletRes, transactionRes] = await Promise.all([

fetch("/api/admin/wallet", { cache: "no-store" }),

fetch("/api/admin/wallet/transactions", { cache: "no-store" }),

]);

      if (!walletRes.ok || !transactionRes.ok) {
        throw new Error("Failed to fetch secure dashboard metrics.");
      }

      const walletData = await walletRes.json();
      const transactionData = await transactionRes.json();

      setWallet(walletData);
      
      const sortedTx = (transactionData.transactions || []).sort(
        (a: Transaction, b: Transaction) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setTransactions(sortedTx);

      // Parse aggregations for Premium Charting Timeline
      if (transactionData.chartData) {
        setChartData(transactionData.chartData);
      }
    } catch (error) {
      console.error(error);
      alert("System Alert: Failed to synchronized core balance records.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequestAdjustment = async () => {
    if (!amount || Number(amount) <= 0) return alert("Enter a valid numerical amount.");
    if (!note.trim()) return alert("Audit Protocol: Absolute compliance requires an adjustment reason note.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/wallet/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: actionType, amount: Number(amount), note }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Adjustment submission failed.");

      alert(data.message || "Adjustment request queued into workflow pipeline.");
      setModalOpen(false);
      setAmount("");
      setNote("");
      await fetchData();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleWorkflowAction = async (id: string, action: "approve" | "reject") => {
    if (!confirm(`Are you sure you want to ${action} this ledger entry request?`)) return;

    try {
      const res = await fetch("/api/admin/wallet/approve", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Workflow validation update failed.");
      alert(`Ledger state updated to: ${action}d`);
      await fetchData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  // Live client-side structural filtering engine
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch = (tx.reference || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (tx.description && (tx.description || "").toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === "all" ? true : tx.status === statusFilter;
      const matchesType = typeFilter === "all" ? true : tx.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [transactions, searchTerm, statusFilter, typeFilter]);

  // Client side structural layout exporter
  const exportToCSV = () => {
    if (filteredTransactions.length === 0) return alert("No ledger dataset matching configuration bounds.");
    const headers = ["Reference,Type,Amount,Status,Reason,Date\n"];
const rows = filteredTransactions.map((tx) => {
  const description = (tx.description || "").replace(/"/g, '""');

  return `"${tx.reference}","${tx.type}",${tx.amount},"${tx.status}","${description}","${tx.createdAt}"`;
});
  
    const blob = new Blob([headers.concat(rows.join("\n")).join("")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Ledger_Audit_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-6 p-8 bg-black min-h-screen text-slate-100 animate-pulse">

        <div className="h-12 w-1/4 bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-slate-900 rounded-2xl border border-slate-800" />)}
        </div>
        <div className="h-64 bg-slate-900 rounded-2xl border border-slate-800" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-black text-slate-100 min-h-screen selection:bg-teal-500 selection:text-black">

      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
            System Liquidity Ledger
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">
            Transactional Operations & System Wallet Audits
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <button 
            onClick={fetchData} 
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white transition group"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin text-teal-400" : "group-hover:rotate-45"}`} />
          </button>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-900 text-sm font-semibold transition"
          >
            <Download className="w-4 h-4" /> Export Ledger
          </button>
          <button
            onClick={() => { setActionType("credit"); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-950/40 transition"
          >
            <PlusCircle className="w-4 h-4" /> Credit Request
          </button>
          <button
            onClick={() => { setActionType("debit"); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-950/40 transition"
          >
            <MinusCircle className="w-4 h-4" /> Debit Request
          </button>
        </div>
      </div>

      {/* METRIC CARD STATS */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="relative p-6 rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950 overflow-hidden shadow-xl">
          <div className="absolute top-4 right-4 p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <WalletIcon className="w-6 h-6" />
          </div>
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Current Vault Balance</p>
          <h2 className="text-3xl font-black text-white mt-2 tracking-tight">
            ₦{(wallet?.balance ?? 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
          </h2>
        </div>

        <div className="relative p-6 rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950 overflow-hidden shadow-xl">
          <div className="absolute top-4 right-4 p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Aggregated Total Inflow</p>
          <h2 className="text-3xl font-black text-emerald-400 mt-2 tracking-tight">
            ₦{(wallet?.totalInflow ?? 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
          </h2>
        </div>

        <div className="relative p-6 rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950 overflow-hidden shadow-xl">
          <div className="absolute top-4 right-4 p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <TrendingDown className="w-6 h-6" />
          </div>
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Aggregated Total Outflow</p>
          <h2 className="text-3xl font-black text-rose-400 mt-2 tracking-tight">
            ₦{(wallet?.totalOutflow ?? 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
          </h2>
        </div>
      </div>

      {/* CHARTS GRAPH */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 shadow-xl">
        <h3 className="text-base font-bold text-slate-300 mb-6 flex items-center gap-2">
          <FileText className="w-4 h-4 text-teal-400" /> Operational Fluidity Timeline
        </h3>
        <div className="w-full h-72">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", stroke: "#1e293b", color: "#fff" }}
                />
                <Area type="monotone" dataKey="Inflow" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorInflow)" />
                <Area type="monotone" dataKey="Outflow" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorOutflow)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm font-medium border border-dashed border-slate-800 rounded-xl">
              Insufficient timeline intervals to extrapolate fluid analytics.
            </div>
          )}
        </div>
      </div>

      {/* SEARCH AND FILTERS ENGINE */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search matching cross references or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 text-slate-200 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase whitespace-nowrap">
            <Filter className="w-3.5 h-3.5" /> Filter Matrix:
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 text-slate-300 border border-slate-800 text-sm px-3 py-1.5 rounded-xl focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="credit">Credit Only</option>
            <option value="debit">Debit Only</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 text-slate-300 border border-slate-800 text-sm px-3 py-1.5 rounded-xl focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="pending">Pending Dual-Auth</option>
            <option value="failed">Failed Entries</option>
            <option value="processing">Processing</option>
          </select>
        </div>
      </div>

      {/* CORE SECURE TRANSACTIONS TABLE */}
      <div className="bg-slate-900/20 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/30">
          <h2 className="font-bold text-slate-200 tracking-tight flex items-center gap-2">
            Audit Ledger Stream 
            <span className="text-xs px-2.5 py-0.5 bg-slate-800 text-slate-400 rounded-full font-semibold">
              {filteredTransactions.length} items
            </span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-300">
            <thead className="bg-slate-900/60 uppercase text-xs font-bold tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Reference ID</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Financial Amount</th>
                <th className="px-6 py-4">Reason / Notes</th>
                <th className="px-6 py-4">Audit Workflow Validation</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTransactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-slate-900/40 transition">
                  <td className="px-6 py-4 font-mono text-xs text-slate-400 tracking-tight">
                    {tx.reference}
                    <div className="text-[10px] text-slate-500 mt-1">{new Date(tx.createdAt).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${
                      tx.type === "credit" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    }`}>
                      {tx.type === "credit" ? <PlusCircle className="w-3 h-3" /> : <MinusCircle className="w-3 h-3" />}
                      {tx.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-100">
                    ₦{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate text-xs text-slate-400" title={tx.description}>
                    {tx.description || <span className="italic text-slate-600">No operational note recorded</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${
                      tx.status === "success" ? "bg-emerald-500/10 text-emerald-400" :
                      tx.status === "pending" ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"
                    }`}>
                      {tx.status === "success" ? <CheckCircle className="w-3 h-3" /> :
                       tx.status === "pending" ? <Clock className="w-3 h-3 animate-pulse" /> : <XCircle className="w-3 h-3" />}
                      {tx.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {tx.status === "pending" ? (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleWorkflowAction(tx._id, "approve")}
                          className="px-2.5 py-1 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-bold transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleWorkflowAction(tx._id, "reject")}
                          className="px-2.5 py-1 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg text-xs font-bold transition"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-600 italic">Validated</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No records localized inside selected operational scope.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADJUSTMENT MODAL WINDOW */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-6 rounded-2xl space-y-5 shadow-2xl">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                {actionType === "credit" ? "Initialize Credit Workflow" : "Initialize Debit Workflow"}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Sensitive modification actions require dual authentication and authorizer clearance logs.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Adjustment Amount (NGN)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 text-white font-mono border border-slate-800 focus:outline-none focus:border-teal-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Audit Compliance Reason / Note</label>
                <textarea
                  placeholder="Provide precise reference justification (e.g. System adjustment for failed terminal API rebate)..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-teal-500 transition resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition"
              >
                Abort
              </button>
              <button
                onClick={handleRequestAdjustment}
                disabled={submitting}
                className={`px-5 py-2.5 rounded-xl text-white font-bold text-sm shadow-md transition ${
                  actionType === "credit" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500"
                } disabled:opacity-50`}
              >
                {submitting ? "Deploying Request..." : "Submit to Workflow"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}