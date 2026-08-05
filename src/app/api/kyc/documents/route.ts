import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import KYCDocument from "@/models/KYCDocument";
import KYCVerification from "@/models/KYCVerification";
import { uploadKYCDocument } from "@/lib/uploadKYCDocument";

// Allowed file types and sizes
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// POST /api/kyc/documents - Upload KYC document
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const userId = session.user.id;
    const formData = await req.formData();

    const file = formData.get("file") as File;
    const documentType = formData.get("documentType") as string;
    const kycId = formData.get("kycId") as string;

    // Validate file
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!documentType) {
      return NextResponse.json(
        { error: "Document type is required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and PDF are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Validate document type
    const validDocumentTypes: Array<"identity_document" | "proof_of_address" | "supporting_document"> = [
      "identity_document",
      "proof_of_address",
      "supporting_document",
    ];

    if (!validDocumentTypes.includes(documentType as "identity_document" | "proof_of_address" | "supporting_document")) {
      return NextResponse.json(
        { error: "Invalid document type" },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const uploadResult = await uploadKYCDocument(file, documentType);

    // Create document record
    const document = await KYCDocument.create({
      kycId: kycId || undefined,
      userId,
      documentType: documentType as "identity_document" | "proof_of_address" | "supporting_document",
      storageReference: {
        publicId: (uploadResult as { public_id: string }).public_id,
        secureUrl: (uploadResult as { secure_url: string }).secure_url,
        resourceType: (uploadResult as { resource_type: string }).resource_type,
        format: (uploadResult as { format: string }).format,
        bytes: (uploadResult as { bytes: number }).bytes,
      },
      originalFileName: file.name,
      mimeType: file.type,
    });

    // If kycId is provided, update the KYC verification
    if (kycId) {
      await KYCVerification.findByIdAndUpdate(kycId, {
        $push: { documentIds: (document as any)._id.toString() },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Document uploaded successfully",
      data: {
        id: (document as any)._id.toString(),
        documentType: (document as any).documentType,
        secureUrl: (uploadResult as { secure_url: string }).secure_url,
      },
    });
  } catch (error) {
    console.error("Error uploading KYC document:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}
