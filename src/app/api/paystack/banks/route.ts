import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response =
      await fetch(
        "https://api.paystack.co/bank",
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );

    const data =
      await response.json();

    return NextResponse.json({
      banks: data.data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Failed to fetch banks",
      },
      {
        status: 500,
      }
    );
  }
}