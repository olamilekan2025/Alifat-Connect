"use client";

import { useEffect, useState } from "react";

import { useSession } from "next-auth/react";

import {
  Loader2,
  RefreshCw,
  Smartphone,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

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
    const cleanedNumber = phoneNumber.replace(/\D/g, "");

    if (cleanedNumber.length < 4) {
      setNetwork("");

      return;
    }

    const prefix = cleanedNumber.slice(0, 4);

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

      setPhone("");
      setAmount("");
      setNetwork("");
      setPin("");

      setOpenPin(false);

      await fetchWallet();

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
        <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Airtime
        </h1>

        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Buy airtime instantly
        </p>
      </div>

      {/* WALLET */}
      <Card className="overflow-hidden rounded-[35px] border-0 bg-white rounded-md dark:bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-white shadow-2xl">
        <CardContent className="flex items-center justify-between p-8">
          <div>
            <p className="text-sm text-black dark:text-zinc-400">
              Wallet Balance
            </p>

            <h2 className="mt-3 text-black text-5xl font-bold">
              ₦{wallet.balance.toLocaleString()}
            </h2>
          </div>

          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-black dark: dark:bg-white/10">
            <Smartphone className="h-8 w-8" />
          </div>
        </CardContent>
      </Card>

      {/* MAIN */}
      <div className="grid gap-6 xl:grid-col-[1fr_0.9fr]">
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

              <div className="rounded-[28px] border border-zinc-200  bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-3">
                  {/* NETWORK */}
                  <div
                    className={`flex h-14 min-w-[160px] items-center justify-between rounded-2xl border px-4 transition-all ${
                      network
                        ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
                        : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Network
                      </span>

                      <span
                        className={`text-sm font-bold ${
                          network
                            ? "text-green-700 dark:text-green-400"
                            : "text-zinc-400 dark:text-zinc-500"
                        }`}
                      >
                        {phone.length >= 4
                          ? network || "Unknown"
                          : "Detecting..."}
                      </span>
                    </div>

                    <ChevronDown className="h-4 w-4 text-zinc-400" />
                  </div>

                  {/* INPUT */}
                  <div className="flex-1">
                    <Input
                      type="tel"
                      maxLength={11}
                      placeholder="08012345678"
                      value={phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");

                        setPhone(value);

                        detectNetwork(value);
                      }}
                      className="h-14 border-0 bg-zinc-50 text-base shadow-none focus-visible:ring-0 dark:bg-zinc-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* STATUS */}
                {phone.length === 11 && (
                  <div className="mt-4 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800">
                    {network ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>

                          <div>
                            <h3 className="font-semibold text-zinc-900 dark:text-white">
                              {network} Number
                            </h3>

                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                              {phone}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-400">
                          Valid
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                          </div>

                          <div>
                            <h3 className="font-semibold text-red-600 dark:text-red-400">
                              Unknown Network
                            </h3>

                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                              Please check the number
                            </p>
                          </div>
                        </div>

                        <div className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-400">
                          Invalid
                        </div>
                      </div>
                    )}
                  </div>
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

          <CardContent className="space-y-4 p-6">
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
              onChange={(e) => setPin(e.target.value)}
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
