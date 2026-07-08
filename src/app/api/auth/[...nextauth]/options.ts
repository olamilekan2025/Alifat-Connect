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
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

         await connectToDatabase();


          const email = credentials.email.trim().toLowerCase();

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
  Array.isArray(req?.headers?.["x-forwarded-for"])
    ? req.headers["x-forwarded-for"][0]
    : req?.headers?.["x-forwarded-for"] ?? "unknown";

const userAgent =
  Array.isArray(req?.headers?.["user-agent"])
    ? req.headers["user-agent"][0]
    : req?.headers?.["user-agent"] ?? "unknown";

          // 🔥 UPDATE LOGIN INFO (ADMIN ONLY)
          if (user.role === "admin") {
            // 🧾 LOG LOGIN ATTEMPT (ADMIN ONLY)
            await AdminLoginLog.create({
              adminId: user._id,
              ip,
              device: "web",
              userAgent,
              success: true,
            });

await User.findByIdAndUpdate(
  user._id,
  {
    $set: {
      lastLoginAt: new Date(),
      lastLoginIp: ip,
      lastDevice: userAgent,
    },
  },
  {
    new: true,
  }
);
          }

 return {
  id: user._id.toString(),
  email: user.email,
  name:
    user.name ??
    `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim(),

  role: user.role,
  isAdmin: user.role === "admin",
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
      token.role = user.role;
      token.isAdmin = user.isAdmin;
    }

    return token;
  },

  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.isAdmin = token.isAdmin;
    }

    return session;
  },
},


  pages: {
    signIn: "/auth/login",
  },
};