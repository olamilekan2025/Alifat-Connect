import type { NextAuthOptions } from "next-auth";

import CredentialsProvider from "next-auth/providers/credentials";

import bcrypt from "bcryptjs";

import { connectToDatabase } from "@/lib/mongodb";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  providers: [
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
      },

    async authorize(credentials) {
  try {
    if (
      !credentials?.email ||
      !credentials?.password
    ) {
      throw new Error(
        "Email and password are required"
      );
    }

    const db =
      await connectToDatabase();

    const email =
      credentials.email
        .trim()
        .toLowerCase();

    const user =
      await db.connection.db!
        .collection("users")
        .findOne({
          email,
        });

    console.log(
      "LOGIN EMAIL:",
      email
    );

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
      "USER ROLE:",
      user.role
    );

    console.log(
      "EMAIL VERIFIED:",
      user.emailVerified
    );

    console.log(
      "HAS PASSWORD:",
      !!user.password
    );

    if (!user.password) {
      throw new Error(
        "Password not found"
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
      throw new Error(
        "Invalid email or password"
      );
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name:
        user.name ??
        `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim(),
          role: user.role ?? "user",
          // step-up verification marker (required for /admin access)
          adminVerified: false,
        };
  } catch (error) {

    console.error(
      "AUTH ERROR:",
      error
    );

    throw error;
  }
}
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.adminVerified = (user as any).adminVerified === true;
      }

      return token;
    },


    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).adminVerified =
          token.adminVerified === true;
      }

      return session;
    },

  },

  pages: {
    signIn: "/auth/login",
  },
};