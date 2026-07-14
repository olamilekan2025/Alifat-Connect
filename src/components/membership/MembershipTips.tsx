"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  CircleCheck,
  Gift,
  Wallet,
} from "lucide-react";

const tips = [
  {
    icon: Wallet,
    title: "Use Your Wallet",
    text: "Every successful wallet payment counts toward your membership progress. Paying directly from your wallet ensures each eligible transaction is recorded.",
  },
  {
    icon: Gift,
    title: "Purchase More Services",
    text: "Buy airtime, data bundles, cable TV subscriptions, electricity tokens, education bills, and recharge cards to unlock higher discount tiers.",
  },
  {
    icon: CircleCheck,
    title: "Automatic Upgrades",
    text: "Once you meet the required transaction count and spending volume, your membership is upgraded automatically—no application required.",
  },
];

export default function MembershipTips() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>How to Upgrade Faster</CardTitle>
      </CardHeader>

      <CardContent className="grid gap-4 md:grid-cols-3">
        {tips.map((tip) => {
          const Icon = tip.icon;

          return (
            <div
              key={tip.title}
              className="rounded-xl border p-5 transition-colors hover:border-[#D4AF37] hover:bg-[#D4AF37]/5"
            >
              <Icon className="mb-4 h-8 w-8 text-[#D4AF37]" />

              <h3 className="text-lg font-semibold">
                {tip.title}
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                {tip.text}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}