import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";

import Newsletter from "@/models/Newsletter";

export async function POST(
  request: Request
) {
  try {
    await connectToDatabase();

    const { email } =
      await request.json();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email is required",
        },
        { status: 400 }
      );
    }

    const cleanEmail = email
      .trim()
      .toLowerCase();

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailRegex.test(cleanEmail)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid email address",
        },
        { status: 400 }
      );
    }

    const existing =
      await Newsletter.findOne({
        email: cleanEmail,
      });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email already subscribed",
        },
        { status: 409 }
      );
    }

    await Newsletter.create({
      email: cleanEmail,
    });

    return NextResponse.json({
      success: true,
      message:
        "Successfully subscribed",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Internal server error",
      },
      { status: 500 }
    );
  }
}