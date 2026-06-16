import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import { connectToDatabase } from "../src/lib/mongodb";
import User from "../src/models/User";

dotenv.config();

function generateReferralCode() {
  return (
    "ADMIN" +
    Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()
  );
}

async function createAdmin() {
  try {
    await connectToDatabase();

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error(
        "ADMIN_EMAIL or ADMIN_PASSWORD missing"
      );
    }

    const existingUser =
      await User.findOne({ email });

    if (existingUser) {
      console.log(
        "User already exists"
      );
      process.exit(0);
    }

    const hashedPassword =
      await bcrypt.hash(password, 12);

    await User.create({
      firstname: "Super",
      lastname: "Admin",
      name: "Super Admin",

      email,
      password: hashedPassword,

      role: "admin",

      emailVerified: true,

      referralCode:
        generateReferralCode(),

      walletBalance: 0,
    });

    console.log(
      "✅ Admin created successfully"
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "Create Admin Error:",
      error
    );
    process.exit(1);
  }
}

createAdmin();