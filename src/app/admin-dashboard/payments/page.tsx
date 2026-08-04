"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertCircle,
  Search,
  Filter,
  ChevronDown,
  Eye,
  Check,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type PaymentStats = {
  totalPayments: number;
  successfulPayments: number;
  pendingPayments: number;
  failedPayments: number;
  totalVolume: number;
  todayVolume: number;
  weekVolume: number;
  monthVolume: number;
  pendingDeposits: any[];
};

type PaymentItem = {
  _id: string;
  reference: string;
  userId: string;
  type: string;
  category: string;
  amount: number;
  status: "pending" | "success" | "failed";
  description?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  user?: {
    _id: string;
    email: string;
    name: string;
    firstname?: string;
    lastname?: string;
    phone?: string;
    walletBalance: number;
  };
};

export default function AdminPaymentsPage() {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingPaymentId, setRejectingPaymentId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);

  const router = useRouter();

  useEffect(() => {
    fetchStats();
    fetchPayments();
  }, [currentPage, statusFilter, typeFilter]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/payments/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      });

      if (statusFilter !== "all") params.append("status", statusFilter);
      if (typeFilter !== "all") params.append("type", typeFilter);

      const res = await fetch(`/api/admin/payments?${params}`);
      const data = await res.json();

      if (data.success) {
        setPayments(data.payments);
        setTotalPayments(data.totalTransactions);
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId: string) => {
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: "Approved by admin" }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Payment approved successfully");
        fetchStats();
        fetchPayments();
        if (selectedPayment?._id === paymentId) {
          setSelectedPayment(data.payment);
        }
      } else {
        toast.error(data.message || "Failed to approve payment");
      }
    } catch (error) {
      console.error("Approval error:", error);
      toast.error("Failed to approve payment");
    }
  };

  const handleReject = async () => {
    if (!rejectingPaymentId || !rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      const res = await fetch(`/api/admin/payments/${rejectingPaymentId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Payment rejected successfully");
        setRejectDialogOpen(false);
        setRejectReason("");
        setRejectingPaymentId(null);
        fetchStats();
        fetchPayments();
        setSelectedPayment(null);
      } else {
        toast.error(data.message || "Failed to reject payment");
      }
    } catch (error) {
      console.error("Rejection error:", error);
      toast.error("Failed to reject payment");
    }
  };

  const openRejectDialog = (payment: PaymentItem) => {
    setRejectingPaymentId(payment._id);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const filteredPayments = payments.filter((payment) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      payment.reference?.toLowerCase().includes(q) ||
      payment.description?.toLowerCase().includes(q) ||
      payment.user?.email?.toLowerCase().includes(q) ||
      payment.user?.name?.toLowerCase().includes(q) ||
      payment.user?.firstname?.toLowerCase().includes(q) ||
      payment.user?.lastname?.toLowerCase().includes(q) ||
      payment.user?.phone?.toLowerCase().includes(q)
    );
  });

  if (loading && !stats) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            Loading payments...
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
          <h1 className="text-2xl font-bold">Payments Management</h1>
          <p className="text-sm text-muted-foreground">
            Monitor and manage all wallet funding payments
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Payments"
            value={stats.totalPayments}
            icon={<CreditCard className="h-5 w-5" />}
            valueClassName="text-blue-600 dark:text-blue-400"
          />
          <StatCard
            title="Successful"
            value={stats.successfulPayments}
            icon={<CheckCircle className="h-5 w-5" />}
            valueClassName="text-green-600 dark:text-green-400"
          />
          <StatCard
            title="Pending"
            value={stats.pendingPayments}
            icon={<Clock className="h-5 w-5" />}
            valueClassName="text-yellow-600 dark:text-yellow-400"
          />
          <StatCard
            title="Failed"
            value={stats.failedPayments}
            icon={<XCircle className="h-5 w-5" />}
            valueClassName="text-red-600 dark:text-red-400"
          />
          <StatCard
            title="Total Volume"
            value={`₦${Number(stats.totalVolume).toLocaleString()}`}
            icon={<DollarSign className="h-5 w-5" />}
            valueClassName="text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            title="Today's Volume"
            value={`₦${Number(stats.todayVolume).toLocaleString()}`}
            icon={<TrendingUp className="h-5 w-5" />}
            valueClassName="text-cyan-600 dark:text-cyan-400"
          />
          <StatCard
            title="This Week"
            value={`₦${Number(stats.weekVolume).toLocaleString()}`}
            icon={<TrendingUp className="h-5 w-5" />}
            valueClassName="text-purple-600 dark:text-purple-400"
          />
          <StatCard
            title="This Month"
            value={`₦${Number(stats.monthVolume).toLocaleString()}`}
            icon={<TrendingUp className="h-5 w-5" />}
            valueClassName="text-pink-600 dark:text-pink-400"
          />
        </div>
      )}

      {/* Pending Deposits Alert */}
      {stats?.pendingDeposits && stats.pendingDeposits.length > 0 && (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                {stats.pendingDeposits.length} Pending Deposit{stats.pendingDeposits.length > 1 ? "s" : ""} Requiring Attention
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Review and approve pending wallet funding requests
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference, email, name..."
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="credit">Credit</SelectItem>
            <SelectItem value="debit">Debit</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={() => { setSearch(""); setStatusFilter("all"); setTypeFilter("all"); }}>
          Clear Filters
        </Button>
      </div>

      {/* Payments Table */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <table className="w-full">
          <thead className="border-b border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
            <tr className="text-left">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                Reference
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                User
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                Amount
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                Type
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                Date
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                  Loading payments...
                </td>
              </tr>
            ) : filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                  No payments found
                </td>
              </tr>
            ) : (
              filteredPayments.map((payment) => (
                <tr
                  key={payment._id}
                  className="border-b border-zinc-200 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  <td className="px-6 py-4 font-mono text-sm font-medium">
                    {payment.reference}
                  </td>

                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">
                        {payment.user?.name || `${payment.user?.firstname || ""} ${payment.user?.lastname || ""}`.trim() || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.user?.email}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4 font-semibold">
                    ₦{Number(payment.amount).toLocaleString()}
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                      {payment.type}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {payment.status === "success" && (
                      <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-600">
                        Success
                      </span>
                    )}
                    {payment.status === "pending" && (
                      <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-600">
                        Pending
                      </span>
                    )}
                    {payment.status === "failed" && (
                      <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-600">
                        Failed
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : "-"}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedPayment(payment)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {payment.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(payment._id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openRejectDialog(payment)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredPayments.length} of {totalPayments} payments
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm">Page {currentPage}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={filteredPayments.length < 20}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Payment Information */}
              <div>
                <h3 className="mb-3 font-semibold">Payment Information</h3>
                <div className="grid gap-2 text-sm">
                  <DetailRow label="Reference" value={selectedPayment.reference} />
                  <DetailRow label="Amount" value={`₦${Number(selectedPayment.amount).toLocaleString()}`} />
                  <DetailRow label="Type" value={selectedPayment.type} />
                  <DetailRow label="Status" value={selectedPayment.status} />
                  <DetailRow label="Description" value={selectedPayment.description || "-"} />
                  <DetailRow
                    label="Created"
                    value={selectedPayment.createdAt ? new Date(selectedPayment.createdAt).toLocaleString() : "-"}
                  />
                  {selectedPayment.approvedAt && (
                    <DetailRow
                      label="Approved"
                      value={new Date(selectedPayment.approvedAt).toLocaleString()}
                    />
                  )}
                  {selectedPayment.rejectionReason && (
                    <DetailRow label="Rejection Reason" value={selectedPayment.rejectionReason} />
                  )}
                </div>
              </div>

              {/* User Information */}
              {selectedPayment.user && (
                <div>
                  <h3 className="mb-3 font-semibold">User Information</h3>
                  <div className="grid gap-2 text-sm">
                    <DetailRow label="Name" value={selectedPayment.user.name || "-"} />
                    <DetailRow label="Email" value={selectedPayment.user.email} />
                    <DetailRow label="Phone" value={selectedPayment.user.phone || "-"} />
                    <DetailRow
                      label="Wallet Balance"
                      value={`₦${Number(selectedPayment.user.walletBalance).toLocaleString()}`}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              {selectedPayment.status === "pending" && (
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(selectedPayment._id)}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve Payment
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => openRejectDialog(selectedPayment)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject Payment
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejecting this payment. This will be communicated to the user.
            </p>

            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
            />

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                Reject Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  valueClassName = "",
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-yellow-500/10 p-2 text-yellow-600">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">{title}</p>

      <h2 className={`mt-1 text-lg font-black tracking-tight ${valueClassName}`}>
        {value}
      </h2>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border/40 pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
