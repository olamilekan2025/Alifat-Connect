"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Crown,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Wallet,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function BecomeSellerPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [walletBalance, setWalletBalance] = useState(0);

  const [accountType, setAccountType] = useState("user");

  const upgradeFee = 5000;

  const benefits = [
    "Cheaper data prices",
    "Higher transaction limits",
    "Priority support",
    "Access to reseller rates",
    "Higher referral earnings",
    "Exclusive seller features",
  ];

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch("/api/user/profile", {
          cache: "no-store",
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setWalletBalance(data.user.walletBalance ?? 0);

          setAccountType(data.user.accountType ?? "user");
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadUser();
  }, []);

  const handleUpgrade = async () => {
    if (accountType === "seller") {
      toast.info("Your seller account is already active.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/account/upgrade-seller", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upgrade failed");
      }

      setWalletBalance(data.data.walletBalance);

      setAccountType(data.data.accountType);

      toast.success("Seller account activated successfully.");

      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Upgrade failed.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
  return (
    <main className="min-h-screen bg-background">
      <section className="relative overflow-hidden rounded-[32px] md:pl-10">
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative overflow-hidden rounded-[32px] border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-transparent p-6 lg:p-8">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-yellow-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <div className="h-7 w-36 animate-pulse rounded-full bg-yellow-500/20" />
              <div className="h-10 w-80 max-w-full animate-pulse rounded-2xl bg-muted" />
              <div className="h-4 w-[520px] max-w-full animate-pulse rounded-full bg-muted" />
              <div className="h-4 w-80 max-w-full animate-pulse rounded-full bg-muted" />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="rounded-2xl border bg-background/80 px-5 py-4 backdrop-blur">
                <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
                <div className="mt-3 h-8 w-32 animate-pulse rounded-xl bg-muted" />
                </div>

              <div className="rounded-2xl border bg-background/80 px-5 py-4 backdrop-blur">
                <div className="h-3 w-20 animate-pulse rounded-full bg-muted" />
                <div className="mt-3 h-8 w-28 animate-pulse rounded-xl bg-yellow-500/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-8xl px-0 py-10 md:pl-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="overflow-hidden rounded-[32px] border-0 shadow-xl">
              <CardContent className="p-1 md:p-8">
                <div className="mb-8 flex items-center gap-3">
                  <div className="h-12 w-12 animate-pulse rounded-2xl bg-yellow-500/10" />

                  <div className="space-y-3">
                    <div className="h-7 w-44 animate-pulse rounded-xl bg-muted" />
                    <div className="h-4 w-56 animate-pulse rounded-full bg-muted" />
                  </div>
                   </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-3xl border p-5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 animate-pulse rounded-xl bg-emerald-500/10" />
                        <div className="h-5 w-40 animate-pulse rounded-full bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="overflow-hidden rounded-[32px] border-0 shadow-xl">
              <CardContent className="p-0">
                 <div className="bg-gradient-to-r from-yellow-500 to-amber-600 p-6 text-black">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 animate-pulse rounded-md bg-black/10" />
                    <div className="h-5 w-32 animate-pulse rounded-full bg-black/10" />
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="h-4 w-28 animate-pulse rounded-full bg-black/10" />
                    <div className="h-11 w-40 animate-pulse rounded-xl bg-black/10" />
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-28 animate-pulse rounded-full bg-muted" />
                    <div className="h-7 w-20 animate-pulse rounded-full bg-muted" />
                  </div>
                </div>
              </CardContent>
            </Card>
             <Card className="sticky top-24 overflow-hidden rounded-[32px] border-2 border-yellow-500/20 shadow-2xl">
              <div className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 p-6 text-black">
                <div className="flex items-center justify-between">
                  <div className="h-7 w-40 animate-pulse rounded-xl bg-black/10" />
                  <div className="h-6 w-6 animate-pulse rounded-md bg-black/10" />
                </div>

                <div className="mt-3 h-4 w-28 animate-pulse rounded-full bg-black/10" />
              </div>

              <CardContent className="p-6">
                <div className="text-center">
                  <div className="mx-auto h-12 w-40 animate-pulse rounded-2xl bg-yellow-500/20" />
                  <div className="mx-auto mt-4 h-4 w-64 max-w-full animate-pulse rounded-full bg-muted" />
                  <div className="mx-auto mt-2 h-4 w-48 max-w-full animate-pulse rounded-full bg-muted" />
                </div>

                <div className="mt-8 h-14 w-full animate-pulse rounded-2xl bg-yellow-500/20" />

                <div className="mt-5 flex items-center justify-center gap-2">
                  <div className="h-3 w-3 animate-pulse rounded-sm bg-muted" />
                  <div className="h-3 w-56 max-w-full animate-pulse rounded-full bg-muted" />
                </div>
              </CardContent>
               </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bor rounded-[32px] md:pl-10">
        <div className="absolute inset-0 " />

        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative overflow-hidden rounded-[32px] border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-transparent p-6 lg:p-8">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-yellow-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-500">
                <Crown className="h-3.5 w-3.5" />
                Seller Upgrade
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight">
                Become a Verified Seller
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Unlock reseller pricing, bigger profits, priority support,
                higher limits, and exclusive seller tools.
              </p>
            </div>

            <div className="flex gap-4">
              <div className="rounded-2xl border bg-background/80 px-5 py-4 backdrop-blur">
                <p className="text-xs text-muted-foreground">Wallet Balance</p>

                <p className="mt-1 text-2xl font-black">
                  {loadingProfile
                    ? "..."
                    : `₦${walletBalance.toLocaleString()}`}
                </p>
              </div>

              <div className="rounded-2xl border bg-background/80 px-5 py-4 backdrop-blur">
                <p className="text-xs text-muted-foreground">Upgrade Fee</p>

                <p className="mt-1 text-2xl font-black text-yellow-500">
                  ₦5,000
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-8xl px-0 py-10 md:pl-10 ">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Benefits */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden rounded-[32px] border-0 shadow-xl">
              <CardContent className="p-1 md:p-8">
                <div className="mb-8 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500/10">
                    <Sparkles className="h-6 w-6 text-yellow-500" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-black">Seller Benefits</h2>
                    <p className="text-sm text-muted-foreground">
                      Everything unlocked after activation
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {benefits.map((benefit) => (
                    <div
                      key={benefit}
                      className="group rounded-3xl border p-5 transition-all hover:border-yellow-500/30 hover:bg-yellow-500/[0.03]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        </div>

                        <span className="font-semibold">{benefit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="overflow-hidden rounded-[32px] border-0 shadow-xl">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-yellow-500 to-amber-600 p-6 text-black">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    <span className="font-bold">Account Status</span>
                  </div>

                  <div className="mt-6">
                    <p className="text-sm opacity-80">Wallet Balance</p>

                    <h2 className="mt-1 text-4xl font-black">
                      {loadingProfile
                        ? "..."
                        : `₦${walletBalance.toLocaleString()}`}
                    </h2>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Account Type</span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        accountType === "seller"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-muted"
                      }`}
                    >
                      {accountType}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upgrade Card */}
            <Card className="sticky top-24 overflow-hidden rounded-[32px] border-2 border-yellow-500/20 shadow-2xl">
              <div className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 p-6 text-black">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black">Seller Upgrade</h3>

                  <Crown className="h-6 w-6" />
                </div>

                <p className="mt-2 text-sm opacity-80">One-time payment</p>
              </div>

              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-5xl font-black text-yellow-500">
                    ₦5,000
                  </div>

                  <p className="mt-3 text-sm text-muted-foreground">
                    Upgrade once and enjoy lifetime seller privileges.
                  </p>
                </div>

                <Button
                  onClick={handleUpgrade}
                  disabled={
                    loading || loadingProfile || accountType === "seller"
                  }
                  className="mt-8 h-14 w-full rounded-2xl bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-base font-black text-black shadow-lg hover:opacity-95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : accountType === "seller" ? (
                    "Seller Active"
                  ) : (
                    <>
                      Become a Seller
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>

                <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Wallet className="h-3 w-3" />
                  Payment will be deducted from your wallet
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
