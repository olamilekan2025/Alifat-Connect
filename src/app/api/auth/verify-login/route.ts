// import { NextResponse } from "next/server";
// import { compare } from "bcrypt-ts"; // Safe for all Production/Serverless/Edge runtimes
// import { connectToDatabase } from "@/lib/mongodb";
// import { sendLoginVerificationCode } from "@/lib/nodemailer";

// // ==========================================
// // 1. POST: VERIFY CODE & PASSWORD
// // ==========================================
// export async function POST(req: Request) {
//   try {
//     const { email, code, password } = await req.json();

//     if (!email || !code || !password) {
//       return NextResponse.json(
//         { error: "Email, code and password are required" },
//         { status: 400 }
//       );
//     }

//     const db = await connectToDatabase();
//     const users = db.connection.collection("users");
//     const loginCodes = db.connection.collection("loginVerificationCodes");

//     const user = await users.findOne({
//       email: email.trim().toLowerCase(),
//     });

//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     // ADMIN ONLY
//     const role = String(user.role || "").toLowerCase();
//     if (role !== "admin") {
//       return NextResponse.json(
//         { error: "Only admins require login verification" },
//         { status: 403 }
//       );
//     }

//     // ACCOUNT VERIFIED
//     if (!user.emailVerified) {
//       return NextResponse.json(
//         { error: "Please verify your email first" },
//         { status: 403 }
//       );
//     }

//     // PASSWORD CHECK
//     if (!user.password) {
//       return NextResponse.json(
//         { error: "Password not found" },
//         { status: 400 }
//       );
//     }

//     // Fixed compare using production-stable package
//     const passwordMatch = await compare(password, user.password);

//     if (!passwordMatch) {
//       return NextResponse.json({ error: "Invalid password" }, { status: 401 });
//     }

//     // FIND OTP
//     const codeDoc = await loginCodes.findOne({
//       email: email.trim().toLowerCase(),
//       code: code.trim(),
//       purpose: "verify-login",
//       usedAt: null,
//     });

//     if (!codeDoc) {
//       return NextResponse.json(
//         { error: "Invalid verification code" },
//         { status: 400 }
//       );
//     }

//     // CHECK EXPIRY
//     if (new Date(codeDoc.expiresAt) < new Date()) {
//       return NextResponse.json(
//         { error: "Verification code expired" },
//         { status: 400 }
//       );
//     }

//     // MARK CODE USED
//     await loginCodes.updateOne(
//       { _id: codeDoc._id },
//       { $set: { usedAt: new Date() } }
//     );

//     // STORE VERIFIED LOGIN FLAG
//     await users.updateOne(
//       { _id: user._id },
//       {
//         $set: {
//           adminLoginVerified: true,
//           adminLoginVerifiedAt: new Date(),
//         },
//       }
//     );

//     return NextResponse.json({
//       success: true,
//       role: "admin",
//       redirectTo: "/admin",
//     });
//   } catch (error) {
//     console.error("VERIFY LOGIN ERROR:", error);
//     return NextResponse.json(
//       { error: "Verification failed" },
//       { status: 500 }
//     );
//   }
// }

// // ==========================================
// // 2. GET: RESEND VERIFICATION CODE
// // ==========================================
// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const email = searchParams.get("email");

//     if (!email) {
//       return NextResponse.json(
//         { error: "Email is required" },
//         { status: 400 }
//       );
//     }

//     const normalizedEmail = email.trim().toLowerCase();

//     const db = await connectToDatabase();

//     const users = db.connection.collection("users");
//     const loginCodes = db.connection.collection(
//       "loginVerificationCodes"
//     );

//     // Verify user exists
//     const user = await users.findOne({
//       email: normalizedEmail,
//     });

//     if (!user) {
//       return NextResponse.json(
//         { error: "User not found" },
//         { status: 404 }
//       );
//     }

//     // Admin only
//     if (String(user.role || "").toLowerCase() !== "admin") {
//       return NextResponse.json(
//         {
//           error:
//             "Only admins can receive login verification codes",
//         },
//         { status: 403 }
//       );
//     }

//     // Email must already be verified
//     if (!user.emailVerified) {
//       return NextResponse.json(
//         {
//           error: "Please verify your email first",
//         },
//         { status: 403 }
//       );
//     }

//     // Generate OTP
//     const newCode = Math.floor(
//       100000 + Math.random() * 900000
//     ).toString();

//     const expiresAt = new Date(
//       Date.now() + 10 * 60 * 1000
//     );

//     // Invalidate previous unused codes
//     await loginCodes.updateMany(
//       {
//         email: normalizedEmail,
//         purpose: "verify-login",
//         usedAt: null,
//       },
//       {
//         $set: {
//           usedAt: new Date(),
//         },
//       }
//     );

//     // Save new code
//     await loginCodes.insertOne({
//       email: normalizedEmail,
//       code: newCode,
//       purpose: "verify-login",
//       createdAt: new Date(),
//       expiresAt,
//       usedAt: null,
//     });


//     const sent =
//   await sendLoginVerificationCode(
//     normalizedEmail,
//     newCode
//   );

// if (!sent) {
//   return NextResponse.json(
//     {
//       error:
//         "Failed to send verification email.",
//     },
//     { status: 500 }
//   );
// }

//     // ==================================================
//     // SEND EMAIL HERE USING YOUR EXISTING EMAIL FUNCTION
//     //
//     // Example:
//     //
//     // await sendEmail({
//     //   to: normalizedEmail,
//     //   subject: "Admin Login Verification Code",
//     //   html: `<p>Your verification code is <strong>${newCode}</strong></p>`,
//     // });
//     //
//     // ==================================================

//     // Temporary development log
//     console.log(
//       `Admin login OTP for ${normalizedEmail}: ${newCode}`
//     );

//     return NextResponse.json({
//       success: true,
//       message: "Verification code generated successfully.",
//     });
//   } catch (error) {
//     console.error(
//       "RESEND CODE ERROR:",
//       error
//     );

//     return NextResponse.json(
//       {
//         error: "Failed to resend code",
//       },
//       { status: 500 }
//     );
//   }
// }





import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";

const GRANT_TTL_MS = 2 * 60 * 1000;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const email = String(body?.email ?? "").trim().toLowerCase();
    const code = String(body?.code ?? "").trim();
    const password = String(body?.password ?? "");

    if (!email || !code || !password) {
      return NextResponse.json(
        { error: "Email, verification code and password are required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "Please provide a valid email and six-digit code." },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const users = db.connection.collection("users");
    const loginCodes = db.connection.collection("loginVerificationCodes");
    const grants = db.connection.collection("adminLoginGrants");

    const user = await users.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email, password or verification code." },
        { status: 401 }
      );
    }

    if (String(user.role ?? "").toLowerCase() !== "admin") {
      return NextResponse.json(
        { error: "This account does not require admin verification." },
        { status: 403 }
      );
    }

    if (user.emailVerified !== true) {
      return NextResponse.json(
        { error: "Please verify your email address first." },
        { status: 403 }
      );
    }

    if (typeof user.password !== "string" || !user.password) {
      return NextResponse.json(
        { error: "This account does not have a valid password." },
        { status: 400 }
      );
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return NextResponse.json(
        { error: "Invalid email, password or verification code." },
        { status: 401 }
      );
    }

    const now = new Date();

    const codeDoc = await loginCodes.findOne({
      email,
      userId: user._id,
      code,
      purpose: "verify-login",
      usedAt: null,
      expiresAt: { $gt: now },
    });

    if (!codeDoc) {
      return NextResponse.json(
        { error: "Invalid, expired or already-used verification code." },
        { status: 400 }
      );
    }

    // Atomically consume the OTP. Only one request can successfully use it.
    const consumed = await loginCodes.updateOne(
      {
        _id: codeDoc._id,
        email,
        userId: user._id,
        code,
        purpose: "verify-login",
        usedAt: null,
        expiresAt: { $gt: new Date() },
      },
      { $set: { usedAt: new Date() } }
    );

    if (consumed.modifiedCount !== 1) {
      return NextResponse.json(
        { error: "This verification code has already been used or expired." },
        { status: 400 }
      );
    }

    // Return the raw grant only once. Store its hash in MongoDB.
    const grantToken = randomBytes(32).toString("hex");
    const grantCreatedAt = new Date();

    await grants.insertOne({
      tokenHash: hashToken(grantToken),
      email,
      userId: user._id,
      purpose: "admin-login",
      createdAt: grantCreatedAt,
      expiresAt: new Date(grantCreatedAt.getTime() + GRANT_TTL_MS),
      usedAt: null,
    });

    return NextResponse.json({
      success: true,
      grantToken,
      message: "Verification successful. Completing sign-in.",
    });
  } catch (error) {
    console.error("VERIFY LOGIN ERROR:", error);

    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
