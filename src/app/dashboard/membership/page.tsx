"use client";

import { useEffect, useState } from "react";

import MembershipHero from "@/components/membership/MembershipHero";
import MembershipProgress from "@/components/membership/MembershipProgress";
import MembershipBenefits from "@/components/membership/MembershipBenefits";
import MembershipComparison from "@/components/membership/MembershipComparison";
import MembershipTips from "@/components/membership/MembershipTips";

import { MembershipData } from "../../../../types/membership"

export default function MembershipPage() {
  const [membership, setMembership] =
    useState<MembershipData | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadMembership() {
      try {
        const res = await fetch("/api/membership");

        const data = await res.json();

       if (data.success) {
  setMembership(data.membership);
}
      } catch (error) {
        console.error("Failed to load membership:", error);
      } finally {
        setLoading(false);
      }
    }

    loadMembership();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        Loading...
      </div>
    );
  }

  if (!membership) {
    return (
      <div className="flex items-center justify-center py-20">
        Failed to load membership.
      </div>
    );
  }

  return (
    <main className="space-y-6">
      <MembershipHero membership={membership} />
      <MembershipProgress membership={membership} />
      <MembershipBenefits membership={membership} />
      <MembershipComparison membership={membership} />
      <MembershipTips />
    </main>
  );
}