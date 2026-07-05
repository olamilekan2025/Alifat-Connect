import Link from "next/link";
import {
  Award,
  Crown,
  Building2,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type MembershipLevel =
  | "starter"
  | "premium"
  | "enterprise";

interface MembershipCardProps {
  membershipLevel?: MembershipLevel;
}

export default function MembershipCard({
  membershipLevel = "starter",
}: MembershipCardProps) {
  const config: Record<
    MembershipLevel,
    {
      icon: React.ReactNode;
      title: string;
      description: string;
      border: string;
      background: string;
    }
  > = {
    starter: {
      icon: (
        <Award className="h-8 w-8 text-[#D4AF37]" />
      ),
      title: "Starter Member",
      description:
        "Every account starts here. Verify your account and continue using Alifat Connect to unlock Premium benefits.",
      border: "border-[#D4AF37]/30",
      background: "bg-[#D4AF37]/5",
    },

    premium: {
      icon: (
        <Crown className="h-8 w-8 text-emerald-600" />
      ),
      title: "Premium Member",
      description:
        "You're enjoying lower transaction rates, higher wallet limits, faster processing, and priority support.",
      border: "border-emerald-300",
      background:
        "bg-emerald-50 dark:bg-emerald-950/20",
    },

    enterprise: {
      icon: (
        <Building2 className="h-8 w-8 text-blue-600" />
      ),
      title: "Enterprise Member",
      description:
        "Your organization enjoys dedicated support, bulk transactions, API access, and custom pricing.",
      border: "border-blue-300",
      background:
        "bg-blue-50 dark:bg-blue-950/20",
    },
  };

  const current =
    config[membershipLevel] ?? config.starter;

  return (
    <Card
      className={`${current.border} ${current.background}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {current.icon}

          <div className="flex-1">
            <h2 className="text-xl font-bold">
              {current.title}
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              {current.description}
            </p>

            {membershipLevel ===
              "starter" && (
              <Button
                asChild
                className="mt-5"
              >
                <Link href="/pricing">
                  Learn About Premium
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}