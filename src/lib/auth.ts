import type { NextAuthOptions } from "next-auth";

import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import bcrypt from "bcryptjs";

import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

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
      clientId:
        process.env.GOOGLE_CLIENT_ID || "",

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
      },

      async authorize(credentials) {
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

        if (!user) {
          throw new Error(
            "Invalid email or password"
          );
        }

        if (!user.emailVerified) {
          throw new Error(
            "Please verify your email"
          );
        }

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

        if (!isPasswordValid) {
          throw new Error(
            "Invalid email or password"
          );
        }

        return {
          id: user._id.toString(),
          name: user.name ?? "User",
          email: user.email,
          image: user.image ?? undefined,
          role: user.role ?? "user",
        };
      },
    }),
  ],

  callbacks: {
    async jwt({
      token,
      user,
      account,
    }) {
      // FIRST LOGIN
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      // GOOGLE LOGIN
      if (
        account?.provider === "google" &&
        token.email
      ) {
        await connectToDatabase();

        const existingUser =
          await User.findOne({
            email: token.email,
          });

        if (existingUser) {
          token.id =
            existingUser._id.toString();

          token.role =
            existingUser.role ?? "user";
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
      if (
        account?.provider === "google"
      ) {
        await connectToDatabase();

        const email = user.email
          ?.trim()
          .toLowerCase();

        if (!email) {
          return false;
        }

        const existingUser =
          await User.findOne({
            email,
          });

        if (!existingUser) {
          await User.create({
            name:
              user.name ??
              "Google User",

            email,

            image:
              user.image ?? undefined,

            emailVerified: true,

            role: "user",


          });
        }
      }

      return true;
    },
  },
};