import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function isAdmin(session: any) {
  return String(session?.user?.role || "").toLowerCase() === "admin";
}

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !isAdmin(session)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 403 }
    );
  }

  return NextResponse.json({
    success: true,
    message:
      "Restore endpoint is ready. Add your database restore implementation before enabling production restores.",
  });
}