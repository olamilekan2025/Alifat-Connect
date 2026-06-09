"use client";

import { useEffect, useState } from "react";
import {
  Wallet,
  ArrowDownCircle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Activity,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

/* ---------------- TYPES ---------------- */

interface Transaction {
  _id: string;
  category?: string;
  amount: number;
  status: string;
  createdAt?: string;
}

interface ReportData {
  totalSpent: number;
  totalFunded: number;
  successful: number;
  failed: number;
  pending: number;
  airtime: number;
  data: number;
  transfer: number;
  funding: number;
  withdrawal: number;
  transactions: Transaction[];
}

/* ---------------- PAGE ---------------- */

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/reports");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* ---------------- SHADCN SKELETON UI ---------------- */

 if (loading) {
  return (
    <div className="space-y-6 p-4 md:p-6">

      {/* HEADER SKELETON */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* KPI CARDS SKELETON (more realistic) */}
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>

            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* CHARTS SKELETON (structured like real charts) */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* BAR CHART SKELETON */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <Skeleton className="h-5 w-40" />

          <div className="flex items-end gap-2 h-44">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className="w-full h-[40%] rounded-md"
              />
            ))}
          </div>
        </div>

        {/* PIE CHART SKELETON */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <Skeleton className="h-5 w-40" />

          <div className="flex items-center justify-center h-44">
            <Skeleton className="h-36 w-36 rounded-full" />
          </div>

          <div className="flex justify-center gap-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>

      {/* INSIGHT SKELETON */}
      <div className="rounded-xl border bg-card p-5 space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>

      {/* TABLE SKELETON (REAL ROW STYLE) */}
      <div className="rounded-xl border bg-card p-5 space-y-4">

        <Skeleton className="h-5 w-48" />

        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between"
            >
              <div className="flex gap-3 items-center">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-3 w-24" />
              </div>

              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

  if (!data) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        No report data found
      </div>
    );
  }

  /* ---------------- SAFE DATA ---------------- */

  const safe = {
    totalSpent: data.totalSpent || 0,
    totalFunded: data.totalFunded || 0,
    successful: data.successful || 0,
    failed: data.failed || 0,
    airtime: data.airtime || 0,
    data: data.data || 0,
    transfer: data.transfer || 0,
    funding: data.funding || 0,
    withdrawal: data.withdrawal || 0,
  };

  const pieData = [
    { name: "Airtime", value: safe.airtime },
    { name: "Data", value: safe.data },
    { name: "Transfer", value: safe.transfer },
    { name: "Funding", value: safe.funding },
    { name: "Withdrawal", value: safe.withdrawal },
  ];

  const barData = [
    { name: "Spent", value: safe.totalSpent },
    { name: "Funded", value: safe.totalFunded },
  ];

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];

  const successRate =
    safe.successful + safe.failed > 0
      ? (
          (safe.successful / (safe.successful + safe.failed)) *
          100
        ).toFixed(1)
      : "0";

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6 p-4 md:pl-10">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Financial Overview
        </h1>
        <p className="text-muted-foreground">
          Real-time insights into your VTU performance
        </p>
      </div>

      {/* CARDS */}
      <div className="grid gap-4 md:grid-cols-4">

        <Card className="bg-gradient-to-r from-black to-gray-900 text-white">
          <CardContent className="p-5">
            <Wallet />
            <p className="text-sm mt-2">Total Spent</p>
            <h2 className="text-2xl font-bold">
              ₦{safe.totalSpent.toLocaleString()}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <ArrowDownCircle />
            <p className="text-sm text-muted-foreground mt-2">
              Wallet Funding
            </p>
            <h2 className="text-xl font-bold">
              ₦{safe.totalFunded.toLocaleString()}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <CheckCircle2 className="text-green-500" />
            <p className="text-sm text-muted-foreground mt-2">
              Success Rate
            </p>
            <h2 className="text-xl font-bold">
              {successRate}%
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <XCircle className="text-red-500" />
            <p className="text-sm text-muted-foreground mt-2">
              Failed
            </p>
            <h2 className="text-xl font-bold">
              {safe.failed}
            </h2>
          </CardContent>
        </Card>
      </div>

      {/* CHARTS */}
      <div className="grid gap-6 md:grid-cols-2">

        <Card>
          <CardContent className="p-5">
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <TrendingUp size={18} />
              Spending Overview
            </h2>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <Activity size={18} />
              Category Breakdown
            </h2>

            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={90}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* TABLE */}
      <Card>
        <CardContent className="p-5">
          <h2 className="mb-4 text-lg font-semibold">
            Recent Transactions
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b">
                  <th className="py-3 text-left">Category</th>
                  <th className="py-3 text-left">Amount</th>
                  <th className="py-3 text-left">Status</th>
                  <th className="py-3 text-left">Date</th>
                </tr>
              </thead>

              <tbody>
                {data.transactions?.length ? (
                  data.transactions.map((tx) => (
                    <tr key={tx._id} className="border-b hover:bg-muted/40">
                      <td className="py-4 capitalize">
                        {tx.category ?? "-"}
                      </td>

                      <td className="py-4 font-medium">
                        ₦{tx.amount.toLocaleString()}
                      </td>

                      <td className="py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            tx.status === "success"
                              ? "bg-green-500/10 text-green-600"
                              : tx.status === "failed"
                              ? "bg-red-500/10 text-red-600"
                              : "bg-yellow-500/10 text-yellow-600"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>

                      <td className="py-4 text-sm text-muted-foreground">
                        {tx.createdAt
                          ? new Date(tx.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}