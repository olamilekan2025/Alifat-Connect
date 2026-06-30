import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { sendNotification } from "@/lib/notification-service";
import AdminLoginLog from "@/models/AdminLoginLog";

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
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          const db = await connectToDatabase();
          const email = credentials.email.trim().toLowerCase();

          const user = await db.connection.db!
            .collection("users")
            .findOne({ email });

          if (!user) {
            throw new Error("Invalid email or password");
          }

          if (user.emailVerified !== true) {
            throw new Error("EMAIL_VERIFICATION_REQUIRED");
          }

          if (!user.password) {
            throw new Error("Password not found");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid email or password");
          }

          // 🧠 LOGIN SECURITY INFO
          const ip =
            req?.headers?.get("x-forwarded-for") ||
            "unknown";

          const userAgent =
            req?.headers?.get("user-agent") || "";

          // 🧾 LOG LOGIN ATTEMPT
          await AdminLoginLog.create({
            adminId: user._id,
            ip,
            device: "web",
            userAgent,
            success: true,
          });

          // 🔥 UPDATE LOGIN INFO (ADMIN ONLY)
          if (user.role === "admin") {
            await db.connection.db!.collection("users").updateOne(
              { _id: user._id },
              {
                $set: {
                  lastLoginAt: new Date(),
                  lastLoginIp: ip,
                  lastDevice: userAgent,
                },
              }
            );
          }

        return {
  id: user._id.toString(),
  email: user.email,
  name:
    user.name ??
    `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim(),

  role: user.role?.toLowerCase() ?? "user",
  isAdmin: user.role?.toLowerCase() === "admin",
};
        } catch (error) {
          console.error("AUTH ERROR:", error);
          throw error;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.isAdmin = (user as any).isAdmin ?? false;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).isAdmin = token.isAdmin;
      }

      return session;
    },
  },

  events: {
    async signIn({ user }) {
      try {
        await sendNotification({
          event: "login",
          userId: user.id,
          title: "🔐 New Login",
          message: "You just logged in to your account",
        });
      } catch (err) {
        console.error("Login notification failed:", err);
      }
    },
  },

  pages: {
    signIn: "/auth/login",
  },
};