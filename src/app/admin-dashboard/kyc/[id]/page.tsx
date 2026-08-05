"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Eye,
  Loader2,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
} from "lucide-react";

type KYCStatus = "not_started" | "pending" | "under_review" | "approved" | "rejected" | "requires_resubmission";

interface KYCDetail {
  _id: string;
  userId: string;
  status: KYCStatus;
  personalInformation?: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
  };
  identityInformation?: {
    idType?: string;
    idNumber?: string;
  };
  addressInformation?: {
    address?: string;
    city?: string;
    state?: string;
    lga?: string;
    country?: string;
  };
  documents?: Array<{
    _id: string;
    documentType: string;
    storageReference: {
      secureUrl: string;
      originalFileName: string;
    };
    verificationStatus: string;
  }>;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  adminNotes?: string;
  version: number;
  previousVersionId?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    accountType: string;
    createdAt: string;
  };
  previousVersions?: Array<{
    status: KYCStatus;
    version: number;
    submittedAt?: string;
    rejectionReason?: string;
    reviewedAt?: string;
  }>;
}

export default function AdminKYCDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [kycDetail, setKycDetail] = useState<KYCDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const fetchKYCDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/kyc/${resolvedParams.id}`);
      const data = await response.json();

      if (data.success) {
        setKycDetail(data.data);
        setAdminNotes(data.data.adminNotes || "");
      } else {
        toast.error("Failed to fetch KYC details");
        router.push("/admin-dashboard/kyc");
      }
    } catch (error) {
      console.error("Error fetching KYC detail:", error);
      toast.error("Failed to fetch KYC details");
      router.push("/admin-dashboard/kyc");
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id, router]);

  useEffect(() => {
    fetchKYCDetail();
  }, [fetchKYCDetail]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/kyc/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          adminNotes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("KYC approved successfully");
        await fetchKYCDetail();
      } else {
        toast.error(data.error || "Failed to approve KYC");
      }
    } catch (error) {
      console.error("Error approving KYC:", error);
      toast.error("Failed to approve KYC");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/kyc/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          rejectionReason,
          adminNotes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("KYC rejected successfully");
        setRejectDialogOpen(false);
        setRejectionReason("");
        await fetchKYCDetail();
      } else {
        toast.error(data.error || "Failed to reject KYC");
      }
    } catch (error) {
      console.error("Error rejecting KYC:", error);
      toast.error("Failed to reject KYC");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkUnderReview = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/kyc/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "review",
          adminNotes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("KYC marked as under review");
        await fetchKYCDetail();
      } else {
        toast.error(data.error || "Failed to update KYC");
      }
    } catch (error) {
      console.error("Error updating KYC:", error);
      toast.error("Failed to update KYC");
    } finally {
      setActionLoading(false);
    }
  };

  const renderStatusBadge = (status: KYCStatus) => {
    const statusConfig = {
      not_started: { icon: Clock, color: "bg-gray-100 text-gray-700", label: "Not Started" },
      pending: { icon: Clock, color: "bg-yellow-100 text-yellow-700", label: "Pending" },
      under_review: { icon: Clock, color: "bg-blue-100 text-blue-700", label: "Under Review" },
      approved: { icon: CheckCircle, color: "bg-green-100 text-green-700", label: "Approved" },
      rejected: { icon: XCircle, color: "bg-red-100 text-red-700", label: "Rejected" },
      requires_resubmission: { icon: AlertCircle, color: "bg-orange-100 text-orange-700", label: "Requires Resubmission" },
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

  const maskSensitiveId = (id: string) => {
    if (!id || id.length <= 4) return "****";
    return id.slice(0, 4) + "****" + id.slice(-4);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-600" />
      </div>
    );
  }

  if (!kycDetail) {
    return null;
  }

  const isApproved = kycDetail.status === "approved";
  const isRejected = kycDetail.status === "rejected" || kycDetail.status === "requires_resubmission";

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/admin-dashboard/kyc")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to KYC List
        </Button>
        <div className="flex-1" />
        {renderStatusBadge(kycDetail.status)}
      </div>

      {/* User Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label className="text-gray-600 dark:text-gray-400">Name</Label>
              <p className="font-semibold">{kycDetail.user?.name || "N/A"}</p>
            </div>
            <div>
              <Label className="text-gray-600 dark:text-gray-400">Email</Label>
              <p className="font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {kycDetail.user?.email || "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-gray-600 dark:text-gray-400">Phone</Label>
              <p className="font-semibold flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {kycDetail.user?.phone || "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-gray-600 dark:text-gray-400">Role</Label>
              <p className="font-semibold">{kycDetail.user?.role || "N/A"}</p>
            </div>
            <div>
              <Label className="text-gray-600 dark:text-gray-400">Account Type</Label>
              <p className="font-semibold">{kycDetail.user?.accountType || "N/A"}</p>
            </div>
            <div>
              <Label className="text-gray-600 dark:text-gray-400">Member Since</Label>
              <p className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {kycDetail.user?.createdAt 
                  ? new Date(kycDetail.user.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KYC Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            KYC Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label className="text-gray-600 dark:text-gray-400">KYC ID</Label>
              <p className="font-semibold text-sm">{kycDetail._id}</p>
            </div>
            <div>
              <Label className="text-gray-600 dark:text-gray-400">Status</Label>
              <p>{renderStatusBadge(kycDetail.status)}</p>
            </div>
            <div>
              <Label className="text-gray-600 dark:text-gray-400">Version</Label>
              <p className="font-semibold">v{kycDetail.version}</p>
            </div>
            <div>
              <Label className="text-gray-600 dark:text-gray-400">Submitted</Label>
              <p className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {kycDetail.submittedAt 
                  ? new Date(kycDetail.submittedAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-gray-600 dark:text-gray-400">Last Updated</Label>
              <p className="font-semibold">
                {new Date(kycDetail.updatedAt).toLocaleString()}
              </p>
            </div>
            {kycDetail.reviewedAt && (
              <div>
                <Label className="text-gray-600 dark:text-gray-400">Reviewed</Label>
                <p className="font-semibold">
                  {new Date(kycDetail.reviewedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {kycDetail.rejectionReason && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200">
              <Label className="text-red-700 dark:text-red-400 font-semibold">Rejection Reason</Label>
              <p className="mt-1 text-sm">{kycDetail.rejectionReason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label className="text-gray-600 dark:text-gray-400">First Name</Label>
              <p className="font-semibold">{kycDetail.personalInformation?.firstName || "N/A"}</p>
            </div>
            <div>
              <Label className="text-gray-600 dark:text-gray-400">Middle Name</Label>
              <p className="font-semibold">{kycDetail.personalInformation?.middleName || "N/A"}</p>
            </div>
            <div>
              <Label className="text-gray-600 dark:text-gray-400">Last Name</Label>
              <p className="font-semibold">{kycDetail.personalInformation?.lastName || "N/A"}</p>
            </div>
            <div>
              <Label className="text-gray-600 dark:text-gray-400">Date of Birth</Label>
              <p className="font-semibold">
                {kycDetail.personalInformation?.dateOfBirth
                  ? new Date(kycDetail.personalInformation.dateOfBirth).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-gray-600 dark:text-gray-400">Gender</Label>
              <p className="font-semibold capitalize">{kycDetail.personalInformation?.gender || "N/A"}</p>
            </div>
            <div>
              <Label className="text-gray-600 dark:text-gray-400">Phone</Label>
              <p className="font-semibold">{kycDetail.personalInformation?.phone || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Identity Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Identity Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-600 dark:text-gray-400">ID Type</Label>
              <p className="font-semibold capitalize">
                {kycDetail.identityInformation?.idType?.replace(/_/g, " ") || "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-gray-600 dark:text-gray-400">ID Number</Label>
              <p className="font-semibold font-mono">
                {kycDetail.identityInformation?.idNumber
                  ? maskSensitiveId(kycDetail.identityInformation.idNumber)
                  : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label className="text-gray-600 dark:text-gray-400">Address</Label>
              <p className="font-semibold">{kycDetail.addressInformation?.address || "N/A"}</p>
            </div>
            <div>
              <Label className="text-gray-600 dark:text-gray-400">City</Label>
              <p className="font-semibold">{kycDetail.addressInformation?.city || "N/A"}</p>
            </div>
            <div>
              <Label className="text-gray-600 dark:text-gray-400">State</Label>
              <p className="font-semibold">{kycDetail.addressInformation?.state || "N/A"}</p>
            </div>
            <div>
              <Label className="text-gray-600 dark:text-gray-400">LGA</Label>
              <p className="font-semibold">{kycDetail.addressInformation?.lga || "N/A"}</p>
            </div>
            <div>
              <Label className="text-gray-600 dark:text-gray-400">Country</Label>
              <p className="font-semibold">{kycDetail.addressInformation?.country || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Uploaded Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {kycDetail.documents && kycDetail.documents.length > 0 ? (
            <div className="space-y-4">
              {kycDetail.documents.map((doc) => (
                <div key={doc._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="font-semibold">{doc.storageReference.originalFileName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {doc.documentType.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={doc.verificationStatus === "approved" ? "default" : "outline"}
                    >
                      {doc.verificationStatus}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(doc.storageReference.secureUrl, "_blank")}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No documents uploaded</p>
          )}
        </CardContent>
      </Card>

      {/* Version History */}
      {kycDetail.previousVersions && kycDetail.previousVersions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Version History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kycDetail.previousVersions.map((version) => (
                <div key={version.version} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">v{version.version}</Badge>
                    {renderStatusBadge(version.status)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {version.submittedAt && new Date(version.submittedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Actions */}
      {!isApproved && (
        <Card>
          <CardHeader>
            <CardTitle>Review Actions</CardTitle>
            <CardDescription>
              {isRejected 
                ? "This KYC was rejected. You can approve it if the user has resubmitted with corrections."
                : "Review the KYC submission and take appropriate action."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
              <Textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add any internal notes about this review..."
                rows={3}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {!isRejected && (
                <>
                  <Button
                    onClick={handleMarkUnderReview}
                    disabled={actionLoading || kycDetail.status === "under_review"}
                    variant="outline"
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Clock className="h-4 w-4 mr-2" />
                    )}
                    Mark Under Review
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Approve KYC
                  </Button>
                </>
              )}
              
              <Button
                onClick={() => setRejectDialogOpen(true)}
                disabled={actionLoading}
                variant="destructive"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Reject KYC
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject KYC Verification</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this KYC submission. This will be communicated to the user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="rejectionReason">Rejection Reason *</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Document is unclear, Information does not match, Invalid document type..."
                rows={4}
              />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Common rejection reasons:
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Document is unclear or blurry</li>
                <li>Information does not match</li>
                <li>Invalid document type</li>
                <li>Expired document</li>
                <li>Missing required information</li>
                <li>Unable to verify identity</li>
              </ul>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={actionLoading || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject KYC"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
