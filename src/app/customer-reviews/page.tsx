import { Metadata } from "next";
import CustomerReviewsPage from "./CustomerReviewsPage";

export const metadata: Metadata = {
  title: "Customer Reviews | Alifat Connect",
  description: "Read real customer reviews and experiences from Alifat Connect users.",
};

export default function Page() {
  return <CustomerReviewsPage />;
}
