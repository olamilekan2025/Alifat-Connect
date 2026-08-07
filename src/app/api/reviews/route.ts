import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createReview } from "@/lib/reviews";

/**
 * POST /api/reviews
 * Create a new review (authenticated users only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { rating, content } = body;

    if (!rating || !content) {
      return NextResponse.json(
        { error: "Rating and content are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (content.length < 10 || content.length > 1000) {
      return NextResponse.json(
        { error: "Content must be between 10 and 1000 characters" },
        { status: 400 }
      );
    }

    const userId = (session.user as any)?.id || session.user.email;
    
    const review = await createReview({ userId, rating, content });
    
    if (!review) {
      return NextResponse.json(
        { error: "Failed to create review" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: "Review submitted successfully. It will be visible after admin approval.",
        review 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
