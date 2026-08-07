import { connectToDatabase } from "@/lib/mongodb";
import { getAllReviews } from "@/lib/reviews";
import Review from "@/models/Review";
import Link from "next/link";
import ReviewTable from "./ReviewTable";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type PageProps = {
  searchParams?: Promise<{
    page?: string;
    status?: string;
  }>;
};

export default async function AdminReviewsPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Ensure only admins can access this page
  const userRole = String(session.user?.role || "user").toLowerCase();
  if (userRole !== "admin") {
    redirect("/dashboard/reviews");
  }

  await connectToDatabase();

  const params = (await searchParams) ?? {};

  const page = Math.max(1, Number(params.page ?? "1"));
  const status = params.status ?? "";

  const [reviewsData, totalReviews, pendingReviews, approvedReviews, rejectedReviews] = await Promise.all([
    getAllReviews({ page, limit: PAGE_SIZE, status: status || undefined }),
    Review.countDocuments(),
    Review.countDocuments({ status: "pending" }),
    Review.countDocuments({ status: "approved" }),
    Review.countDocuments({ status: "rejected" }),
  ]);

  const { reviews, total, totalPages } = reviewsData;

  return (
    <div className="min-h-screen space-y-6 bg-gradient-to-b from-background to-muted/20 p-4 sm:p-6 lg:space-y-8 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
            Reviews Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage user reviews, approvals, and featured content.
          </p>
        </div>
        <div className="w-full rounded-2xl border bg-card px-5 py-4 shadow-sm sm:w-auto sm:px-6">
          <p className="text-xs uppercase text-muted-foreground">
            Total Reviews
          </p>
          <p className="text-3xl font-bold">{totalReviews.toLocaleString()}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border bg-yellow-500/10 p-6 shadow-sm transition hover:-translate-y-1">
          <p className="text-yellow-700 text-sm">Pending Reviews</p>
          <h2 className="mt-3 text-4xl font-black text-yellow-600">
            {pendingReviews}
          </h2>
        </div>

        <div className="rounded-3xl border bg-emerald-500/10 p-6 shadow-sm transition hover:-translate-y-1">
          <p className="text-emerald-700 text-sm">Approved Reviews</p>
          <h2 className="mt-3 text-4xl font-black text-emerald-600">
            {approvedReviews}
          </h2>
        </div>

        <div className="rounded-3xl border bg-red-500/10 p-6 shadow-sm transition hover:-translate-y-1">
          <p className="text-red-700 text-sm">Rejected Reviews</p>
          <h2 className="mt-3 text-4xl font-black text-red-600">
            {rejectedReviews}
          </h2>
        </div>
      </div>

      {/* Filters */}
      <form method="GET" className="rounded-3xl border bg-card p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <select
            name="status"
            defaultValue={status}
            className="h-12 rounded-xl border bg-background px-4"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <button
            className="h-12 rounded-xl bg-primary text-primary-foreground font-semibold transition hover:scale-[1.02]"
            type="submit"
          >
            Apply Filters
          </button>
        </div>
      </form>

      {/* Reviews Table */}
      <ReviewTable reviews={reviews} />

      {/* Pagination */}
      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <p className="text-sm text-muted-foreground">
          Showing page <strong>{page}</strong> of <strong>{totalPages}</strong>
        </p>

        <div className="flex flex-wrap gap-2">
          {page > 1 && (
            <Link
              href={`?page=${page - 1}&status=${status}`}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Previous
            </Link>
          )}

          {page < totalPages && (
            <Link
              href={`?page=${page + 1}&status=${status}`}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
