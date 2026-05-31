"use client";

import { useEffect, useMemo, useState } from "react";

import { useSession } from "next-auth/react";

import {
  Loader2,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
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

const networkPrefixes: Record<string, string[]> = {
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

const dataPlans: Record<string, Record<string, PlanItem[]>> = {
  MTN: {
    Daily: [
      {
        plan: "110MB",
        validity: "1 Day",
        amount: 100,
        cashback: "₦3.5 Cashback",
      },

      {
        plan: "500MB",
        validity: "1 Day",
        amount: 350,
        cashback: "₦12.25 Cashback",
      },

      {
        plan: "2.5GB",
        validity: "1 Day",
        amount: 730,
        cashback: "₦100 Cashback",
      },

      {
        plan: "3.5GB",
        validity: "1 Day",
        amount: 980,
        cashback: "₦100 Cashback",
      },
    ],

    Weekly: [
      {
        plan: "1GB",
        validity: "7 Days",
        amount: 780,
        cashback: "₦100 Cashback",
      },

      {
        plan: "3.5GB",
        validity: "7 Days",
        amount: 1480,
        cashback: "₦100 Cashback",
      },
    ],

    Monthly: [
      {
        plan: "7GB",
        validity: "30 Days",
        amount: 3480,
        cashback: "₦200 Cashback",
      },

      {
        plan: "20GB",
        validity: "30 Days",
        amount: 7480,
        cashback: "₦500 Cashback",
      },
    ],

    Yearly: [
      {
        plan: "800GB",
        amount: 125000,
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
  const { status } = useSession();

  const [loading, setLoading] = useState(true);

  const [buying, setBuying] = useState(false);

  const [wallet, setWallet] = useState<WalletData>({
    balance: 0,
  });

  const [transactions, setTransactions] = useState<DataTransaction[]>([]);

  const [network, setNetwork] = useState("");

  const [phone, setPhone] = useState("");

  const [planType, setPlanType] = useState("Daily");

  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);

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
        balance: data.wallet?.balance || 0,
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

      const response = await fetch("/api/data/history", {
        cache: "no-store",
      });

      const data = await response.json();

      setTransactions(
        Array.isArray(data.transactions) ? data.transactions : [],
      );
    } catch (error) {
      console.error(error);

      toast.error("Failed to load transactions");
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
      if (!network || !phone || !selectedPlan) {
        toast.error("Complete all fields");

        return;
      }

      if (phone.length !== 11) {
        toast.error("Invalid phone number");

        return;
      }

      if (pin.trim().length !== 4) {
        toast.error("Enter valid payment PIN");

        return;
      }

      const walletBalance = Number(wallet.balance || 0);

      const planAmount = Number(selectedPlan.amount || 0);

      if (walletBalance < planAmount) {
        toast.error(`Insufficient balance. Wallet: ₦${walletBalance}`);

        return;
      }

      setBuying(true);

      const response = await fetch("/api/data/purchase", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          network: String(network),
          phone: String(phone),
          amount: Number(selectedPlan.amount),
          planName: String(selectedPlan.plan),
          pin: String(pin),
        }),
      });
      let data;

      try {
        data = await response.json();
      } catch (error) {
        console.error(error);

        toast.error("Invalid server response");

        return;
      }

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

// UPDATE WALLET IMMEDIATELY
setWallet({
  balance: Number(
    data.balance || 0,
  ),
});

// RESET FORM
setPhone("");
setNetwork("");
setSelectedPlan(null);
setPin("");
setPlanType("Daily");

// CLOSE MODALS
setOpenPin(false);
setOpenSummary(false);

// REFRESH TRANSACTIONS
await fetchTransactions();
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong");
    } finally {
      setBuying(false);
    }
  }

  const plans = useMemo(() => {
    if (!network) return [];

    return dataPlans[network]?.[planType] || [];
  }, [network, planType]);

  if (loading && transactions.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] dark:bg-black">
      <div className="mx-auto max-w-7xl space-y-4 px-3 pb-24 md:space-y-6 md:p-6">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-[28px] bg-black px-4 py-5 text-white md:p-8">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* LEFT */}
            <div className="hidden max-w-xl md:block">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-xl">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                Premium VTU Service
              </div>

              <h1 className="text-5xl font-black tracking-tight">
                Buy Data Instantly
              </h1>

              <p className="mt-4 text-zinc-300">
                Purchase affordable mobile data for all Nigerian networks with
                instant delivery.
              </p>
            </div>

            {/* WALLET */}
            <div className="w-full rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-2xl md:max-w-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Wallet Balance</p>

                  <h2 className="mt-2 text-3xl font-black md:text-4xl">
                    ₦{wallet.balance.toLocaleString()}
                  </h2>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-black">
                  <Database className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-2xl bg-emerald-500/10 p-3 text-sm text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                Secured Transactions
              </div>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          {/* BUY CARD */}
          <Card className="overflow-hidden rounded-[28px] border-0 bg-white shadow-sm dark:bg-zinc-950">
            <CardContent className="space-y-8 p-4 md:p-8">
              {/* TITLE */}
              <div>
                <h2 className="text-3xl font-black">Data Purchase</h2>

                <p className="mt-2 text-sm text-zinc-500">
                  Enter recipient phone number and select bundle
                </p>
              </div>

              {/* PHONE */}
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

              {/* PLAN TYPE */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black">Bundle Category</h3>

                  <p className="text-sm text-zinc-500">
                    Choose preferred duration
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {["Daily", "Weekly", "Monthly", "Yearly"].map((type) => {
                    const active = planType === type;

                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setPlanType(type);

                          setSelectedPlan(null);
                        }}
                        className={`rounded-[18px] px-4 py-4 text-sm font-bold transition-all ${
                          active
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PLANS */}
              {network && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-black">Available Plans</h2>

                    <p className="text-sm text-zinc-500">
                      Select preferred bundle
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
                    {plans.map((item, index) => {
                      const active = selectedPlan?.plan === item.plan;

                      return (
                        <button
                          key={`${item.plan}-${index}`}
                          type="button"
                          onClick={() => setSelectedPlan(item)}
                          className={`rounded-[22px] border p-3 transition-all ${
                            active
                              ? "border-emerald-500 bg-emerald-500 text-black"
                              : "border-zinc-200 bg-white hover:border-emerald-400 dark:border-white/10 dark:bg-zinc-900"
                          }`}
                        >
                          <div className="space-y-2 text-center">
                            <h3 className="text-sm font-black">{item.plan}</h3>

                            <p className="text-[11px] opacity-70">
                              {item.validity}
                            </p>

                            <h2 className="text-lg font-black">
                              ₦{item.amount.toLocaleString()}
                            </h2>

                            <div className="rounded-full bg-black/10 px-2 py-1 text-[10px] font-bold">
                              {item.cashback}
                            </div>
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

                  if (!network || !phone) {
                    toast.error("Enter phone number");

                    return;
                  }

                  if (phone.length !== 11) {
                    toast.error("Invalid phone number");

                    return;
                  }

                  if (!selectedPlan) {
                    toast.error("Select a data plan");

                    return;
                  }

                  setOpenSummary(true);
                }}
                className="h-14 rounded-[20px] bg-black text-base font-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
              >
                Continue Payment
              </Button>
            </CardContent>
          </Card>

          {/* TRANSACTIONS */}
          <Card className="overflow-hidden rounded-[28px] border-0 bg-white shadow-sm dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-100 p-6 dark:border-white/10">
              <div>
                <h2 className="text-2xl font-black">Transactions</h2>

                <p className="text-sm text-zinc-500">Recent purchases</p>
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
                    className="rounded-[20px] bg-[#f7f8fa] p-4 dark:bg-zinc-900"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold">{item.planName}</h3>

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

      {/* SUMMARY MODAL */}
      <Dialog open={openSummary} onOpenChange={setOpenSummary}>
        <DialogContent className="rounded-[28px]">
          <DialogTitle>Confirm Payment</DialogTitle>

          <DialogDescription>Review transaction details</DialogDescription>

          <div className="space-y-5">
            <div className="rounded-3xl bg-zinc-50 p-5 dark:bg-zinc-900">
              <div className="flex justify-between py-3">
                <span>Plan</span>

                <span className="font-semibold">{selectedPlan?.plan}</span>
              </div>

              <div className="flex justify-between py-3">
                <span>Network</span>

                <span className="font-semibold">{network}</span>
              </div>

              <div className="flex justify-between py-3">
                <span>Phone</span>

                <span className="font-semibold">{phone}</span>
              </div>

              <div className="flex justify-between py-3">
                <span>Amount</span>

                <span className="text-2xl font-black">
                  ₦{selectedPlan?.amount.toLocaleString()}
                </span>
              </div>
            </div>

            <Button
              onClick={() => {
                setOpenSummary(false);

                setOpenPin(true);
              }}
              className="h-14 w-full rounded-2xl"
            >
              Pay Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PIN MODAL */}
      <Dialog open={openPin} onOpenChange={setOpenPin}>
        <DialogContent className="rounded-[28px]">
          <DialogTitle>Enter Payment PIN</DialogTitle>

          <DialogDescription>Secure transaction</DialogDescription>

          <div className="space-y-5">
            <Input
              type="password"
              maxLength={4}
              placeholder="****"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="h-16 rounded-2xl text-center text-2xl tracking-[10px]"
            />

            <Button
              onClick={handlePurchase}
              disabled={buying}
              className="h-14 w-full rounded-2xl"
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
