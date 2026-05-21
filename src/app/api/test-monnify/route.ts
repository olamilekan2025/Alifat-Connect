import { NextResponse } from "next/server";

import { getMonnifyToken } from "@/lib/monnify";

export async function GET() {
  try {
    const token =
      await getMonnifyToken();

    return NextResponse.json({
      success: true,
      token,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}