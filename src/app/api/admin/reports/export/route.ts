import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/models/transaction";
import User from "@/models/User";
import Referral from "@/models/Referral";

function isAdmin(session: { user?: { role?: string } } | null) {
  return String(session?.user?.role || "").toLowerCase() === "admin";
}

function getDateRange(period: string) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (period) {
    case "today":
      return { startDate: startOfDay, endDate: now };
    case "7days":
      return { 
        startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), 
        endDate: now 
      };
    case "30days":
      return { 
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), 
        endDate: now 
      };
    case "90days":
      return { 
        startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), 
        endDate: now 
      };
    case "thismonth":
      return { 
        startDate: new Date(now.getFullYear(), now.getMonth(), 1), 
        endDate: now 
      };
    case "lastmonth":
      return { 
        startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1), 
        endDate: new Date(now.getFullYear(), now.getMonth(), 0) 
      };
    case "thisyear":
      return { 
        startDate: new Date(now.getFullYear(), 0, 1), 
        endDate: now 
      };
    case "alltime":
    default:
      return { startDate: new Date(0), endDate: now };
  }
}

function generateCSV(data: unknown[], headers: string[]): string {
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = (row as Record<string, unknown>)[header] ?? '';
      const escaped = String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (!isAdmin(session)) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get("type") || "transactions";
    const period = searchParams.get("period") || "30days";
    const format = searchParams.get("format") || "csv";
    const { startDate, endDate } = getDateRange(period);

    await connectToDatabase();

    let data: unknown[] = [];
    let filename = "";
    let headers: string[] = [];

    switch (reportType) {
      case "transactions":
        data = await Transaction.find({
          createdAt: { $gte: startDate, $lte: endDate }
        })
        .select('reference category amount status type network phone plan provider createdAt')
        .sort({ createdAt: -1 })
        .limit(5000)
        .lean();
        
        filename = `transactions-export-${period}-${Date.now()}`;
        headers = ['reference', 'category', 'amount', 'status', 'type', 'network', 'phone', 'plan', 'provider', 'createdAt'];
        break;

      case "users":
        data = await User.find({
          createdAt: { $gte: startDate, $lte: endDate }
        })
        .select('name email role membershipLevel walletBalance kycVerified referralCode referralsCount referralEarnings createdAt')
        .sort({ createdAt: -1 })
        .limit(5000)
        .lean();
        
        filename = `users-export-${period}-${Date.now()}`;
        headers = ['name', 'email', 'role', 'membershipLevel', 'walletBalance', 'kycVerified', 'referralCode', 'referralsCount', 'referralEarnings', 'createdAt'];
        break;

      case "referrals":
        data = await Referral.find({
          createdAt: { $gte: startDate, $lte: endDate }
        })
        .select('referrerId referredUserId referralCode rewardAmount rewardType status qualificationStatus createdAt')
        .sort({ createdAt: -1 })
        .limit(5000)
        .lean();
        
        filename = `referrals-export-${period}-${Date.now()}`;
        headers = ['referrerId', 'referredUserId', 'referralCode', 'rewardAmount', 'rewardType', 'status', 'qualificationStatus', 'createdAt'];
        break;

      case "overview":
        // Export overview summary as a single row
        const overviewRes = await fetch(`${req.nextUrl.origin}/api/admin/reports?period=${period}`, {
          headers: req.headers
        });
        const overviewData = await overviewRes.json();
        
        if (overviewData.success && overviewData.overview) {
          data = [overviewData.overview];
          filename = `overview-export-${period}-${Date.now()}`;
          headers = Object.keys(overviewData.overview);
        } else {
          return NextResponse.json(
            { success: false, message: "Failed to fetch overview data" },
            { status: 500 }
          );
        }
        break;

      case "revenue":
        const revenueRes = await fetch(`${req.nextUrl.origin}/api/admin/reports/revenue?period=${period}`, {
          headers: req.headers
        });
        const revenueData = await revenueRes.json();
        
        if (revenueData.success && revenueData.serviceRevenue) {
          data = revenueData.serviceRevenue;
          filename = `revenue-export-${period}-${Date.now()}`;
          headers = ['_id', 'revenue', 'transactions', 'avgTransaction'];
        } else {
          return NextResponse.json(
            { success: false, message: "Failed to fetch revenue data" },
            { status: 500 }
          );
        }
        break;

      case "services":
        const servicesRes = await fetch(`${req.nextUrl.origin}/api/admin/reports/services?period=${period}`, {
          headers: req.headers
        });
        const servicesData = await servicesRes.json();
        
        if (servicesData.success && servicesData.servicePerformance) {
          data = servicesData.servicePerformance;
          filename = `services-export-${period}-${Date.now()}`;
          headers = ['_id', 'totalTransactions', 'totalVolume', 'revenue', 'successRate'];
        } else {
          return NextResponse.json(
            { success: false, message: "Failed to fetch services data" },
            { status: 500 }
          );
        }
        break;

      case "wallet":
        const walletRes = await fetch(`${req.nextUrl.origin}/api/admin/reports/wallet?period=${period}`, {
          headers: req.headers
        });
        const walletData = await walletRes.json();
        
        if (walletData.success) {
          // Export funding by method
          data = walletData.fundingByMethod || [];
          filename = `wallet-export-${period}-${Date.now()}`;
          headers = ['_id', 'totalAmount', 'successful', 'failed', 'pending'];
        } else {
          return NextResponse.json(
            { success: false, message: "Failed to fetch wallet data" },
            { status: 500 }
          );
        }
        break;

      case "kyc":
        const kycRes = await fetch(`${req.nextUrl.origin}/api/admin/reports/kyc?period=${period}`, {
          headers: req.headers
        });
        const kycData = await kycRes.json();
        
        if (kycData.success && kycData.statusBreakdown) {
          data = kycData.statusBreakdown;
          filename = `kyc-export-${period}-${Date.now()}`;
          headers = ['_id', 'count'];
        } else {
          return NextResponse.json(
            { success: false, message: "Failed to fetch KYC data" },
            { status: 500 }
          );
        }
        break;

      case "support":
        const supportRes = await fetch(`${req.nextUrl.origin}/api/admin/reports/support?period=${period}`, {
          headers: req.headers
        });
        const supportData = await supportRes.json();
        
        if (supportData.success && supportData.ticketsByCategory) {
          data = supportData.ticketsByCategory;
          filename = `support-export-${period}-${Date.now()}`;
          headers = ['_id', 'count'];
        } else {
          return NextResponse.json(
            { success: false, message: "Failed to fetch support data" },
            { status: 500 }
          );
        }
        break;

      default:
        return NextResponse.json(
          { success: false, message: "Invalid report type" },
          { status: 400 }
        );
    }

    if (format === "csv") {
      const csv = generateCSV(data, headers);
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
        },
      });
    }

    // For Excel/PDF, we would need additional libraries
    // For now, return CSV as default
    const csv = generateCSV(data, headers);
    
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to export report" },
      { status: 500 }
    );
  }
}
