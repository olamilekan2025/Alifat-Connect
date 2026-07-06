// "use client";

// import { useEffect, useState } from "react";

// import Link from "next/link";

// import {
//   ArrowUpRight,
//   CreditCard,
//   Smartphone,
//   Tv,
//   Zap,
//   Wallet,
//   TrendingUp,
//   Activity,
//   CheckCircle2,
//   Clock3,
//   Eye,
//   EyeOff,
// } from "lucide-react";

// import { Button } from "@/components/ui/button";

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import MembershipCard from "@/components/dashboard/membership-card";
// import MembershipSummary from "@/components/dashboard/MembershipSummary";

// const quickActions = [
//   {
//     title: "Buy Airtime",
//     icon: Smartphone,
//     href: "/dashboard/airtime",
//   },
//   {
//     title: "Buy Data",
//     icon: Activity,
//     href: "/dashboard/data",
//   },
//   {
//     title: "Electricity",
//     icon: Zap,
//     href: "/dashboard/electricity",
//   },
//   {
//     title: "TV Subscription",
//     icon: Tv,
//     href: "/dashboard/tv",
//   },
// ];

// export default function DashboardPage() {
//   const [showBalance, setShowBalance] =
//     useState(true);

//   const [loading, setLoading] =
//     useState(true);

//   const [dashboardData, setDashboardData] =
//     useState<any>(null);

//   useEffect(() => {
//     async function fetchDashboard() {
//       try {
//         const response = await fetch(
//           "/api/dashboard",
//           {
//             cache: "no-store",
//           }
//         );

//         const data =
//           await response.json();

//         setDashboardData(data);
//       } catch (error) {
//         console.error(error);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchDashboard();
//   }, []);

//  const user = {
//   name:
//     dashboardData?.user?.name ||
//     "User",

//   membershipLevel:
//     dashboardData?.user?.membershipLevel ||
//     "starter",

//   balance:
//     Number(
//       dashboardData?.wallet?.balance
//     ) || 0,

//   totalTransactions:
//     Number(
//       dashboardData?.stats
//         ?.totalTransactions
//     ) || 0,

//   successfulRate:
//     Number(
//       dashboardData?.stats
//         ?.successfulRate
//     ) || 0,
// };

//   const transactions =
//     dashboardData?.transactions ||
//     [];

//    if (loading && transactions.length === 0) {
//     return (
//       <div className="flex h-[70vh] items-center justify-center">
//         <div className="custom-loader" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 p-1 md:pl-12">
//       {/* HEADER */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-1xl font-bold tracking-tight md:text-4xl">
//             Welcome back, {user.name}
//           </h1>

//           <p className="mt-1 text-sm text-zinc-500">
//             Manage your VTU services
//             and wallet.
//           </p>
//         </div>
//       </div>

//       {/* TOP GRID */}
//       <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
//         {/* WALLET CARD */}
//         <Card className="overflow-hidden rounded-3xl border-none bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white shadow-2xl">
//           <CardContent className="p-6 md:p-8">
//             <div className="flex items-start justify-between">
//               <div>
//                 <div className="flex items-center gap-3">
//                   <p className="text-sm text-zinc-400">
//                     Available Balance
//                   </p>

//                   <button
//                     onClick={() =>
//                       setShowBalance(
//                         !showBalance
//                       )
//                     }
//                     className="text-zinc-400 transition hover:text-white"
//                   >
//                     {showBalance ? (
//                       <EyeOff className="h-4 w-4" />
//                     ) : (
//                       <Eye className="h-4 w-4" />
//                     )}
//                   </button>
//                 </div>

//                 <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
//                   {showBalance
//                     ? `₦${user.balance.toLocaleString()}`
//                     : "₦••••••"}
//                 </h1>
//               </div>

//               <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl">
//                 <Wallet className="h-7 w-7" />
//               </div>
//             </div>

//             <div className="mt-8 flex flex-wrap gap-3">
//               <Button className="h-12 rounded-2xl bg-white text-black hover:bg-zinc-200">
//                 Fund Wallet
//               </Button>

//               <Button
//                 variant="outline"
//                 className="h-12 rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/20"
//               >
//                 Transfer
//               </Button>
//             </div>
//           </CardContent>
//         </Card>

//         {/* STATS */}
//         <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
//           <Card className="rounded-3xl border-zinc-200/70 shadow-sm dark:border-zinc-800">
//             <CardContent className="flex items-center justify-between p-6">
//               <div>
//                 <p className="text-sm text-zinc-500">
//                   Total Transactions
//                 </p>

//                 <h2 className="mt-2 text-3xl font-bold">
//                   {user.totalTransactions.toLocaleString()}
//                 </h2>
//               </div>

//               <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900">
//                 <TrendingUp className="h-6 w-6" />
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="rounded-3xl border-zinc-200/70 shadow-sm dark:border-zinc-800">
//             <CardContent className="flex items-center justify-between p-6">
//               <div>
//                 <p className="text-sm text-zinc-500">
//                   Successful Payments
//                 </p>

//                 <h2 className="mt-2 text-3xl font-bold">
//                   {user.successfulRate}%
//                 </h2>
//               </div>

//               <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-950/40">
//                 <CheckCircle2 className="h-6 w-6 text-green-600" />
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//  <div className="grid gap-6 lg:grid-cols-2" >
//   <MembershipCard membershipLevel={user.membershipLevel} />

//   <MembershipSummary  />
// </div>

//       {/* QUICK ACTIONS */}
//       <Card className="rounded-3xl border-zinc-200/70 shadow-sm dark:border-zinc-800">
//         <CardHeader>
//           <CardTitle className="text-xl">
//             Quick Actions
//           </CardTitle>

//           <CardDescription>
//             Access all VTU services
//             quickly.
//           </CardDescription>
//         </CardHeader>

//         <CardContent>
//           <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
//             {quickActions.map(
//               (action) => {
//                 const Icon =
//                   action.icon;

//                 return (
//                   <Link
//                     key={action.title}
//                     href={action.href}
//                     className="group flex items-center justify-between rounded-3xl border border-zinc-200 bg-white p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
//                   >
//                     <div>
//                       <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 transition-all duration-300 group-hover:bg-zinc-900 group-hover:text-white dark:bg-zinc-800 dark:group-hover:bg-white dark:group-hover:text-black">
//                         <Icon className="h-6 w-6" />
//                       </div>

//                       <p className="mt-5 text-base font-semibold text-zinc-900 dark:text-white">
//                         {action.title}
//                       </p>
//                     </div>

//                     <ArrowUpRight className="h-5 w-5 text-zinc-400 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
//                   </Link>
//                 );
//               }
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       {/* TRANSACTIONS */}
//       <Card className="rounded-3xl border-zinc-200/70 shadow-sm dark:border-zinc-800">
//         <CardHeader>
//           <CardTitle className="text-xl">
//             Recent Transactions
//           </CardTitle>

//           <CardDescription>
//             Your latest activities.
//           </CardDescription>
//         </CardHeader>

//         <CardContent className="space-y-4">
//           {transactions.length >
//           0 ? (
//             transactions.map(
//               (
//                 transaction: any
//               ) => (
//                 <div
//                   key={
//                     transaction.id
//                   }
//                   className="flex items-center justify-between rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800"
//                 >
//                   <div className="flex items-center gap-4">
//                     <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900">
//                       <CreditCard className="h-5 w-5" />
//                     </div>

//                     <div>
//                       <p className="font-semibold">
//                         {
//                           transaction.title
//                         }
//                       </p>

//                       <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
//                         <Clock3 className="h-4 w-4" />

//                         {
//                           transaction.time
//                         }
//                       </div>
//                     </div>
//                   </div>

//                   <div className="text-right">
//                     <p className="font-semibold">
//                       {
//                         transaction.amount
//                       }
//                     </p>

//                     <span className="mt-1 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
//                       {
//                         transaction.status
//                       }
//                     </span>
//                   </div>
//                 </div>
//               )
//             )
//           ) : (
//             <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center">
//               <p className="text-sm text-zinc-500">
//                 No transactions found.
//               </p>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
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
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  ArrowDownLeft,
  ArrowUpRightFromSquare,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CalendarDays,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton"; // Official shadcn component
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import MembershipCard from "@/components/dashboard/membership-card";
import MembershipSummary from "@/components/dashboard/MembershipSummary";

const quickActions = [
  {
    title: "Buy Airtime",
    icon: Smartphone,
    href: "/dashboard/airtime",
    color: "bg-amber-500/10 text-amber-500 dark:bg-amber-400/10 dark:text-amber-400",
  },
  {
    title: "Buy Data",
    icon: TrendingUp,
    href: "/dashboard/data",
    color: "bg-blue-500/10 text-blue-500 dark:bg-blue-400/10 dark:text-blue-400",
  },
  {
    title: "Electricity",
    icon: Zap,
    href: "/dashboard/electricity",
    color: "bg-purple-500/10 text-purple-500 dark:bg-purple-400/10 dark:text-purple-400",
  },
  {
    title: "TV Subscription",
    icon: Tv,
    href: "/dashboard/tv",
    color: "bg-rose-500/10 text-rose-500 dark:bg-rose-400/10 dark:text-rose-400",
  },
];

export default function DashboardPage() {
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await fetch("/api/dashboard", {
          cache: "no-store",
        });
        const data = await response.json();
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
    name: dashboardData?.user?.name || "User",
    membershipLevel: dashboardData?.user?.membershipLevel || "starter",
    balance: Number(dashboardData?.wallet?.balance) || 0,
    totalTransactions: Number(dashboardData?.stats?.totalTransactions) || 0,
    successfulRate: Number(dashboardData?.stats?.successfulRate) || 0,
  };

  const transactions = dashboardData?.transactions || [];

  // PREMIUM SKELETON LAYOUT STATE USING SHADCN
  if (loading && transactions.length === 0) {
    return (
      <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64 md:w-80 rounded-xl" />
            <Skeleton className="h-4 w-48 md:w-60" />
          </div>
          <Skeleton className="h-7 w-44 rounded-full" />
        </div>

        {/* Top Grid Skeleton */}
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Wallet Card Skeleton - Dark Premium Base */}
          <Card className="rounded-[2.5rem] bg-gradient-to-tr from-zinc-950 via-neutral-900 to-zinc-900 border-none min-h-[240px] p-6 sm:p-8 md:p-10 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <Skeleton className="h-4 w-32 bg-zinc-800 dark:bg-zinc-800" />
                <Skeleton className="h-12 w-56 bg-zinc-800 dark:bg-zinc-800 rounded-xl" />
              </div>
              <Skeleton className="h-12 w-12 bg-zinc-800 dark:bg-zinc-800 rounded-2xl" />
            </div>
            <div className="mt-8 flex gap-3">
              <Skeleton className="h-12 flex-1 bg-zinc-800 dark:bg-zinc-800 rounded-xl" />
              <Skeleton className="h-12 flex-1 bg-zinc-800 dark:bg-zinc-800 rounded-xl" />
            </div>
          </Card>

          {/* Side Stats Skeleton */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Card className="rounded-[2rem] border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-950 p-6 flex justify-between items-center">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
              <Skeleton className="h-12 w-12 rounded-2xl" />
            </Card>
            <Card className="rounded-[2rem] border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-950 p-6 flex justify-between items-center">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
              <Skeleton className="h-12 w-12 rounded-2xl" />
            </Card>
          </div>
        </div>

        {/* Mid Grid Skeleton */}
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[180px] rounded-[2rem]" />
          <Skeleton className="h-[180px] rounded-[2rem]" />
        </div>

        {/* Actions Skeleton */}
        <Card className="rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-950 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      
     {/* HEADER */}
<div className="relative overflow-hidden rounded-3xl border border-black bg-gradient-to-br from-white via-white to-amber-50/40 p-8 shadow-sm dark:border-white dark:hover:border-white/20 dark:from-zinc-950 dark:via-zinc-950 dark:to-amber-950/10">
  {/* Background Glow */}
  <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl" />
  <div className="absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-yellow-400/5 blur-3xl" />

  <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
    {/* LEFT */}
    <div className="space-y-5">
      <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-700 dark:border-amber-900/50 dark:bg-amber-500/10 dark:text-black">
        <Sparkles className="h-3.5 w-3.5 fill-current" />
         Dashboard
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white lg:text-5xl">
          Welcome back,
          <span className="ml-2 bg-[#D4AF37] bg-clip-text text-transparent">
            {user.name}
          </span>
        </h1>

        <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
          Monitor platform activity, oversee transactions, manage users,
          and keep the entire payment ecosystem running smoothly.
        </p>
      </div>
    </div>

    {/* RIGHT */}
    <div className="flex flex-col gap-4 lg:items-end">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-900/40 dark:bg-black/10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              System Status
            </p>

            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <CalendarDays className="h-4 w-4" />
        {new Date().toLocaleDateString("en-NG", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </div>
    </div>
  </div>
</div>

      {/* TOP METRICS GRID */}
<div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] items-stretch">
  
  {/* PREMIUM WALLET COMPONENT */}
  <Card className="relative overflow-hidden rounded-[2.5rem] border border-black dark:border-white bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black text-white shadow-2xl shadow-zinc-950/50 group flex flex-col justify-between transition-all duration-300 hover:shadow-emerald-950/10  dark:hover:border-white/10">
    {/* Ambient Glow Emitter */}
    <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-emerald-500/10 blur-[60px] transition-all duration-500 group-hover:bg-emerald-500/15 group-hover:scale-110 pointer-events-none" />
    
    <CardContent className="p-6 sm:p-8 md:p-9 flex flex-col justify-between h-full min-h-[260px] relative z-10">
      {/* Top Ledger Wrapper */}
      <div className="flex items-start justify-between w-full">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <p className="text-[11px] font-bold tracking-[0.15em] text-black dark:text-white uppercase">
              Available Balance
            </p>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-black dark:text-white transition-colors hover:text-zinc-200 p-1 rounded-md hover:bg-white/5 active:scale-95"
              aria-label={showBalance ? "Hide balance" : "Show balance"}
            >
              {showBalance ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>

          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl font-mono text-black dark:text-white drop-shadow-sm selection:bg-emerald-500/30">
            {showBalance ? (
              <>
                <span className="text-black dark:text-white text-3xl sm:text-4xl font-sans font-light mr-0.5">₦</span>
                {user.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </>
            ) : (
              "₦ •••• ••••"
            )}
          </h2>
        </div>

        {/* Premium Geometric Icon Box */}
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-white/10 to-white/[0.02] border border-white/10 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
          <Wallet className="h-5 w-5 text-zinc-200" />
        </div>
      </div>

      {/* Primary Interaction Array */}
      <div className="mt-8 flex flex-row items-center gap-3 w-full">
        <Button className="flex-1 h-12 rounded-xl dark:bg-white bg-black font-medium text-white dark:text-black hover:bg-[#D4AF37] shadow-[0_4px_12px_rgba(255,255,255,0.15)] dark:shadow-none transition-all duration-200 active:scale-[0.985]">
          <ArrowDownLeft className="mr-2 h-4 w-4 stroke-[2.5] text-white dark:text-blaxk" /> Fund Wallet
        </Button>
        <Button
          variant="outline"
          className="flex-1 h-12 rounded-xl border-black dark:border-white bg-white/[0.03] font-medium text-black dark:text-white hover:bg-white/[0.08] hover:border-white/20 backdrop-blur-sm transition-all duration-200 active:scale-[0.985]"
        >
          <ArrowUpRightFromSquare className="mr-2 h-4 w-4 stroke-[2.5] text-black dark:text-white" /> Transfer
        </Button>
      </div>
    </CardContent>
  </Card>

  {/* METRICS STATS SUBGRID */}
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
    
    {/* STAT CARD: TOTAL TRANSACTIONS */}
    <Card className="rounded-[2rem] border border-black dark:border-white bg-gradient-to-b from-white to-zinc-50/50 dark:from-zinc-950 dark:to-zinc-950/40 shadow-sm transition-all duration-300 hover:shadow-md  dark:hover:border-zinc-800 group/stat">
      <CardContent className="flex items-center justify-between p-6 h-full">
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
            Total Transactions
          </p>
          <h3 className="text-3xl font-bold tracking-tight text-black dark:text-white font-mono">
            {user.totalTransactions.toLocaleString()}
          </h3>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 border border-black dark:border-white text-[#D4AF37] dark:text-zinc-400 transition-colors duration-300 group-hover/stat:bg-zinc-900 group-hover/stat:text-white dark:group-hover/stat:bg-white dark:group-hover/stat:text-black">
          <TrendingUp className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>

    {/* STAT CARD: SUCCESS RATE */}
    <Card className="rounded-[2rem] border border-black dark:border-white bg-gradient-to-b from-white to-zinc-50/50 dark:from-zinc-950 dark:to-zinc-950/40 shadow-sm transition-all duration-300 hover:shadow-md  dark:hover:border-zinc-800 group/stat">
      <CardContent className="flex items-center justify-between p-6 h-full">
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
            Successful Payments
          </p>
          <h3 className="text-3xl font-bold tracking-tight text-black dark:text-white font-mono flex items-baseline gap-0.5">
            {user.successfulRate}
            <span className="text-xl font-sans font-medium text-emerald-500 dark:text-emerald-400">%</span>
          </h3>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 border border-black dark:border-white text-[#D4AF37] dark:text-zinc-400 transition-colors duration-300 group-hover/stat:bg-zinc-900 group-hover/stat:text-white dark:group-hover/stat:bg-white dark:group-hover/stat:text-black">
          <CheckCircle2 className="h-4 w-4 stroke-[2.2]" />
        </div>
      </CardContent>
    </Card>
  </div>
</div>

      {/* MEMBERSHIP PLACEMENT GRID */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="transition-all hover:scale-[1.005]">
          <MembershipCard membershipLevel={user.membershipLevel} />
        </div>
        <div className="transition-all hover:scale-[1.005]">
          <MembershipSummary />
        </div>
      </div>

      {/* QUICK ACTIONS SECTION */}
      <Card className="rounded-[2.5rem] border border-black dark:border-white bg-white dark:bg-zinc-950 shadow-sm">
        <CardHeader className="px-6 pt-6 pb-2 sm:px-8">
          <CardTitle className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
            Quick Utilities
          </CardTitle>
          <CardDescription className="text-zinc-400 dark:text-zinc-500">
            Instant settlement vectors for dynamic VTU services.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group flex flex-col justify-between rounded-2xl border border-black dark:border-white/20 bg-zinc-50/50 dark:bg-zinc-900/30 p-5 text-left transition-all duration-300 hover:bg-white dark:hover:bg-zinc-900 hover:scale-[1.02] hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-none hover:border-zinc-200 dark:hover:border-zinc-800"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${action.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-black dark:text-white transition-all duration-300 group-hover:text-white dark:group-hover:text-white group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                  <p className="mt-6 text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white">
                    {action.title}
                  </p>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* TRANSACTIONS SYSTEM ARCHIVE */}
      <Card className="rounded-[2.5rem] border border-black dark:border-white bg-white dark:bg-zinc-950 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-2 sm:px-8">
          <div>
            <CardTitle className="text-lg font-bold tracking-tight text-black dark:text-white">
              Recent Activity Ledger
            </CardTitle>
            <CardDescription className="text-zinc-400 dark:text-zinc-500">
              Real-time balance settlement logs.
            </CardDescription>
          </div>
          {transactions.length > 0 && (
            <Button variant="ghost" size="sm" className="text-xs text-black dark:text-white hover:text-black dark:hover:text-white rounded-lg">
              View All <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          )}
        </CardHeader>

        <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8 space-y-3">
          {transactions.length > 0 ? (
            transactions.map((transaction: any) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-xl border border-black/20 dark:border-white/20 bg-white dark:bg-zinc-950 p-4 transition-all hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 hover:border-zinc-200 dark:hover:border-zinc-800"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                    <CreditCard className="h-4 w-4" />
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      {transaction.title}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
                      <Clock3 className="h-3 w-3" />
                      {transaction.time}
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <p className="text-sm font-bold font-mono text-zinc-900 dark:text-white">
                    {transaction.amount}
                  </p>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase ${
                      transaction.status?.toLowerCase() === "success" || transaction.status?.toLowerCase() === "successful"
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : transaction.status?.toLowerCase() === "pending"
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                        : "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                    }`}
                  >
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 py-12 text-center bg-zinc-50/30 dark:bg-zinc-950">
              <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500">
                No automated records found in the current billing loop.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}