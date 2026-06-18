import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);

    const page = Math.max(
      1,
      Number(searchParams.get("page") ?? "1")
    );

    const search =
      searchParams.get("search")?.trim() ?? "";

    const role = searchParams.get("role") ?? "";

    const verified =
      searchParams.get("verified") ?? "";

    const query: Record<string, any> = {};

    if (search) {
      const regex = new RegExp(search, "i");

      query.$or = [
        { name: regex },
        { firstname: regex },
        { lastname: regex },
        { email: regex },
        { phone: regex },
        { referralCode: regex },
      ];
    }

    if (role) {
      // Schema role enum: admin | user | moderator
      // Seller is represented by accountType
      if (role === "seller") {
        query.accountType = "seller";
      } else {
        query.role = role;
      }
    }

    if (verified === "true") {
      query.emailVerified = true;
    } else if (verified === "false") {
      query.emailVerified = false;
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select(
          [
            "name",
            "firstname",
            "lastname",
            "email",
            "phone",
            "role",
            "accountType",
            "walletBalance",
            "emailVerified",
            "subscriptionActive",
            "subscriptionType",
            "referralCode",
            "referralsCount",
            "createdAt",
          ].join(" ")
        )
        .sort({ createdAt: -1 })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .lean(),

      User.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      users,
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users.",
      },
      { status: 500 }
    );
  }
}