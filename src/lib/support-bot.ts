import { supportFAQs } from "@/lib/support-faq";

export function generateAutoReply(
  subject: string,
  message: string
) {
  const text =
    `${subject} ${message}`.toLowerCase();

  const match = supportFAQs.find((faq) =>
    faq.keywords.some((keyword) =>
      text.includes(keyword.toLowerCase())
    )
  );

  if (match) {
    return match.reply;
  }

  return `
Thank you for contacting Alifat Connect Support.

Your request has been received successfully.

A support representative will review your issue and respond shortly.

Please keep your ticket ID for future reference.
  `;
}