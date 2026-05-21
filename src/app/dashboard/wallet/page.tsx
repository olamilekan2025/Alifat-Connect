// "use client";

// import { useEffect, useState } from "react";

// import { useSession } from "next-auth/react";

// import {
//   Copy,
//   Loader2,
//   RefreshCw,
//   Send,
//   Wallet,
// } from "lucide-react";

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

//      const uniqueBanks = Array.isArray(data.data)
//   ? data.data.filter(
//       (
//         bank: Bank,
//         index: number,
//         self: Bank[],
//       ) =>
//         index ===
//         self.findIndex(
//           (b) =>
//             b.code === bank.code &&
//             b.name === bank.name,
//         ),
//     )
//   : [];

// setBanks(uniqueBanks);
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

//   if (sessionStatus === "loading" || loading) {
//     return (
//       <div className="flex h-[70vh] items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 p-4 md:p-6">
//       <div>
//         <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>

//         <p className="mt-1 text-sm text-zinc-500">
//           Manage your wallet, withdrawals, cards and transactions.
//         </p>
//       </div>

//       <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-black to-zinc-800 text-white shadow-xl">
//         <CardContent className="p-8">
//           <div className="flex items-start justify-between">
//             <div>
//               <p className="text-sm text-zinc-300">Available Balance</p>

//               <h2 className="mt-3 text-5xl font-bold">
//                 ₦{wallet.balance.toLocaleString()}
//               </h2>
//             </div>

//             <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10">
//               <Wallet className="h-8 w-8" />
//             </div>
//           </div>

//           <div className="mt-8 grid gap-4 md:grid-cols-2">
//             <div className="rounded-2xl bg-white/10 p-4">
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

//             <div className="rounded-2xl bg-white/10 p-4">
//               <p className="text-xs text-zinc-300">Bank Name</p>

//               <p className="mt-2  text-lg font-semibold">{wallet.bankName}</p>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       <div className="grid gap-6 lg:grid-cols-3">
//         {/* Fund Wallet */}
//         <Card className="rounded-3xl lg:col-span-1">
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
//               min={100}
//               disabled={funding}
//             />
//             <div className="text-xs text-zinc-400">
//               Minimum funding amount is <span className="font-medium">₦100</span>
//             </div>
//             <Button
//               onClick={initializePayment}
//               disabled={!canFund || funding}
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

//         {/* Withdraw */}
//         <Card className="rounded-3xl lg:col-span-1">
//           <CardHeader>
//             <CardTitle>Withdraw</CardTitle>
//             <CardDescription>
//               Withdraw wallet balance to your bank account.
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="space-y-2">
//               <label className="text-xs font-medium text-zinc-400">Bank</label>
//             <select
//   value={bankCode}
//   onChange={(e) => {
//     setBankCode(e.target.value);
//     setAccountName("");
//   }}
//   className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:ring-2 focus:ring-black dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
//   disabled={withdrawing || verifying}
// >
//   <option value="">Select bank</option>

//   {banks.map((b, index) => (
//     <option
//       key={`${b.code}-${index}`}
//       value={b.code}
//     >
//       {b.name}
//     </option>
//   ))}
// </select>
//             </div>

//             <Input
//               type="number"
//               placeholder="Account number"
//               value={accountNumber}
//               onChange={(e) => {
//                 setAccountNumber(e.target.value);
//                 setAccountName("");
//               }}
//               className="h-12 rounded-2xl "
//               min={0}
//               disabled={withdrawing || verifying}
//             />

//             <Button
//               onClick={verifyAccount}
//               disabled={!bankCode || accountNumber.length !== 10 || verifying || withdrawing}
//               className="h-12 w-full rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800"
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

//             {accountName ? (
//               <div className="rounded-2xl bg-white/5 p-3">
//                 <div className="text-xs text-zinc-400">Account Name</div>
//                 <div className="mt-1 text-sm font-semibold">{accountName}</div>
//               </div>
//             ) : null}

//             <Input
//               type="number"
//               placeholder="Amount to withdraw"
//               value={withdrawAmount}
//               onChange={(e) => setWithdrawAmount(e.target.value)}
//               className="h-12 rounded-2xl"
//               min={1}
//               disabled={withdrawing}
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

//         {/* Transactions */}
//         <Card className="rounded-3xl lg:col-span-1">
//           <CardHeader>
//             <CardTitle>Transactions</CardTitle>
//             <CardDescription>
//               Latest wallet activity.
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-3">
//             <div className="flex items-center justify-between">
//               <div className="text-sm text-zinc-400">
//                 {transactions.length ? `${transactions.length} recent` : "No transactions"}
//               </div>
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => fetchWallet()}
//                 className="h-8 rounded-full"
//                 disabled={loading}
//               >
//                 <RefreshCw className="mr-2 h-4 w-4" />
//                 Refresh
//               </Button>
//             </div>

//             <div className="max-h-[360px] space-y-2 overflow-auto pr-1">
//               {transactions.length ? (
//                 transactions.map((t, idx) => (
//                   <div
//                     key={`${t._id}-${idx}`}
//                     className="flex items-start justify-between gap-4 rounded-2xl bg-white/5 p-3"
//                   >
//                     <div>
//                       <div className="text-sm font-semibold">
//                         {t.type === "credit" ? (
//                           <span className="text-emerald-400">Credit</span>
//                         ) : (
//                           <span className="text-red-400">Debit</span>
//                         )}
//                       </div>
//                       <div className="mt-1 text-xs text-zinc-400">
//                         {t.description}
//                       </div>
//                       <div className="mt-2 text-xs text-zinc-500">
//                         {t.createdAt ? new Date(t.createdAt).toLocaleString() : ""}
//                       </div>
//                     </div>

//                     <div className="text-right">
//                       <div className="text-sm font-semibold">
//                         ₦{Number(t.amount).toLocaleString()}
//                       </div>
//                       <div className="mt-1 text-xs text-zinc-500">
//                         {t.status || ""}
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="rounded-2xl bg-white/5 p-3 text-sm text-zinc-400">
//                   No recent transactions found.
//                 </div>
//               )}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";

import { useSession } from "next-auth/react";

import { Copy, Loader2, RefreshCw, Wallet } from "lucide-react";

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

      setTransactions(
        Array.isArray(data.transactions) ? data.transactions : [],
      );
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

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>

        <p className="mt-1 text-sm text-zinc-500">
          Manage your wallet, withdrawals, cards and transactions.
        </p>
      </div>

      <Card className="overflow-hidden rounded-3xl border-0 bg:white dark:bg-gradient-to-br from-black to-zinc-800 text-white shadow-xl ">
        <CardContent className="p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-black dark:text-white">Available Balance</p>

              <h2 className="mt-3 text-black dark:text-white text-5xl font-bold">
                ₦{wallet.balance.toLocaleString()}
              </h2>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-black dark:bg-white/10">
              <Wallet className="h-8 w-8 text-white dark:text-white" />
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-black dark:bg-white/10 p-4">
              <p className="text-xs text-zinc-300">Account Number</p>

              <div className="mt-2 flex items-center gap-2">
                <p className="text-lg font-semibold tracking-wider">
                  {wallet.accountNumber}
                </p>

                <button
                  type="button"
                  onClick={copyAccountNumber}
                  className="transition hover:opacity-70"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-black dark:bg-white/10 p-4">
              <p className="text-xs text-zinc-300">Bank Name</p>

              <p className="mt-2 text-lg font-semibold">{wallet.bankName}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3 ">
        <Card className="rounded-3xl  ">
          <CardHeader>
            <CardTitle>Fund Wallet</CardTitle>

            <CardDescription>
              Add money securely using Paystack.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Input
              type="number"
              placeholder="5000"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              className="h-12 rounded-2xl"
            />

            <Button
              onClick={initializePayment}
              disabled={!canFund}
              className="h-12 w-full rounded-2xl"
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

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Withdraw</CardTitle>

            <CardDescription>Withdraw to your bank account.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400">Bank</label>

              <div className="relative">
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
                  className="h-12 rounded-2xl"
                />

                {showBanks && (
                  <div className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
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
                          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
                        >
                          {bank.name}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-zinc-500">
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
              className="h-12 rounded-2xl"
            />

            <Button
              onClick={verifyAccount}
              disabled={!bankCode || accountNumber.length !== 10 || verifying}
              className="h-12 w-full rounded-2xl"
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
              <div className="rounded-2xl bg-zinc-100 p-3 dark:bg-zinc-900">
                <p className="text-xs text-zinc-500">Account Name</p>

                <p className="mt-1 text-sm font-semibold">{accountName}</p>
              </div>
            )}

            <Input
              type="number"
              placeholder="Amount"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="h-12 rounded-2xl"
            />

            <Button
              onClick={handleWithdraw}
              disabled={!withdrawAmount || !accountName || withdrawing}
              className="h-12 w-full rounded-2xl"
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

        <Card className="flex h-[300px] flex-col rounded-3xl">
  <CardHeader className="shrink-0">
    <CardTitle>
      Transactions
    </CardTitle>

    <CardDescription>
      Latest wallet activity.
    </CardDescription>
  </CardHeader>

  <CardContent className="flex min-h-0 flex-1 flex-col space-y-3 overflow-hidden">
    <div className="flex items-center justify-between">
      <div className="text-sm text-zinc-400">
        {transactions.length} recent
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={fetchWallet}
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Refresh
      </Button>
    </div>

    <div className="scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 flex-1 space-y-2 overflow-y-auto pr-1">
      {transactions.length > 0 ? (
        transactions.map((t, idx) => (
          <div
            key={`${t._id}-${idx}`}
            className="flex items-start justify-between rounded-2xl bg-zinc-100 p-3 dark:bg-zinc-900"
          >
            <div>
              <p className="text-sm font-semibold">
                {t.description}
              </p>

              <p className="text-xs text-zinc-500">
                {new Date(
                  t.createdAt,
                ).toLocaleString()}
              </p>
            </div>

            <div className="text-right">
              <p
                className={`text-sm font-bold ${
                  t.type === "credit"
                    ? "text-emerald-500"
                    : "text-red-500"
                }`}
              >
                ₦
                {Number(
                  t.amount,
                ).toLocaleString()}
              </p>

              <p className="text-xs text-zinc-500">
                {t.status}
              </p>
            </div>
          </div>
        ))
      ) : (
        <div className="rounded-2xl bg-zinc-100 p-4 text-sm text-zinc-500 dark:bg-zinc-900">
          No recent transactions
          found.
        </div>
      )}
    </div>
  </CardContent>
</Card>
      </div>
    </div>
  );
}
