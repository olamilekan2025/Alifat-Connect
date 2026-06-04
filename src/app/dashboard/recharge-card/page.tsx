"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, Loader2, ShieldCheck, Ticket, X } from "lucide-react";
import { toast } from "sonner";

interface GeneratedPinItem {
  id: string;
  pin: string;
  serial: string;
  expiryDate: string;
}

interface BatchTransactionResponse {
  batchId: string;
  network: string;
  amount: number;
  quantity: number;
  businessName: string;
  items: GeneratedPinItem[];
  totalCost: number;
  newBalance: number;
  timestamp: string;
}

type NetworkType = "mtn" | "airtel" | "glo" | "9mobile";

export default function RechargeCardPage() {
  const [network, setNetwork] = useState<NetworkType>("mtn");
  const [amount, setAmount] = useState<string>("100");
  const [quantity, setQuantity] = useState<string>("1");
  const [businessName, setBusinessName] = useState<string>("Alifat Connect");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [activeBatch, setActiveBatch] =
    useState<BatchTransactionResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const denominations = ["100", "200", "500", "1000"];

  const networkColors: Record<
    NetworkType,
    { bg: string; text: string; label: string }
  > = {
    mtn: {
      bg: "bg-yellow-400 dark:bg-yellow-500",
      text: "text-black",
      label: "MTN NGA",
    },
    airtel: { bg: "bg-red-600", text: "text-white", label: "Airtel" },
    glo: { bg: "bg-green-600", text: "text-white", label: "Glo" },
    "9mobile": { bg: "bg-teal-700", text: "text-white", label: "9mobile" },
  };

  // Reusable balance loader accessible across event handlers and lifecycles
  const loadBalance = async () => {
    try {
      const res = await fetch("/api/user/balance");

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        setWalletBalance(Number(data.balance || 0));
      }
    } catch (error) {
      console.error("Failed to load wallet balance:", error);

      setWalletBalance(0);
    }
  };
  useEffect(() => {
    loadBalance();
  }, []);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/recharge/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          network,
          amount: Number(amount),
          quantity: Number(quantity),
          businessName,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Generation error occurred.");
      }

      const transactionData: BatchTransactionResponse = result.data;

      setActiveBatch(transactionData);
      setIsModalOpen(true);

      // Fetch fresh system state balance immediately post-mint
      await loadBalance();

      toast.success("Batch Successfully Minted", {
        description: `Secured ${transactionData.quantity} pieces of e-pins successfully.`,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Please check server logs.";
      toast.error("Generation Failed", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerSystemPrint = () => {
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const totalCostEstimate = (Number(amount) || 0) * (Number(quantity) || 1);

  return (
    <main className="min-h-screen w-full bg-background text-foreground transition-colors duration-300">
      {/* Top Navigation Bar */}
<header className="relative overflow-hidden border-b border-border bg-gradient-to-r from-orange-500 to-orange-500 text-white print:hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 px-1 py-1 md:px-10 md:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center md:h-16 md:w-16">
                <Ticket className="h-4 w-4 md:h-8 md:w-8" />
              </div>

              <div>
                <h1 className="text-xs font-black md:text-lg">Recharge Card Studio</h1>
                <p className="text-xs text-white/80">Generate & Print E-Pins</p>
              </div>
            </div>

            <div className="rounded-2xl bg-white/15 backdrop-blur px-4 justify-center items-center py-1 text-right md:px-4 md:py-3">
              <p className="text-[8px] uppercase tracking-wider text-white/70 md:text-[11px]">
                Wallet Balance
              </p>

              <p className="text-xs font-black md:text-xl">
                {walletBalance === null
                  ? "Loading..."
                  : `₦${walletBalance.toLocaleString()}`}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Workspace Area Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-4rem)] print:hidden">
        {/* Left Control Parameter Settings */}
        <section className="lg:col-span-5 p-4 lg:p-8 bg-muted/10">
          <div className="space-y-6 max-w-md mx-auto w-full">
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Configure Batch
              </h2>
              <p className="text-sm text-muted-foreground">
                Select parameters to print customized recharge slips.
              </p>
            </div>

            <Card className="h-full rounded-3xl border-0 shadow-xl">
              <CardContent className="p-3 md:-8">
                {/* form content */}
                <form
                  id="recharge-form"
                  onSubmit={handleGenerate}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Network Provider
                    </label>

                    <div className="grid grid-cols-4 gap-2">
                      {(Object.keys(networkColors) as Array<NetworkType>).map(
                        (net) => (
                          <button
                            key={net}
                            type="button"
                            onClick={() => setNetwork(net)}
                            className={`h-12 rounded-xl font-bold border capitalize transition-all text-xs flex flex-col items-center justify-center gap-1 ${
                              network === net
                                ? "border-primary  bg-primary/5 ring-1 ring-primary text-foreground"
                                : "border-border bg-background text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${networkColors[net].bg}`}
                            />

                            {net}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Value (₦)
                      </label>

                      <Select value={amount} onValueChange={setAmount}>
                        <SelectTrigger className="bg-background border-input h-11">
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          {denominations.map((val) => (
                            <SelectItem key={val} value={val}>
                              ₦{val}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Quantity
                      </label>

                      <Input
                        type="number"
                        min="1"
                        max="20"
                        value={quantity}
                        onChange={(e) => {
                          const value = e.target.value;

                          if (value === "") {
                            setQuantity("");

                            return;
                          }

                          const num = Number(value);

                          if (Number.isNaN(num) || num < 1 || num > 20) return;

                          setQuantity(value);
                        }}
                        className="bg-background border-input h-11"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border bg-muted/30 p-4">
                    <div className="flex justify-between text-sm">
                      <span>Network</span>
                      <span className="font-bold uppercase">{network}</span>
                    </div>

                    <div className="mt-2 flex justify-between text-sm">
                      <span>Quantity</span>
                      <span className="font-bold">{quantity}</span>
                    </div>

                    <div className="mt-2 flex justify-between text-sm">
                      <span>Amount</span>
                      <span className="font-bold">
                        ₦{Number(amount).toLocaleString()}
                      </span>
                    </div>

                    <div className="mt-4 border-t pt-3 flex justify-between">
                      <span className="font-semibold">Total</span>

                      <span className="text-lg font-black text-orange-600">
                        ₦{totalCostEstimate.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Branding Banner Header
                    </label>

                    <Input
                      type="text"
                      maxLength={50}
                      placeholder="e.g. Alifat Connect"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 border-t border-border pt-6 max-w-md mx-auto w-full space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-muted-foreground">
                  Total Batch Cost
                </p>
                <p className="text-2xl font-black ">
                  ₦{totalCostEstimate.toLocaleString()}
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>Platform Charge: ₦0.00</p>
              </div>
            </div>

            <Button
              type="submit"
              form="recharge-form"
              disabled={isLoading}
className="w-full h-14 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-500 hover:bg-emerald-700 text-white font-black text-base shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Securing Pins from Server...
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  Generate & Print Batch
                </>
              )}
            </Button>
          </div>
        </section>

        {/* Right Side Card Preview Layout Frame */}
        <section className="relative lg:col-span-7 flex items-start justify-center p-3 md:p-12 overflow-hidden via-background to-cyan-50 dark:from-zinc-950 dark:via-background dark:to-zinc-900">
  {/* Background Pattern */}
  <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,#10b98115_1px,transparent_1px)] [background-size:18px_18px]" />

  <div className="relative z-10 w-full max-w-md">
    <div className="mb-4 text-center">
      <span className="inline-flex items-center rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-600 dark:text-orange-400">
        Live Voucher Preview
      </span>
    </div>

    <Card className="relative overflow-hidden rounded-[32px] border border-dashed border-0 bg-white  dark:bg-zinc-900">
      {/* Decorative Glow */}


      {/* Ticket Cutouts */}
      <div className="absolute left-0 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background" />
      <div className="absolute right-0 top-1/2 h-10 w-10 translate-x-1/2 -translate-y-1/2 rounded-full bg-background" />

      <CardContent className="relative p-0 border border-dashed">
        {/* Header */}
        <div className="px-6 pt-6 pb-5 text-center text-white">
          <h3 className="truncate text-xl font-black uppercase tracking-wide">
            {businessName?.trim() || "ALIFAT CONNECT"}
          </h3>

          <p className="mt-1 text-xs text-white/80">
            Electronic Recharge Voucher
          </p>
        </div>

        {/* Body */}
        <div className="space-y-5 px-3 pb-6 md:px-6 md:pb-8">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border bg-muted/40 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Network
              </p>

              <div
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase ${networkColors[network].bg} ${networkColors[network].text}`}
              >
                {networkColors[network].label}
              </div>
            </div>

            <div className="rounded-2xl border bg-muted/40 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Amount
              </p>

              <p className="mt-2 text-lg font-black">
                ₦{Number(amount).toLocaleString()}
              </p>
            </div>
          </div>

          {/* PIN Area */}
          <div className="rounded-3xl border-2 border-dashed border-orange-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent p-5 text-center">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Recharge PIN
            </p>

            <div className="text-xs font-black tracking-[0.3em] text-foreground/40 md:text-xl">
              XXXX XXXX XXXX
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-2xl border bg-muted/30 p-4">
            <p className="mb-2 text-center text-xs font-bold">
              Load Instructions
            </p>

            <p className="text-center text-xs text-muted-foreground">
              Dial *311*PIN# and press Call
            </p>
          </div>

          {/* Barcode */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex h-12 items-end justify-center gap-[2px]">
              {[...Array(28)].map((_, i) => (
                <div
                  key={i}
                  className={`bg-foreground ${
                    i % 4 === 0
                      ? "h-11 w-[4px]"
                      : i % 2 === 0
                        ? "h-8 w-[3px]"
                        : "h-9 w-[1.7px]"
                  }`}
                />
              ))}
            </div>

            <p className="text-center text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Batch Reference Code
            </p>

            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-orange-600 dark:text-orange-400">
              <ShieldCheck className="h-4 w-4" />
              Secured by VTU Engine
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</section>
      </div>

      {/* Modal Ticket Layer Layout */}
      {isModalOpen && activeBatch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto print:absolute print:inset-0 print:bg-white print:p-0">
          <div className="bg-background border border-border rounded-2xl max-w-5xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden print:border-none print:shadow-none print:max-h-full print:w-full">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30 print:hidden">
              <div>
                <h3 className="font-bold text-sm">
                  Batch Output: {activeBatch.batchId}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Ready for local thermal ticket processing.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  onClick={triggerSystemPrint}
                  className="gap-1.5 font-semibold text-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Batch
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setIsModalOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-8 flex-1 bg-gradient-to-b from-muted/20 to-background print:overflow-visible print:p-0 print:space-y-4">
              {activeBatch.items.map((item) => (
                <div
                  key={item.id}
                  className="w-full max-w-xs mx-auto bg-card text-card-foreground border-2 border-dashed border-border py-5 px-4 font-mono text-xs text-center relative rounded-none break-inside-avoid print:my-2 print:border-black"
                >
                  <div className="border-b border-muted pb-3 print:border-black">
                    <h4 className="font-bold text-sm tracking-wide uppercase truncate">
                      {activeBatch.businessName}
                    </h4>
                    <p className="text-[10px] text-muted-foreground print:text-black">
                      Instant Recharge Token
                    </p>
                  </div>

                  <div className="space-y-1.5 mt-4 text-left">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-[10px] uppercase print:text-black">
                        Network:
                      </span>
                      <span className="font-bold uppercase text-[10px] text-foreground print:text-black">
                        {activeBatch.network}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-[10px] uppercase print:text-black">
                        Value:
                      </span>
                      <span className="font-bold text-foreground print:text-black">
                        ₦{activeBatch.amount}.00
                      </span>
                    </div>
                  </div>

                  <div className="bg-muted p-2.5 border rounded border-border my-3 print:bg-gray-100 print:border-black">
                    <span className="text-[8px] tracking-wider text-muted-foreground block mb-0.5 print:text-black">
                      PIN VALUE
                    </span>
                    <p className="text-lg font-black tracking-[0.15em] text-foreground font-mono print:text-black">
                      {item.pin}
                    </p>
                  </div>

                  <div className="text-[9px] text-muted-foreground space-y-0.5 text-left border-b border-muted pb-3 mb-3 print:text-black print:border-black">
                    <p>
                      <span className="font-semibold">S/N:</span> {item.serial}
                    </p>
                    <p>
                      <span className="font-semibold">Expiry:</span>{" "}
                      {item.expiryDate}
                    </p>
                  </div>

                  <div className="text-[9px] text-muted-foreground text-left space-y-0.5 print:text-black">
                    <p className="font-bold text-center text-foreground mb-1 print:text-black">
                      Load Instructions:
                    </p>
                    <p className="text-center">Dial *311*PIN# then call</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
