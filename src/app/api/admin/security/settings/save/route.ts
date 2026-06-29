// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";

// import { authOptions } from "@/lib/auth";
// import { connectToDatabase } from "@/lib/mongodb";

// import User from "@/models/User";
// import AdminSecuritySettings from "@/models/AdminSecuritySettings";

// export async function PUT(req: Request) {
//   await connectToDatabase();

//   const session = await getServerSession(authOptions);

//   if (!session?.user?.id)
//     return NextResponse.json({}, { status: 401 });

//   const admin = await User.findById(session.user.id);

//   if (!admin || admin.role !== "admin")
//     return NextResponse.json({}, { status: 403 });

//   const body = await req.json();

//   const updated =
//     await AdminSecuritySettings.findOneAndUpdate(
//       {
//         adminId: admin._id,
//       },
//       body,
//       {
//         new: true,
//         upsert: true,
//       }
//     );

//   return NextResponse.json(updated);
// }



import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

import User from "@/models/User";
import AdminSecuritySettings from "@/models/AdminSecuritySettings";

export async function PUT(req: Request) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const admin = await User.findById(
      (session.user as any).id
    );

    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Only allow these fields to be updated
    const updateData = {
      twoFA: body.twoFA,
      emailVerification: body.emailVerification,
      smsOtp: body.smsOtp,
      biometric: body.biometric,
      adminPin: body.adminPin,
      sessionTimeout: body.sessionTimeout,
      passwordPolicy: body.passwordPolicy,
      apiSecurity: body.apiSecurity,
      lockdown: body.lockdown,
      loginNotifications: body.loginNotifications,
      rememberDevices: body.rememberDevices,
      maxFailedAttempts: body.maxFailedAttempts,
      accountLockDuration: body.accountLockDuration,
    };

    const settings =
      await AdminSecuritySettings.findOneAndUpdate(
        {
          adminId: admin._id,
        },
        {
          $set: updateData,
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

    return NextResponse.json({
      success: true,
      authentication: settings?.toObject(),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}