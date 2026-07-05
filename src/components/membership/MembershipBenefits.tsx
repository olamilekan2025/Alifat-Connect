"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { MembershipData } from "../../../types/membership";

interface MembershipBenefitsProps {
  membership: MembershipData;
}

export default function MembershipBenefits({
  membership,
}: MembershipBenefitsProps) {
  const benefits = [
    {
      title: "Airtime",
      value: `${membership.benefits.airtimeDiscount}%`,
    },
    {
      title: "Data",
      value: `${membership.benefits.dataDiscount}%`,
    },
    {
      title: "Cable TV",
      value: `${membership.benefits.cableDiscount}%`,
    },
    {
      title: "Electricity",
      value: `${membership.benefits.electricityDiscount}%`,
    },
    {
      title: "Recharge Cards",
      value: `${membership.benefits.rechargeCardDiscount}%`,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Current Benefits</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {benefits.map((benefit) => (
          <div
            key={benefit.title}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <span className="font-medium">
              {benefit.title}
            </span>

            <span className="font-bold text-green-600">
              {benefit.value}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}