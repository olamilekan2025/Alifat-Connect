import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";

import User from "@/models/User";

import PasswordResetCode from "@/models/password-reset-code";

import { sendPasswordResetCode } from "@/lib/nodemailer";

const RESET_CODE_TTL_MS =
  10 * 60 * 1000;

export async function POST(
  req: Request
) {
  try {
    const body = await req.json();

    const email =
      body?.email
        ?.trim()
        ?.toLowerCase();

    if (!email) {
      return NextResponse.json(
        {
          error:
            "Email is required",
        },
        {
          status: 400,
        }
      );
    }

    // CONNECT DATABASE
    await connectToDatabase();

    // FIND USER
    const user =
      await User.findOne({
        email,
      });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Account does not exist",
        },
        {
          status: 404,
        }
      );
    }

    // DELETE OLD UNUSED CODES
    await PasswordResetCode.deleteMany(
      {
        email,
        usedAt: null,
      }
    );

    // GENERATE 6 DIGIT CODE
    const code = String(
      Math.floor(
        100000 +
          Math.random() *
            900000
      )
    );

    const expiresAt =
      new Date(
        Date.now() +
          RESET_CODE_TTL_MS
      );

    // SAVE RESET CODE
    await PasswordResetCode.create(
      {
        email,
        code,
        purpose:
          "reset-password",
        expiresAt,
        createdAt: new Date(),
        usedAt: null,
      }
    );

    // SEND EMAIL
    await sendPasswordResetCode(
      email,
      code
    );

    return NextResponse.json({
      ok: true,
      email,
      redirectTo: `/auth/reset-password?email=${encodeURIComponent(
        email
      )}`,
    });
  } catch (error) {
    console.error(
      "FORGOT PASSWORD ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Forgot password failed",
      },
      {
        status: 500,
      }
    );
  }
}