import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";

import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import AdminLoginLog from "@/models/AdminLoginLog";
import {
  sendLoginVerificationCode,
} from "@/lib/nodemailer";

function generateReferralCode() {
  return (
    "REF" +
    Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()
  );
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/auth/login",
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET || "",
    }),

    CredentialsProvider({
      name: "Credentials",

     credentials: {
  email: {
    label: "Email",
    type: "email",
  },

  password: {
    label: "Password",
    type: "password",
  },

  adminVerified: {
    label: "Admin Verified",
    type: "text",
  },
},

      async authorize(credentials, req) {
        try {
          if (
            !credentials?.email ||
            !credentials?.password
          ) {
            throw new Error(
              "Email and password are required"
            );
          }

          await connectToDatabase();

          const email = credentials.email
            .trim()
            .toLowerCase();

  const user = await User.findOne({
  email,
}).select("+password");

          console.log(
            "========== LOGIN DEBUG =========="
          );
          console.log("EMAIL:", email);
          console.log(
            "USER FOUND:",
            !!user
          );

          if (!user) {
            throw new Error(
              "Invalid email or password"
            );
          }

          console.log(
            "ROLE:",
            user.role
          );

          console.log(
            "EMAIL VERIFIED:",
            user.emailVerified
          );

        console.log("HAS PASSWORD:", Boolean(user.password));

if (
  typeof user.password !== "string" ||
  user.password.length === 0
) {
  throw new Error(
    "Your account does not have a valid password. Please reset it or contact an administrator."
  );
}

         if (!user.emailVerified) {
  throw new Error("EMAIL_VERIFICATION_REQUIRED");
}

         

          const role =
            user.role
              ? String(user.role).toLowerCase()
              : "user";

          if (
  user.role === "admin" &&
  credentials.adminVerified !== "true"
) {
  const otp = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

const db =
  await connectToDatabase();

await db.connection
  .collection(
    "loginVerificationCodes"
  )
  .insertOne({
    email: user.email,
    code: otp,
    purpose: "verify-login",
    createdAt: new Date(),
    expiresAt: new Date(
      Date.now() +
        10 * 60 * 1000
    ),
    usedAt: null,
  });

const emailSent =
  await sendLoginVerificationCode(
    user.email,
    otp
  );

console.log(
  "ADMIN LOGIN OTP:",
  otp
);

console.log(
  "EMAIL SENT:",
  emailSent
);

if (!emailSent) {
  throw new Error(
    "Failed to send verification code"
  );
}

throw new Error(
  "ADMIN_VERIFICATION_REQUIRED"
);
}

          const isPasswordValid =
            await bcrypt.compare(
              credentials.password,
              user.password
            );

          console.log(
            "PASSWORD MATCH:",
            isPasswordValid
          );

         if (!isPasswordValid) {
  // Log failed login attempt for admin
  if (user.role === "admin") {
    const ip = req?.headers?.["x-forwarded-for"] || "unknown";
    const userAgent = req?.headers?.["user-agent"] || "";
    try {
      await AdminLoginLog.create({
        adminId: user._id,
        ip,
        device: "web",
        userAgent,
        success: false,
      });
    } catch (logError) {
      console.error("Failed to log login attempt:", logError);
    }
  }
  throw new Error("Invalid email or password");
}

// Update login information
user.lastLoginAt = new Date();
user.sessionCreatedAt = new Date();

await user.save();

// Log successful login attempt for admin
if (user.role === "admin") {
  const ip = req?.headers?.["x-forwarded-for"] || "unknown";
  const userAgent = req?.headers?.["user-agent"] || "";
  try {
    await AdminLoginLog.create({
      adminId: user._id,
      ip,
      device: "web",
      userAgent,
      success: true,
    });
  } catch (logError) {
    console.error("Failed to log login attempt:", logError);
  }
}

          return {
            id: user._id.toString(),
            name:
              user.name ||
              `${user.firstname || ""} ${
                user.lastname || ""
              }`.trim() ||
              "User",
            email: user.email,
            image:
              user.image ?? undefined,
            role: (
              user.role || "user"
            ).toLowerCase(),
          };
        } catch (error) {
          console.error(
            "AUTH ERROR:",
            error
          );

          throw error;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({
      token,
      user,
      account,
    }) {
      if (user) {
        token.id = user.id;

        token.role = String(
          user.role || "user"
        ).toLowerCase();
      }

      if (
        account?.provider ===
          "google" &&
        token.email
      ) {
        await connectToDatabase();

        const existingUser =
          await User.findOne({
            email: token.email
              .trim()
              .toLowerCase(),
          });

        if (existingUser) {
          token.id =
            existingUser._id.toString();

          token.role = String(
            existingUser.role || "user"
          ).toLowerCase();
        }
      }

      return token;
    },

    async session({
      session,
      token,
    }) {
      if (session.user) {
        session.user.id = String(
          token.id
        );

        session.user.role = String(
          token.role
        );
      }

      return session;
    },

    async signIn({
      user,
      account,
    }) {
      try {
        if (
          account?.provider ===
          "google"
        ) {
          await connectToDatabase();

          const email =
            user.email
              ?.trim()
              .toLowerCase();

          if (!email) {
            return false;
          }

          let existingUser =
            await User.findOne({
              email,
            });

          if (!existingUser) {
            existingUser =
              await User.create({
                name:
                  user.name ||
                  "Google User",

                email,

                image:
                  user.image ||
                  undefined,

                emailVerified: true,

                role: "user",

                walletBalance: 0,

                referralCode:
                  generateReferralCode(),
              });
          }
        }

        return true;
      } catch (error) {
        console.error(
          "SIGN IN ERROR:",
          error
        );

        return false;
      }
    },
  },
};