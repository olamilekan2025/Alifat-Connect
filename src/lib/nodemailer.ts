import nodemailer from "nodemailer";

// VALIDATE ENV VARIABLES FIRST
const requiredEnv = [
  "EMAIL_SERVER_USER",
  "EMAIL_SERVER_PASSWORD",
  "FROM_EMAIL",
];

requiredEnv.forEach((env) => {
  if (!process.env[env]) {
    throw new Error(`Missing environment variable: ${env}`);
  }
});


console.log({
  EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
  EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD ? "SET" : "MISSING",
  FROM_EMAIL: process.env.FROM_EMAIL,
});
// CREATE TRANSPORTER

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",

  port: 465,

  secure: true,

  auth: {
    user: process.env.EMAIL_SERVER_USER!,
    pass: process.env.EMAIL_SERVER_PASSWORD!,
  },

  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000,
});

// // VERIFY SMTP CONNECTION
// transporter.verify((error) => {
//   if (error) {
//     console.error("❌ SMTP CONNECTION ERROR:", error);
//   } else {
//     console.log("✅ SMTP SERVER READY");
//   }
// });

/**
 * GENERIC EMAIL SENDER
 */
export async function sendEmail(
  options: nodemailer.SendMailOptions,
): Promise<boolean> {
  try {
    const info =
      await transporter.sendMail({
        from:
          process.env.FROM_EMAIL,

        ...options,
      });

    console.log(
      "✅ EMAIL SENT:",
      info.messageId,
    );

    return true;
  } catch (error: any) {
  console.error({
    code: error.code,
    command: error.command,
    response: error.response,
    responseCode: error.responseCode,
    message: error.message,
  });


    return false;
  }
}





/**
 * Helper template to wrap common structures and keep code DRY.
 * Handles the HTML boilerplate, mobile responsiveness, and layout limits.
 */
function getEmailWrapper(contentHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Notification</title>
  <style>
    @media only screen and (max-width: 620px) {
      .email-body { padding: 16px !important; }
      .email-card { padding: 24px !important; border-radius: 8px !important; }
      .code-display { font-size: 28px !important; letter-spacing: 4px !important; padding: 16px !important; }
      .email-heading { font-size: 22px !important; }
    }
  </style>
</head>
<body class="email-body" style="
  margin: 0;
  padding: 40px;
  background-color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
">
  <div class="email-card" style="
    max-width: 560px;
    margin: 0 auto;
    background-color: #D4AF37;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    border: 1px solid #e2e8f0;
    text-align: center;
  ">
    ${contentHtml}
    
    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0 16px 0;" />
    <p style="font-size: 12px; color: #f2f4f6; margin: 0; line-height: 1.5;">
      If you did not request this email, you can safely ignore it.
    </p>
  </div>
</body>
</html>
`;
}

/**
 * SEND EMAIL VERIFICATION CODE
 */
export async function sendEmailVerificationCode(
  email: string,
  code: string,
): Promise<boolean> {
  const innerContent = `
    <h1 class="email-heading" style="color: #0f172a; font-size: 26px; font-weight: 700; margin: 0 0 16px 0; -webkit-font-smoothing: antialiased;">📧 Verify Your Email</h1>
    <p style="color: #f2f4f6; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Use the verification code below to verify and activate your account.
    </p>
    <div class="code-display" style="
      font-size: 34px;
      font-weight: 700;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      letter-spacing: 6px;
      background-color: #f0f9ff;
      color: #0284c7;
      padding: 20px;
      border-radius: 8px;
      margin: 24px 0;
      border: 2px dashed #000;
    ">
      ${code}
    </div>
    <p style="color: #f2f4f6; font-size: 14px; margin: 0;">
      This code expires in <strong style="color: #0f172a; font-weight: 600;">10 minutes</strong>.
    </p>
  `;

  return await sendEmail({
    to: email,
    subject: "Verify Your Email",
    html: getEmailWrapper(innerContent),
  });
}

/**
 * SEND LOGIN VERIFICATION CODE
 */
export async function sendLoginVerificationCode(
  email: string,
  code: string,
): Promise<boolean> {
  const innerContent = `
    <h1 class="email-heading" style="color: #0f172a; font-size: 26px; font-weight: 700; margin: 0 0 16px 0; -webkit-font-smoothing: antialiased;">🔐 Login Verification</h1>
    <p style="color: #f2f4f6; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Use the code below to complete your login verification.
    </p>
    <div class="code-display" style="
      font-size: 34px;
      font-weight: 700;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      letter-spacing: 6px;
      background-color: white;
      color: #0f172a;
      padding: 20px;
      border-radius: 8px;
      margin: 24px 0;
      border: 2px dashed #000;
    ">
      ${code}
    </div>
    <p style="color: #f2f4f6; font-size: 14px; margin: 0;">
      This code expires in <strong style="color: #0f172a; font-weight: 600;">5 minutes</strong>.
    </p>
  `;

  return await sendEmail({
    to: email,
    subject: "Login Verification Code",
    html: getEmailWrapper(innerContent),
  });
}

/**
 * SEND PASSWORD RESET CODE
 */
export async function sendPasswordResetCode(
  email: string,
  code: string,
): Promise<boolean> {
  const innerContent = `
    <h1 class="email-heading" style="color: #0f172a; font-size: 26px; font-weight: 700; margin: 0 0 16px 0; -webkit-font-smoothing: antialiased;">🔑 Reset Password</h1>
    <p style="color: #fafbfd; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Use the security verification code below to reset your password.
    </p>
    <div class="code-display" style="
      font-size: 34px;
      font-weight: 700;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      letter-spacing: 6px;
      background-color: #fef2f2;
      color: #dc2626;
      padding: 20px;
      border-radius: 8px;
      margin: 24px 0;
      border: 2px dashed #dc2626;
    ">
      ${code}
    </div>
    <p style="color: #f3f6f9; font-size: 14px; margin: 0;">
      This code expires in <strong style="color: #0f172a; font-weight: 600;">10 minutes</strong>.
    </p>
  `;

  return await sendEmail({
    to: email,
    subject: "Reset Password Code",
    html: getEmailWrapper(innerContent),
  });
}

/**
 * SEND PAYMENT PIN RESET CODE
 */
export async function sendPaymentPinResetCode(
  email: string,
  code: string,
): Promise<boolean> {
  const innerContent = `
    <h1 class="email-heading" style="color: #0f172a; font-size: 26px; font-weight: 700; margin: 0 0 16px 0; -webkit-font-smoothing: antialiased;">🔐 Reset Payment PIN</h1>
    <p style="color: #f8fafc; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Use the verification code below to update your payment security PIN.
    </p>
    <div class="code-display" style="
      font-size: 34px;
      font-weight: 700;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      letter-spacing: 6px;
      background-color: #f0fdf4;
      color: #16a34a;
      padding: 20px;
      border-radius: 8px;
      margin: 24px 0;
      border: 2px dashed #000;
    ">
      ${code}
    </div>
    <p style="color: #f5f7fa; font-size: 14px; margin: 0;">
      This code expires in <strong style="color: #0f172a; font-weight: 600;">10 minutes</strong>.
    </p>
  `;

  return await sendEmail({
    to: email,
    subject: "Reset Payment PIN",
    html: getEmailWrapper(innerContent),
  });
}

/**
 * SEND WELCOME EMAIL
 */
export async function sendWelcomeEmail(
  email: string,
  firstname: string,
): Promise<boolean> {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome</title>
  <style>
    @media only screen and (max-width: 620px) {
      .email-body { padding: 16px !important; }
      .email-card { padding: 32px 20px !important; border-radius: 8px !important; }
      .email-heading { font-size: 24px !important; }
    }
  </style>
</head>
<body class="email-body" style="
  margin: 0;
  padding: 40px;
  background-color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
">
  <div class="email-card" style="
    max-width: 560px;
    margin: 0 auto;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: #ffffff;
    padding: 48px 40px;
    border-radius: 12px;
    box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.2);
    text-align: center;
  ">
    <h1 class="email-heading" style="font-size: 30px; font-weight: 800; margin: 0 0 12px 0; color: #ffffff;">
      🎉 Welcome, ${firstname}!
    </h1>
    <p style="color: #e0e7ff; font-size: 16px; line-height: 1.6; margin: 0; font-weight: 400;">
      Your account has been successfully created. We're excited to have you on board!
    </p>
  </div>
</body>
</html>
`;

  return await sendEmail({
    to: email,
    subject: `Welcome ${firstname}`,
    html,
  });
}