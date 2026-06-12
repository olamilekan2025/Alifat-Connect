import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import SupportTicket from "@/models/SupportTicket";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import { generateAutoReply } from "@/lib/support-bot";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    // ✅ FormData (because frontend uses FormData)
    const formData = await request.formData();

    const name = getString(formData, "name");
    const email = getString(formData, "email");
    const phone = getString(formData, "phone");
    const subject = getString(formData, "subject");
    const message = getString(formData, "message");
    const category = getString(formData, "category");

    // 📎 FILE (NEW)
    const file = formData.get("file") as File | null;

    const ticketId = `SUP-${Date.now()}`;

    // ✅ validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        {
          success: false,
          error: "Please fill all required fields",
        },
        { status: 400 }
      );
    }

    // ☁️ CLOUDINARY UPLOAD (NEW)
    let attachmentUrl = "";

    if (file && file.size > 0) {
      try {
        const result: any = await uploadToCloudinary(file);
        attachmentUrl = result.secure_url;
      } catch (uploadError) {
        console.error("CLOUDINARY ERROR:", uploadError);
      }
    }

    // 💾 SAVE TO DB
    const ticket = await SupportTicket.create({
       ticketId,
    name,
    email,
    phone,
    subject,
    message,
    category,

    autoReply,

    status: "unread",
  });

    // 📧 RESEND EMAIL (unchanged, safe)
    if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
      try {
        const { Resend } = await import("resend");

        const resend = new Resend(process.env.RESEND_API_KEY);

        const fromEmail =
          process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

        // Admin email
        await resend.emails.send({
          from: fromEmail,
          to: process.env.ADMIN_EMAIL,
          subject: `New Support Ticket: ${ticketId}`,
          html: `
            <h2>New Support Ticket</h2>

            <p><strong>ID:</strong> ${ticketId}</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || "N/A"}</p>
            <p><strong>Category:</strong> ${category || "General"}</p>

            <p><strong>Message:</strong></p>
            <p>${message}</p>

            ${
              attachmentUrl
                ? `<p><strong>Attachment:</strong> <a href="${attachmentUrl}">View File</a></p>`
                : ""
            }
          `,
        });

        // User email
        await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: "Support Ticket Received",
          html: `
            <h2>We received your message</h2>

            <p>Your ticket ID:</p>
            <h1>${ticketId}</h1>

            <p>We will respond shortly.</p>
          `,
        });
      } catch (emailError) {
        console.error("EMAIL ERROR:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      ticketId,
      ticket,
      attachment: attachmentUrl,
    });
  } catch (error) {
    console.error("SUPPORT TICKET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create ticket",
      },
      { status: 500 }
    );
  }
}