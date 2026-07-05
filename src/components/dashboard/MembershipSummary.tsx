"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

import { MembershipData } from "../../../types/membership";

export default function MembershipSummary() {
  const [membership, setMembership] =
    useState<MembershipData | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMembership() {
      try {
        const res = await fetch("/api/membership");
        const data = await res.json();

if (data.success) {
  setMembership(data.membership);
}


      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadMembership();
  }, []);

  if (loading) {
    return (
      <Card>
  <CardContent className="space-y-4 p-6">
    <div className="h-5 w-40 animate-pulse rounded bg-muted" />
    <div className="h-3 animate-pulse rounded bg-muted" />
    <div className="h-3 animate-pulse rounded bg-muted" />
    <div className="h-3 animate-pulse rounded bg-muted" />
  </CardContent>
</Card>
    );
  }

  if (!membership) return null;

  const transactionTarget =
    membership.level === "starter"
      ? membership.requirements.premium.transactions
      : membership.requirements.enterprise.transactions;

  const transactionProgress = Math.min(
    100,
    (membership.transactionCount /
      transactionTarget) *
      100
  );

 const spendingTarget =
  membership.level === "enterprise"
    ? membership.transactionVolume
    : membership.requirements.enterprise
        .volume;

const spendingProgress = Math.min(
  100,
  (membership.transactionVolume /
    spendingTarget) *
    100
);

  return (
    <Card className="overflow-hidden rounded-3xl border border-black bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37] hover:shadow-lg dark:border-white dark:bg-black">
      <CardHeader>
        <CardTitle>
          Membership Progress
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span>Transactions</span>

            <span>
              {membership.transactionCount}/
              {transactionTarget}
            </span>
          </div>

          <Progress value={transactionProgress} />
        </div>

        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span>Total Spending</span>

            <span>
              ₦
              {membership.transactionVolume.toLocaleString()}
            </span>
          </div>

          <Progress value={spendingProgress} />
        </div>

        <div className="space-y-2 rounded-xl border p-4">
          <h3 className="font-semibold">
            Current Discounts
          </h3>

          <div className="flex justify-between">
            <span>Airtime</span>

            <span>
              {membership.benefits.airtimeDiscount}%
            </span>
          </div>

          <div className="flex justify-between">
            <span>Data</span>

            <span>
              {membership.benefits.dataDiscount}%
            </span>
          </div>

          <div className="flex justify-between">
            <span>Electricity</span>

            <span>
              {membership.benefits.electricityDiscount}%
            </span>
          </div>

          <div className="flex justify-between">
            <span>Cable TV</span>

            <span>
              {membership.benefits.cableDiscount}%
            </span>
          </div>

          <div className="flex justify-between">
            <span>Recharge Cards</span>

            <span>
              {membership.benefits.rechargeCardDiscount}%
            </span>
          </div>
        </div>

        <Button asChild className="w-full">
          <Link href="/dashboard/membership">
            View Full Membership
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}