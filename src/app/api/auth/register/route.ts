// /app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { generateReferralCode } from "@/lib/referral";
import { processReferral } from "@/lib/referral-tracking";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const { name, email, password, referralCode } = await req.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // CREATE USER FIRST
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      referralCode: generateReferralCode(name),
    });

    // PROCESS REFERRAL
    if (referralCode) {
      const referralResult = await processReferral(
        String(user._id),
        referralCode
      );

      if (referralResult.success) {
        console.log("REFERRAL PROCESSED:", referralResult);
      } else {
        console.log("REFERRAL PROCESSING FAILED:", referralResult.message);
        // Don't fail registration if referral processing fails
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        referralCode: user.referralCode,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}