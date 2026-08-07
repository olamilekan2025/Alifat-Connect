import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateReviewStatus, toggleReviewFeatured, deleteReview } from "@/lib/reviews";
import Review from "@/models/Review";

/**
 * GET /api/admin/reviews/[id]
 * Get a single review (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const review = await Review.findById(id).lean();

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { error: "Failed to fetch review" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/reviews/[id]
 * Update review status or toggle featured (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      const text = await request.text();
      if (!text) {
        return NextResponse.json({ error: "Request body is required" }, { status: 400 });
      }
      body = JSON.parse(text);
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    const { action, status } = body;
    const { id } = await params;

    if (action === "updateStatus") {
      if (!status || !["pending", "approved", "rejected"].includes(status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }

      const review = await updateReviewStatus(id, status);
      if (!review) {
        return NextResponse.json({ error: "Review not found" }, { status: 404 });
      }

      return NextResponse.json(review);
    }

    if (action === "toggleFeatured") {
      const review = await toggleReviewFeatured(id);
      if (!review) {
        return NextResponse.json({ error: "Review not found" }, { status: 404 });
      }

      return NextResponse.json(review);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/reviews/[id]
 * Delete a review (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const success = await deleteReview(id);

    if (!success) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
