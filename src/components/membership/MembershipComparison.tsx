"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { MembershipData } from "../../../types/membership";

interface MembershipComparisonProps {
  membership: MembershipData;
}

const levels = [
  {
    id: "starter",
    title: "Starter",
    requirement: "Default Membership",
    discount: "0%",
  },
  {
    id: "premium",
    title: "Premium",
    requirement: "15 Successful Transactions",
    discount: "Up to 2%",
  },
  {
    id: "enterprise",
    title: "Enterprise",
    requirement: "100 Transactions + ₦500,000 Spending",
    discount: "Up to 5%",
  },
] as const;

export default function MembershipComparison({
  membership,
}: MembershipComparisonProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Membership Levels
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid gap-5 md:grid-cols-3">
          {levels.map((level) => {
            const active =
              membership.level ===
              level.id;

            return (
              <div
                key={level.id}
                className={`rounded-xl border-2 p-6 transition-all ${
                  active
                    ? "border-[#D4AF37] bg-amber-50 shadow-md dark:bg-amber-950/20"
                    : "border-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">
                    {level.title}
                  </h3>

                  {active && (
                    <span className="rounded-full bg-[#D4AF37] px-2 py-1 text-xs font-semibold text-white">
                      Current
                    </span>
                  )}
                </div>

                <p className="mt-3 text-sm text-muted-foreground">
                  {level.requirement}
                </p>

                <div className="mt-8 text-3xl font-bold text-[#D4AF37]">
                  {level.discount}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}