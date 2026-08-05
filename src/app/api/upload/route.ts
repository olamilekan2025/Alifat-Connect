import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";

export async function POST(
  request: Request
) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const result: any = await uploadToCloudinary(file);
    const url = result.secure_url;

    return NextResponse.json({
      success: true,
      url,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      {
        error: "Upload failed",
      },
      { status: 500 }
    );
  }
}