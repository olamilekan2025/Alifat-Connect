"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Gift,
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Eye,
  Settings,
  Award,
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
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type ReferralStats = {
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  failedReferrals: number;
  cancelledReferrals: number;
  qualifiedReferrals: number;
  totalRewards: number;
  averageReward: number;
  conversionRate: number;
  pendingReferralsList: ReferralItem[];
};

type ReferralItem = {
  _id: string;
  referrerId: string;
  referredUserId: string;
  referralCode: string;
  rewardAmount: number;
  rewardType: "fixed" | "percentage";
  status: "pending" | "qualified" | "rewarded" | "cancelled" | "failed";
  qualificationStatus: "pending" | "qualified" | "not_qualified";
  transactionId?: string;
  reference?: string;
  qualificationCondition?: string;
  qualificationAmount?: number;
  qualifiedAt?: string;
  rewardedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  referrer?: {
    _id: string;
    firstname?: string;
    lastname?: string;
    name?: string;
    email: string;
    referralCode: string;
    referralsCount?: number;
    referralEarnings?: number;
    createdAt: string;
    isSuspended?: boolean;
  };
  referredUser?: {
    _id: string;
    firstname?: string;
    lastname?: string;
    name?: string;
    email: string;
    referralCode?: string;
    createdAt: string;
    isSuspended?: boolean;
  };
};

type TopReferrer = {
  _id: string;
  rank: number;
  firstname?: string;
  lastname?: string;
  name?: string;
  email: string;
  referralCode: string;
  referralsCount: number;
  referralEarnings: number;
  totalReferrals: number;
  successfulReferrals: number;
  conversionRate: number;
  createdAt: string;
};

type ReferralSettings = {
  enabled: boolean;
  rewardType: "fixed" | "percentage";
  fixedRewardAmount: number;
  percentageReward: number;
  minimumQualificationAmount: number;
  maximumReward: number;
  autoCreditReward: boolean;
  qualificationCondition: string;
};

function AdminReferralsContent() {
  const searchParams = useSearchParams();
  
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReferral, setSelectedReferral] = useState<ReferralItem | null>(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page") || 1));
  const [totalReferrals, setTotalReferrals] = useState(0);

  const [analyticsPeriod, setAnalyticsPeriod] = useState("30days");
  const [analyticsData, setAnalyticsData] = useState<Array<{ _id: string; totalReferrals: number; successfulReferrals: number; pendingReferrals: number; totalRewards: number }>>([]);
  const [analyticsSummary, setAnalyticsSummary] = useState<{ totalReferrals: number; successfulReferrals: number; pendingReferrals: number; totalRewards: number } | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<Partial<ReferralSettings>>({});

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/referrals/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, []);

  const fetchReferrals = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      });

      if (statusFilter !== "all") params.append("status", statusFilter);
      if (sort) params.append("sort", sort);

      const res = await fetch(`/api/admin/referrals?${params}`);
      const data = await res.json();

      if (data.success) {
        setReferrals(data.referrals);
        setTotalReferrals(data.totalReferrals);
      }
    } catch (error) {
      console.error("Failed to fetch referrals:", error);
      toast.error("Failed to load referrals");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, sort]);

  const fetchTopReferrers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/referrals/top?limit=10");
      const data = await res.json();
      if (data.success) {
        setTopReferrers(data.topReferrers);
      }
    } catch (error) {
      console.error("Failed to fetch top referrers:", error);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/referrals/analytics?period=${analyticsPeriod}`);
      const data = await res.json();
      if (data.success) {
        setAnalyticsData(data.analytics);
        setAnalyticsSummary(data.summary);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  }, [analyticsPeriod]);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/referrals/settings");
      const data = await res.json();
      if (data.success) {
        setSettingsForm(data.settings);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchStats();
    fetchReferrals();
    fetchTopReferrers();
    fetchAnalytics();
    fetchSettings();
  }, [fetchStats, fetchReferrals, fetchTopReferrers, fetchAnalytics, fetchSettings]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleUpdateSettings = async () => {
    try {
      const res = await fetch("/api/admin/referrals/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Referral settings updated successfully");
        setSettingsDialogOpen(false);
        fetchSettings();
      } else {
        toast.error(data.message || "Failed to update settings");
      }
    } catch (error) {
      console.error("Settings update error:", error);
      toast.error("Failed to update settings");
    }
  };

  const filteredReferrals = referrals.filter((referral) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      referral.referralCode?.toLowerCase().includes(q) ||
      referral.reference?.toLowerCase().includes(q) ||
      referral.referrer?.email?.toLowerCase().includes(q) ||
      referral.referrer?.name?.toLowerCase().includes(q) ||
      referral.referrer?.firstname?.toLowerCase().includes(q) ||
      referral.referrer?.lastname?.toLowerCase().includes(q) ||
      referral.referredUser?.email?.toLowerCase().includes(q) ||
      referral.referredUser?.name?.toLowerCase().includes(q) ||
      referral.referredUser?.firstname?.toLowerCase().includes(q) ||
      referral.referredUser?.lastname?.toLowerCase().includes(q)
    );
  });

  if (loading && !stats) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            Loading referrals...
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
          <h1 className="text-2xl font-bold">Referrals Management</h1>
          <p className="text-sm text-muted-foreground">
            Monitor and manage referral program performance
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setSettingsDialogOpen(true)}
        >
          <Settings className="mr-2 h-4 w-4" />
          Referral Settings
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Referrals"
            value={stats.totalReferrals}
            icon={<Users className="h-5 w-5" />}
            valueClassName="text-blue-600 dark:text-blue-400"
          />
          <StatCard
            title="Successful"
            value={stats.successfulReferrals}
            icon={<CheckCircle className="h-5 w-5" />}
            valueClassName="text-green-600 dark:text-green-400"
          />
          <StatCard
            title="Pending"
            value={stats.pendingReferrals}
            icon={<Clock className="h-5 w-5" />}
            valueClassName="text-yellow-600 dark:text-yellow-400"
          />
          <StatCard
            title="Failed/Cancelled"
            value={stats.failedReferrals + stats.cancelledReferrals}
            icon={<XCircle className="h-5 w-5" />}
            valueClassName="text-red-600 dark:text-red-400"
          />
          <StatCard
            title="Total Rewards"
            value={`₦${Number(stats.totalRewards).toLocaleString()}`}
            icon={<DollarSign className="h-5 w-5" />}
            valueClassName="text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            title="Average Reward"
            value={`₦${Number(stats.averageReward).toFixed(2)}`}
            icon={<TrendingUp className="h-5 w-5" />}
            valueClassName="text-cyan-600 dark:text-cyan-400"
          />
          <StatCard
            title="Conversion Rate"
            value={`${stats.conversionRate.toFixed(1)}%`}
            icon={<Award className="h-5 w-5" />}
            valueClassName="text-purple-600 dark:text-purple-400"
          />
          <StatCard
            title="Qualified"
            value={stats.qualifiedReferrals}
            icon={<Gift className="h-5 w-5" />}
            valueClassName="text-pink-600 dark:text-pink-400"
          />
        </div>
      )}

      {/* Pending Referrals Alert */}
      {stats?.pendingReferralsList && stats.pendingReferralsList.length > 0 && (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                {stats.pendingReferralsList.length} Pending Referral{stats.pendingReferralsList.length > 1 ? "s" : ""} Requiring Attention
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Review and process pending referral rewards
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Chart */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold">Referral Analytics</h3>
          <Select value={analyticsPeriod} onValueChange={setAnalyticsPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">7 Days</SelectItem>
              <SelectItem value="30days">30 Days</SelectItem>
              <SelectItem value="90days">90 Days</SelectItem>
              <SelectItem value="thisyear">This Year</SelectItem>
              <SelectItem value="alltime">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {analyticsSummary && (
          <div className="mb-4 grid gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">Total Referrals</p>
              <p className="text-lg font-semibold">{analyticsSummary.totalReferrals}</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">Successful</p>
              <p className="text-lg font-semibold text-green-600">{analyticsSummary.successfulReferrals}</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-semibold text-yellow-600">{analyticsSummary.pendingReferrals}</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">Total Rewards</p>
              <p className="text-lg font-semibold text-emerald-600">₦{Number(analyticsSummary.totalRewards).toLocaleString()}</p>
            </div>
          </div>
        )}

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="totalReferrals" stroke="#3b82f6" name="Total Referrals" />
              <Line type="monotone" dataKey="successfulReferrals" stroke="#22c55e" name="Successful" />
              <Line type="monotone" dataKey="pendingReferrals" stroke="#eab308" name="Pending" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Referrers */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Top Referrers</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left">
                <th className="px-4 py-3 text-sm font-semibold">Rank</th>
                <th className="px-4 py-3 text-sm font-semibold">User</th>
                <th className="px-4 py-3 text-sm font-semibold">Referral Code</th>
                <th className="px-4 py-3 text-sm font-semibold">Total Referrals</th>
                <th className="px-4 py-3 text-sm font-semibold">Successful</th>
                <th className="px-4 py-3 text-sm font-semibold">Conversion Rate</th>
                <th className="px-4 py-3 text-sm font-semibold">Total Earnings</th>
              </tr>
            </thead>
            <tbody>
              {topReferrers.map((referrer) => (
                <tr key={referrer._id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/10 font-bold text-yellow-600">
                      {referrer.rank}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">
                        {referrer.name || `${referrer.firstname || ""} ${referrer.lastname || ""}`.trim() || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">{referrer.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm">{referrer.referralCode}</td>
                  <td className="px-4 py-3 font-semibold">{referrer.totalReferrals}</td>
                  <td className="px-4 py-3 font-semibold text-green-600">{referrer.successfulReferrals}</td>
                  <td className="px-4 py-3 font-semibold">{referrer.conversionRate.toFixed(1)}%</td>
                  <td className="px-4 py-3 font-semibold text-emerald-600">₦{Number(referrer.referralEarnings).toLocaleString()}</td>
                </tr>
              ))}
              {topReferrers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No referrers yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code, email, name..."
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
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="rewarded">Rewarded</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="highest_reward">Highest Reward</SelectItem>
            <SelectItem value="lowest_reward">Lowest Reward</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={() => { setSearch(""); setStatusFilter("all"); setSort("newest"); }}>
          Clear Filters
        </Button>
      </div>

      {/* Referrals Table */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <table className="w-full">
          <thead className="border-b border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
            <tr className="text-left">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                Referrer
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                Referred User
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                Referral Code
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">
                Reward
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
                  Loading referrals...
                </td>
              </tr>
            ) : filteredReferrals.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                  No referrals found
                </td>
              </tr>
            ) : (
              filteredReferrals.map((referral) => (
                <tr
                  key={referral._id}
                  className="border-b border-zinc-200 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">
                        {referral.referrer?.name || `${referral.referrer?.firstname || ""} ${referral.referrer?.lastname || ""}`.trim() || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {referral.referrer?.email}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">
                        {referral.referredUser?.name || `${referral.referredUser?.firstname || ""} ${referral.referredUser?.lastname || ""}`.trim() || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {referral.referredUser?.email}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4 font-mono text-sm font-medium">
                    {referral.referralCode}
                  </td>

                  <td className="px-6 py-4 font-semibold">
                    ₦{Number(referral.rewardAmount).toLocaleString()}
                  </td>

                  <td className="px-6 py-4">
                    {referral.status === "rewarded" && (
                      <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-600">
                        Rewarded
                      </span>
                    )}
                    {referral.status === "pending" && (
                      <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-600">
                        Pending
                      </span>
                    )}
                    {referral.status === "qualified" && (
                      <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600">
                        Qualified
                      </span>
                    )}
                    {referral.status === "cancelled" && (
                      <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-600">
                        Cancelled
                      </span>
                    )}
                    {referral.status === "failed" && (
                      <span className="rounded-full bg-gray-500/10 px-3 py-1 text-xs font-semibold text-gray-600">
                        Failed
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {referral.createdAt ? new Date(referral.createdAt).toLocaleDateString() : "-"}
                  </td>

                  <td className="px-6 py-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedReferral(referral)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
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
          Showing {filteredReferrals.length} of {totalReferrals} referrals
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
            disabled={filteredReferrals.length < 20}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Referral Details Modal */}
      {selectedReferral && (
        <Dialog open={!!selectedReferral} onOpenChange={() => setSelectedReferral(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Referral Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Referrer Information */}
              {selectedReferral.referrer && (
                <div>
                  <h3 className="mb-3 font-semibold">Referrer Information</h3>
                  <div className="grid gap-2 text-sm">
                    <DetailRow label="Name" value={selectedReferral.referrer.name || "-"} />
                    <DetailRow label="Email" value={selectedReferral.referrer.email} />
                    <DetailRow label="Referral Code" value={selectedReferral.referrer.referralCode} />
                    <DetailRow label="Total Referrals" value={String(selectedReferral.referrer.referralsCount || 0)} />
                    <DetailRow label="Total Earnings" value={`₦${Number(selectedReferral.referrer.referralEarnings || 0).toLocaleString()}`} />
                    <DetailRow
                      label="Registration Date"
                      value={selectedReferral.referrer.createdAt ? new Date(selectedReferral.referrer.createdAt).toLocaleDateString() : "-"}
                    />
                  </div>
                </div>
              )}

              {/* Referred User Information */}
              {selectedReferral.referredUser && (
                <div>
                  <h3 className="mb-3 font-semibold">Referred User Information</h3>
                  <div className="grid gap-2 text-sm">
                    <DetailRow label="Name" value={selectedReferral.referredUser.name || "-"} />
                    <DetailRow label="Email" value={selectedReferral.referredUser.email} />
                    <DetailRow
                      label="Registration Date"
                      value={selectedReferral.referredUser.createdAt ? new Date(selectedReferral.referredUser.createdAt).toLocaleDateString() : "-"}
                    />
                    <DetailRow label="Account Status" value={selectedReferral.referredUser.isSuspended ? "Suspended" : "Active"} />
                  </div>
                </div>
              )}

              {/* Referral Information */}
              <div>
                <h3 className="mb-3 font-semibold">Referral Information</h3>
                <div className="grid gap-2 text-sm">
                  <DetailRow label="Referral ID" value={selectedReferral._id} />
                  <DetailRow label="Referral Code" value={selectedReferral.referralCode} />
                  <DetailRow label="Status" value={selectedReferral.status} />
                  <DetailRow label="Qualification Status" value={selectedReferral.qualificationStatus} />
                  <DetailRow label="Reward Amount" value={`₦${Number(selectedReferral.rewardAmount).toLocaleString()}`} />
                  <DetailRow label="Reward Type" value={selectedReferral.rewardType} />
                  <DetailRow label="Reference" value={selectedReferral.reference || "-"} />
                  <DetailRow label="Transaction ID" value={selectedReferral.transactionId || "-"} />
                  <DetailRow label="Qualification Condition" value={selectedReferral.qualificationCondition || "-"} />
                  <DetailRow label="Qualification Amount" value={selectedReferral.qualificationAmount ? `₦${Number(selectedReferral.qualificationAmount).toLocaleString()}` : "-"} />
                  <DetailRow
                    label="Created"
                    value={selectedReferral.createdAt ? new Date(selectedReferral.createdAt).toLocaleString() : "-"}
                  />
                  {selectedReferral.qualifiedAt && (
                    <DetailRow
                      label="Qualified"
                      value={new Date(selectedReferral.qualifiedAt).toLocaleString()}
                    />
                  )}
                  {selectedReferral.rewardedAt && (
                    <DetailRow
                      label="Rewarded"
                      value={new Date(selectedReferral.rewardedAt).toLocaleString()}
                    />
                  )}
                  {selectedReferral.cancelledAt && (
                    <DetailRow
                      label="Cancelled"
                      value={new Date(selectedReferral.cancelledAt).toLocaleString()}
                    />
                  )}
                  {selectedReferral.cancellationReason && (
                    <DetailRow label="Cancellation Reason" value={selectedReferral.cancellationReason} />
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Referral Settings</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Enable Referral System</label>
              <input
                type="checkbox"
                checked={settingsForm.enabled || false}
                onChange={(e) => setSettingsForm({ ...settingsForm, enabled: e.target.checked })}
                className="h-5 w-5"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Reward Type</label>
              <Select
                value={settingsForm.rewardType || "fixed"}
                onValueChange={(value: "fixed" | "percentage") => setSettingsForm({ ...settingsForm, rewardType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {settingsForm.rewardType === "fixed" && (
              <div>
                <label className="mb-2 block text-sm font-medium">Fixed Reward Amount (₦)</label>
                <Input
                  type="number"
                  value={settingsForm.fixedRewardAmount || 0}
                  onChange={(e) => setSettingsForm({ ...settingsForm, fixedRewardAmount: Number(e.target.value) })}
                  min={0}
                />
              </div>
            )}

            {settingsForm.rewardType === "percentage" && (
              <div>
                <label className="mb-2 block text-sm font-medium">Percentage Reward (%)</label>
                <Input
                  type="number"
                  value={settingsForm.percentageReward || 0}
                  onChange={(e) => setSettingsForm({ ...settingsForm, percentageReward: Number(e.target.value) })}
                  min={0}
                  max={100}
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium">Minimum Qualification Amount (₦)</label>
              <Input
                type="number"
                value={settingsForm.minimumQualificationAmount || 0}
                onChange={(e) => setSettingsForm({ ...settingsForm, minimumQualificationAmount: Number(e.target.value) })}
                min={0}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Maximum Reward (₦)</label>
              <Input
                type="number"
                value={settingsForm.maximumReward || 0}
                onChange={(e) => setSettingsForm({ ...settingsForm, maximumReward: Number(e.target.value) })}
                min={0}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Auto Credit Reward</label>
              <input
                type="checkbox"
                checked={settingsForm.autoCreditReward !== undefined ? settingsForm.autoCreditReward : true}
                onChange={(e) => setSettingsForm({ ...settingsForm, autoCreditReward: e.target.checked })}
                className="h-5 w-5"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Qualification Condition</label>
              <Input
                value={settingsForm.qualificationCondition || "first_transaction"}
                onChange={(e) => setSettingsForm({ ...settingsForm, qualificationCondition: e.target.value })}
                placeholder="e.g., first_transaction, minimum_purchase"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateSettings}>
                Save Settings
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

export default function AdminReferralsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            Loading referrals...
          </p>
        </div>
      </div>
    }>
      <AdminReferralsContent />
    </Suspense>
  );
}
