"use client";

import { useEffect, useState } from "react";

import { useSession } from "next-auth/react";

import {
  Loader2,
  RefreshCw,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Smartphone, ShieldCheck } from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface AirtimeTransaction {
  _id: string;

  network: string;

  phone: string;

  amount: number;

  status: string;

  createdAt: string;
}

interface WalletData {
  balance: number;
}

const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

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

  Glo: ["0805", "0807", "0705", "0811", "0815", "0905", "0915"],

  "9mobile": ["0809", "0817", "0818", "0908", "0909"],
};

const networkColors: Record<string, string> = {
  MTN: "from-yellow-400 to-yellow-600",

  Airtel: "from-red-500 to-red-700",

  Glo: "from-green-500 to-green-700",

  "9mobile": "from-emerald-400 to-emerald-700",
};

export default function AirtimePage() {
  const { status } = useSession();

  const [loading, setLoading] = useState(true);

  const [buying, setBuying] = useState(false);

  const [wallet, setWallet] = useState<WalletData>({
    balance: 0,
  });

  const [transactions, setTransactions] = useState<AirtimeTransaction[]>([]);

  const [network, setNetwork] = useState("");

  const [phone, setPhone] = useState("");

  const [amount, setAmount] = useState("");

  const [pin, setPin] = useState("");

  const [openSummary, setOpenSummary] = useState(false);

  const [openPin, setOpenPin] = useState(false);

  const [hasPaymentPin, setHasPaymentPin] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchWallet();

      fetchTransactions();
    }
  }, [status]);

  async function fetchWallet() {
    try {
      const response = await fetch("/api/wallet", {
        cache: "no-store",
      });

      const data = await response.json();

      setWallet({
        balance: data.wallet.balance || 0,
      });

      setHasPaymentPin(data.user?.hasPaymentPin || false);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load wallet");
    }
  }

  async function fetchTransactions() {
    try {
      setLoading(true);

      const response = await fetch("/api/airtime/history", {
        cache: "no-store",
      });

      const data = await response.json();

      setTransactions(
        Array.isArray(data.transactions) ? data.transactions : [],
      );
    } catch (error) {
      console.error(error);

      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  }

  function detectNetwork(phoneNumber: string) {
    const cleaned = phoneNumber.replace(/\D/g, "");

    if (cleaned.length < 4) {
      setNetwork("");

      return;
    }

    const prefix = cleaned.slice(0, 4);

    let detected = "";

    Object.entries(networkPrefixes).forEach(([networkName, prefixes]) => {
      if (prefixes.includes(prefix)) {
        detected = networkName;
      }
    });

    setNetwork(detected);
  }
  async function handlePurchase() {
    try {
      if (!network || !phone || !amount) {
        toast.error("Complete all fields");

        return;
      }

      if (phone.length !== 11) {
        toast.error("Invalid phone number");

        return;
      }

      if (pin.length !== 4) {
        toast.error("Enter valid payment PIN");

        return;
      }

      const parsedAmount = Number(amount);

      if (parsedAmount < 50) {
        toast.error("Minimum amount is ₦50");

        return;
      }

      if (parsedAmount > wallet.balance) {
        toast.error("Insufficient balance");

        return;
      }

      setBuying(true);

      const response = await fetch("/api/airtime/purchase", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          network,
          phone,
          amount: parsedAmount,
          pin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Purchase failed");

        return;
      }

      toast.success("Airtime purchase successful");

      setWallet({
        balance: Number(data.balance || 0),
      });

      setPhone("");
      setAmount("");
      setNetwork("");
      setPin("");

      setOpenPin(false);
      setOpenSummary(false);

      await fetchTransactions();
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong");
    } finally {
      setBuying(false);
    }
  }

  if (loading && transactions.length === 0) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="custom-loader" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* HEADER */}
      <div className="relative overflow-hidden rounded-[28px] bg-black px-4 py-5 text-white md:p-8">
        {" "}
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />{" "}
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {" "}
          <div className="max-w-xl">
            {" "}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-xl">
              {" "}
              <Smartphone className="h-4 w-4 text-emerald-400" /> Instant
              Airtime Top-up{" "}
            </div>{" "}
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">
              {" "}
              Buy Airtime{" "}
            </h1>{" "}
            <p className="mt-4 text-zinc-300">
              {" "}
              Purchase airtime instantly for all Nigerian networks with fast and
              secure delivery.{" "}
            </p>{" "}
          </div>{" "}
          <div className="w-full rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-2xl md:max-w-sm">
            {" "}
            <div className="flex items-start justify-between">
              {" "}
              <div>
                {" "}
                <p className="text-sm text-zinc-400"> Wallet Balance </p>{" "}
                <h2 className="mt-2 text-3xl font-black md:text-4xl">
                  {" "}
                  ₦{wallet.balance.toLocaleString()}{" "}
                </h2>{" "}
              </div>{" "}
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-black">
                {" "}
                <Smartphone className="h-6 w-6" />{" "}
              </div>{" "}
            </div>{" "}
            <div className="mt-5 flex items-center gap-2 rounded-2xl bg-emerald-500/10 p-3 text-sm text-emerald-400">
              {" "}
              <ShieldCheck className="h-4 w-4" /> Instant & Secure Airtime
              Purchase{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>
      {/* MAIN */}
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        {/* LEFT */}
        <Card className="overflow-hidden rounded-[35px] rounded-md  border border-zinc-200 bg-white shadow-[0_20px_80px_rgba(0,0,0,0.08)] dark:border-zinc-800 dark:bg-zinc-950">
          <div className="dark:bg-gradient-to-br from-black via-zinc-900 to-zinc-800 p-8 text-white">
            <h2 className="text-3xl font-bold text-black dark:text-white">
              Buy Airtime
            </h2>
          </div>

          <CardContent className="space-y-8 p-8  ">
            {/* PHONE */}
            <div className="space-y-8">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Recipient Number
              </label>

              <div className="space-y-3">
                <label className="text-sm font-semibold">Phone Number</label>

                <div className="flex items-center gap-2 rounded-[24px] border border-zinc-200 bg-[#f7f8fa] p-2 dark:border-white/10 dark:bg-zinc-900">
                  <div
                    className={`flex h-12 min-w-[90px] items-center justify-center rounded-[18px] bg-gradient-to-br ${
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
                    className="h-12 border-0 bg-transparent text-lg font-bold shadow-none focus-visible:ring-0"
                  />
                </div>

                {phone.length === 11 && (
                  <>
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
                  </>
                )}
              </div>
            </div>

            {/* AMOUNT */}
            <div className="space-y-3 mt-6 ">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Amount
              </label>

              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-14 rounded-2xl dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
            </div>

            {/* QUICK */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {quickAmounts.map((item) => (
                <button
                  key={item}
                  onClick={() => setAmount(String(item))}
                  className={`rounded-2xl border p-4 text-sm font-semibold transition-all ${
                    amount === String(item)
                      ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                      : "border-zinc-200 bg-zinc-50 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  }`}
                >
                  ₦{item}
                </button>
              ))}
            </div>

            {/* BUTTON */}
            <Button
              onClick={() => {
                if (!network) {
                  toast.error("Invalid network");

                  return;
                }

                if (phone.length !== 11) {
                  toast.error("Invalid phone number");

                  return;
                }

                if (!amount) {
                  toast.error("Enter amount");

                  return;
                }

                // CHECK PAYMENT PIN
                if (!hasPaymentPin) {
                  toast.error(
                    "Please go to Settings and set up your payment PIN",
                  );

                  return;
                }

                setOpenSummary(true);
              }}
              className="h-14 w-full mt-8 rounded-2xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Continue Payment
            </Button>
          </CardContent>
        </Card>

        {/* TRANSACTIONS */}
        <Card className="overflow-hidden rounded-[35px]  rounded-md  border border-zinc-200 bg-white shadow-[0_20px_80px_rgba(0,0,0,0.08)] dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-200 p-8 dark:border-zinc-800">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                Recent Transactions
              </h2>
            </div>

            <Button
              size="icon"
              variant="outline"
              onClick={fetchTransactions}
              className="rounded-2xl dark:border-zinc-700 dark:bg-zinc-900"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>

          <CardContent className="space-y-4 p-6 max-h-[500px] overflow-y-auto">
            {transactions.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center rounded-3xl border border-dashed border-zinc-300 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                No transactions yet
              </div>
            ) : (
              transactions.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between rounded-3xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                      {item.network}
                    </h3>

                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {item.phone}
                    </p>
                  </div>

                  <div className="text-right">
                    <h3 className="font-bold text-zinc-900 dark:text-white">
                      ₦{item.amount.toLocaleString()}
                    </h3>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-400">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* SUMMARY */}
      <Dialog open={openSummary} onOpenChange={setOpenSummary}>
        <DialogContent className="rounded-[35px] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <DialogTitle className="text-zinc-900 dark:text-white">
            Confirm Payment
          </DialogTitle>

          <DialogDescription className="text-zinc-500 dark:text-zinc-400">
            Review transaction details
          </DialogDescription>

          <div className="space-y-5">
            <div className="rounded-3xl bg-zinc-50 p-5 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-zinc-200 py-4 dark:border-zinc-700">
                <span className="text-zinc-600 dark:text-zinc-300">
                  Product
                </span>

                <span className="font-semibold text-zinc-900 dark:text-white">
                  {network} Airtime
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-zinc-200 py-4 dark:border-zinc-700">
                <span className="text-zinc-600 dark:text-zinc-300">
                  Recipient
                </span>

                <span className="font-semibold text-zinc-900 dark:text-white">
                  {phone}
                </span>
              </div>

              <div className="flex items-center justify-between py-4">
                <span className="text-zinc-600 dark:text-zinc-300">Amount</span>

                <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                  ₦{Number(amount).toLocaleString()}
                </span>
              </div>
            </div>

            <Button
              onClick={() => {
                setOpenSummary(false);

                setOpenPin(true);
              }}
              className="h-14 w-full rounded-2xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Pay Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PIN */}
      <Dialog open={openPin} onOpenChange={setOpenPin}>
        <DialogContent className="rounded-[35px] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <DialogTitle className="text-zinc-900 dark:text-white">
            Enter Payment PIN
          </DialogTitle>

          <DialogDescription className="text-zinc-500 dark:text-zinc-400">
            Secure transaction
          </DialogDescription>

          <div className="space-y-5">
            <Input
              type="password"
              maxLength={4}
              placeholder="****"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="h-16 rounded-2xl text-center text-2xl tracking-[10px] dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />

            <Button
              onClick={handlePurchase}
              disabled={buying}
              className="h-14 w-full rounded-2xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {buying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Complete Payment"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
