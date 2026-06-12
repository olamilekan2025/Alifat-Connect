import { writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export async function POST(
  request: Request
) {
  try {
    const formData =
      await request.formData();

    const file =
      formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const bytes =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    const fileName = `${Date.now()}-${file.name}`;

    const uploadPath = path.join(
      process.cwd(),
      "public/uploads",
      fileName
    );

    await writeFile(
      uploadPath,
      buffer
    );

    return NextResponse.json({
      success: true,
      url: `/uploads/${fileName}`,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Upload failed",
      },
      { status: 500 }
    );
  }
}