

import type { NextAuthOptions, User as NextAuthUser } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import {
  createHash,
  randomBytes,
  randomInt,
} from "node:crypto";

import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import AdminLoginLog from "@/models/AdminLoginLog";
import { sendLoginVerificationCode } from "@/lib/nodemailer";

const OTP_TTL_MS = 5 * 60 * 1000;
const GRANT_TTL_MS = 2 * 60 * 1000;

type AppUser = NextAuthUser & {
  role?: string;
  isAdmin?: boolean;
};

function generateReferralCode(): string {
  return (
    "REF" +
    randomBytes(6).toString("hex").substring(0, 6).toUpperCase()
  );
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function getHeader(
  value: string | string[] | undefined,
): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeRole(value: unknown): string {
  return typeof value === "string" && value.trim()
    ? value.trim().toLowerCase()
    : "user";
}

function getUserName(user: {
  name?: string | null;
  firstname?: string | null;
  lastname?: string | null;
}): string {
  const fullName =
    `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim();

  return user.name?.trim() || fullName || "User";
}

function getDatabaseUserId(user: {
  _id?: { toString(): string };
  id?: string;
}): string {
  if (user._id) return user._id.toString();
  return typeof user.id === "string" ? user.id : "";
}

function getRequestIp(
  headers: Record<string, string | string[] | undefined>,
): string {
  const forwardedFor = getHeader(headers["x-forwarded-for"]);

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim() || "unknown";
  }

  return getHeader(headers["x-real-ip"]) || "unknown";
}

async function logAdminLogin(data: {
  adminId: unknown;
  ip: string;
  userAgent: string;
  success: boolean;
}): Promise<void> {
  try {
    await AdminLoginLog.create({
      adminId: data.adminId,
      ip: data.ip,
      device: "web",
      userAgent: data.userAgent,
      success: data.success,
    });
  } catch (error) {
    console.error(
      "Failed to record admin login attempt:",
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/auth/login",
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),

    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        adminLoginGrant: {
          label: "Admin login grant",
          type: "text",
        },
      },

      async authorize(credentials, req) {
        const email = normalizeEmail(credentials?.email);
        const password = String(credentials?.password ?? "");

        if (!email || !password) {
          throw new Error("Email and password are required");
        }

        if (!process.env.NEXTAUTH_SECRET) {
          console.error("NEXTAUTH_SECRET is not configured");
          throw new Error("Authentication is not configured");
        }

        await connectToDatabase();

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
          throw new Error("Invalid email or password");
        }

        if (
          typeof user.password !== "string" ||
          !user.password
        ) {
          throw new Error(
            "Your account does not have a valid password. Please reset it or contact an administrator.",
          );
        }

        if (!user.emailVerified) {
          throw new Error("EMAIL_VERIFICATION_REQUIRED");
        }

        const passwordValid = await bcrypt.compare(
          password,
          user.password,
        );

        const role = normalizeRole(user.role);
        const isAdmin = role === "admin";

        const headers = (req?.headers ?? {}) as Record<
          string,
          string | string[] | undefined
        >;

        const ip = getRequestIp(headers);
        const userAgent = getHeader(headers["user-agent"]);

        if (!passwordValid) {
          if (isAdmin) {
            await logAdminLogin({
              adminId: user._id,
              ip,
              userAgent,
              success: false,
            });
          }

          throw new Error("Invalid email or password");
        }

        if (isAdmin) {
          const db = await connectToDatabase();
          const loginCodes = db.connection.collection(
            "loginVerificationCodes",
          );
          const grants = db.connection.collection("adminLoginGrants");

          const grantToken = String(
            credentials?.adminLoginGrant ?? "",
          ).trim();

          if (!grantToken) {
            const now = new Date();

            await loginCodes.updateMany(
              {
                email,
                purpose: "verify-login",
                usedAt: null,
              },
              {
                $set: { usedAt: now },
              },
            );

            const code = randomInt(100000, 1000000).toString();

            await loginCodes.insertOne({
              email,
              userId: user._id,
              code,
              purpose: "verify-login",
              createdAt: now,
              expiresAt: new Date(now.getTime() + OTP_TTL_MS),
              usedAt: null,
            });

            const emailSent = await sendLoginVerificationCode(
              email,
              code,
            );

            if (!emailSent) {
              await loginCodes.updateOne(
                {
                  email,
                  code,
                  purpose: "verify-login",
                  usedAt: null,
                },
                {
                  $set: { usedAt: new Date() },
                },
              );

              throw new Error(
                "Unable to send the verification code. Please try again.",
              );
            }

            throw new Error("ADMIN_VERIFICATION_REQUIRED");
          }

          const tokenHash = hashToken(grantToken);
          const now = new Date();

          const grant = await grants.findOne({
            tokenHash,
            email,
            userId: user._id,
            purpose: "admin-login",
            usedAt: null,
            expiresAt: { $gt: now },
          });

          if (!grant) {
            throw new Error("ADMIN_VERIFICATION_REQUIRED");
          }

          const consumedAt = new Date();

          const consumed = await grants.updateOne(
            {
              _id: grant._id,
              tokenHash,
              email,
              userId: user._id,
              purpose: "admin-login",
              usedAt: null,
              expiresAt: { $gt: consumedAt },
            },
            {
              $set: { usedAt: consumedAt },
            },
          );

          if (consumed.modifiedCount !== 1) {
            throw new Error(
              "Your verification has expired or already been used. Please try again.",
            );
          }
        }

        const databaseUserId = getDatabaseUserId(user);

        if (!databaseUserId) {
          throw new Error("Unable to identify your account");
        }

        user.lastLoginAt = new Date();
        user.sessionCreatedAt = new Date();
        await user.save();

        if (isAdmin) {
          await logAdminLogin({
            adminId: user._id,
            ip,
            userAgent,
            success: true,
          });
        }

        return {
          id: databaseUserId,
          name: getUserName(user),
          email: normalizeEmail(user.email),
          image: user.image ?? undefined,
          role,
          isAdmin,
        } as AppUser;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        const appUser = user as AppUser;

        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = normalizeRole(appUser.role);
        token.isAdmin = token.role === "admin";
      }

      if (account?.provider === "google") {
        const email = normalizeEmail(token.email);

        if (!email) {
          throw new Error("Google account does not provide an email address");
        }

        await connectToDatabase();

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
          throw new Error("Google account could not be linked to a database user");
        }

        const databaseUserId = getDatabaseUserId(existingUser);

        if (!databaseUserId) {
          throw new Error("Unable to identify your Google account");
        }

        token.id = databaseUserId;
        token.name = getUserName(existingUser);
        token.email = email;
        token.role = normalizeRole(existingUser.role);
        token.isAdmin = token.role === "admin";
      }

      // Fallback for older JWTs containing `sub` but not `id`.
      if (!token.id && token.sub) {
        token.id = token.sub;
      }

      if (!token.role) {
        token.role = "user";
      }

      // Always derive the admin flag from the role claim.
      token.isAdmin = token.role === "admin";

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        const id =
          typeof token.id === "string"
            ? token.id
            : typeof token.sub === "string"
              ? token.sub
              : "";

        session.user.id = id;
        session.user.name =
          typeof token.name === "string" ? token.name : "";
        session.user.email =
          typeof token.email === "string" ? token.email : "";
        session.user.role = normalizeRole(token.role);
        session.user.isAdmin = session.user.role === "admin";
      }

      return session;
    },

    async signIn({ user, account }) {
      try {
        if (account?.provider !== "google") {
          return true;
        }

        await connectToDatabase();

        const email = normalizeEmail(user.email);

        if (!email) {
          return false;
        }

        let existingUser = await User.findOne({ email });

        if (!existingUser) {
          existingUser = await User.create({
            name: user.name || "Google User",
            email,
            image: user.image || undefined,
            emailVerified: true,
            role: "user",
            walletBalance: 0,
            referralCode: generateReferralCode(),
          });
        }

        return true;
      } catch (error) {
        console.error(
          "Google sign-in failed:",
          error instanceof Error ? error.message : "Unknown error",
        );

        return false;
      }
    },
  },
};
