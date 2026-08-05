"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Upload, 
  FileText,
  Loader2 
} from "lucide-react";

type KYCStatus = "not_started" | "pending" | "under_review" | "approved" | "rejected" | "requires_resubmission";

interface KYCData {
  status: KYCStatus;
  data: {
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
      id: string;
      documentType: string;
      secureUrl: string;
      originalFileName: string;
    }>;
    submittedAt?: string;
    rejectionReason?: string;
  };
}

export default function KYCPage() {
  const { data: session } = useSession();
  const [kycData, setKycData] = useState<KYCData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{
    id: string;
    documentType: string;
    secureUrl: string;
    originalFileName: string;
  }>>([]);

  // Form state
  const [formData, setFormData] = useState({
    personalInformation: {
      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      phone: "",
    },
    identityInformation: {
      idType: "",
      idNumber: "",
    },
    addressInformation: {
      address: "",
      city: "",
      state: "",
      lga: "",
      country: "Nigeria",
    },
  });

  const fetchKYCStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/kyc");
      const data = await response.json();
      setKycData(data);
      
      if (data.data) {
        setFormData({
          personalInformation: data.data.personalInformation || formData.personalInformation,
          identityInformation: data.data.identityInformation || formData.identityInformation,
          addressInformation: data.data.addressInformation || formData.addressInformation,
        });
        setUploadedDocuments(data.data.documents || []);
      }
    } catch (error) {
      console.error("Error fetching KYC status:", error);
      toast.error("Failed to load KYC status");
    } finally {
      setLoading(false);
    }
  }, [formData.personalInformation, formData.identityInformation, formData.addressInformation]);

  useEffect(() => {
    if (session) {
      fetchKYCStatus();
    }
  }, [session, fetchKYCStatus]);

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", documentType);

    try {
      const response = await fetch("/api/kyc/documents", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setUploadedDocuments([
          ...uploadedDocuments,
          {
            id: data.data.id,
            documentType: data.data.documentType,
            secureUrl: data.data.secureUrl,
            originalFileName: file.name,
          },
        ]);
        toast.success("Document uploaded successfully");
      } else {
        toast.error(data.error || "Failed to upload document");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const response = await fetch("/api/kyc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          documentIds: uploadedDocuments.map((doc) => doc.id),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("KYC submitted successfully");
        await fetchKYCStatus();
      } else {
        toast.error(data.error || "Failed to submit KYC");
      }
    } catch (error) {
      console.error("Error submitting KYC:", error);
      toast.error("Failed to submit KYC");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResubmit = async () => {
    setSubmitting(true);

    try {
      const response = await fetch("/api/kyc", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          documentIds: uploadedDocuments.map((doc) => doc.id),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("KYC resubmitted successfully");
        await fetchKYCStatus();
      } else {
        toast.error(data.error || "Failed to resubmit KYC");
      }
    } catch (error) {
      console.error("Error resubmitting KYC:", error);
      toast.error("Failed to resubmit KYC");
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-600" />
      </div>
    );
  }

  // Status-based views
  if (kycData?.status === "approved") {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <CardTitle className="text-green-900 dark:text-green-100">KYC Verified</CardTitle>
                <CardDescription>Your identity has been successfully verified</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Verified Date:</strong> {new Date(kycData.data.submittedAt || "").toLocaleDateString()}</p>
              <p className="text-green-700 dark:text-green-300">Your account is now fully verified with all features unlocked.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (kycData?.status === "pending" || kycData?.status === "under_review") {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {renderStatusBadge(kycData.status)}
                <CardTitle>KYC Verification</CardTitle>
              </div>
            </div>
            <CardDescription>
              {kycData.status === "pending" 
                ? "Your KYC has been submitted and is awaiting review"
                : "Your KYC is currently under review by our team"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Submitted: {new Date(kycData.data.submittedAt || "").toLocaleDateString()}</p>
              </div>
              
              {uploadedDocuments.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Submitted Documents</h3>
                  <div className="space-y-2">
                    {uploadedDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{doc.originalFileName}</span>
                        <Badge variant="outline" className="ml-auto">{doc.documentType}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (kycData?.status === "rejected" || kycData?.status === "requires_resubmission") {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              {renderStatusBadge(kycData.status)}
              <div>
                <CardTitle className="text-red-900 dark:text-red-100">KYC Needs Attention</CardTitle>
                <CardDescription>Please review and update your information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {kycData.data.rejectionReason && (
              <div className="mb-4 p-3 bg-white dark:bg-black rounded border border-red-200">
                <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Reason:</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{kycData.data.rejectionReason}</p>
              </div>
            )}
            <Button onClick={() => setCurrentStep(1)} className="w-full">
              Update and Resubmit
            </Button>
          </CardContent>
        </Card>

        {currentStep > 0 && renderKYCForm()}
      </div>
    );
  }

  // Not started - show form
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>KYC Verification</CardTitle>
          <CardDescription>
            Complete your identity verification to unlock all platform features
          </CardDescription>
        </CardHeader>
      </Card>

      {renderKYCForm()}
    </div>
  );

  function renderKYCForm() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Complete Your KYC</CardTitle>
          <CardDescription>Step {currentStep} of 4</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.personalInformation.firstName}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalInformation: { ...formData.personalInformation, firstName: e.target.value }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input
                    id="middleName"
                    value={formData.personalInformation.middleName}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalInformation: { ...formData.personalInformation, middleName: e.target.value }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.personalInformation.lastName}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalInformation: { ...formData.personalInformation, lastName: e.target.value }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.personalInformation.dateOfBirth}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalInformation: { ...formData.personalInformation, dateOfBirth: e.target.value }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={formData.personalInformation.gender}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      personalInformation: { ...formData.personalInformation, gender: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.personalInformation.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalInformation: { ...formData.personalInformation, phone: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setCurrentStep(2)}>Next</Button>
              </div>
            </div>
          )}

          {/* Step 2: Identity Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Identity Information</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="idType">Identification Type *</Label>
                  <Select
                    value={formData.identityInformation.idType}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      identityInformation: { ...formData.identityInformation, idType: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nin">NIN (National Identity Number)</SelectItem>
                      <SelectItem value="bvn">BVN (Bank Verification Number)</SelectItem>
                      <SelectItem value="international_passport">International Passport</SelectItem>
                      <SelectItem value="drivers_license">Driver&apos;s License</SelectItem>
                      <SelectItem value="voter_card">Voter&apos;s Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idNumber">Identification Number *</Label>
                  <Input
                    id="idNumber"
                    value={formData.identityInformation.idNumber}
                    onChange={(e) => setFormData({
                      ...formData,
                      identityInformation: { ...formData.identityInformation, idNumber: e.target.value }
                    })}
                    placeholder="Enter your ID number"
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
                <Button onClick={() => setCurrentStep(3)}>Next</Button>
              </div>
            </div>
          )}

          {/* Step 3: Address Information */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Address Information</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.addressInformation.address}
                    onChange={(e) => setFormData({
                      ...formData,
                      addressInformation: { ...formData.addressInformation, address: e.target.value }
                    })}
                    placeholder="Enter your full address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.addressInformation.city}
                      onChange={(e) => setFormData({
                        ...formData,
                        addressInformation: { ...formData.addressInformation, city: e.target.value }
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.addressInformation.state}
                      onChange={(e) => setFormData({
                        ...formData,
                        addressInformation: { ...formData.addressInformation, state: e.target.value }
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lga">LGA</Label>
                    <Input
                      id="lga"
                      value={formData.addressInformation.lga}
                      onChange={(e) => setFormData({
                        ...formData,
                        addressInformation: { ...formData.addressInformation, lga: e.target.value }
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={formData.addressInformation.country}
                      onChange={(e) => setFormData({
                        ...formData,
                        addressInformation: { ...formData.addressInformation, country: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
                <Button onClick={() => setCurrentStep(4)}>Next</Button>
              </div>
            </div>
          )}

          {/* Step 4: Document Upload */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Document Upload</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Identity Document *</Label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={(e) => handleDocumentUpload(e, "identity_document")}
                      className="hidden"
                      id="identityDoc"
                    />
                    <label htmlFor="identityDoc" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">JPG, PNG, PDF (Max 5MB)</p>
                      </div>
                    </label>
                  </div>
                  {uploadedDocuments.find((d) => d.documentType === "identity_document") && (
                    <p className="text-sm text-green-600">✓ Identity document uploaded</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Proof of Address (Optional)</Label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={(e) => handleDocumentUpload(e, "proof_of_address")}
                      className="hidden"
                      id="addressDoc"
                    />
                    <label htmlFor="addressDoc" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">JPG, PNG, PDF (Max 5MB)</p>
                      </div>
                    </label>
                  </div>
                  {uploadedDocuments.find((d) => d.documentType === "proof_of_address") && (
                    <p className="text-sm text-green-600">✓ Proof of address uploaded</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>Back</Button>
                <Button 
                  onClick={kycData?.status === "rejected" || kycData?.status === "requires_resubmission" ? handleResubmit : handleSubmit}
                  disabled={submitting || !uploadedDocuments.find((d) => d.documentType === "identity_document")}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    kycData?.status === "rejected" || kycData?.status === "requires_resubmission" ? "Resubmit KYC" : "Submit KYC"
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
}
