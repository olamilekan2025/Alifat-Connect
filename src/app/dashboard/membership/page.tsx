// "use client";

// import { useEffect, useState } from "react";

// import MembershipHero from "@/components/membership/MembershipHero";
// import MembershipProgress from "@/components/membership/MembershipProgress";
// import MembershipBenefits from "@/components/membership/MembershipBenefits";
// import MembershipComparison from "@/components/membership/MembershipComparison";
// import MembershipTips from "@/components/membership/MembershipTips";

// import { MembershipData } from "../../../../types/membership"

// export default function MembershipPage() {
//   const [membership, setMembership] =
//     useState<MembershipData | null>(null);

//   const [loading, setLoading] =
//     useState(true);

//   useEffect(() => {
//     async function loadMembership() {
//       try {
//         const res = await fetch("/api/membership");

//         const data = await res.json();

//        if (data.success) {
//   setMembership(data.membership);
// }
//       } catch (error) {
//         console.error("Failed to load membership:", error);
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadMembership();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-20">
//         Loading...
//       </div>
//     );
//   }

//   if (!membership) {
//     return (
//       <div className="flex items-center justify-center py-20">
//         Failed to load membership.
//       </div>
//     );
//   }

//   return (
//     <main className="space-y-6">
//       <MembershipHero membership={membership} />
//       <MembershipProgress membership={membership} />
//       <MembershipBenefits membership={membership} />
//       <MembershipComparison membership={membership} />
//       <MembershipTips />
//     </main>
//   );
// }





"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Crown,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import MembershipHero from "@/components/membership/MembershipHero";
import MembershipProgress from "@/components/membership/MembershipProgress";
import MembershipBenefits from "@/components/membership/MembershipBenefits";
import MembershipComparison from "@/components/membership/MembershipComparison";
import MembershipTips from "@/components/membership/MembershipTips";
import { Button } from "@/components/ui/button";

import { MembershipData } from "../../../../types/membership";

export default function MembershipPage() {
  const [membership, setMembership] = useState<MembershipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  async function loadMembership() {
    try {
      const res = await fetch("/api/membership", {
        cache: "no-store",
      });
      const data = await res.json();

      if (data.success) {
        setMembership(data.membership);
      } else {
        setMembership(null);
      }
    } catch (error) {
      console.error("Failed to load membership:", error);
      setMembership(null);
    } finally {
       setLoading(false);
      setRetrying(false);
    }
  }

  useEffect(() => {
    loadMembership();
  }, []);

  async function handleRetry() {
    setRetrying(true);
    await loadMembership();
  }

  if (loading) {
    return <MembershipPageSkeleton />;
  }

  if (!membership) {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-950 dark:bg-zinc-950 dark:text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center">
          <div className="w-full max-w-md rounded-[2rem] border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <AlertCircle className="h-7 w-7" />
            </div>

            <h1 className="mt-5 text-2xl font-semibold tracking-tight">
              Membership unavailable
            </h1>

            <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              We could not load your membership profile. Check your connection
              and try again.
            </p>

            <Button
              onClick={handleRetry}
              disabled={retrying}
              className="mt-6 h-12 w-full rounded-2xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              {retrying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                   </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-6 text-zinc-950 dark:bg-zinc-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                <Crown className="h-3.5 w-3.5" />
                Membership center
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Your Membership
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                Track your current level, progress, rewards, benefits, and the
                next upgrades available to your account.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-zinc-950/70">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                   <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      Status
                    </p>
                    <p className="text-sm font-semibold">Active profile</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-zinc-950/70">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      Rewards
                    </p>
                    <p className="text-sm font-semibold">Benefits unlocked</p>
                  </div>
                </div>
              </div>
            </div>
             </div>
        </section>

        <div className="space-y-6">
          <MembershipHero membership={membership} />
          <MembershipProgress membership={membership} />
          <MembershipBenefits membership={membership} />
          <MembershipComparison membership={membership} />
          <MembershipTips />
        </div>
      </div>
    </main>
  );
}

function MembershipPageSkeleton() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-950 dark:bg-zinc-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
           <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="h-7 w-44 animate-pulse rounded-full bg-zinc-200 dark:bg-white/10" />
              <div className="h-11 w-72 max-w-full animate-pulse rounded-2xl bg-zinc-200 dark:bg-white/10" />
              <div className="h-4 w-[560px] max-w-full animate-pulse rounded-full bg-zinc-200 dark:bg-white/10" />
              <div className="h-4 w-96 max-w-full animate-pulse rounded-full bg-zinc-200 dark:bg-white/10" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-20 w-full animate-pulse rounded-2xl bg-zinc-200 dark:bg-white/10 sm:w-56" />
              <div className="h-20 w-full animate-pulse rounded-2xl bg-zinc-200 dark:bg-white/10 sm:w-56" />
            </div>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="h-72 animate-pulse rounded-[2rem] bg-zinc-200 dark:bg-white/10" />
          <div className="h-72 animate-pulse rounded-[2rem] bg-zinc-200 dark:bg-white/10" />
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
             <div
              key={index}
              className="h-44 animate-pulse rounded-[1.75rem] bg-zinc-200 dark:bg-white/10"
            />
          ))}
        </div>

        <div className="h-80 animate-pulse rounded-[2rem] bg-zinc-200 dark:bg-white/10" />
      </div>
    </main>
  );
}