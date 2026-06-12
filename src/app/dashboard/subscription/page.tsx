"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Crown,
  CheckCircle2,
  Zap,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Clock,
  UserCheck,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface PlanStructure {
  id: "monthly" | "quarterly" | "yearly";
  name: string;
  price: number;
  durationDays: number;
  badge?: string;
  popular?: boolean;
  savings?: string;
}

interface UserSubscriptionStatus {
  active: boolean;
  tier: string;
  expiryDate: string | null;
  daysRemaining: number;
}

export default function SubscriptionPage() {
  // System State Configuration Management
  const [selectedPlan, setSelectedPlan] = useState<
    "monthly" | "quarterly" | "yearly"
  >("yearly");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [walletBalance, setWalletBalance] = useState<number>(75000); // Track platform wallet balance

  // Simulated DB user membership footprint state
  const [currentSubscription, setCurrentSubscription] =
    useState<UserSubscriptionStatus>({
      active: true,
      tier: "Free Tier Account",
      expiryDate: null,
      daysRemaining: 0,
    });

  const deploymentPlans: PlanStructure[] = [
    {
      id: "monthly",
      name: "Monthly Access Plan",
      price: 2500,
      durationDays: 30,
    },
    {
      id: "quarterly",
      name: "Quarterly Access Plan",
      price: 6500,
      durationDays: 90,
      savings: "Save ₦1,000",
    },
    {
      id: "yearly",
      name: "Yearly Platinum Vanguard",
      price: 22000,
      durationDays: 365,
      badge: "Best Alternative Value",
      popular: true,
      savings: "Save ₦8,000",
    },
  ];

  const premiumFeatures = [
    {
      title: "Elevated Transaction Ceilings",
      desc: "Unlock higher funding capacities across all asset modules.",
    },
    {
      title: "Priority Channel Escrow",
      desc: "Your verification transactions hit the node ahead of queue grids.",
    },
    {
      title: "Slashed Distribution Service Rates",
      desc: "Keep more of your capital value; reduced rates on utilities.",
    },
    {
      title: "Exclusive E-Pin Batch Tools",
      desc: "Generate vast card runs via advanced multi-threaded background queues.",
    },
    {
      title: "Dedicated SLA Account Desk",
      desc: "Instant technical intervention pipeline direct to backend engineering.",
    },
  ];

  const resolvedPlanDetails = deploymentPlans.find(
    (p) => p.id === selectedPlan,
  )!;
const handleProcessSubscription = async () => {
  if (walletBalance < resolvedPlanDetails.price) {
    toast.error("Insufficient Balance", {
      description:
        "Fund your wallet before purchasing this subscription.",
    });
    return;
  }

  try {
    setIsSubmitting(true);

    const response = await fetch(
      "/api/subscription/purchase",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          planId: selectedPlan,
        }),
      }
    );

    const text =
      await response.text();

    let result;

    try {
      result = JSON.parse(text);
    } catch {
      throw new Error(
        "Subscription API returned invalid response. Check your route."
      );
    }

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Subscription failed"
      );
    }

    setWalletBalance(
      (prev) =>
        prev -
        resolvedPlanDetails.price
    );

    const expiryDate =
      new Date();

    expiryDate.setDate(
      expiryDate.getDate() +
        resolvedPlanDetails.durationDays
    );

    setCurrentSubscription({
      active: true,
      tier:
        resolvedPlanDetails.name,
      expiryDate:
        expiryDate.toLocaleDateString(),
      daysRemaining:
        resolvedPlanDetails.durationDays,
    });

    toast.success(
      "Subscription Activated",
      {
        description:
          "Subscription purchased successfully.",
      }
    );
  } catch (error: any) {
    toast.error(
      error.message ||
        "Subscription failed"
    );
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <main className="min-h-screen w-full bg-background text-foreground pb-16">
      {/* 1. PREMIUM HERO NODE CONTAINER LAYOUT */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-500/15 via-orange-500/5 to-transparent border-b border-border/40 py-16 px-4 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_0.5px,transparent_0.5px)] dark:bg-[radial-gradient(#d97706_0.5px,transparent_0.5px)] [background-size:32px_32px] opacity-15" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 backdrop-blur-md shadow-sm">
            <Crown className="w-3.5 h-3.5 fill-amber-500/20 animate-pulse" />
            Alifat Connect Premium Node Architecture
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
            Elevate Your Processing Engine to <br />
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">
              Enterprise Executive Status
            </span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto font-medium">
            Shed execution boundaries. Deploy higher structural transaction
            capacity metrics, bypass network queues, and access refined service
            layouts.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT WORKSPACE FLUID GRID (PLANS & BENEFITS BLOCK) */}
        <div className="lg:col-span-8 space-y-12">
          {/* 2. SUBSCRIPTION PLANS MATRIX SECTION */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight uppercase text-muted-foreground text-[11px]">
                Available Access Tiers
              </h2>
              <p className="text-xs text-muted-foreground">
                Select an operational commitment window to view configuration
                parameters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {deploymentPlans.map((plan) => {
                const isSelected = selectedPlan === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`relative rounded-3xl border p-5 bg-card cursor-pointer transition-all duration-300 flex flex-col justify-between select-none group h-full ${
                      isSelected
                        ? "border-orange-500 ring-2 ring-[#D4AF37] shadow-xl scale-[1.01]"
                        : "border-border/80 hover:border-border hover:bg-muted/30"
                    }`}
                  >
                    {plan.badge && (
                      <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-md text-[9px] font-black bg-gradient-to-r from-orange-500 to-amber-500 text-white uppercase tracking-wider shadow-sm">
                        {plan.badge}
                      </span>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold tracking-tight text-foreground">
                          {plan.name}
                        </h3>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                            isSelected
                              ? "border-[#D4AF37] bg-[#D4AF37]"
                              : "border-[#D4AF37]"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>

                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-2xl font-black text-foreground font-mono">
                          ₦{plan.price.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          / {plan.durationDays} Days
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground font-medium">
                        System Validity Cycle
                      </span>
                      {plan.savings ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          {plan.savings}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/80 font-mono">
                          Standard Price
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. PREMIUM ADVANTAGE BENEFIT LOGS */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold tracking-tight uppercase text-muted-foreground text-[11px]">
                System Architecture Advantages
              </h3>
              <p className="text-xs text-muted-foreground">
                Every active subscription allocation shifts your account
                footprint status profile.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {premiumFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 p-4 border border-border/50 rounded-2xl bg-muted/10 items-start"
                >
                  <div className="h-6 w-6 rounded-lg bg-orange-500/10 border border-[#D4AF37] flex items-center justify-center text-orange-500 flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground tracking-wide">
                      {feat.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE WORKSPACE BAR: STATUS CARDS & INVOICE FLOW ACTION CHANNEL */}
        <div className="lg:col-span-4 space-y-6">
          {/* 4. ACTIVE LIVE SYSTEM PLAN FOOTPRINT STATUS CARD */}
          <Card className="rounded-[28px] border border-border/80 bg-card overflow-hidden shadow-md">
            <div className="p-4 bg-muted/40 border-b border-border flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Membership Snapshot Status
              </span>
            </div>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  Core Profile Footprint
                </span>
                <span className="font-bold text-foreground uppercase px-2 py-0.5 bg-muted rounded-md text-[10px]">
                  {currentSubscription.tier}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  Network Expiry Timestamp
                </span>
                <span className="font-mono font-bold text-foreground">
                  {currentSubscription.expiryDate || "Continuous Cycle"}
                </span>
              </div>

              <div className="border-t border-dashed border-border pt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Time Pipeline Remaining</span>
                </div>
                <p className="font-mono font-black text-sm text-[#D4AF37] dark:text-[#D4AF37]">
                  {currentSubscription.daysRemaining} Days
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 5. LIVE CHECKOUT SETTLEMENT PORT CARD CONTAINER */}
          <Card className="rounded-[28px] border-2 border-[#D4AF37] bg-card shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Sparkles className="w-20 h-20 text-[#D4AF37]" />
            </div>

            <div className="p-5 bg-gradient-to-b from-orange-500/10 via-orange-500/5 to-transparent border-b border-border/40">
              <h3 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                Secure Checkout Node Gateway
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Value ledger transaction validation interface.
              </p>
            </div>

            <CardContent className="p-5 space-y-4 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Selected Parameters</span>
                  <span className="font-bold text-foreground">
                    {resolvedPlanDetails.name}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Allocation Duration</span>
                  <span className="font-semibold text-foreground">
                    {resolvedPlanDetails.durationDays} Days
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Platform Node Surcharge</span>
                  <span className="font-mono text-[#D4AF37] font-bold">
                    ₦0.00 (Waived)
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-border/80 space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Gross Value Due:
                  </span>
                  <span className="text-2xl font-black text-[#D4AF37] dark:text-[#D4AF37] font-mono tracking-tight">
                    ₦{resolvedPlanDetails.price.toLocaleString()}.00
                  </span>
                </div>

                <Button
                  onClick={handleProcessSubscription}
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#D4AF37] hover:opacity-95 text-white font-bold transition-all shadow-md shadow-[#D4AF37]/10 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Committing Ledger Vault...
                    </>
                  ) : (
                    <>
                      Authorize Wallet Debit
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </>
                  )}
                </Button>
              </div>

              <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground text-center">
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500/20" />
                Funds will be immediately subtracted from active balance.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
