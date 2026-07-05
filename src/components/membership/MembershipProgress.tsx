"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { MembershipData } from "../../../types/membership";

interface MembershipProgressProps {
  membership: MembershipData;
}

export default function MembershipProgress({
  membership,
}: MembershipProgressProps) {
  const transactionTarget =
    membership.level === "starter"
      ? membership.requirements.premium.transactions
      : membership.requirements.enterprise.transactions;

  const transactionProgress = Math.min(
    100,
    (membership.transactionCount / transactionTarget) * 100
  );

  const spendingTarget =
    membership.requirements.enterprise.volume;

  const spendingProgress = Math.min(
    100,
    (membership.transactionVolume / spendingTarget) * 100
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Progress</CardTitle>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Transactions */}
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>Successful Transactions</span>

            <span className="font-medium">
              {membership.transactionCount} / {transactionTarget}
            </span>
          </div>

          <Progress value={transactionProgress} />

          <p className="mt-2 text-xs text-muted-foreground">
            {membership.remainingTransactions} more successful
            transaction(s) to reach{" "}
            <span className="capitalize">
              {membership.nextLevel}
            </span>
            .
          </p>
        </div>

        {/* Spending */}
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>Total Spending</span>

            <span className="font-medium">
              ₦
              {membership.transactionVolume.toLocaleString()} / ₦
              {spendingTarget.toLocaleString()}
            </span>
          </div>

          <Progress value={spendingProgress} />

          <p className="mt-2 text-xs text-muted-foreground">
            ₦
            {membership.remainingVolume.toLocaleString()} remaining
            to reach Enterprise.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}