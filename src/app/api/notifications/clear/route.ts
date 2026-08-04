import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { clearNotifications } from "@/lib/notifications";

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const count = await clearNotifications(session.user.id, "user");

    return NextResponse.json({
      success: true,
      message: "All notifications cleared",
      count,
    });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
