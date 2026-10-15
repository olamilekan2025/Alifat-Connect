import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { connectToDatabase } from "@/lib/mongodb";
import AdminLoginLog from "@/models/AdminLoginLog";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          await connectToDatabase();

          const email = String(credentials.email).trim().toLowerCase();
          const password = String(credentials.password);

          const user = await User.findOne({ email })
            .select("+password")
            .lean();

          if (!user) {
            throw new Error("Invalid email or password");
          }

          if (user.emailVerified !== true) {
            throw new Error("EMAIL_VERIFICATION_REQUIRED");
          }

          if (!user.password) {
            throw new Error("Invalid email or password");
          }

          const isPasswordValid = await bcrypt.compare(
            password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid email or password");
          }

          const forwardedFor = req?.headers?.["x-forwarded-for"];

          const ip = Array.isArray(forwardedFor)
            ? forwardedFor[0]
            : forwardedFor?.split(",")[0]?.trim() || "unknown";

          const rawUserAgent = req?.headers?.["user-agent"];

          const userAgent = Array.isArray(rawUserAgent)
            ? rawUserAgent[0] ?? "unknown"
            : rawUserAgent ?? "unknown";

          const userId = String(user._id);
          const role = String(user.role ?? "user");
          const name =
            user.name ??
            `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim();

          // Update admin login security records.
          if (role === "admin") {
            await AdminLoginLog.create({
              adminId: user._id,
              ip,
              device: "web",
              userAgent,
              success: true,
            });
          }

          // Update login information for every successfully authenticated user.
          await User.findByIdAndUpdate(user._id, {
            $set: {
              lastLoginAt: new Date(),
              lastLoginIp: ip,
              lastDevice: userAgent,
            },
          });

          return {
            id: userId,
            email: user.email,
            name,
            role,
            isAdmin: role === "admin",
          };
        } catch (error) {
          // Avoid logging passwords, credentials, or authentication tokens.
          console.error(
            "Authentication failed:",
            error instanceof Error ? error.message : "Unknown error"
          );

          throw error;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "user";
        token.isAdmin = token.role === "admin";
      }

      // Support existing sessions that may not have the custom ID claim.
      if (!token.id && token.sub) {
        token.id = token.sub;
      }

      if (typeof token.role !== "string") {
        token.role = "user";
      }

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
        session.user.role =
          typeof token.role === "string" ? token.role : "user";
        session.user.isAdmin = session.user.role === "admin";
      }

      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
  },
};