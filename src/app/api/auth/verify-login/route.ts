import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = body?.email;
    const code = body?.code;
    const password = body?.password;

    if (!email || !code || !password) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    const users = db.collection("users");
    const loginCodes = db.collection(
      "loginVerificationCodes"
    );

    const user = await users.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // ADMIN ONLY
    if (user.role !== "Admin") {
      return NextResponse.json(
        {
          error:
            "Only admins require login verification",
        },
        { status: 403 }
      );
    }

    // PASSWORD CHECK
    const passwordMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // FIND CODE
    const codeDoc = await loginCodes.findOne({
      email,
      code,
      purpose: "verify-login",
      usedAt: null,
    });

    if (!codeDoc) {
      return NextResponse.json(
        { error: "Invalid code" },
        { status: 400 }
      );
    }

    // EXPIRED?
    if (
      new Date(codeDoc.expiresAt) <
      new Date()
    ) {
      return NextResponse.json(
        { error: "Code expired" },
        { status: 400 }
      );
    }

    // MARK USED
    await loginCodes.updateOne(
      { _id: codeDoc._id },
      {
        $set: {
          usedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      ok: true,
      role: user.role,
      redirectTo: "/admin/dashboard",
    });
  } catch (error) {
    console.error(
      "VERIFY LOGIN ERROR:",
      error
    );

    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}