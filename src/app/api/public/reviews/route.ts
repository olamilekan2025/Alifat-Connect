import { NextRequest, NextResponse } from "next/server";
import { getHomepageReviews, getPaginatedReviews, getReviewStats } from "@/lib/reviews";

/**
 * GET /api/public/reviews
 * 
 * Query params:
 * - type: "homepage" | "paginated" | "stats"
 * - page: number (for paginated)
 * - limit: number (for paginated)
 * - rating: number (for filtering)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "homepage";

    if (type === "homepage") {
      // Get 3 approved reviews for homepage
      const reviews = await getHomepageReviews();
      return NextResponse.json({ reviews });
    }

    if (type === "paginated") {
      // Get paginated reviews
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "12");
      const rating = searchParams.get("rating")
        ? parseInt(searchParams.get("rating")!)
        : undefined;

      const result = await getPaginatedReviews({ page, limit, rating });
      return NextResponse.json(result);
    }

    if (type === "stats") {
      // Get review statistics
      const stats = await getReviewStats();
      return NextResponse.json(stats);
    }

    return NextResponse.json(
      { error: "Invalid type parameter" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in public reviews API:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
