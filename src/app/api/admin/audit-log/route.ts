import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const database = (await connectToDatabase())?.connection?.db;

    if (!database) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    await database.collection("admin_audit_logs").insertOne({
      userEmail: session.user.email,
      action: body.action,
      meta: body.meta || {},
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Audit log failed" },
      { status: 500 }
    );
  }
}