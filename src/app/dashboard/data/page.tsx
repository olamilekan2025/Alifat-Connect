// "use client";

// import { useEffect, useState } from "react";

// import { useSession } from "next-auth/react";

// import {
//   Loader2,
//   RefreshCw,
//   Database,
//   ChevronDown,
//   CheckCircle2,
//   AlertCircle,
// } from "lucide-react";

// import { toast } from "sonner";

// import { Button } from "@/components/ui/button";

// import {
//   Card,
//   CardContent,
// } from "@/components/ui/card";

// import { Input } from "@/components/ui/input";

// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogTitle,
// } from "@/components/ui/dialog";

// interface DataTransaction {
//   _id: string;
//   network: string;
//   phone: string;
//   amount: number;
//   planName: string;
//   status: string;
//   createdAt: string;
// }

// interface WalletData {
//   balance: number;
// }

// interface PlanItem {
//   plan: string;
//   amount: number;
// }

// const networkPrefixes = {
//   MTN: [
//     "0803",
//     "0806",
//     "0703",
//     "0704",
//     "0706",
//     "0810",
//     "0813",
//     "0814",
//     "0816",
//     "0903",
//     "0906",
//     "0913",
//     "0916",
//     "0707",
//   ],

//   Airtel: [
//     "0802",
//     "0808",
//     "0701",
//     "0708",
//     "0812",
//     "0901",
//     "0902",
//     "0904",
//     "0907",
//     "0912",
//   ],

//   Glo: [
//     "0805",
//     "0807",
//     "0705",
//     "0811",
//     "0815",
//     "0905",
//     "0915",
//   ],

//   "9mobile": [
//     "0809",
//     "0817",
//     "0818",
//     "0908",
//     "0909",
//   ],
// };

// const dataPlans: Record<
//   string,
//   Record<string, PlanItem[]>
// > = {
//   MTN: {
//     Daily: [
//       { plan: "100MB", amount: 100 },
//       { plan: "350MB", amount: 200 },
//       { plan: "1GB", amount: 350 },
//     ],

//     Weekly: [
//       { plan: "1.5GB", amount: 500 },
//       { plan: "5GB", amount: 1500 },
//     ],

//     Monthly: [
//       { plan: "2GB", amount: 1200 },
//       { plan: "5GB", amount: 2500 },
//       { plan: "10GB", amount: 5000 },
//     ],

//     Yearly: [
//       { plan: "120GB", amount: 50000 },
//     ],
//   },

//   Airtel: {
//     Daily: [
//       { plan: "100MB", amount: 100 },
//     ],

//     Weekly: [
//       { plan: "1GB", amount: 500 },
//     ],

//     Monthly: [
//       { plan: "3GB", amount: 1500 },
//       { plan: "8GB", amount: 3000 },
//     ],

//     Yearly: [
//       { plan: "100GB", amount: 45000 },
//     ],
//   },

//   Glo: {
//     Daily: [
//       { plan: "200MB", amount: 100 },
//     ],

//     Weekly: [
//       { plan: "1.5GB", amount: 500 },
//     ],

//     Monthly: [
//       { plan: "5GB", amount: 1500 },
//     ],

//     Yearly: [
//       { plan: "90GB", amount: 40000 },
//     ],
//   },

//   "9mobile": {
//     Daily: [
//       { plan: "100MB", amount: 100 },
//     ],

//     Weekly: [
//       { plan: "1GB", amount: 500 },
//     ],

//     Monthly: [
//       { plan: "7GB", amount: 2000 },
//     ],

//     Yearly: [
//       { plan: "120GB", amount: 60000 },
//     ],
//   },
// };

// export default function DataPage() {
//   const { status } = useSession();

//   const [loading, setLoading] =
//     useState(true);

//   const [buying, setBuying] =
//     useState(false);

//   const [wallet, setWallet] =
//     useState<WalletData>({
//       balance: 0,
//     });

//   const [transactions, setTransactions] =
//     useState<DataTransaction[]>([]);

//   const [network, setNetwork] =
//     useState("");

//   const [phone, setPhone] =
//     useState("");

//   const [planType, setPlanType] =
//     useState("");

//   const [selectedPlan, setSelectedPlan] =
//     useState<PlanItem | null>(null);

//   const [pin, setPin] =
//     useState("");

//   const [openSummary, setOpenSummary] =
//     useState(false);

//   const [openPin, setOpenPin] =
//     useState(false);

//   const [hasPaymentPin, setHasPaymentPin] =
//     useState(false);

//   useEffect(() => {
//     if (
//       status ===
//       "authenticated"
//     ) {
//       fetchWallet();

//       fetchTransactions();
//     }
//   }, [status]);

//   async function fetchWallet() {
//     try {
//       const response =
//         await fetch("/api/wallet", {
//           cache: "no-store",
//         });

//       const data =
//         await response.json();

//       setWallet({
//         balance:
//           data.wallet?.balance || 0,
//       });

//       setHasPaymentPin(
//         data.user?.hasPaymentPin || false,
//       );
//     } catch (error) {
//       console.error(error);

//       toast.error(
//         "Failed to load wallet",
//       );
//     }
//   }

//   async function fetchTransactions() {
//     try {
//       setLoading(true);

//       const response =
//         await fetch(
//           "/api/data/history",
//           {
//             cache: "no-store",
//           },
//         );

//       const data =
//         await response.json();

//       setTransactions(
//         Array.isArray(
//           data.transactions,
//         )
//           ? data.transactions
//           : [],
//       );
//     } catch (error) {
//       console.error(error);

//       toast.error(
//         "Failed to load transactions",
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   function detectNetwork(
//     phoneNumber: string,
//   ) {
//     const cleaned =
//       phoneNumber.replace(/\D/g, "");

//     if (cleaned.length < 4) {
//       setNetwork("");
//       return;
//     }

//     const prefix =
//       cleaned.slice(0, 4);

//     let detected = "";

//     Object.entries(
//       networkPrefixes,
//     ).forEach(
//       ([networkName, prefixes]) => {
//         if (
//           prefixes.includes(prefix)
//         ) {
//           detected = networkName;
//         }
//       },
//     );

//     setNetwork(detected);
//   }

//   async function handlePurchase() {
//     try {
//       if (
//         !network ||
//         !phone ||
//         !selectedPlan
//       ) {
//         toast.error(
//           "Complete all fields",
//         );

//         return;
//       }

//       if (phone.length !== 11) {
//         toast.error(
//           "Invalid phone number",
//         );

//         return;
//       }

//       if (pin.length !== 4) {
//         toast.error(
//           "Enter valid payment PIN",
//         );

//         return;
//       }

//       if (
//         selectedPlan.amount >
//         wallet.balance
//       ) {
//         toast.error(
//           "Insufficient balance",
//         );

//         return;
//       }

//       setBuying(true);

//       const response =
//         await fetch(
//           "/api/data/purchase",
//           {
//             method: "POST",

//             headers: {
//               "Content-Type":
//                 "application/json",
//             },

//             body: JSON.stringify({
//               network,
//               phone,
//               amount:
//                 selectedPlan.amount,
//               planName:
//                 selectedPlan.plan,
//               pin,
//             }),
//           },
//         );

//       const data =
//         await response.json();

//       if (!response.ok) {
//         toast.error(
//           data.message ||
//             "Purchase failed",
//         );

//         return;
//       }

//       toast.success(
//         "Data purchase successful",
//       );

//       setPhone("");
//       setNetwork("");
//       setPlanType("");
//       setSelectedPlan(null);
//       setPin("");

//       setOpenPin(false);

//       await fetchWallet();

//       await fetchTransactions();
//     } catch (error) {
//       console.error(error);

//       toast.error(
//         "Something went wrong",
//       );
//     } finally {
//       setBuying(false);
//     }
//   }

//   const plans =
//     network && planType
//       ? dataPlans[network]?.[
//           planType
//         ] || []
//       : [];

//   if (
//     loading &&
//     transactions.length === 0
//   ) {
//     return (
//       <div className="flex h-[70vh] items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 p-4 md:p-6">
//       {/* HEADER */}
//       <div>
//         <h1 className="text-3xl font-bold">
//           Data Bundle
//         </h1>

//         <p className="text-sm text-zinc-500">
//           Buy mobile data instantly
//         </p>
//       </div>

//       {/* WALLET */}
//       <Card className="overflow-hidden rounded-[35px] border-0 bg-white shadow-2xl dark:bg-zinc-950">
//         <CardContent className="flex items-center justify-between p-8">
//           <div>
//             <p className="text-sm text-zinc-500">
//               Wallet Balance
//             </p>

//             <h2 className="mt-3 text-5xl font-bold">
//               ₦
//               {wallet.balance.toLocaleString()}
//             </h2>
//           </div>

//           <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-black text-white">
//             <Database className="h-8 w-8" />
//           </div>
//         </CardContent>
//       </Card>

//       <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
//         {/* BUY CARD */}
//         <Card className="rounded-[35px] border bg-white dark:bg-zinc-950">
//           <CardContent className="space-y-6 p-8">
//             <div>
//               <h2 className="text-3xl font-bold">
//                 Buy Data
//               </h2>
//             </div>

//             {/* PHONE */}
//             <div className="space-y-3">
//               <label className="text-sm font-medium">
//                 Phone Number
//               </label>

//               <div className="rounded-[28px] border p-3">
//                 <div className="flex items-center gap-3">
//                   <div className="flex h-14 min-w-[150px] items-center justify-between rounded-2xl border bg-zinc-50 px-4">
//                     <div>
//                       <p className="text-[11px] text-zinc-500">
//                         Network
//                       </p>

//                       <p className="font-bold">
//                         {network ||
//                           "Detecting"}
//                       </p>
//                     </div>

//                     <ChevronDown className="h-4 w-4" />
//                   </div>

//                   <Input
//                     type="tel"
//                     maxLength={11}
//                     placeholder="08012345678"
//                     value={phone}
//                     onChange={(e) => {
//                       const value =
//                         e.target.value.replace(
//                           /\D/g,
//                           "",
//                         );

//                       setPhone(value);

//                       detectNetwork(value);
//                     }}
//                     className="h-14 border-0"
//                   />
//                 </div>

//                 {phone.length === 11 && (
//                   <div className="mt-4">
//                     {network ? (
//                       <div className="flex items-center gap-2 text-green-600">
//                         <CheckCircle2 className="h-5 w-5" />

//                         <span>
//                           {network} Number
//                         </span>
//                       </div>
//                     ) : (
//                       <div className="flex items-center gap-2 text-red-600">
//                         <AlertCircle className="h-5 w-5" />

//                         <span>
//                           Invalid Number
//                         </span>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* PLAN TYPE */}
//             <div className="space-y-3">
//               <label className="text-sm font-medium">
//                 Plan Type
//               </label>

//               <select
//                 value={planType}
//                 onChange={(e) => {
//                   setPlanType(
//                     e.target.value,
//                   );

//                   setSelectedPlan(
//                     null,
//                   );
//                 }}
//                 className="h-14 w-full rounded-2xl border px-4"
//               >
//                 <option value="">
//                   Select Plan Type
//                 </option>

//                 <option value="Daily">
//                   Daily
//                 </option>

//                 <option value="Weekly">
//                   Weekly
//                 </option>

//                 <option value="Monthly">
//                   Monthly
//                 </option>

//                 <option value="Yearly">
//                   Yearly
//                 </option>
//               </select>
//             </div>

//             {/* PLAN */}
//            {/* PLAN SWITCH CONTAINER */}
// <div className="space-y-5">
//   <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
//     Select Plan Category
//   </label>

//   <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
//     {[
//       "Daily",
//       "Weekly",
//       "Monthly",
//       "Yearly",
//     ].map((type) => (
//       <button
//         key={type}
//         onClick={() => {
//           setPlanType(type);

//           setSelectedPlan(null);
//         }}
//         type="button"
//         className={`h-14 rounded-2xl border text-sm font-semibold transition-all ${
//           planType === type
//             ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
//             : "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
//         }`}
//       >
//         {type}
//       </button>
//     ))}
//   </div>
// </div>

// {/* DAILY PLANS */}
// {network &&
//   planType === "Daily" && (
//     <div className="space-y-3">
//       <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
//         Daily Data Plans
//       </label>

//       <select
//         value={
//           selectedPlan?.plan || ""
//         }
//         onChange={(e) => {
//           const found =
//             dataPlans[
//               network as keyof typeof dataPlans
//             ]?.Daily.find(
//               (item) =>
//                 item.plan ===
//                 e.target.value,
//             );

//           setSelectedPlan(
//             found || null,
//           );
//         }}
//         className="h-14 w-full rounded-2xl border border-zinc-200 bg-white px-4 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
//       >
//         <option value="">
//           Select Daily Plan
//         </option>

//         {dataPlans[
//           network as keyof typeof dataPlans
//         ]?.Daily.map((item) => (
//           <option
//             key={item.plan}
//             value={item.plan}
//           >
//             {item.plan} — ₦
//             {item.amount.toLocaleString()}
//           </option>
//         ))}
//       </select>
//     </div>
//   )}

// {/* WEEKLY PLANS */}
// {network &&
//   planType === "Weekly" && (
//     <div className="space-y-3">
//       <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
//         Weekly Data Plans
//       </label>

//       <select
//         value={
//           selectedPlan?.plan || ""
//         }
//         onChange={(e) => {
//           const found =
//             dataPlans[
//               network as keyof typeof dataPlans
//             ]?.Weekly.find(
//               (item) =>
//                 item.plan ===
//                 e.target.value,
//             );

//           setSelectedPlan(
//             found || null,
//           );
//         }}
//         className="h-14 w-full rounded-2xl border border-zinc-200 bg-white px-4 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
//       >
//         <option value="">
//           Select Weekly Plan
//         </option>

//         {dataPlans[
//           network as keyof typeof dataPlans
//         ]?.Weekly.map((item) => (
//           <option
//             key={item.plan}
//             value={item.plan}
//           >
//             {item.plan} — ₦
//             {item.amount.toLocaleString()}
//           </option>
//         ))}
//       </select>
//     </div>
//   )}

// {/* MONTHLY PLANS */}
// {network &&
//   planType === "Monthly" && (
//     <div className="space-y-3">
//       <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
//         Monthly Data Plans
//       </label>

//       <select
//         value={
//           selectedPlan?.plan || ""
//         }
//         onChange={(e) => {
//           const found =
//             dataPlans[
//               network as keyof typeof dataPlans
//             ]?.Monthly.find(
//               (item) =>
//                 item.plan ===
//                 e.target.value,
//             );

//           setSelectedPlan(
//             found || null,
//           );
//         }}
//         className="h-14 w-full rounded-2xl border border-zinc-200 bg-white px-4 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
//       >
//         <option value="">
//           Select Monthly Plan
//         </option>

//         {dataPlans[
//           network as keyof typeof dataPlans
//         ]?.Monthly.map((item) => (
//           <option
//             key={item.plan}
//             value={item.plan}
//           >
//             {item.plan} — ₦
//             {item.amount.toLocaleString()}
//           </option>
//         ))}
//       </select>
//     </div>
//   )}

// {/* YEARLY PLANS */}
// {network &&
//   planType === "Yearly" && (
//     <div className="space-y-3">
//       <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
//         Yearly Data Plans
//       </label>

//       <select
//         value={
//           selectedPlan?.plan || ""
//         }
//         onChange={(e) => {
//           const found =
//             dataPlans[
//               network as keyof typeof dataPlans
//             ]?.Yearly.find(
//               (item) =>
//                 item.plan ===
//                 e.target.value,
//             );

//           setSelectedPlan(
//             found || null,
//           );
//         }}
//         className="h-14 w-full rounded-2xl border border-zinc-200 bg-white px-4 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
//       >
//         <option value="">
//           Select Yearly Plan
//         </option>

//         {dataPlans[
//           network as keyof typeof dataPlans
//         ]?.Yearly.map((item) => (
//           <option
//             key={item.plan}
//             value={item.plan}
//           >
//             {item.plan} — ₦
//             {item.amount.toLocaleString()}
//           </option>
//         ))}
//       </select>
//     </div>
//   )}
//             <Button
//               onClick={() => {
//                 if (
//                   !hasPaymentPin
//                 ) {
//                   toast.error(
//                     "Set payment PIN in settings",
//                   );

//                   return;
//                 }

//                 if (
//                   !selectedPlan
//                 ) {
//                   toast.error(
//                     "Select data plan",
//                   );

//                   return;
//                 }

//                 setOpenSummary(
//                   true,
//                 );
//               }}
//               className="h-14 w-full rounded-2xl"
//             >
//               Continue Payment
//             </Button>
//           </CardContent>
//         </Card>

//         {/* HISTORY */}
//         <Card className="rounded-[35px] border bg-white dark:bg-zinc-950">
//           <div className="flex items-center justify-between border-b p-8">
//             <h2 className="text-2xl font-bold">
//               Transactions
//             </h2>

//             <Button
//               size="icon"
//               variant="outline"
//               onClick={
//                 fetchTransactions
//               }
//             >
//               <RefreshCw className="h-5 w-5" />
//             </Button>
//           </div>

//           <CardContent className="space-y-4 p-6">
//             {transactions.length === 0 ? (
//               <div className="flex h-[300px] items-center justify-center">
//                 No transactions yet
//               </div>
//             ) : (
//               transactions.map(
//                 (item) => (
//                   <div
//                     key={item._id}
//                     className="flex items-center justify-between rounded-3xl border p-5"
//                   >
//                     <div>
//                       <h3 className="font-semibold">
//                         {
//                           item.planName
//                         }
//                       </h3>

//                       <p className="text-sm text-zinc-500">
//                         {item.phone}
//                       </p>
//                     </div>

//                     <div className="text-right">
//                       <h3 className="font-bold">
//                         ₦
//                         {item.amount.toLocaleString()}
//                       </h3>

//                       <span className="text-xs text-green-600">
//                         {
//                           item.status
//                         }
//                       </span>
//                     </div>
//                   </div>
//                 ),
//               )
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       {/* SUMMARY MODAL */}
//       <Dialog
//         open={openSummary}
//         onOpenChange={
//           setOpenSummary
//         }
//       >
//         <DialogContent className="rounded-[35px]">
//           <DialogTitle>
//             Confirm Payment
//           </DialogTitle>

//           <DialogDescription>
//             Review transaction details
//           </DialogDescription>

//           <div className="space-y-5">
//             <div className="rounded-3xl bg-zinc-50 p-5">
//               <div className="flex justify-between py-3">
//                 <span>Plan</span>

//                 <span className="font-semibold">
//                   {
//                     selectedPlan?.plan
//                   }
//                 </span>
//               </div>

//               <div className="flex justify-between py-3">
//                 <span>Network</span>

//                 <span className="font-semibold">
//                   {network}
//                 </span>
//               </div>

//               <div className="flex justify-between py-3">
//                 <span>Phone</span>

//                 <span className="font-semibold">
//                   {phone}
//                 </span>
//               </div>

//               <div className="flex justify-between py-3">
//                 <span>Amount</span>

//                 <span className="text-2xl font-bold">
//                   ₦
//                   {selectedPlan?.amount.toLocaleString()}
//                 </span>
//               </div>
//             </div>

//             <Button
//               onClick={() => {
//                 setOpenSummary(
//                   false,
//                 );

//                 setOpenPin(true);
//               }}
//               className="h-14 w-full rounded-2xl"
//             >
//               Pay Now
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* PIN MODAL */}
//       <Dialog
//         open={openPin}
//         onOpenChange={setOpenPin}
//       >
//         <DialogContent className="rounded-[35px]">
//           <DialogTitle>
//             Enter Payment PIN
//           </DialogTitle>

//           <DialogDescription>
//             Secure transaction
//           </DialogDescription>

//           <div className="space-y-5">
//             <Input
//               type="password"
//               maxLength={4}
//               placeholder="****"
//               value={pin}
//               onChange={(e) =>
//                 setPin(
//                   e.target.value.replace(
//                     /\D/g,
//                     "",
//                   ),
//                 )
//               }
//               className="h-16 rounded-2xl text-center text-2xl tracking-[10px]"
//             />

//             <Button
//               onClick={
//                 handlePurchase
//               }
//               disabled={buying}
//               className="h-14 w-full rounded-2xl"
//             >
//               {buying ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Processing...
//                 </>
//               ) : (
//                 "Complete Payment"
//               )}
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }





"use client";

import { useEffect, useMemo, useState } from "react";

import { useSession } from "next-auth/react";

import {
  Loader2,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertCircle,
  Wifi,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface DataTransaction {
  _id: string;

  network: string;

  phone: string;

  amount: number;

  planName: string;

  status: string;

  createdAt: string;
}

interface WalletData {
  balance: number;
}

interface PlanItem {
  plan: string;

  amount: number;

  validity?: string;

  cashback?: string;
}

const networkPrefixes = {
  MTN: [
    "0803",
    "0806",
    "0703",
    "0704",
    "0706",
    "0810",
    "0813",
    "0814",
    "0816",
    "0903",
    "0906",
    "0913",
    "0916",
    "0707",
  ],

  Airtel: [
    "0802",
    "0808",
    "0701",
    "0708",
    "0812",
    "0901",
    "0902",
    "0904",
    "0907",
    "0912",
  ],

  Glo: [
    "0805",
    "0807",
    "0705",
    "0811",
    "0815",
    "0905",
    "0915",
  ],

  "9mobile": [
    "0809",
    "0817",
    "0818",
    "0908",
    "0909",
  ],
};

const networkColors: Record<
  string,
  string
> = {
  MTN: "from-yellow-400 to-yellow-600",

  Airtel:
    "from-red-500 to-red-700",

  Glo: "from-green-500 to-green-700",

  "9mobile":
    "from-emerald-400 to-emerald-700",
};

const dataPlans: Record<
  string,
  Record<string, PlanItem[]>
> = {
  MTN: {
    Daily: [
      {
        plan: "250MB",
        amount: 100,
        validity: "1 Day",
        cashback: "₦5 Cashback",
      },

      {
        plan: "1GB",
        amount: 350,
        validity: "1 Day",
        cashback: "₦10 Cashback",
      },

      {
        plan: "2GB",
        amount: 500,
        validity: "2 Days",
        cashback: "₦20 Cashback",
      },

      {
        plan: "4GB",
        amount: 1000,
        validity: "2 Days",
        cashback: "₦50 Cashback",
      },
    ],

    Weekly: [
      {
        plan: "6GB",
        amount: 1500,
        validity: "7 Days",
        cashback: "₦75 Cashback",
      },

      {
        plan: "8GB",
        amount: 2500,
        validity: "7 Days",
        cashback: "₦100 Cashback",
      },

      {
        plan: "10GB",
        amount: 3000,
        validity: "7 Days",
        cashback: "₦120 Cashback",
      },
    ],

    Monthly: [
      {
        plan: "12GB",
        amount: 5000,
        validity: "30 Days",
        cashback: "₦200 Cashback",
      },

      {
        plan: "20GB",
        amount: 7500,
        validity: "30 Days",
        cashback: "₦300 Cashback",
      },

      {
        plan: "35GB",
        amount: 10000,
        validity: "30 Days",
        cashback: "₦500 Cashback",
      },
    ],

    Yearly: [
      {
        plan: "120GB",
        amount: 50000,
        validity: "365 Days",
        cashback: "₦2,000 Cashback",
      },
    ],
  },

  Airtel: {
    Daily: [
      {
        plan: "500MB",
        amount: 200,
        validity: "1 Day",
        cashback: "₦10 Cashback",
      },

      {
        plan: "1GB",
        amount: 500,
        validity: "1 Day",
        cashback: "₦20 Cashback",
      },
    ],

    Weekly: [
      {
        plan: "6GB",
        amount: 2000,
        validity: "7 Days",
        cashback: "₦100 Cashback",
      },
    ],

    Monthly: [
      {
        plan: "15GB",
        amount: 5000,
        validity: "30 Days",
        cashback: "₦200 Cashback",
      },

      {
        plan: "25GB",
        amount: 8000,
        validity: "30 Days",
        cashback: "₦350 Cashback",
      },
    ],

    Yearly: [
      {
        plan: "100GB",
        amount: 45000,
        validity: "365 Days",
        cashback: "₦1,500 Cashback",
      },
    ],
  },

  Glo: {
    Daily: [
      {
        plan: "500MB",
        amount: 150,
        validity: "1 Day",
        cashback: "₦5 Cashback",
      },
    ],

    Weekly: [
      {
        plan: "7GB",
        amount: 2500,
        validity: "7 Days",
        cashback: "₦100 Cashback",
      },
    ],

    Monthly: [
      {
        plan: "20GB",
        amount: 5000,
        validity: "30 Days",
        cashback: "₦200 Cashback",
      },
    ],

    Yearly: [
      {
        plan: "90GB",
        amount: 40000,
        validity: "365 Days",
        cashback: "₦1,500 Cashback",
      },
    ],
  },

  "9mobile": {
    Daily: [
      {
        plan: "100MB",
        amount: 100,
        validity: "1 Day",
        cashback: "₦5 Cashback",
      },
    ],

    Weekly: [
      {
        plan: "5GB",
        amount: 2000,
        validity: "7 Days",
        cashback: "₦100 Cashback",
      },
    ],

    Monthly: [
      {
        plan: "15GB",
        amount: 5000,
        validity: "30 Days",
        cashback: "₦200 Cashback",
      },
    ],

    Yearly: [
      {
        plan: "120GB",
        amount: 60000,
        validity: "365 Days",
        cashback: "₦2,000 Cashback",
      },
    ],
  },
};

export default function DataPage() {
  const { status } =
    useSession();

  const [loading, setLoading] =
    useState(true);

  const [buying, setBuying] =
    useState(false);

  const [wallet, setWallet] =
    useState<WalletData>({
      balance: 0,
    });

  const [
    transactions,
    setTransactions,
  ] = useState<
    DataTransaction[]
  >([]);

  const [network, setNetwork] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [planType, setPlanType] =
    useState("Daily");

  const [
    selectedPlan,
    setSelectedPlan,
  ] = useState<PlanItem | null>(
    null,
  );

  const [pin, setPin] =
    useState("");

  const [
    openSummary,
    setOpenSummary,
  ] = useState(false);

  const [openPin, setOpenPin] =
    useState(false);

  const [
    hasPaymentPin,
    setHasPaymentPin,
  ] = useState(false);

  useEffect(() => {
    if (
      status ===
      "authenticated"
    ) {
      fetchWallet();

      fetchTransactions();
    }
  }, [status]);

  async function fetchWallet() {
    try {
      const response =
        await fetch("/api/wallet", {
          cache: "no-store",
        });

      const data =
        await response.json();

      setWallet({
        balance:
          data.wallet?.balance || 0,
      });

      setHasPaymentPin(
        data.user
          ?.hasPaymentPin || false,
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to load wallet",
      );
    }
  }

  async function fetchTransactions() {
    try {
      setLoading(true);

      const response =
        await fetch(
          "/api/data/history",
          {
            cache:
              "no-store",
          },
        );

      const data =
        await response.json();

      setTransactions(
        Array.isArray(
          data.transactions,
        )
          ? data.transactions
          : [],
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to load transactions",
      );
    } finally {
      setLoading(false);
    }
  }

  function detectNetwork(
    phoneNumber: string,
  ) {
    const cleaned =
      phoneNumber.replace(
        /\D/g,
        "",
      );

    if (
      cleaned.length < 4
    ) {
      setNetwork("");

      return;
    }

    const prefix =
      cleaned.slice(0, 4);

    let detected = "";

    Object.entries(
      networkPrefixes,
    ).forEach(
      ([networkName, prefixes]) => {
        if (
          prefixes.includes(
            prefix,
          )
        ) {
          detected =
            networkName;
        }
      },
    );

    setNetwork(detected);
  }

  async function handlePurchase() {
    try {
      if (
        !network ||
        !phone ||
        !selectedPlan
      ) {
        toast.error(
          "Complete all fields",
        );

        return;
      }

      if (
        phone.length !== 11
      ) {
        toast.error(
          "Invalid phone number",
        );

        return;
      }

      if (
        pin.length !== 4
      ) {
        toast.error(
          "Enter valid payment PIN",
        );

        return;
      }

      if (
        selectedPlan.amount >
        wallet.balance
      ) {
        toast.error(
          "Insufficient balance",
        );

        return;
      }

      setBuying(true);

      const response =
        await fetch(
          "/api/data/purchase",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              network,

              phone,

              amount:
                selectedPlan.amount,

              plan:
                selectedPlan.plan,

              pin,
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        toast.error(
          data.message ||
            "Purchase failed",
        );

        return;
      }

      toast.success(
        "Data purchase successful",
      );

      setPhone("");

      setNetwork("");

      setSelectedPlan(null);

      setPin("");

      setOpenPin(false);

      await fetchWallet();

      await fetchTransactions();
    } catch (error) {
      console.error(error);

      toast.error(
        "Something went wrong",
      );
    } finally {
      setBuying(false);
    }
  }

  const plans = useMemo(() => {
    if (!network)
      return [];

    return (
      dataPlans[network]?.[
        planType
      ] || []
    );
  }, [network, planType]);

  if (
    loading &&
    transactions.length === 0
  ) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
      </div>
    );
  }
return (
  <div className="min-h-screen bg-[#f5f7fa] dark:bg-black">
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      
      {/* TOP HERO */}
      <div className="relative overflow-hidden rounded-[36px] bg-black p-6 text-white md:p-8">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              Premium VTU Service
            </div>

            <h1 className="text-4xl font-black tracking-tight md:text-5xl">
              Buy Data Instantly
            </h1>

            <p className="mt-4 text-base text-zinc-300">
              Purchase affordable mobile data for all Nigerian networks with instant delivery.
            </p>
          </div>

          {/* BALANCE CARD */}
          <div className="w-full max-w-sm rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-zinc-400">
                  Wallet Balance
                </p>

                <h2 className="mt-3 text-4xl font-black">
                  ₦{wallet.balance.toLocaleString()}
                </h2>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-black">
                <Database className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-2xl bg-emerald-500/10 p-3 text-sm text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              Secured Transactions
            </div>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        
        {/* BUY CARD */}
        <Card className="rounded-[36px] border-0 bg-white shadow-sm dark:bg-zinc-950">
          <CardContent className="space-y-8 p-5 md:p-8">

            {/* HEADER */}
            <div>
              <h2 className="text-3xl font-black">
                Data Purchase
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Enter recipient phone number and select bundle
              </p>
            </div>

            {/* PHONE INPUT */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Phone Number
              </label>

              <div className="flex items-center gap-3 rounded-[28px] border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-zinc-900">
                
                {/* NETWORK */}
                <div
                  className={`flex h-14 min-w-[120px] items-center justify-center rounded-2xl bg-gradient-to-br ${
                    network
                      ? networkColors[network]
                      : "from-zinc-300 to-zinc-400 dark:from-zinc-700 dark:to-zinc-800"
                  }`}
                >
                  <span className="text-sm font-black text-white">
                    {network || "AUTO"}
                  </span>
                </div>

                <Input
                  type="tel"
                  maxLength={11}
                  value={phone}
                  placeholder="08123456789"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");

                    setPhone(value);

                    detectNetwork(value);
                  }}
                  className="h-14 border-0 bg-transparent text-xl font-bold shadow-none focus-visible:ring-0"
                />
              </div>

              {phone.length === 11 && (
                <div>
                  {network ? (
                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                      {network} number detected
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm font-medium text-red-500">
                      <AlertCircle className="h-4 w-4" />
                      Invalid network
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* PLAN TYPE */}
            <div className="space-y-4">
  <div className="flex items-center justify-between">
    <div>
      <h3 className="text-lg font-black">
        Bundle Category
      </h3>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Choose preferred data duration
      </p>
    </div>

    {planType && (
      <div className="rounded-full w-full bg-zinc-100 px-4 py-2 text-xs font-bold text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
        {planType}
      </div>
    )}
  </div>

  {/* PREMIUM SEGMENTED SELECTOR */}
  <div className="overflow-x-auto scrollbar-hide w-full"> 
    <div className="inline-flex min-w-full rounded-[28px] border border-zinc-200 bg-zinc-50 p-2 dark:border-white/10 dark:bg-zinc-900">
      {[
        {
          label: "Daily",
          desc: "24hrs",
        },
        {
          label: "Weekly",
          desc: "7 days",
        },
        {
          label: "Monthly",
          desc: "30 days",
        },
        {
          label: "Yearly",
          desc: "365 days",
        },
      ].map((item) => {
        const active =
          planType === item.label;

        return (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              setPlanType(item.label);

              setSelectedPlan(null);
            }}
            className={`relative flex w-full min-w-[140px] flex-1 flex-col rounded-2xl px-5 py-4 text-left transition-all duration-300 ${
              active
                ? "bg-black text-white shadow-lg dark:bg-white dark:text-black"
                : "text-zinc-700 hover:bg-white dark:text-zinc-400 dark:hover:bg-black/30"
            }`}
          >
            {/* ACTIVE DOT */}
            {active && (
              <div className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-emerald-400 dark:bg-emerald-500" />
            )}

            <span className="text-sm font-black">
              {item.label}
            </span>

            <span
              className={`mt-1 text-xs ${
                active
                  ? "text-white/70 dark:text-black/60"
                  : "text-zinc-500"
              }`}
            >
              {item.desc}
            </span>
          </button>
        );
      })}
    </div>
  </div>
</div>
            {/* DATA PLANS */}
            {network && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-black">
                    Available Plans
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    Choose your preferred bundle
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {plans.map((item) => {
                    const active =
                      selectedPlan?.plan === item.plan;

                    return (
                      <button
                        key={item.plan}
                        type="button"
                        onClick={() =>
                          setSelectedPlan(item)
                        }
                        className={`rounded-[28px] border p-5 text-left transition-all ${
                          active
                            ? "border-emerald-500 bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                            : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-white/10 dark:bg-zinc-900"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-3xl font-black">
                              {item.plan}
                            </h3>

                            <p
                              className={`mt-1 text-sm ${
                                active
                                  ? "text-black/70"
                                  : "text-zinc-500"
                              }`}
                            >
                              {item.validity}
                            </p>
                          </div>

                          {active && (
                            <CheckCircle2 className="h-5 w-5" />
                          )}
                        </div>

                        <div className="mt-6">
                          <h2 className="text-2xl font-black">
                            ₦{item.amount.toLocaleString()}
                          </h2>
                        </div>

                        <div
                          className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            active
                              ? "bg-black/10"
                              : "bg-emerald-500/10 text-emerald-600"
                          }`}
                        >
                          {item.cashback}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* BUTTON */}
            <Button
              onClick={() => {
                if (!hasPaymentPin) {
                  toast.error("Set payment PIN first");
                  return;
                }

                if (!selectedPlan) {
                  toast.error("Select a data plan");
                  return;
                }

                setOpenSummary(true);
              }}
              className="h-16 rounded-[24px] bg-black text-lg font-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
            >
              Continue Payment
            </Button>
          </CardContent>
        </Card>

        {/* TRANSACTIONS */}
        <Card className="rounded-[36px] border-0 bg-white shadow-sm dark:bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-100 p-6 dark:border-white/10">
            <div>
              <h2 className="text-2xl font-black">
                Transactions
              </h2>

              <p className="text-sm text-zinc-500">
                Recent purchases
              </p>
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={fetchTransactions}
              className="rounded-2xl"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>

          <CardContent className="space-y-4 p-5">
            {transactions.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-zinc-500">
                No transactions yet
              </div>
            ) : (
              transactions.map((item) => (
                <div
                  key={item._id}
                  className="rounded-[24px] bg-zinc-50 p-4 dark:bg-zinc-900"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">
                        {item.planName}
                      </h3>

                      <p className="mt-1 text-sm text-zinc-500">
                        {item.phone}
                      </p>
                    </div>

                    <div className="text-right">
                      <h2 className="font-black">
                        ₦{item.amount.toLocaleString()}
                      </h2>

                      <span className="text-xs font-bold text-emerald-600">
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);
}