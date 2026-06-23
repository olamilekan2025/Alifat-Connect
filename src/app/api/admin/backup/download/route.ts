import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";

function isAdmin(session: any) {
  return String(session?.user?.role || "").toLowerCase() === "admin";
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !isAdmin(session)) {
    return new Response("Unauthorized", { status: 403 });
  }

  const backupDir = path.join(process.cwd(), "backups");

  if (!fs.existsSync(backupDir)) {
    return new Response("No backups found", { status: 404 });
  }

  const files = fs
    .readdirSync(backupDir)
    .sort()
    .reverse();

  if (files.length === 0) {
    return new Response("No backups found", { status: 404 });
  }

  const latest = files[0];
  const filePath = path.join(backupDir, latest);

  const buffer = fs.readFileSync(filePath);

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${latest}"`,
    },
  });
}