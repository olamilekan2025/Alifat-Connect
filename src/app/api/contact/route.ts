import { NextResponse } from "next/server";
import Contact from "@/models/Contact";
import { connectToDatabase } from "@/lib/mongodb";
import { generateAutoReply } from "@/lib/support-bot";

function getString(
  formData: FormData,
  key: string
): string {
  const value = formData.get(key);

  return typeof value === "string"
    ? value.trim()
    : "";
}

export async function POST(
  request: Request
) {
  try {
    await connectToDatabase();

    console.log(
      "✅ Contact API Request Received"
    );

    const formData =
      await request.formData();

    const name = getString(
      formData,
      "name"
    );

    const email = getString(
      formData,
      "email"
    );

    const phone = getString(
      formData,
      "phone"
    );

    const subject = getString(
      formData,
      "subject"
    );

    const message = getString(
      formData,
      "message"
    );

    const category = getString(
      formData,
      "category"
    );

    const autoReply =
  generateAutoReply(
    subject,
    message
  );

    const file =
      formData.get("file");

    console.log({
      name,
      email,
      phone,
      subject,
      message,
      category,
      hasFile: !!file,
    });

    if (
      !name ||
      !email ||
      !subject ||
      !message
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please complete all required fields",
        },
        { status: 400 }
      );
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid email address",
        },
        { status: 400 }
      );
    }

    const ticketId = `SUP-${Date.now()}`;

    const contactData = {
      ticketId,
      name,
      email,
      phone,
      category,
      subject,
      message,
      status: "Open",
    } as any;

    const contact = await Contact.create(contactData);

    console.log(
      "✅ Ticket Created:",
      contact.ticketId
    );

    return NextResponse.json({
      success: true,
      ticketId,
      message:
        "Support request submitted successfully",
    });
  } catch (error) {
    console.error(
      "❌ CONTACT API ERROR:",
      error instanceof Error
        ? error.stack
        : error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}