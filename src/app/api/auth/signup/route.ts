import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";

import { connectToDatabase } from "@/lib/mongodb";

import { sendEmailVerificationCode } from "@/lib/nodemailer";

import { createReservedAccount } from "@/lib/monnify";

import User from "@/models/User";
import VirtualAccount from "@/models/VirtualAccount";
import { generateReferralCode } from "@/lib/referral";

const EMAIL_CODE_TTL_MS =
  10 * 60 * 1000;

export async function POST(
  req: Request
) {
  try {
    const body = await req.json();

    const firstname =
      body?.firstname?.trim();

    const lastname =
      body?.lastname?.trim();

    const address =
      body?.address?.trim();

    const phone =
      body?.phone?.trim();

    const email = body?.email
      ?.trim()
      ?.toLowerCase();

    const password =
      body?.password?.trim();

    // VALIDATION

    if (
      !firstname ||
      !lastname ||
      !address ||
      !phone ||
      !email ||
      !password
    ) {
      return NextResponse.json(
        {
          error:
            "All fields are required",
        },
        {
          status: 400,
        }
      );
    }

    // EMAIL VALIDATION

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error:
            "Invalid email address",
        },
        {
          status: 400,
        }
      );
    }

    // PASSWORD VALIDATION

    if (password.length < 6) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 6 characters",
        },
        {
          status: 400,
        }
      );
    }

    // CONNECT DATABASE

    await connectToDatabase();

    // CHECK IF USER EXISTS

    const existingUser =
      await User.findOne({
        email,
      });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "Account already exists",
        },
        {
          status: 409,
        }
      );
    }

    // HASH PASSWORD

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    // GENERATE CODE

    const code = String(
      Math.floor(
        100000 +
          Math.random() * 900000
      )
    );

    // CREATE USER

    const user = new User({
  name: `${firstname} ${lastname}`,

  firstname,

  lastname,

  address,

  phone,

  email,

  password: hashedPassword,

  role: "user",

  walletBalance: 0,

  emailVerified: false,

  referralCode: generateReferralCode(
    `${firstname}${lastname}`
  ),

  loginVerificationCode: code,

  loginVerificationExpires: new Date(
    Date.now() + EMAIL_CODE_TTL_MS
  ),
});

    await user.save();

    console.log(
      "USER CREATED:",
      String(user._id)
    );

    // CREATE MONNIFY RESERVED ACCOUNT

    try {
      const monnifyAccount =
        await createReservedAccount(
          {
            email,
            name: `${firstname} ${lastname}`,
          }
        );

      console.log(
        "MONNIFY RESPONSE:",
        JSON.stringify(
          monnifyAccount,
          null,
          2
        )
      );

      if (
        monnifyAccount?.accounts &&
        Array.isArray(
          monnifyAccount.accounts
        ) &&
        monnifyAccount.accounts.length >
          0
      ) {
        const firstBank =
          monnifyAccount.accounts[0];

        const savedAccount =
          await VirtualAccount.create(
            {
              userId: user._id,

              bankName:
                firstBank.bankName,

              accountName:
                monnifyAccount.accountName,

              accountNumber:
                firstBank.accountNumber,

              provider:
                "Monnify",
            }
          );

        console.log(
          "VIRTUAL ACCOUNT SAVED:",
          savedAccount
        );
      } else {
        console.error(
          "No bank accounts returned from Monnify"
        );
      }
    } catch (monnifyError) {
      console.error(
        "MONNIFY ERROR:",
        monnifyError
      );
    }

    // SEND VERIFICATION EMAIL

    try {
      await sendEmailVerificationCode(
        email,
        code
      );

      console.log(
        "Verification email sent"
      );
    } catch (emailError) {
      console.error(
        "EMAIL ERROR:",
        emailError
      );
    }

    return NextResponse.json(
      {
        ok: true,

        email,

        message:
          "Signup successful. Verification code sent.",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "SIGNUP ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Signup failed",
      },
      {
        status: 500,
      }
    );
  }
}