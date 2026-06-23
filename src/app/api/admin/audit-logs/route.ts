import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

function isAdmin(session: any) {
  return String(session?.user?.role || "").toLowerCase() === "admin";
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (!isAdmin(session)) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();
    const db = (global as any).mongoose?.connection?.db;

    // safer: connectToDatabase sets mongoose connection, but we can also access via lazy import
    // We'll just use the admin_audit_logs collection directly from db connection.
    const mongoose = (global as any).mongoose;
    const connectionDb = mongoose?.connection?.db;
    const database = connectionDb || db;

    if (!database) {
      return NextResponse.json({ success: false, message: "Database not connected" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(50, Number(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (q) {
      filter.$or = [
        { userEmail: { $regex: q, $options: "i" } },
        { action: { $regex: q, $options: "i" } },
        { ip: { $regex: q, $options: "i" } },
        { "meta.target": { $regex: q, $options: "i" } },
        { "meta.resource": { $regex: q, $options: "i" } },
      ];
    }

    const total = await database.collection("admin_audit_logs").countDocuments(filter);
    const logs = await database
      .collection("admin_audit_logs")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      data: logs.map((l: any) => ({
        id: String(l._id),
        createdAt: l.createdAt,
        administrator: l.userEmail || "-",
        actionPerformed: l.action || "-",
        targetResource: l.meta?.target || l.meta?.resource || "-",
        ipAddress: l.ip || "-",
        status: l.meta?.status || "Success",
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

