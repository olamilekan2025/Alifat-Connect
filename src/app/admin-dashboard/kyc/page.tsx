"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Loader2 
} from "lucide-react";

type KYCStatus = "not_started" | "pending" | "under_review" | "approved" | "rejected" | "requires_resubmission";

interface KYCSubmission {
  _id: string;
  userId: string;
  status: KYCStatus;
  identityInformation?: {
    idType?: string;
    idNumber?: string;
  };
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  user?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface KYCStats {
  total: number;
  not_started: number;
  pending: number;
  under_review: number;
  approved: number;
  rejected: number;
  requires_resubmission: number;
}

export default function AdminKYCPage() {
  const router = useRouter();
  const [kycSubmissions, setKycSubmissions] = useState<KYCSubmission[]>([]);
  const [stats, setStats] = useState<KYCStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchKYCData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        ...(search && { search }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(dateRange !== "all" && { dateRange }),
      });

      const response = await fetch(`/api/admin/kyc?${params}`);
      const data = await response.json();

      if (data.success) {
        setKycSubmissions(data.kycSubmissions);
        setTotalPages(data.totalPages);
      } else {
        toast.error("Failed to fetch KYC submissions");
      }
    } catch (error) {
      console.error("Error fetching KYC data:", error);
      toast.error("Failed to fetch KYC submissions");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, dateRange]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/kyc/stats");
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchKYCData();
    fetchStats();
  }, [fetchKYCData, fetchStats]);

  const handleSearch = () => {
    setPage(1);
    fetchKYCData();
  };

  const renderStatusBadge = (status: KYCStatus) => {
    const statusConfig = {
      not_started: { icon: Clock, color: "bg-gray-100 text-gray-700", label: "Not Started" },
      pending: { icon: Clock, color: "bg-yellow-100 text-yellow-700", label: "Pending" },
      under_review: { icon: Clock, color: "bg-blue-100 text-blue-700", label: "Under Review" },
      approved: { icon: CheckCircle, color: "bg-green-100 text-green-700", label: "Approved" },
      rejected: { icon: XCircle, color: "bg-red-100 text-red-700", label: "Rejected" },
      requires_resubmission: { icon: AlertCircle, color: "bg-orange-100 text-orange-700", label: "Resubmit" },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.under_review}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Under Review</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Rejected</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.requires_resubmission}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Resubmit</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Management</CardTitle>
          <CardDescription>Review and manage user identity verification submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="requires_resubmission">Requires Resubmission</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleSearch}>
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KYC Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-600" />
            </div>
          ) : kycSubmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No KYC Submissions Found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                There are no verification requests matching your current filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>ID Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kycSubmissions.map((kyc) => (
                    <TableRow key={kyc._id}>
                      <TableCell className="font-medium">
                        {kyc.user?.name || "N/A"}
                      </TableCell>
                      <TableCell>{kyc.user?.email || "N/A"}</TableCell>
                      <TableCell>{kyc.user?.phone || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {kyc.identityInformation?.idType || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>{renderStatusBadge(kyc.status)}</TableCell>
                      <TableCell>
                        {kyc.submittedAt 
                          ? new Date(kyc.submittedAt).toLocaleDateString()
                          : new Date(kyc.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin-dashboard/kyc/${kyc._id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
