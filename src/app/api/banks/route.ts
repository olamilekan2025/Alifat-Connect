import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://api.paystack.co/bank?country=nigeria",
      {
        method: "GET",

        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,

          "Content-Type": "application/json",
        },

        cache: "no-store",
      }
    );

    // HANDLE FAILED RESPONSE
    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch banks",
          data: [],
        },
        {
          status: 400,
        }
      );
    }

    // SAFELY GET TEXT
    const text =
      await response.text();

    // EMPTY RESPONSE FIX
    if (!text) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Empty response from Paystack",
          data: [],
        },
        {
          status: 400,
        }
      );
    }

    // PARSE JSON SAFELY
    const data = JSON.parse(text);

    return NextResponse.json({
      success: true,

      data: data.data || [],
    });
  } catch (error) {
    console.error(
      "FETCH BANKS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to fetch banks",
        data: [],
      },
      {
        status: 500,
      }
    );
  }
}