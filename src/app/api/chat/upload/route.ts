import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireChatUser } from "../../../../lib/chat-auth";
import { isAllowedUpload, messageTypeFromMime } from "../../../../lib/chat-utils";

export async function POST(req: Request) {
  await requireChatUser();
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  if (!isAllowedUpload(file)) {
    return NextResponse.json({ error: "Only images and PDFs up to 10MB are allowed" }, { status: 400 });
  }

  const uploadRoot = process.env.CHAT_UPLOAD_DIR || "public/uploads/chat";
  const absoluteDir = path.join(process.cwd(), uploadRoot);
  await mkdir(absoluteDir, { recursive: true });

  const extension = path.extname(file.name) || `.${file.type.split("/").pop()}`;
  const safeName = `${randomUUID()}${extension}`;
  const absolutePath = path.join(absoluteDir, safeName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  const url = `/${uploadRoot.replace(/^public[\\/]/, "").replaceAll("\\", "/")}/${safeName}`;

  return NextResponse.json({
    attachment: {
      url,
      name: file.name,
      size: file.size,
      mimeType: file.type,
      messageType: messageTypeFromMime(file.type)
    }
  });
}

