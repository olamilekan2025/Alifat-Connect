// // app/api/auth/resend-verification-code/route.ts

// import { NextResponse } from "next/server";

// import { connectToDatabase } from "@/lib/mongodb";
// import { sendEmailVerificationCode } from "@/lib/nodemailer";

// const EMAIL_CODE_TTL_MS = 10 * 60 * 1000;

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();

//     const email =
//       body?.email?.trim()?.toLowerCase();

//     if (!email) {
//       return NextResponse.json(
//         { error: "Missing email" },
//         { status: 400 }
//       );
//     }

//     const db = await connectToDatabase();

//     // connectToDatabase returns the mongoose instance; get native db
//     const nativeDb = (db as any).connection?.db || (db as any).db;

//     const users = nativeDb.collection("users");

//     const emailCodes = nativeDb.collection(
//       "emailVerificationCodes"
//     );

//     const user = await users.findOne({
//       email,
//     });

//     // Don't expose whether account exists
//     if (!user) {
//       return NextResponse.json(
//         {
//           ok: true,
//           message:
//             "If the account exists, a verification code has been sent",
//         },
//         { status: 200 }
//       );
//     }

//     if (user.emailVerified) {
//       return NextResponse.json(
//         {
//           error: "Email already verified",
//         },
//         { status: 400 }
//       );
//     }

//     // Generate 6-digit code
//     const code = Math.floor(
//       100000 + Math.random() * 900000
//     ).toString();

//     const expiresAt = new Date(
//       Date.now() + EMAIL_CODE_TTL_MS
//     );

//     // Remove old unused codes
//     await emailCodes.deleteMany({
//       email,
//       purpose: "verify-email",
//     });

//     // Save new code
//     await emailCodes.insertOne({
//       email,
//       code,
//       userId: user._id,
//       purpose: "verify-email",
//       expiresAt,
//       createdAt: new Date(),
//       usedAt: null,
//     });

//     // Send email
//     await sendEmailVerificationCode(
//       email,
//       code
//     );

//     return NextResponse.json(
//       {
//         ok: true,
//         message:
//           "Verification code resent successfully",
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error(
//       "RESEND_VERIFICATION_CODE_ERROR:",
//       error
//     );

//     return NextResponse.json(
//       {
//         error:
//           "Resend email code failed",
//       },
//       { status: 500 }
//     );
//   }
// }




import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { sendEmailVerificationCode } from "@/lib/nodemailer";

const EMAIL_CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (!email) {
      return NextResponse.json(
        {
          error: "Email is required",
        },
        {
          status: 400,
        }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    // Already verified
    if (user.emailVerified) {
      return NextResponse.json(
        {
          success: true,
          message: "Email is already verified.",
        },
        {
          status: 200,
        }
      );
    }

    // Generate a new 6-digit code
    const code = String(
      Math.floor(100000 + Math.random() * 900000)
    );

    // Save the new code and expiry
    user.loginVerificationCode = code;
    user.loginVerificationExpires = new Date(
      Date.now() + EMAIL_CODE_TTL_MS
    );

    await user.save();

    // Send the email
    await sendEmailVerificationCode(email, code);

    return NextResponse.json(
      {
        success: true,
        message: "Verification code sent successfully.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "RESEND VERIFICATION CODE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to resend verification code",
      },
      {
        status: 500,
      }
    );
  }
}