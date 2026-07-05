"use client";

import { Crown } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { MembershipData } from "../../../types/membership";

interface MembershipHeroProps {
  membership: MembershipData;
}

export default function MembershipHero({
  membership,
}: MembershipHeroProps) {
  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-white shadow-xl">
      <CardContent className="flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-widest opacity-80">
            Membership Program
          </p>

          <h1 className="text-4xl font-bold capitalize">
  {membership.level} Member
</h1>

          <p className="max-w-xl text-white/90">
            Every successful purchase increases your membership level,
            unlocking higher discounts on airtime, data, electricity,
            cable TV, education bills and recharge cards.
          </p>

          <div className="mt-4 inline-flex rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur">
            Current Level:{" "}
           Current Level:
<span className="ml-2 font-bold capitalize">
  {membership.level}
</span>
          </div>
        </div>

        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur">
          <Crown className="h-12 w-12" />
        </div>
      </CardContent>
    </Card>
  );
}