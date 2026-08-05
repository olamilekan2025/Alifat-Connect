import { NextRequest, NextResponse } from "next/server";
import { requireChatUser } from "../../../../lib/chat-auth";
import { isAllowedUpload, messageTypeFromMime } from "../../../../lib/chat-utils";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";

export async function POST(req: NextRequest) {
  await requireChatUser(req);
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  if (!isAllowedUpload(file)) {
    return NextResponse.json({ error: "Only images and PDFs up to 10MB are allowed" }, { status: 400 });
  }

  try {
    const result: any = await uploadToCloudinary(file);
    const url = result.secure_url;

    return NextResponse.json({
      attachment: {
        url,
        name: file.name,
        size: file.size,
        mimeType: file.type,
        messageType: messageTypeFromMime(file.type)
      }
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file to Cloudinary" },
      { status: 500 }
    );
  }
}

