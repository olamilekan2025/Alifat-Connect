import { NextResponse } from "next/server";

// Server-controlled pricing matrix to prevent client-side tampering
const PRICES: Record<string, number> = {
  waec: 3500,
  neco: 1200,
  jamb: 4700,
  nabteb: 3000,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, profileId, quantity } = body;

    // 1. Validation Checks
    if (!provider || !profileId || !quantity) {
      return NextResponse.json(
        { success: false, error: "All fields are required." },
        { status: 400 }
      );
    }

    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 5) {
      return NextResponse.json(
        { success: false, error: "Invalid quantity selection." },
        { status: 400 }
      );
    }

    const cleanProvider = provider.toLowerCase();
    const unitPrice = PRICES[cleanProvider];
    
    if (!unitPrice) {
      return NextResponse.json(
        { success: false, error: "Invalid exam provider selection." },
        { status: 400 }
      );
    }

    // 2. Calculate Total Cost
    const totalCost = unitPrice * parsedQuantity;

    /**
     * 3. BACKEND INTEGRATION PLACEHOLDER
     * This is where you would normally:
     * a) Check your database for the user's active wallet balance
     * b) Confirm balance >= totalCost
     * c) Deduct the money from the user account
     * d) Hit your third-party VTU Provider API endpoint (e.g., via Axios/Fetch)
     */

    // Mocking a successful processing delay & response structure
    const referenceId = `EDU-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    
    // Generate mock serial numbers and pins based on requested quantity
    const generatedTokens = Array.from({ length: parsedQuantity }, () => ({
      pin: Math.floor(100000000000 + Math.random() * 900000000000).toString(),
      serial: `SN-${Math.floor(100000 + Math.random() * 900000)}`
    }));

    return NextResponse.json(
      {
        success: true,
        message: "Purchase completed successfully",
        data: {
          transactionId: referenceId,
          provider: cleanProvider,
          totalDebited: totalCost,
          items: generatedTokens,
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected internal server error occurred." },
      { status: 500 }
    );
  }
}