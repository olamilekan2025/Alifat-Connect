"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  ArrowLeftRight,
  Gift,
  Wallet,
  BadgeCheck,
  MessageSquare,
  Download,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type OverviewStats = {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  successRate: string;
  failureRate: string;
  revenue: number;
  transactionVolume: number;
  walletFunding: number;
  withdrawals: number;
  referralRewards: number;
};

type RevenueData = {
  summary: {
    totalRevenue: number;
    grossVolume: number;
    fees: number;
  };
  serviceRevenue: Array<{
    _id: string;
    revenue: number;
    transactions: number;
    avgTransaction: number;
  }>;
  revenueOverTime: Array<any>;
};

type TransactionData = {
  summary: {
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    pendingTransactions: number;
    processingTransactions: number;
    totalVolume: number;
    avgTransactionValue: number;
    successRate: string;
    failureRate: string;
    pendingRate: string;
  };
  statusBreakdown: Array<any>;
  volumeOverTime: Array<any>;
};

type ServiceData = {
  servicePerformance: Array<any>;
  networkPerformance: Array<any>;
  popularDataPlans: Array<any>;
  providerPerformance: Array<any>;
};

type UserData = {
  summary: {
    totalUsers: number;
    newUsers: number;
    verifiedUsers: number;
    suspendedUsers: number;
    activeUsers: number;
    usersWithTransactions: number;
    verificationRate: string;
    suspensionRate: string;
  };
  userGrowth: Array<any>;
  registrationSources: Array<any>;
  membershipDistribution: Array<any>;
};

type ReferralData = {
  summary: {
    totalReferrals: number;
    successfulReferrals: number;
    pendingReferrals: number;
    failedReferrals: number;
    cancelledReferrals: number;
    qualifiedReferrals: number;
    totalRewards: number;
    averageReward: number;
    conversionRate: string;
  };
  topReferrers: Array<any>;
  referralTrends: Array<any>;
};

type WalletData = {
  funding: {
    totalFunding: number;
    successfulFunding: number;
    pendingFunding: number;
    failedFunding: number;
    totalFundingAmount: number;
    avgFundingAmount: number;
    successRate: string;
  };
  withdrawals: {
    totalWithdrawals: number;
    successfulWithdrawals: number;
    pendingWithdrawals: number;
    failedWithdrawals: number;
    totalWithdrawalAmount: number;
    avgWithdrawalAmount: number;
    successRate: string;
  };
  fundingByMethod: Array<any>;
  walletStats: {
    totalWalletBalance: number;
    totalInflow: number;
    totalOutflow: number;
  };
  fundingTrends: Array<any>;
};

type KYCData = {
  summary: {
    totalSubmissions: number;
    pendingSubmissions: number;
    underReviewSubmissions: number;
    approvedSubmissions: number;
    rejectedSubmissions: number;
    requiresResubmission: number;
    notStarted: number;
    approvalRate: string;
    rejectionRate: string;
    avgReviewTime: number;
  };
  statusBreakdown: Array<any>;
  kycTrends: Array<any>;
  idTypeDistribution: Array<any>;
};

type SupportData = {
  summary: {
    totalTickets: number;
    openTickets: number;
    pendingTickets: number;
    inProgressTickets: number;
    resolvedTickets: number;
    closedTickets: number;
    urgentTickets: number;
    resolutionRate: string;
    avgResponseTime: number;
    avgResolutionTime: number;
  };
  ticketsByCategory: Array<any>;
  ticketsByPriority: Array<any>;
  adminPerformance: Array<any>;
  ticketTrends: Array<any>;
};

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#06b6d4'];

function StatCard({ title, value, icon, valueClassName }: { title: string; value: string | number; icon: React.ReactNode; valueClassName?: string }) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={cn("text-2xl font-bold mt-1", valueClassName)}>
            {typeof value === "number" && value >= 1000 
              ? `₦${value.toLocaleString()}` 
              : value}
          </p>
        </div>
        <div className="text-muted-foreground">{icon}</div>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-[40vh] items-center justify-center rounded-2xl border border-dashed bg-muted/30">
      <div className="text-center">
        <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

function AdminReportsContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [period, setPeriod] = useState(searchParams.get("period") || "30days");
  const [granularity, setGranularity] = useState("daily");
  
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [transactions, setTransactions] = useState<TransactionData | null>(null);
  const [services, setServices] = useState<ServiceData | null>(null);
  const [users, setUsers] = useState<UserData | null>(null);
  const [referrals, setReferrals] = useState<ReferralData | null>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [kyc, setKyc] = useState<KYCData | null>(null);
  const [support, setSupport] = useState<SupportData | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/reports?period=${period}`);
      const data = await res.json();
      if (data.success) {
        setOverview(data.overview);
      }
    } catch (error) {
      console.error("Failed to fetch overview:", error);
    }
  }, [period]);

  const fetchRevenue = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/reports/revenue?period=${period}&granularity=${granularity}`);
      const data = await res.json();
      if (data.success) {
        setRevenue(data);
      }
    } catch (error) {
      console.error("Failed to fetch revenue:", error);
    }
  }, [period, granularity]);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/reports/transactions?period=${period}&granularity=${granularity}`);
      const data = await res.json();
      if (data.success) {
        setTransactions(data);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  }, [period, granularity]);

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/reports/services?period=${period}`);
      const data = await res.json();
      if (data.success) {
        setServices(data);
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
    }
  }, [period]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/reports/users?period=${period}&granularity=${granularity}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  }, [period, granularity]);

  const fetchReferrals = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/reports/referrals?period=${period}`);
      const data = await res.json();
      if (data.success) {
        setReferrals(data);
      }
    } catch (error) {
      console.error("Failed to fetch referrals:", error);
    }
  }, [period]);

  const fetchWallet = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/reports/wallet?period=${period}`);
      const data = await res.json();
      if (data.success) {
        setWallet(data);
      }
    } catch (error) {
      console.error("Failed to fetch wallet:", error);
    }
  }, [period]);

  const fetchKYC = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/reports/kyc?period=${period}`);
      const data = await res.json();
      if (data.success) {
        setKyc(data);
      }
    } catch (error) {
      console.error("Failed to fetch KYC:", error);
    }
  }, [period]);

  const fetchSupport = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/reports/support?period=${period}`);
      const data = await res.json();
      if (data.success) {
        setSupport(data);
      }
    } catch (error) {
      console.error("Failed to fetch support:", error);
    }
  }, [period]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchOverview(),
      fetchRevenue(),
      fetchTransactions(),
      fetchServices(),
      fetchUsers(),
      fetchReferrals(),
      fetchWallet(),
      fetchKYC(),
      fetchSupport(),
    ]);
    setLoading(false);
  }, [fetchOverview, fetchRevenue, fetchTransactions, fetchServices, fetchUsers, fetchReferrals, fetchWallet, fetchKYC, fetchSupport]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleRefresh = () => {
    fetchAllData();
    toast.success("Reports refreshed successfully");
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`/api/admin/reports/export?type=${activeTab}&period=${period}&format=csv`);
      
      if (!res.ok) {
        throw new Error("Failed to export report");
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTab}-report-${period}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Report exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export report");
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "revenue", label: "Revenue", icon: DollarSign },
    { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
    { id: "services", label: "Services", icon: TrendingUp },
    { id: "users", label: "Users", icon: Users },
    { id: "referrals", label: "Referrals", icon: Gift },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "kyc", label: "KYC", icon: BadgeCheck },
    { id: "support", label: "Support", icon: MessageSquare },
  ];

  if (loading && !overview) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex h-[40vh] items-center justify-center rounded-2xl border border-dashed bg-muted/30">
      <div className="text-center">
        <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Comprehensive VTU platform analytics and insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">7 Days</SelectItem>
              <SelectItem value="30days">30 Days</SelectItem>
              <SelectItem value="90days">90 Days</SelectItem>
              <SelectItem value="thismonth">This Month</SelectItem>
              <SelectItem value="lastmonth">Last Month</SelectItem>
              <SelectItem value="thisyear">This Year</SelectItem>
              <SelectItem value="alltime">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Select value={granularity} onValueChange={setGranularity}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === tab.id
                  ? "border-yellow-500 text-yellow-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && overview ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value={overview.revenue}
              icon={<DollarSign className="h-5 w-5" />}
              valueClassName="text-green-600"
            />
            <StatCard
              title="Transaction Volume"
              value={overview.transactionVolume}
              icon={<ArrowLeftRight className="h-5 w-5" />}
              valueClassName="text-blue-600"
            />
            <StatCard
              title="Successful Transactions"
              value={overview.successfulTransactions}
              icon={<TrendingUp className="h-5 w-5" />}
              valueClassName="text-emerald-600"
            />
            <StatCard
              title="Failed Transactions"
              value={overview.failedTransactions}
              icon={<TrendingUp className="h-5 w-5 rotate-180" />}
              valueClassName="text-red-600"
            />
            <StatCard
              title="Total Users"
              value={overview.totalUsers}
              icon={<Users className="h-5 w-5" />}
              valueClassName="text-purple-600"
            />
            <StatCard
              title="Active Users"
              value={overview.activeUsers}
              icon={<Users className="h-5 w-5" />}
              valueClassName="text-cyan-600"
            />
            <StatCard
              title="Wallet Funding"
              value={overview.walletFunding}
              icon={<Wallet className="h-5 w-5" />}
              valueClassName="text-orange-600"
            />
            <StatCard
              title="Referral Rewards"
              value={overview.referralRewards}
              icon={<Gift className="h-5 w-5" />}
              valueClassName="text-pink-600"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Transaction Success Rate</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Success Rate</span>
                  <span className="text-lg font-bold text-green-600">{overview.successRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${overview.successRate}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Failure Rate</span>
                  <span className="text-lg font-bold text-red-600">{overview.failureRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: `${overview.failureRate}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Transaction Volume</span>
                  <span className="font-semibold">₦{overview.transactionVolume.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Wallet Funding</span>
                  <span className="font-semibold">₦{overview.walletFunding.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Withdrawals</span>
                  <span className="font-semibold">₦{overview.withdrawals.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Platform Revenue</span>
                  <span className="font-semibold text-green-600">₦{overview.revenue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "overview" && loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">Loading overview...</p>
          </div>
        </div>
      ) : activeTab === "overview" ? (
        <EmptyState message="No overview data available for the selected period" />
      ) : null}

      {/* Revenue Tab */}
      {activeTab === "revenue" && revenue ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Total Revenue"
              value={revenue.summary.totalRevenue}
              icon={<DollarSign className="h-5 w-5" />}
              valueClassName="text-green-600"
            />
            <StatCard
              title="Gross Volume"
              value={revenue.summary.grossVolume}
              icon={<ArrowLeftRight className="h-5 w-5" />}
              valueClassName="text-blue-600"
            />
            <StatCard
              title="Fees/Discounts"
              value={revenue.summary.fees}
              icon={<TrendingUp className="h-5 w-5" />}
              valueClassName="text-orange-600"
            />
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Revenue by Service</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenue.serviceRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip formatter={(value) => typeof value === 'number' ? `₦${value.toLocaleString()}` : String(value || '')} />
                  <Bar dataKey="revenue" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : activeTab === "revenue" && loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">Loading revenue data...</p>
          </div>
        </div>
      ) : activeTab === "revenue" ? (
        <EmptyState message="No revenue data available for the selected period" />
      ) : null}

      {/* Transactions Tab */}
      {activeTab === "transactions" && transactions ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              title="Total Transactions"
              value={transactions.summary.totalTransactions}
              icon={<ArrowLeftRight className="h-5 w-5" />}
              valueClassName="text-blue-600"
            />
            <StatCard
              title="Successful"
              value={transactions.summary.successfulTransactions}
              icon={<TrendingUp className="h-5 w-5" />}
              valueClassName="text-green-600"
            />
            <StatCard
              title="Failed"
              value={transactions.summary.failedTransactions}
              icon={<TrendingUp className="h-5 w-5 rotate-180" />}
              valueClassName="text-red-600"
            />
            <StatCard
              title="Pending"
              value={transactions.summary.pendingTransactions}
              icon={<Calendar className="h-5 w-5" />}
              valueClassName="text-yellow-600"
            />
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Transaction Volume Over Time</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={transactions.volumeOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip formatter={(value) => typeof value === 'number' ? `₦${value.toLocaleString()}` : String(value || '')} />
                  <Line type="monotone" dataKey="totalVolume" stroke="#3b82f6" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : activeTab === "transactions" && loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">Loading transaction data...</p>
          </div>
        </div>
      ) : activeTab === "transactions" ? (
        <EmptyState message="No transaction data available for the selected period" />
      ) : null}

      {/* Services Tab */}
      {activeTab === "services" && services ? (
        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Service Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="px-4 py-3 text-sm font-semibold">Service</th>
                    <th className="px-4 py-3 text-sm font-semibold">Transactions</th>
                    <th className="px-4 py-3 text-sm font-semibold">Volume</th>
                    <th className="px-4 py-3 text-sm font-semibold">Revenue</th>
                    <th className="px-4 py-3 text-sm font-semibold">Success Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {services.servicePerformance.map((service) => (
                    <tr key={service._id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3 capitalize">{service._id}</td>
                      <td className="px-4 py-3">{service.totalTransactions}</td>
                      <td className="px-4 py-3">₦{service.totalVolume.toLocaleString()}</td>
                      <td className="px-4 py-3">₦{service.revenue.toLocaleString()}</td>
                      <td className="px-4 py-3">{service.successRate.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === "services" && loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">Loading service data...</p>
          </div>
        </div>
      ) : activeTab === "services" ? (
        <EmptyState message="No service data available for the selected period" />
      ) : null}

      {/* Users Tab */}
      {activeTab === "users" && users ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              title="Total Users"
              value={users.summary.totalUsers}
              icon={<Users className="h-5 w-5" />}
              valueClassName="text-blue-600"
            />
            <StatCard
              title="New Users"
              value={users.summary.newUsers}
              icon={<Users className="h-5 w-5" />}
              valueClassName="text-green-600"
            />
            <StatCard
              title="Verified Users"
              value={users.summary.verifiedUsers}
              icon={<BadgeCheck className="h-5 w-5" />}
              valueClassName="text-emerald-600"
            />
            <StatCard
              title="Active Users"
              value={users.summary.activeUsers}
              icon={<Users className="h-5 w-5" />}
              valueClassName="text-purple-600"
            />
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">User Growth Over Time</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={users.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="newUsers" stroke="#3b82f6" name="New Users" />
                  <Line type="monotone" dataKey="verifiedUsers" stroke="#22c55e" name="Verified Users" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : activeTab === "users" && loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">Loading user data...</p>
          </div>
        </div>
      ) : activeTab === "users" ? (
        <EmptyState message="No user data available for the selected period" />
      ) : null}

      {/* Referrals Tab */}
      {activeTab === "referrals" && referrals ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              title="Total Referrals"
              value={referrals.summary.totalReferrals}
              icon={<Gift className="h-5 w-5" />}
              valueClassName="text-blue-600"
            />
            <StatCard
              title="Successful"
              value={referrals.summary.successfulReferrals}
              icon={<TrendingUp className="h-5 w-5" />}
              valueClassName="text-green-600"
            />
            <StatCard
              title="Pending"
              value={referrals.summary.pendingReferrals}
              icon={<Calendar className="h-5 w-5" />}
              valueClassName="text-yellow-600"
            />
            <StatCard
              title="Total Rewards"
              value={referrals.summary.totalRewards}
              icon={<DollarSign className="h-5 w-5" />}
              valueClassName="text-emerald-600"
            />
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Top Referrers</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="px-4 py-3 text-sm font-semibold">Rank</th>
                    <th className="px-4 py-3 text-sm font-semibold">User</th>
                    <th className="px-4 py-3 text-sm font-semibold">Referrals</th>
                    <th className="px-4 py-3 text-sm font-semibold">Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.topReferrers.slice(0, 10).map((referrer) => (
                    <tr key={referrer._id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/10 font-bold text-yellow-600">
                          {referrer.rank}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{referrer.name || referrer.email}</p>
                        <p className="text-xs text-muted-foreground">{referrer.email}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold">{referrer.referralsCount}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-600">
                        ₦{referrer.referralEarnings.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === "referrals" && loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">Loading referral data...</p>
          </div>
        </div>
      ) : activeTab === "referrals" ? (
        <EmptyState message="No referral data available for the selected period" />
      ) : null}

      {/* Wallet Tab */}
      {activeTab === "wallet" && wallet ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Wallet Funding</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Funding</span>
                  <span className="font-semibold">₦{wallet.funding.totalFundingAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Successful</span>
                  <span className="font-semibold text-green-600">{wallet.funding.successfulFunding}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <span className="font-semibold text-yellow-600">{wallet.funding.pendingFunding}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Failed</span>
                  <span className="font-semibold text-red-600">{wallet.funding.failedFunding}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Withdrawals</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Withdrawals</span>
                  <span className="font-semibold">₦{wallet.withdrawals.totalWithdrawalAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Successful</span>
                  <span className="font-semibold text-green-600">{wallet.withdrawals.successfulWithdrawals}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <span className="font-semibold text-yellow-600">{wallet.withdrawals.pendingWithdrawals}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Failed</span>
                  <span className="font-semibold text-red-600">{wallet.withdrawals.failedWithdrawals}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Overall Wallet Statistics</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Wallet Balance</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₦{wallet.walletStats.totalWalletBalance.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Inflow</p>
                <p className="text-2xl font-bold text-green-600">
                  ₦{wallet.walletStats.totalInflow.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Outflow</p>
                <p className="text-2xl font-bold text-red-600">
                  ₦{wallet.walletStats.totalOutflow.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "wallet" && loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">Loading wallet data...</p>
          </div>
        </div>
      ) : activeTab === "wallet" ? (
        <EmptyState message="No wallet data available for the selected period" />
      ) : null}

      {/* KYC Tab */}
      {activeTab === "kyc" && kyc ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              title="Total Submissions"
              value={kyc.summary.totalSubmissions}
              icon={<BadgeCheck className="h-5 w-5" />}
              valueClassName="text-blue-600"
            />
            <StatCard
              title="Approved"
              value={kyc.summary.approvedSubmissions}
              icon={<TrendingUp className="h-5 w-5" />}
              valueClassName="text-green-600"
            />
            <StatCard
              title="Pending"
              value={kyc.summary.pendingSubmissions + kyc.summary.underReviewSubmissions}
              icon={<Calendar className="h-5 w-5" />}
              valueClassName="text-yellow-600"
            />
            <StatCard
              title="Rejected"
              value={kyc.summary.rejectedSubmissions}
              icon={<TrendingUp className="h-5 w-5 rotate-180" />}
              valueClassName="text-red-600"
            />
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">KYC Status Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={kyc.statusBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry._id}: ${entry.count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {kyc.statusBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : activeTab === "kyc" && loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">Loading KYC data...</p>
          </div>
        </div>
      ) : activeTab === "kyc" ? (
        <EmptyState message="No KYC data available for the selected period" />
      ) : null}

      {/* Support Tab */}
      {activeTab === "support" && support ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              title="Total Tickets"
              value={support.summary.totalTickets}
              icon={<MessageSquare className="h-5 w-5" />}
              valueClassName="text-blue-600"
            />
            <StatCard
              title="Open"
              value={support.summary.openTickets}
              icon={<MessageSquare className="h-5 w-5" />}
              valueClassName="text-yellow-600"
            />
            <StatCard
              title="Resolved"
              value={support.summary.resolvedTickets}
              icon={<TrendingUp className="h-5 w-5" />}
              valueClassName="text-green-600"
            />
            <StatCard
              title="Urgent"
              value={support.summary.urgentTickets}
              icon={<MessageSquare className="h-5 w-5" />}
              valueClassName="text-red-600"
            />
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Tickets by Category</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={support.ticketsByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : activeTab === "support" && loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">Loading support data...</p>
          </div>
        </div>
      ) : activeTab === "support" ? (
        <EmptyState message="No support data available for the selected period" />
      ) : null}
    </div>
  );
}

export default function AdminReportsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminReportsContent />
    </Suspense>
  );
}
