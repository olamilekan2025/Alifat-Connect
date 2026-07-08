
// "use client";

// import { useEffect, useState } from "react";

// import { useSession } from "next-auth/react";

// import { Copy, Loader2, RefreshCw, Wallet } from "lucide-react";

// import { toast } from "sonner";

// import { Button } from "@/components/ui/button";

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

// import { Input } from "@/components/ui/input";

// declare global {
//   interface Window {
//     PaystackPop: any;
//   }
// }

// interface Transaction {
//   _id: string;

//   type: "credit" | "debit";

//   amount: number;

//   description: string;

//   status?: string;

//   createdAt: string;
// }

// interface WalletData {
//   balance: number;

//   accountNumber: string;

//   bankName: string;
// }

// interface PaystackResponse {
//   reference: string;
// }

// interface Bank {
//   name: string;

//   code: string;
// }

// export default function WalletPage() {
//   const { data: session, status: sessionStatus } = useSession();

//   const [loading, setLoading] = useState(true);

//   const [funding, setFunding] = useState(false);

//   const [withdrawing, setWithdrawing] = useState(false);

//   const [verifying, setVerifying] = useState(false);

//   const [wallet, setWallet] = useState<WalletData>({
//     balance: 0,
//     accountNumber: "",
//     bankName: "",
//   });

//   const [transactions, setTransactions] = useState<Transaction[]>([]);

//   const [banks, setBanks] = useState<Bank[]>([]);

//   const [bankSearch, setBankSearch] = useState("");

//   const [showBanks, setShowBanks] = useState(false);

//   const [fundAmount, setFundAmount] = useState("");

//   const [withdrawAmount, setWithdrawAmount] = useState("");

//   const [bankCode, setBankCode] = useState("");

//   const [accountNumber, setAccountNumber] = useState("");

//   const [accountName, setAccountName] = useState("");

//   useEffect(() => {
//     if (sessionStatus === "authenticated") {
//       fetchWallet();

//       fetchBanks();
//     }
//   }, [sessionStatus]);

//   async function fetchWallet() {
//     try {
//       setLoading(true);

//       const response = await fetch("/api/wallet", {
//         cache: "no-store",
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         toast.error(data.message || "Failed to load wallet");

//         return;
//       }

//       setWallet({
//         balance: data.wallet?.balance || 0,

//         accountNumber: data.wallet?.accountNumber || "",

//         bankName: data.wallet?.bankName || "",
//       });

//       setTransactions(
//         Array.isArray(data.transactions) ? data.transactions : [],
//       );
//     } catch (error) {
//       console.error("FETCH WALLET ERROR:", error);

//       toast.error("Failed to load wallet");
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function fetchBanks() {
//     try {
//       const response = await fetch("/api/banks", {
//         cache: "no-store",
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error("Failed to fetch banks");
//       }

//       const uniqueBanks = Array.isArray(data.data)
//         ? data.data.filter(
//             (bank: Bank, index: number, self: Bank[]) =>
//               index ===
//               self.findIndex(
//                 (b) => b.code === bank.code && b.name === bank.name,
//               ),
//           )
//         : [];

//       setBanks(uniqueBanks);
//     } catch (error) {
//       console.error("FETCH BANKS ERROR:", error);

//       toast.error("Unable to load banks");
//     }
//   }

//   async function verifyAccount() {
//     try {
//       if (!bankCode || !accountNumber) {
//         toast.error("Complete all fields");

//         return;
//       }

//       if (accountNumber.length !== 10) {
//         toast.error("Invalid account number");

//         return;
//       }

//       setVerifying(true);

//       setAccountName("");

//       const response = await fetch("/api/banks/verify", {
//         method: "POST",

//         headers: {
//           "Content-Type": "application/json",
//         },

//         body: JSON.stringify({
//           bankCode,
//           accountNumber,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         toast.error(data.message || "Verification failed");

//         return;
//       }

//       if (!data.accountName) {
//         toast.error("Account not found");

//         return;
//       }

//       setAccountName(data.accountName);

//       toast.success("Account verified");
//     } catch (error) {
//       console.error("VERIFY ACCOUNT ERROR:", error);

//       toast.error("Verification failed");
//     } finally {
//       setVerifying(false);
//     }
//   }

//   async function handlePaystackSuccess(reference: string) {
//     try {
//       setFunding(true);

//       const verifyResponse = await fetch("/api/paystack/verify", {
//         method: "POST",

//         headers: {
//           "Content-Type": "application/json",
//         },

//         body: JSON.stringify({
//           reference,
//         }),
//       });

//       const data = await verifyResponse.json();

//       if (!verifyResponse.ok) {
//         toast.error(data.message || "Payment verification failed");

//         return;
//       }

//       toast.success("Wallet funded successfully");

//       setFundAmount("");

//       await fetchWallet();
//     } catch (error) {
//       console.error("PAYSTACK VERIFY ERROR:", error);
      

//       toast.error("Verification failed");
//     } finally {
//       setFunding(false);
//     }
//   }

//   function initializePayment() {
//     if (!window.PaystackPop) {
//       toast.error("Paystack failed to load");

//       return;
//     }

//     if (!session?.user?.email) {
//       toast.error("User email not found");

//       return;
//     }

//     const parsedAmount = Number(fundAmount);

//     if (isNaN(parsedAmount) || parsedAmount < 100) {
//       toast.error("Minimum funding amount is ₦100");

//       return;
//     }

//     const handler = window.PaystackPop.setup({
//       key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",

//       email: session.user.email,

//       amount: parsedAmount * 100,

//       currency: "NGN",

//       ref: `${Date.now()}`,

//       callback: function (response: PaystackResponse) {
//         handlePaystackSuccess(response.reference);
//       },

//       onClose: function () {
//         toast.error("Payment cancelled");
//       },
//     });

//     handler.openIframe();
//   }

//   async function handleWithdraw() {
//     try {
//       if (!withdrawAmount) {
//         toast.error("Enter withdrawal amount");

//         return;
//       }

//       if (!accountName) {
//         toast.error("Verify bank account first");

//         return;
//       }

//       const amount = Number(withdrawAmount);

//       if (isNaN(amount) || amount <= 0) {
//         toast.error("Enter a valid amount");

//         return;
//       }

//       if (amount > wallet.balance) {
//         toast.error("Insufficient wallet balance");

//         return;
//       }

//       setWithdrawing(true);

//       const response = await fetch("/api/wallet/withdraw", {
//         method: "POST",

//         headers: {
//           "Content-Type": "application/json",
//         },

//         body: JSON.stringify({
//           amount,
//           bankCode,
//           accountNumber,
//           accountName,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         toast.error(data.message || "Withdrawal failed");

//         return;
//       }

//       toast.success("Withdrawal successful");

//       setWithdrawAmount("");
//       setAccountName("");
//       setAccountNumber("");
//       setBankCode("");
//       setBankSearch("");

//       await fetchWallet();
//     } catch (error) {
//       console.error("WITHDRAW ERROR:", error);

//       toast.error("Something went wrong");
//     } finally {
//       setWithdrawing(false);
//     }
//   }

//   async function copyAccountNumber() {
//     try {
//       if (!wallet.accountNumber) {
//         toast.error("No account number found");

//         return;
//       }

//       await navigator.clipboard.writeText(wallet.accountNumber);

//       toast.success("Account number copied");
//     } catch (error) {
//       console.error(error);

//       toast.error("Failed to copy account number");
//     }
//   }

//   const parsedAmount = Number(fundAmount);

//   const canFund = parsedAmount >= 100 && !!session?.user?.email && !funding;

//   const filteredBanks = banks.filter((bank) =>
//     bank.name.toLowerCase().includes(bankSearch.toLowerCase()),
//   );

//  if (loading && transactions.length === 0) {
//     return (
//       <div className="flex h-[70vh] items-center justify-center">
//         <div className="custom-loader" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 p-1 md:pl-12">
//       <div>
//         <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>

//         <p className="mt-1 text-sm text-zinc-500">
//           Manage your wallet, withdrawals, cards and transactions.
//         </p>
//       </div>

//       <Card className="overflow-hidden rounded-3xl border-0 bg:white dark:bg-gradient-to-br from-black to-zinc-800 text-white shadow-xl ">
//         <CardContent className="p-3 md:p-6">
//           <div className="flex items-start justify-between">
//             <div>
//               <p className="text-sm text-black dark:text-white">Available Balance</p>

//               <h2 className="mt-3 text-black dark:text-white text-5xl font-bold">
//                 ₦{Number(wallet?.balance || 0).toLocaleString()}
//               </h2>
//             </div>

//             <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-black dark:bg-white/10">
//               <Wallet className="h-8 w-8 text-white dark:text-white" />
//             </div>
//           </div>

//           <div className="mt-8 grid gap-4 md:grid-cols-2">
//             <div className="rounded-2xl bg-black dark:bg-white/10 p-4">
//               <p className="text-xs text-zinc-300">Account Number</p>

//               <div className="mt-2 flex items-center gap-2">
//                 <p className="text-lg font-semibold tracking-wider">
//                   {wallet.accountNumber}
//                 </p>

//                 <button
//                   type="button"
//                   onClick={copyAccountNumber}
//                   className="transition hover:opacity-70"
//                 >
//                   <Copy className="h-4 w-4" />
//                 </button>
//               </div>
//             </div>

//             <div className="rounded-2xl bg-black dark:bg-white/10 p-4">
//               <p className="text-xs text-zinc-300">Bank Name</p>

//               <p className="mt-2 text-lg font-semibold">{wallet.bankName}</p>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       <div className="grid gap-6 lg:grid-cols-3 ">
//         <Card className="rounded-3xl  ">
//           <CardHeader>
//             <CardTitle>Fund Wallet</CardTitle>

//             <CardDescription>
//               Add money securely using Paystack.
//             </CardDescription>
//           </CardHeader>

//           <CardContent className="space-y-4">
//             <Input
//               type="number"
//               placeholder="5000"
//               value={fundAmount}
//               onChange={(e) => setFundAmount(e.target.value)}
//               className="h-12 rounded-2xl"
//             />

//             <Button
//               onClick={initializePayment}
//               disabled={!canFund}
//               className="h-12 w-full rounded-2xl"
//             >
//               {funding ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Processing...
//                 </>
//               ) : (
//                 "Fund Wallet"
//               )}
//             </Button>
//           </CardContent>
//         </Card>

//         <Card className="rounded-3xl">
//           <CardHeader>
//             <CardTitle>Withdraw</CardTitle>

//             <CardDescription>Withdraw to your bank account.</CardDescription>
//           </CardHeader>

//           <CardContent className="space-y-4">
//             <div className="space-y-2">
//               <label className="text-xs font-medium text-zinc-400">Bank</label>

//               <div className="relative">
//                 <Input
//                   type="text"
//                   placeholder="Search bank..."
//                   value={bankSearch}
//                   onChange={(e) => {
//                     setBankSearch(e.target.value);

//                     setShowBanks(true);

//                     setBankCode("");

//                     setAccountName("");
//                   }}
//                   onFocus={() => setShowBanks(true)}
//                   className="h-12 rounded-2xl"
//                 />

//                 {showBanks && (
//                   <div className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
//                     {filteredBanks.length > 0 ? (
//                       filteredBanks.map((bank, index) => (
//                         <button
//                           type="button"
//                           key={`${bank.code}-${index}`}
//                           onClick={() => {
//                             setBankCode(bank.code);

//                             setBankSearch(bank.name);

//                             setShowBanks(false);

//                             setAccountName("");
//                           }}
//                           className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
//                         >
//                           {bank.name}
//                         </button>
//                       ))
//                     ) : (
//                       <div className="px-4 py-3 text-sm text-zinc-500">
//                         No bank found
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>

//             <Input
//               type="number"
//               placeholder="Account number"
//               value={accountNumber}
//               onChange={(e) => {
//                 setAccountNumber(e.target.value);

//                 setAccountName("");
//               }}
//               className="h-12 rounded-2xl"
//             />

//             <Button
//               onClick={verifyAccount}
//               disabled={!bankCode || accountNumber.length !== 10 || verifying}
//               className="h-12 w-full rounded-2xl"
//             >
//               {verifying ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Verifying...
//                 </>
//               ) : (
//                 "Verify Account"
//               )}
//             </Button>

//             {accountName && (
//               <div className="rounded-2xl bg-zinc-100 p-3 dark:bg-zinc-900">
//                 <p className="text-xs text-zinc-500">Account Name</p>

//                 <p className="mt-1 text-sm font-semibold">{accountName}</p>
//               </div>
//             )}

//             <Input
//               type="number"
//               placeholder="Amount"
//               value={withdrawAmount}
//               onChange={(e) => setWithdrawAmount(e.target.value)}
//               className="h-12 rounded-2xl"
//             />

//             <Button
//               onClick={handleWithdraw}
//               disabled={!withdrawAmount || !accountName || withdrawing}
//               className="h-12 w-full rounded-2xl"
//             >
//               {withdrawing ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Processing...
//                 </>
//               ) : (
//                 "Withdraw"
//               )}
//             </Button>
//           </CardContent>
//         </Card>

//         <Card className="flex h-[300px] flex-col rounded-3xl">
//   <CardHeader className="shrink-0">
//     <CardTitle>
//       Transactions
//     </CardTitle>

//     <CardDescription>
//       Latest wallet activity.
//     </CardDescription>
//   </CardHeader>

//   <CardContent className="flex min-h-0 flex-1 flex-col space-y-3 overflow-hidden">
//     <div className="flex items-center justify-between">
//       <div className="text-sm text-zinc-400">
//         {transactions.length} recent
//       </div>

//       <Button
//         variant="ghost"
//         size="sm"
//         onClick={fetchWallet}
//       >
//         <RefreshCw className="mr-2 h-4 w-4" />
//         Refresh
//       </Button>
//     </div>

//     <div className="scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 flex-1 space-y-2 overflow-y-auto pr-1">
//       {transactions.length > 0 ? (
//         transactions.map((t, idx) => (
//           <div
//             key={`${t._id}-${idx}`}
//             className="flex items-start justify-between rounded-2xl bg-zinc-100 p-3 dark:bg-zinc-900"
//           >
//             <div>
//               <p className="text-sm font-semibold">
//                 {t.description}
//               </p>

//               <p className="text-xs text-zinc-500">
//                 {new Date(
//                   t.createdAt,
//                 ).toLocaleString()}
//               </p>
//             </div>

//             <div className="text-right">
//               <p
//                 className={`text-sm font-bold ${
//                   t.type === "credit"
//                     ? "text-emerald-500"
//                     : "text-red-500"
//                 }`}
//               >
//                 ₦
//                 {Number(
//                   t.amount,
//                 ).toLocaleString()}
//               </p>

//               <p className="text-xs text-zinc-500">
//                 {t.status}
//               </p>
//             </div>
//           </div>
//         ))
//       ) : (
//         <div className="rounded-2xl bg-zinc-100 p-4 text-sm text-zinc-500 dark:bg-zinc-900">
//           No recent transactions
//           found.
//         </div>
//       )}
//     </div>
//   </CardContent>
// </Card>
//       </div>
//     </div>
//   );
// }








"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Copy,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

interface Transaction {
  _id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  status?: string;
  createdAt: string;
}

interface WalletData {
  balance: number;
  accountNumber: string;
  bankName: string;
  }

interface PaystackResponse {
  reference: string;
}

interface Bank {
  name: string;
  code: string;
}

export default function WalletPage() {
  const { data: session, status: sessionStatus } = useSession();

  const [loading, setLoading] = useState(true);
  const [funding, setFunding] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [wallet, setWallet] = useState<WalletData>({
    balance: 0,
    accountNumber: "",
    bankName: "",
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankSearch, setBankSearch] = useState("");
  const [showBanks, setShowBanks] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchWallet();
      fetchBanks();
    }
  }, [sessionStatus]);

  async function fetchWallet() {
    try {
      setLoading(true);

      const response = await fetch("/api/wallet", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to load wallet");
        return;
      }

      setWallet({
        balance: data.wallet?.balance || 0,
        accountNumber: data.wallet?.accountNumber || "",
        bankName: data.wallet?.bankName || "",
      });

      setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
    } catch (error) {
      console.error("FETCH WALLET ERROR:", error);
      toast.error("Failed to load wallet");
    } finally {
      setLoading(false);
    }
  }

  async function fetchBanks() {
    try {
      const response = await fetch("/api/banks", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error("Failed to fetch banks");
      }

      const uniqueBanks = Array.isArray(data.data)
        ? data.data.filter(
            (bank: Bank, index: number, self: Bank[]) =>
              index ===
              self.findIndex(
                (b) => b.code === bank.code && b.name === bank.name,
              ),
          )
        : [];

      setBanks(uniqueBanks);
    } catch (error) {
      console.error("FETCH BANKS ERROR:", error);
      toast.error("Unable to load banks");
      }
  }

  async function verifyAccount() {
    try {
      if (!bankCode || !accountNumber) {
        toast.error("Complete all fields");
        return;
      }

      if (accountNumber.length !== 10) {
        toast.error("Invalid account number");
        return;
      }

      setVerifying(true);
      setAccountName("");

      const response = await fetch("/api/banks/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bankCode,
          accountNumber,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Verification failed");
        return;
      }

      if (!data.accountName) {
        toast.error("Account not found");
        return;
      }

      setAccountName(data.accountName);
      toast.success("Account verified");
    } catch (error) {
      console.error("VERIFY ACCOUNT ERROR:", error);
      toast.error("Verification failed");
    } finally {
      setVerifying(false);
    }
  }
  async function handlePaystackSuccess(reference: string) {
    try {
      setFunding(true);

      const verifyResponse = await fetch("/api/paystack/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reference,
        }),
      });
      const data = await verifyResponse.json();

      if (!verifyResponse.ok) {
        toast.error(data.message || "Payment verification failed");
        return;
      }

      toast.success("Wallet funded successfully");
      setFundAmount("");
      await fetchWallet();
    } catch (error) {
      console.error("PAYSTACK VERIFY ERROR:", error);
      toast.error("Verification failed");
    } finally {
      setFunding(false);
    }
  }

  function initializePayment() {
    if (!window.PaystackPop) {
      toast.error("Paystack failed to load");
      return;
    }

    if (!session?.user?.email) {
      toast.error("User email not found");
      return;
    }

    const parsedAmount = Number(fundAmount);

    if (isNaN(parsedAmount) || parsedAmount < 100) {
      toast.error("Minimum funding amount is ₦100");
      return;
       }

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
      email: session.user.email,
      amount: parsedAmount * 100,
      currency: "NGN",
      ref: `${Date.now()}`,
      callback: function (response: PaystackResponse) {
        handlePaystackSuccess(response.reference);
      },
      onClose: function () {
        toast.error("Payment cancelled");
      },
    });

    handler.openIframe();
  }

  async function handleWithdraw() {
    try {
      if (!withdrawAmount) {
        toast.error("Enter withdrawal amount");
        return;
      }
      if (!accountName) {
        toast.error("Verify bank account first");
        return;
      }

      const amount = Number(withdrawAmount);

      if (isNaN(amount) || amount <= 0) {
        toast.error("Enter a valid amount");
        return;
      }

      if (amount > wallet.balance) {
        toast.error("Insufficient wallet balance");
        return;
      }

      setWithdrawing(true);

      const response = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          bankCode,
          accountNumber,
          accountName,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Withdrawal failed");
        return;
      }

      toast.success("Withdrawal successful");
      setWithdrawAmount("");
      setAccountName("");
      setAccountNumber("");
      setBankCode("");
      setBankSearch("");
      await fetchWallet();
    } catch (error) {
      console.error("WITHDRAW ERROR:", error);
      toast.error("Something went wrong");
    } finally {
      setWithdrawing(false);
    }
  }

  async function copyAccountNumber() {
    try {
      if (!wallet.accountNumber) {
        toast.error("No account number found");
        return;
      }

      await navigator.clipboard.writeText(wallet.accountNumber);
      toast.success("Account number copied");
    } catch (error) {
      console.error(error);
      toast.error("Failed to copy account number");
    }
  }

  const parsedAmount = Number(fundAmount);
  const canFund = parsedAmount >= 100 && !!session?.user?.email && !funding;
  const filteredBanks = banks.filter((bank) =>
    bank.name.toLowerCase().includes(bankSearch.toLowerCase()),
  );
  if (loading && transactions.length === 0) {
  return (
    <div className="min-h-screen bg-zinc-50 px-3 py-5 text-zinc-950 dark:bg-zinc-950 dark:text-white sm:px-5 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="h-7 w-36 animate-pulse rounded-full bg-zinc-200 dark:bg-white/10" />
            <div className="h-10 w-40 animate-pulse rounded-xl bg-zinc-200 dark:bg-white/10" />
            <div className="h-4 w-80 max-w-full animate-pulse rounded-full bg-zinc-200 dark:bg-white/10" />
            <div className="h-4 w-56 max-w-full animate-pulse rounded-full bg-zinc-200 dark:bg-white/10 md:hidden" />
          </div>

          <div className="h-11 w-28 animate-pulse rounded-full bg-zinc-200 dark:bg-white/10" />
        </div>

        <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <Card className="overflow-hidden rounded-[2rem] border-0 bg-zinc-950 text-white shadow-2xl shadow-zinc-200/70 dark:shadow-black/30">
            <CardContent className="relative p-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.28),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(244,114,182,0.12),transparent_30%)]" />

              <div className="relative p-5 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-4">
                    <div className="h-4 w-32 animate-pulse rounded-full bg-white/10" />
                    <div className="h-14 w-72 max-w-full animate-pulse rounded-2xl bg-white/10" />
                  </div>

                  <div className="h-14 w-14 shrink-0 animate-pulse rounded-2xl bg-white/10" />
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur">
                    <div className="h-4 w-36 animate-pulse rounded-full bg-white/10" />
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="h-7 w-44 animate-pulse rounded-xl bg-white/10" />
                      <div className="h-9 w-9 animate-pulse rounded-full bg-white/10" />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur">
                    <div className="h-4 w-28 animate-pulse rounded-full bg-white/10" />
                    <div className="mt-4 h-7 w-40 animate-pulse rounded-xl bg-white/10" />
                  </div>
                </div>
              </div>
              </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 animate-pulse rounded-2xl bg-zinc-200 dark:bg-white/10" />
                <div className="space-y-3">
                  <div className="h-4 w-32 animate-pulse rounded-full bg-zinc-200 dark:bg-white/10" />
                  <div className="h-3 w-40 animate-pulse rounded-full bg-zinc-200 dark:bg-white/10" />
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 animate-pulse rounded-2xl bg-zinc-200 dark:bg-white/10" />
                <div className="space-y-3">
                  <div className="h-4 w-36 animate-pulse rounded-full bg-zinc-200 dark:bg-white/10" />
                  <div className="h-3 w-32 animate-pulse rounded-full bg-zinc-200 dark:bg-white/10" />
                </div>
              </div>
            </div>
            </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[0.8fr_1fr_1.15fr]">
          <Card className="rounded-[1.75rem] border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <CardHeader className="pb-4">
              <div className="h-6 w-36 animate-pulse rounded-xl bg-zinc-200 dark:bg-white/10" />
              <div className="h-4 w-48 animate-pulse rounded-full bg-zinc-200 dark:bg-white/10" />
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="h-12 animate-pulse rounded-2xl bg-zinc-200 dark:bg-white/10" />
              <div className="h-12 animate-pulse rounded-2xl bg-zinc-200 dark:bg-white/10" />
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <CardHeader className="pb-4">
              <div className="h-6 w-28 animate-pulse rounded-xl bg-zinc-200 dark:bg-white/10" />
              <div className="h-4 w-56 animate-pulse rounded-full bg-zinc-200 dark:bg-white/10" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="h-3 w-16 animate-pulse rounded-full bg-zinc-200 dark:bg-white/10" />
                <div className="h-12 animate-pulse rounded-2xl bg-zinc-200 dark:bg-white/10" />
              </div>

              <div className="h-12 animate-pulse rounded-2xl bg-zinc-200 dark:bg-white/10" />
              <div className="h-12 animate-pulse rounded-2xl bg-zinc-200 dark:bg-white/10" />
              <div className="h-12 animate-pulse rounded-2xl bg-zinc-200 dark:bg-white/10" />
              <div className="h-12 animate-pulse rounded-2xl bg-zinc-200 dark:bg-white/10" />
            </CardContent>
          </Card>

          <Card className="flex h-[460px] flex-col rounded-[1.75rem] border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <CardHeader className="shrink-0 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-3">
                  <div className="h-6 w-32 animate-pulse rounded-xl bg-zinc-200 dark:bg-white/10" />
                  <div className="h-4 w-40 animate-pulse rounded-full bg-zinc-200 dark:bg-white/10" />
                </div>
                <div className="h-7 w-20 animate-pulse rounded-full bg-zinc-200 dark:bg-white/10" />
              </div>
            </CardHeader>
             <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="min-h-0 flex-1 space-y-2 overflow-hidden pr-1">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between gap-4 rounded-2xl border border-zinc-100 bg-zinc-50 p-3 dark:border-white/10 dark:bg-zinc-950/70"
                  >
                    <div className="min-w-0 space-y-3">
                      <div className="h-4 w-40 animate-pulse rounded-full bg-zinc-200 dark:bg-white/10" />
                      <div className="h-3 w-32 animate-pulse rounded-full bg-zinc-200 dark:bg-white/10" />
                    </div>

                    <div className="shrink-0 space-y-3">
                      <div className="ml-auto h-4 w-20 animate-pulse rounded-full bg-zinc-200 dark:bg-white/10" />
                      <div className="ml-auto h-3 w-16 animate-pulse rounded-full bg-zinc-200 dark:bg-white/10" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          </section>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-zinc-50 px-3 py-5 text-zinc-950 dark:bg-zinc-950 dark:text-white sm:px-5 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Secured wallet
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Wallet
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              Manage deposits, bank withdrawals, and wallet activity from one
              clean account center.
            </p>
          </div>
           <Button
            variant="outline"
            onClick={fetchWallet}
            className="h-11 rounded-full border-zinc-200 bg-white px-5 text-zinc-700 shadow-sm hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <Card className="overflow-hidden rounded-[2rem] border-0 bg-zinc-950 text-white shadow-2xl shadow-zinc-200/70 dark:shadow-black/30">
            <CardContent className="relative p-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.34),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(244,114,182,0.16),transparent_30%)]" />
              <div className="relative p-5 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-300">
                      Available balance
                    </p>
                    <h2 className="mt-3 break-words text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                      ₦{Number(wallet?.balance || 0).toLocaleString()}
                    </h2>
                  </div>
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 backdrop-blur">
                    <Wallet className="h-7 w-7" />
                  </div>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-400">
                      <Building2 className="h-4 w-4" />
                      Account number
                    </div>
                    <div className="mt-3 flex min-h-8 items-center justify-between gap-3">
                      <p className="font-mono text-xl font-semibold tracking-widest">
                        {wallet.accountNumber || "Unavailable"}
                      </p>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={copyAccountNumber}
                        className="h-9 w-9 rounded-full text-white hover:bg-white/10"
                        aria-label="Copy account number"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-400">
                      <ShieldCheck className="h-4 w-4" />
                      Bank partner
                    </div>
                    <p className="mt-3 min-h-8 text-xl font-semibold">
                      {wallet.bankName || "Unavailable"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <ArrowDownToLine className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Instant deposits</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Paystack-secured funding
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-200">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Bank withdrawals</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Verify before payout
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[0.8fr_1fr_1.15fr]">
          <Card className="rounded-[1.75rem] border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ArrowDownToLine className="h-5 w-5 text-emerald-500" />
                Fund Wallet
              </CardTitle>
              <CardDescription>Add money securely using Paystack.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Input
                type="number"
                placeholder="5000"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                className="h-12 rounded-2xl border-zinc-200 bg-zinc-50 text-base dark:border-white/10 dark:bg-zinc-950"
              />

              <Button
                onClick={initializePayment}
                disabled={!canFund}
                className="h-12 w-full rounded-2xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                {funding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Fund Wallet"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ArrowUpRight className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
                Withdraw
              </CardTitle>
              <CardDescription>Send funds to a verified bank account.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Bank
                </label>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    type="text"
                    placeholder="Search bank..."
                    value={bankSearch}
                    onChange={(e) => {
                      setBankSearch(e.target.value);
                      setShowBanks(true);
                      setBankCode("");
                      setAccountName("");
                    }}
                    onFocus={() => setShowBanks(true)}
                    className="h-12 rounded-2xl border-zinc-200 bg-zinc-50 pl-11 dark:border-white/10 dark:bg-zinc-950"
                  />
                  {showBanks && (
                    <div className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-2xl border border-zinc-200 bg-white p-1 shadow-2xl dark:border-white/10 dark:bg-zinc-950">
                      {filteredBanks.length > 0 ? (
                        filteredBanks.map((bank, index) => (
                          <button
                            type="button"
                            key={`${bank.code}-${index}`}
                            onClick={() => {
                              setBankCode(bank.code);
                              setBankSearch(bank.name);
                              setShowBanks(false);
                              setAccountName("");
                            }}
                            className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm transition hover:bg-zinc-100 dark:hover:bg-white/10"
                          >
                            {bank.name}
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-3 text-sm text-zinc-500">
                          No bank found
                        </div>
                      )}
                    </div>
                    )}
                </div>
              </div>

              <Input
                type="number"
                placeholder="Account number"
                value={accountNumber}
                onChange={(e) => {
                  setAccountNumber(e.target.value);
                  setAccountName("");
                }}
                className="h-12 rounded-2xl border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-zinc-950"
              />

              <Button
                onClick={verifyAccount}
                disabled={!bankCode || accountNumber.length !== 10 || verifying}
                variant="outline"
                className="h-12 w-full rounded-2xl border-zinc-200 bg-white dark:border-white/10 dark:bg-transparent"
              >
                {verifying ? (
                  <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Account"
                )}
              </Button>

              {accountName && (
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-950 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  <div>
                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                      Account Name
                    </p>
                    <p className="text-sm font-semibold">{accountName}</p>
                  </div>
                </div>
              )}
<Input
                type="number"
                placeholder="Amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="h-12 rounded-2xl border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-zinc-950"
              />

              <Button
                onClick={handleWithdraw}
                disabled={!withdrawAmount || !accountName || withdrawing}
                className="h-12 w-full rounded-2xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                {withdrawing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Withdraw"
                )}
              </Button>
            </CardContent>
          </Card>
          <Card className="flex h-[460px] flex-col rounded-[1.75rem] border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <CardHeader className="shrink-0 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">Transactions</CardTitle>
                  <CardDescription>Latest wallet activity.</CardDescription>
                </div>
                <div className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
                  {transactions.length} recent
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                {transactions.length > 0 ? (
                  transactions.map((t, idx) => (
                    <div
                      key={`${t._id}-${idx}`}
                      className="flex items-start justify-between gap-4 rounded-2xl border border-zinc-100 bg-zinc-50 p-3 dark:border-white/10 dark:bg-zinc-950/70"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {t.description}
                          </p>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          {new Date(t.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p
                          className={`text-sm font-bold ${
                            t.type === "credit"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {t.type === "credit" ? "+" : "-"}₦
                          {Number(t.amount).toLocaleString()}
                        </p>
                        {t.status && (
                          <p className="mt-1 text-xs capitalize text-zinc-500 dark:text-zinc-400">
                            {t.status}
                          </p>
                        )}
                      </div>
                    </div>
                    ))
                ) : (
                  <div className="flex h-full min-h-44 items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-5 text-center text-sm text-zinc-500 dark:border-white/10 dark:bg-zinc-950/70 dark:text-zinc-400">
                    No recent transactions found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}