// import nodemailer from "nodemailer";

// // CREATE TRANSPORTER
// const transporter = nodemailer.createTransport({
//   service: "gmail",

//   auth: {
//     user: process.env.EMAIL_SERVER_USER,
//     pass: process.env.EMAIL_SERVER_PASSWORD,
//   },
// });

// // VERIFY SMTP CONNECTION
// transporter.verify((error, success) => {
//   if (error) {
//     console.error(
//       "❌ SMTP CONNECTION ERROR:",
//       error
//     );
//   } else {
//     console.log(
//       "✅ SMTP server is ready"
//     );
//   }
// });

// /**
//  * Validate environment variables
//  */
// function assertSmtpConfig() {
//   const required = [
//     "EMAIL_SERVER_USER",
//     "EMAIL_SERVER_PASSWORD",
//     "FROM_EMAIL",
//   ];

//   const missing = required.filter(
//     (key) =>
//       !process.env[
//         key as keyof NodeJS.ProcessEnv
//       ]
//   );

//   if (missing.length > 0) {
//     throw new Error(
//       `Missing environment variables: ${missing.join(", ")}`
//     );
//   }
// }

// /**
//  * Generic email sender
//  */
// export async function sendEmail(
//   options: nodemailer.SendMailOptions
// ): Promise<boolean> {
//   try {
//     assertSmtpConfig();

//     const info =
//       await transporter.sendMail({
//         from: process.env.FROM_EMAIL,
//         ...options,
//       });

//     console.log(
//       "✅ Email sent:",
//       info.messageId
//     );

//     return true;
//   } catch (error) {
//     console.error(
//       "❌ Failed to send email:",
//       error
//     );

//     return false;
//   }
// }

// /**
//  * SEND EMAIL VERIFICATION CODE
//  */
// export async function sendEmailVerificationCode(
//   email: string,
//   code: string
// ): Promise<boolean> {
//   const html = `
// <!DOCTYPE html>
// <html>
// <head>
//   <meta charset="utf-8" />
//   <title>Email Verification</title>
// </head>

// <body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:40px;">

//   <div style="
//     max-width:600px;
//     margin:auto;
//     background:white;
//     padding:40px;
//     border-radius:12px;
//     text-align:center;
//   ">

//     <h1>📧 Verify Your Email</h1>

//     <p>
//       Use the verification code below
//       to verify your account.
//     </p>

//     <div style="
//       font-size:36px;
//       font-weight:bold;
//       letter-spacing:8px;
//       background:#0ea5e9;
//       color:white;
//       padding:20px;
//       border-radius:10px;
//       margin:30px 0;
//     ">
//       ${code}
//     </div>

//     <p>
//       This code expires in
//       <strong>10 minutes</strong>.
//     </p>

//   </div>

// </body>
// </html>
// `;

//   return sendEmail({
//     to: email,
//     subject: "Verify Your Email",
//     html,
//   });
// }

// /**
//  * SEND LOGIN VERIFICATION CODE
//  */
// export async function sendLoginVerificationCode(
//   email: string,
//   code: string
// ): Promise<boolean> {
//   const html = `
// <!DOCTYPE html>
// <html>
// <head>
//   <meta charset="utf-8" />
//   <title>Login Verification</title>
// </head>

// <body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:40px;">

//   <div style="
//     max-width:600px;
//     margin:auto;
//     background:white;
//     padding:40px;
//     border-radius:12px;
//     text-align:center;
//   ">

//     <h1>🔐 Login Verification</h1>

//     <p>
//       Use the code below to verify login.
//     </p>

//     <div style="
//       font-size:36px;
//       font-weight:bold;
//       letter-spacing:8px;
//       background:#111827;
//       color:white;
//       padding:20px;
//       border-radius:10px;
//       margin:30px 0;
//     ">
//       ${code}
//     </div>

//     <p>
//       This code expires in
//       <strong>5 minutes</strong>.
//     </p>

//   </div>

// </body>
// </html>
// `;

//   return sendEmail({
//     to: email,
//     subject: "Login Verification Code",
//     html,
//   });
// }

// /**
//  * SEND PASSWORD RESET EMAIL
//  */
// /**
//  * SEND PASSWORD RESET CODE
//  */
// export async function sendPasswordResetCode(
//   email: string,
//   code: string
// ): Promise<boolean> {
//   const html = `
// <!DOCTYPE html>
// <html>
// <head>
//   <meta charset="utf-8" />
//   <title>Reset Password</title>
// </head>

// <body style="
//   font-family:Arial,sans-serif;
//   background:#f5f5f5;
//   padding:40px;
// ">

//   <div style="
//     max-width:600px;
//     margin:auto;
//     background:white;
//     padding:40px;
//     border-radius:12px;
//     text-align:center;
//   ">

//     <h1>🔑 Reset Password</h1>

//     <p>
//       Use the verification code below
//       to reset your password.
//     </p>

//     <div style="
//       font-size:36px;
//       font-weight:bold;
//       letter-spacing:8px;
//       background:#dc2626;
//       color:white;
//       padding:20px;
//       border-radius:10px;
//       margin:30px 0;
//     ">
//       ${code}
//     </div>

//     <p>
//       This code expires in
//       <strong>10 minutes</strong>.
//     </p>

//   </div>

// </body>
// </html>
// `;

//   return sendEmail({
//     to: email,
//     subject: "Reset Password Code",
//     html,
//   });
// }
// /**
//  * SEND WELCOME EMAIL
//  */
// export async function sendWelcomeEmail(
//   email: string,
//   firstname: string
// ): Promise<boolean> {
//   const html = `
// <!DOCTYPE html>
// <html>
// <head>
//   <meta charset="utf-8" />
//   <title>Welcome</title>
// </head>

// <body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:40px;">

//   <div style="
//     max-width:600px;
//     margin:auto;
//     background:linear-gradient(135deg,#667eea,#764ba2);
//     color:white;
//     padding:40px;
//     border-radius:12px;
//     text-align:center;
//   ">

//     <h1>
//       🎉 Welcome, ${firstname}!
//     </h1>

//     <p>
//       Your account has been created
//       successfully.
//     </p>

//   </div>

// </body>
// </html>
// `;

//   return sendEmail({
//     to: email,
//     subject: `Welcome ${firstname}`,
//     html,
//   });
// }









import nodemailer from "nodemailer";

// VALIDATE ENV VARIABLES FIRST
const requiredEnv = [
  "EMAIL_SERVER_USER",
  "EMAIL_SERVER_PASSWORD",
  "FROM_EMAIL",
];

requiredEnv.forEach((env) => {
  if (!process.env[env]) {
    console.error(
      `❌ Missing environment variable: ${env}`,
    );
  }
});

// CREATE TRANSPORTER
const transporter =
  nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

// VERIFY SMTP CONNECTION
transporter.verify(
  (error, success) => {
    if (error) {
      console.error(
        "❌ SMTP CONNECTION ERROR:",
        error,
      );
    } else {
      console.log(
        "✅ SMTP SERVER READY",
      );
    }
  },
);

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
  } catch (error) {
    console.error(
      "❌ EMAIL SEND ERROR:",
      error,
    );

    return false;
  }
}

/**
 * SEND EMAIL VERIFICATION CODE
 */
export async function sendEmailVerificationCode(
  email: string,
  code: string,
): Promise<boolean> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Email Verification</title>
</head>

<body style="
  font-family:Arial,sans-serif;
  background:#f5f5f5;
  padding:40px;
">

  <div style="
    max-width:600px;
    margin:auto;
    background:white;
    padding:40px;
    border-radius:12px;
    text-align:center;
  ">

    <h1>📧 Verify Your Email</h1>

    <p>
      Use the verification code below
      to verify your account.
    </p>

    <div style="
      font-size:36px;
      font-weight:bold;
      letter-spacing:8px;
      background:#0ea5e9;
      color:white;
      padding:20px;
      border-radius:10px;
      margin:30px 0;
    ">
      ${code}
    </div>

    <p>
      This code expires in
      <strong>10 minutes</strong>.
    </p>

  </div>

</body>
</html>
`;

  return await sendEmail({
    to: email,
    subject:
      "Verify Your Email",
    html,
  });
}

/**
 * SEND LOGIN VERIFICATION CODE
 */
export async function sendLoginVerificationCode(
  email: string,
  code: string,
): Promise<boolean> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Login Verification</title>
</head>

<body style="
  font-family:Arial,sans-serif;
  background:#f5f5f5;
  padding:40px;
">

  <div style="
    max-width:600px;
    margin:auto;
    background:white;
    padding:40px;
    border-radius:12px;
    text-align:center;
  ">

    <h1>🔐 Login Verification</h1>

    <p>
      Use the code below to verify login.
    </p>

    <div style="
      font-size:36px;
      font-weight:bold;
      letter-spacing:8px;
      background:#111827;
      color:white;
      padding:20px;
      border-radius:10px;
      margin:30px 0;
    ">
      ${code}
    </div>

    <p>
      This code expires in
      <strong>5 minutes</strong>.
    </p>

  </div>

</body>
</html>
`;

  return await sendEmail({
    to: email,
    subject:
      "Login Verification Code",
    html,
  });
}

/**
 * SEND PASSWORD RESET CODE
 */
export async function sendPasswordResetCode(
  email: string,
  code: string,
): Promise<boolean> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Reset Password</title>
</head>

<body style="
  font-family:Arial,sans-serif;
  background:#f5f5f5;
  padding:40px;
">

  <div style="
    max-width:600px;
    margin:auto;
    background:white;
    padding:40px;
    border-radius:12px;
    text-align:center;
  ">

    <h1>🔑 Reset Password</h1>

    <p>
      Use the verification code below
      to reset your password.
    </p>

    <div style="
      font-size:36px;
      font-weight:bold;
      letter-spacing:8px;
      background:#dc2626;
      color:white;
      padding:20px;
      border-radius:10px;
      margin:30px 0;
    ">
      ${code}
    </div>

    <p>
      This code expires in
      <strong>10 minutes</strong>.
    </p>

  </div>

</body>
</html>
`;

  return await sendEmail({
    to: email,
    subject:
      "Reset Password Code",
    html,
  });
}

/**
 * SEND PAYMENT PIN RESET CODE
 */
export async function sendPaymentPinResetCode(
  email: string,
  code: string,
): Promise<boolean> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Reset Payment PIN</title>
</head>

<body style="
  font-family:Arial,sans-serif;
  background:#f5f5f5;
  padding:40px;
">

  <div style="
    max-width:600px;
    margin:auto;
    background:white;
    padding:40px;
    border-radius:12px;
    text-align:center;
  ">

    <h1>🔐 Reset Payment PIN</h1>

    <p>
      Use the verification code below
      to reset your payment PIN.
    </p>

    <div style="
      font-size:36px;
      font-weight:bold;
      letter-spacing:8px;
      background:#16a34a;
      color:white;
      padding:20px;
      border-radius:10px;
      margin:30px 0;
    ">
      ${code}
    </div>

    <p>
      This code expires in
      <strong>10 minutes</strong>.
    </p>

  </div>

</body>
</html>
`;

  return await sendEmail({
    to: email,
    subject:
      "Reset Payment PIN",
    html,
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
<html>
<head>
  <meta charset="utf-8" />
  <title>Welcome</title>
</head>

<body style="
  font-family:Arial,sans-serif;
  background:#f5f5f5;
  padding:40px;
">

  <div style="
    max-width:600px;
    margin:auto;
    background:linear-gradient(135deg,#667eea,#764ba2);
    color:white;
    padding:40px;
    border-radius:12px;
    text-align:center;
  ">

    <h1>
      🎉 Welcome, ${firstname}!
    </h1>

    <p>
      Your account has been created
      successfully.
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