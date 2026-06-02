"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import {
  ArrowUpRight,
  CreditCard,
  Smartphone,
  Tv,
  Zap,
  Wallet,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const quickActions = [
  {
    title: "Buy Airtime",
    icon: Smartphone,
    href: "/dashboard/airtime",
  },
  {
    title: "Buy Data",
    icon: Activity,
    href: "/dashboard/data",
  },
  {
    title: "Electricity",
    icon: Zap,
    href: "/dashboard/electricity",
  },
  {
    title: "TV Subscription",
    icon: Tv,
    href: "/dashboard/tv",
  },
];

export default function DashboardPage() {
  const [showBalance, setShowBalance] =
    useState(true);

  const [loading, setLoading] =
    useState(true);

  const [dashboardData, setDashboardData] =
    useState<any>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await fetch(
          "/api/dashboard",
          {
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        setDashboardData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  const user = {
    name:
      dashboardData?.user?.name ||
      "User",

    balance:
      Number(
        dashboardData?.wallet
          ?.balance
      ) || 0,

    totalTransactions:
      Number(
        dashboardData?.stats
          ?.totalTransactions
      ) || 0,

    successfulRate:
      Number(
        dashboardData?.stats
          ?.successfulRate
      ) || 0,
  };

  const transactions =
    dashboardData?.transactions ||
    [];

  if (loading) {
    return (
      <div className="p-6">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1 md:p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-1xl font-bold tracking-tight md:text-4xl">
            Welcome back, {user.name}
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Manage your VTU services
            and wallet.
          </p>
        </div>
      </div>

      {/* TOP GRID */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* WALLET CARD */}
        <Card className="overflow-hidden rounded-3xl border-none bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white shadow-2xl">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-zinc-400">
                    Available Balance
                  </p>

                  <button
                    onClick={() =>
                      setShowBalance(
                        !showBalance
                      )
                    }
                    className="text-zinc-400 transition hover:text-white"
                  >
                    {showBalance ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
                  {showBalance
                    ? `₦${user.balance.toLocaleString()}`
                    : "₦••••••"}
                </h1>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl">
                <Wallet className="h-7 w-7" />
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button className="h-12 rounded-2xl bg-white text-black hover:bg-zinc-200">
                Fund Wallet
              </Button>

              <Button
                variant="outline"
                className="h-12 rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                Transfer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* STATS */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
          <Card className="rounded-3xl border-zinc-200/70 shadow-sm dark:border-zinc-800">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-zinc-500">
                  Total Transactions
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  {user.totalTransactions.toLocaleString()}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900">
                <TrendingUp className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-zinc-200/70 shadow-sm dark:border-zinc-800">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-zinc-500">
                  Successful Payments
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  {user.successfulRate}%
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-950/40">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <Card className="rounded-3xl border-zinc-200/70 shadow-sm dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-xl">
            Quick Actions
          </CardTitle>

          <CardDescription>
            Access all VTU services
            quickly.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map(
              (action) => {
                const Icon =
                  action.icon;

                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="group flex items-center justify-between rounded-3xl border border-zinc-200 bg-white p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 transition-all duration-300 group-hover:bg-zinc-900 group-hover:text-white dark:bg-zinc-800 dark:group-hover:bg-white dark:group-hover:text-black">
                        <Icon className="h-6 w-6" />
                      </div>

                      <p className="mt-5 text-base font-semibold text-zinc-900 dark:text-white">
                        {action.title}
                      </p>
                    </div>

                    <ArrowUpRight className="h-5 w-5 text-zinc-400 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </Link>
                );
              }
            )}
          </div>
        </CardContent>
      </Card>

      {/* TRANSACTIONS */}
      <Card className="rounded-3xl border-zinc-200/70 shadow-sm dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-xl">
            Recent Transactions
          </CardTitle>

          <CardDescription>
            Your latest activities.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {transactions.length >
          0 ? (
            transactions.map(
              (
                transaction: any
              ) => (
                <div
                  key={
                    transaction.id
                  }
                  className="flex items-center justify-between rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900">
                      <CreditCard className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="font-semibold">
                        {
                          transaction.title
                        }
                      </p>

                      <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
                        <Clock3 className="h-4 w-4" />

                        {
                          transaction.time
                        }
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      {
                        transaction.amount
                      }
                    </p>

                    <span className="mt-1 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                      {
                        transaction.status
                      }
                    </span>
                  </div>
                </div>
              )
            )
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center">
              <p className="text-sm text-zinc-500">
                No transactions found.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}