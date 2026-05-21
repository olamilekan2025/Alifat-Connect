import {
  NextRequest,
  NextResponse,
} from "next/server";

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const {
      bankCode,
      accountNumber,
    } = body;

    // VALIDATION
    if (
      !bankCode ||
      !accountNumber
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Bank code and account number are required",
        },
        {
          status: 400,
        }
      );
    }

    // TEST MODE FALLBACK
    // PAYSTACK ONLY ALLOWS LIMITED TEST RESOLVES

    if (
      process.env
        .PAYSTACK_SECRET_KEY?.startsWith(
          "sk_test"
        )
    ) {
      // USE PAYSTACK TEST BANK
      if (bankCode !== "001") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Use bank code 001 in test mode",
          },
          {
            status: 400,
          }
        );
      }

      return NextResponse.json({
        success: true,

        accountName:
          "Test Account",
      });
    }

    // LIVE MODE REQUEST
    const response =
      await fetch(
        `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,

            "Content-Type":
              "application/json",
          },

          cache: "no-store",
        }
      );

    // HANDLE FAILED RESPONSE
    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to verify account right now",
        },
        {
          status: 400,
        }
      );
    }

    // SAFE RESPONSE PARSE
    const text =
      await response.text();

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Empty response from Paystack",
        },
        {
          status: 400,
        }
      );
    }

    const data =
      JSON.parse(text);

    console.log(
      "BANK VERIFY RESPONSE:",
      data
    );

    // HANDLE PAYSTACK ERRORS
    if (!data.status) {
      return NextResponse.json(
        {
          success: false,
          message:
            data.message ||
            "Account verification failed",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json({
      success: true,

      accountName:
        data.data.account_name,
    });
  } catch (error) {
    console.error(
      "BANK VERIFY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to verify account right now",
      },
      {
        status: 500,
      }
    );
  }
}