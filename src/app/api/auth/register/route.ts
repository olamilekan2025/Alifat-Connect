// /app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { generateReferralCode } from "@/lib/referral";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const { name, email, password, referralCode } = await req.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

  // FIND INVITER
let inviter = null;

if (referralCode) {
  inviter = await User.findOne({ referralCode });
}

// CREATE USER FIRST
const user = await User.create({
  name,
  email,
  password: hashedPassword,
  referralCode: generateReferralCode(name),
  referredBy: inviter ? inviter.referralCode : null,
});

// ❌ PREVENT SELF REFERRAL
if (inviter && inviter._id.toString() === user._id.toString()) {
  return NextResponse.json(
    { error: "Self-referral not allowed" },
    { status: 400 }
  );
}

// HANDLE REFERRAL REWARD
if (inviter) {
  const reward = 500;

  inviter.referralsCount = (inviter.referralsCount || 0) + 1;
  inviter.referralEarnings = (inviter.referralEarnings || 0) + reward;
  inviter.walletBalance = (inviter.walletBalance || 0) + reward;

  // referralHistory may not be defined on the TS type for inviter; handle safely
  const referralHistory = (inviter as any).referralHistory || [];
  referralHistory.push({
    userId: user._id.toString(),
    name: user.name,
    reward,
  });
  (inviter as any).referralHistory = referralHistory;

  await inviter.save();
}

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        referralCode: user.referralCode,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}