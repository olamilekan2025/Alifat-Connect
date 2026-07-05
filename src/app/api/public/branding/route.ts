import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import AdminSettings from "@/models/AdminSettings";

export async function GET() {
  try {
    await connectToDatabase();

    const settings = await AdminSettings.findOne({}).lean();

    return NextResponse.json(
      {
        success: true,
        branding: settings?.branding || {},
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
