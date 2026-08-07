import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ReviewSubmissionPage from "../reviews/ReviewSubmissionPage";

export const metadata: Metadata = {
  title: "Write a Review | Alifat Connect",
  description: "Share your experience with Alifat Connect",
};

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Ensure only regular users can access this page
  const userRole = String(session.user?.role || "user").toLowerCase();
  if (userRole === "admin") {
    redirect("/admin-dashboard/reviews");
  }

  return <ReviewSubmissionPage session={session} />;
}
