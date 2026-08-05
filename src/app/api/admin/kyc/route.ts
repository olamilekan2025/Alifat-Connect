import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import KYCVerification from "@/models/KYCVerification";
import User from "@/models/User";

const PAGE_SIZE = 25;

// GET /api/admin/kyc - List all KYC submissions with filters, search, pagination
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const search = searchParams.get("search")?.trim() ?? "";
    const status = searchParams.get("status") ?? "";
    const dateRange = searchParams.get("dateRange") ?? "";

    const query: Record<string, unknown> = {};

    // Search by user name, email, phone, or KYC ID
    if (search) {
      const regex = new RegExp(search, "i");
      
      // Get matching user IDs first
      const matchingUsers = await User.find({
        $or: [
          { name: regex },
          { firstname: regex },
          { lastname: regex },
          { email: regex },
          { phone: regex },
        ],
      }).select("_id").lean();

      const userIds = matchingUsers.map((u) => u._id.toString());
      
      query.$or = [
        { userId: { $in: userIds } },
        { _id: regex },
      ];
    }

    // Filter by status
    if (status && status !== "all") {
      query.status = status;
    }

    // Date range filter
    if (dateRange) {
      const now = new Date();
      let startDate: Date;

      switch (dateRange) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case "7days":
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "30days":
          startDate = new Date(now.setDate(now.getDate() - 30));
          break;
        case "90days":
          startDate = new Date(now.setDate(now.getDate() - 90));
          break;
        default:
          startDate = new Date(0);
      }

      query.createdAt = { $gte: startDate };
    }

    // Get KYC submissions
    const [kycSubmissions, total] = await Promise.all([
      KYCVerification.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .lean(),
      KYCVerification.countDocuments(query),
    ]);

    // Get user information for each KYC
    const userIds = kycSubmissions.map((kyc) => kyc.userId);
    const users = await User.find({ _id: { $in: userIds } })
      .select("name firstname lastname email phone")
      .lean();

    const userMap = new Map(
      users.map((u) => [u._id.toString(), u])
    );

    // Combine KYC with user info
    const kycWithUsers = kycSubmissions.map((kyc) => {
      const user = userMap.get(kyc.userId);
      return {
        ...kyc,
        _id: kyc._id?.toString(),
        user: user ? {
          name: user.name || `${user.firstname || ""} ${user.lastname || ""}`.trim(),
          email: user.email,
          phone: user.phone,
        } : null,
      };
    });

    return NextResponse.json({
      success: true,
      kycSubmissions: kycWithUsers,
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    });
  } catch (error) {
    console.error("Error fetching KYC submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch KYC submissions" },
      { status: 500 }
    );
  }
}
