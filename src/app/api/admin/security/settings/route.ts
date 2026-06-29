import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

import User from "@/models/User";
import AdminSecuritySettings from "@/models/AdminSecuritySettings";

export async function GET() {
  await connectToDatabase();

  const session = await getServerSession(authOptions);

  if (!session?.user?.id)
    return NextResponse.json({}, { status: 401 });

  const admin = await User.findById(session.user.id);

  if (!admin || admin.role !== "admin")
    return NextResponse.json({}, { status: 403 });

  let settings =
    await AdminSecuritySettings.findOne({
      adminId: admin._id,
    });

  if (!settings) {
    settings =
      await AdminSecuritySettings.create({
        adminId: admin._id,
      });
  }

  return NextResponse.json(settings);
}