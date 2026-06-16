import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

import Notification from "@/models/Notification";

export async function GET() {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load notifications",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const notification = await Notification.create({
      title: body.title,
      message: body.message,
      audience: body.audience ?? "all",
      priority: body.priority ?? "normal",
      actionText: body.actionText,
      actionUrl: body.actionUrl,
      status: body.status ?? "draft",
      scheduledFor: body.scheduledFor,
      targetUserId: body.targetUserId,
    });

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create notification",
      },
      { status: 500 }
    );
  }
}