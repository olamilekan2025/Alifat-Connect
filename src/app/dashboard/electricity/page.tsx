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
import {
  Loader2,
  ShieldCheck,
  Zap,
  X,
  CheckCircle2,
  Printer,
} from "lucide-react";
import { toast } from "sonner";

type MeterType = "prepaid" | "postpaid";

interface VerificationResponse {
  success: boolean;
  customerName?: string;
  customerAddress?: string;
  error?: string;
}

interface PurchaseResponse {
  type: "electricity";
  provider: string;
  meterNumber: string;
  meterType: MeterType;
  customerName: string;
  amount: number;
  token?: string;
  status: "success" | "failed";
  reference: string;
  createdAt: string;
  newBalance?: number;
}

export default function ElectricityPage() {
  // Form State Configurations
  const [selectedDisco, setSelectedDisco] = useState<string>("IKEDC");
  const [meterType, setMeterType] = useState<MeterType>("prepaid");
  const [meterNumber, setMeterNumber] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [paymentPin, setPaymentPin] = useState<string>("");

  // UI Engine Lifecycle States
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);

  // Receipt Output Overlay Layer
  const [activeReceipt, setActiveReceipt] = useState<PurchaseResponse | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const discoProviders = [
    "IKEDC",
    "EKEDC",
    "AEDC",
    "IBEDC",
    "KEDCO",
    "JED",
    "EEDC",
    "PHED",
    "BEDC",
    "YEDC",
    "KAEDCO",
  ];

  // System balance retrieval mechanism
  const loadBalance = async () => {
    try {
      const res = await fetch("/api/user/balance");

      if (!res.ok) {
        console.error("Balance endpoint not found");
        return;
      }

      const data = await res.json();

      if (data?.success) {
        setWalletBalance(Number(data.balance || 0));
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  };

  useEffect(() => {
    loadBalance();
  }, []);

  // Workflow Trigger 1: Customer Identity Validation Action
  const handleValidateMeter = async () => {
    if (!meterNumber.trim()) {
      toast.error("Validation Error", {
        description: "Enter a meter number.",
      });
      return;
    }

    if (meterNumber.length < 11) {
      toast.error("Invalid Meter Number", {
        description: "Meter number must be at least 11 digits.",
      });
      return;
    }

    setIsValidating(true);
    setCustomerName("");
    setIsVerified(false);

    try {
      const res = await fetch("/api/electricity/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedDisco,
          meterNumber,
          meterType,
        }),
      });

      const result: VerificationResponse = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(
          result.error || "Could not resolve meter configurations.",
        );
      }

      setCustomerName(result.customerName || "UNKNOWN CUSTOMER");
      setIsVerified(true);
      toast.success("Meter Identity Verified", {
        description: `Account resolved to: ${result.customerName}`,
      });
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Meter validation pipeline failed.";
      toast.error("Verification Aborted", { description: msg });
    } finally {
      setIsValidating(false);
    }
  };

  // Workflow Trigger 2: Token Acquisition processing
  const handlePurchase = async (e: FormEvent) => {
    e.preventDefault();

    if (!isVerified || !customerName) {
      toast.error("Action Prohibited", {
        description:
          "Please validate the meter asset before committing assets.",
      });
      return;
    }
    if (!amount || isNaN(Number(amount))) {
      toast.error("Invalid Amount", {
        description: "Enter a valid amount.",
      });
      return;
    }

    if (Number(amount) < 500) {
      toast.error("Invalid Amount", {
        description: "Minimum purchase amount is ₦500.",
      });
      return;
    }

    if (paymentPin.length !== 4) {
      toast.error("Invalid PIN", {
        description: "Transaction PIN must be exactly 4 digits.",
      });
      return;
    }

    setIsMinting(true);

    try {
      const res = await fetch("/api/electricity/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedDisco,
          meterNumber,
          meterType,
          customerName,
          amount: Number(amount),
          pin: paymentPin,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(
          result.error || "A fatal transaction error was encountered.",
        );
      }

      const txReceipt: PurchaseResponse = result.data;

      setActiveReceipt(txReceipt);
      setIsModalOpen(true);

      if (txReceipt.newBalance !== undefined) {
        setWalletBalance(txReceipt.newBalance);
      }

      setAmount("");
      setPaymentPin("");

      toast.success("Electricity Purchase Successful", {
        description: `Reference: ${txReceipt.reference}`,
      });
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Internal engine execution error.";
      toast.error("Transaction Core Rejected", { description: msg });
    } finally {
      setIsMinting(false);
    }
  };

  const executeSystemReceiptPrint = () => {
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
  <main className="min-h-screen w-full bg-background text-foreground transition-colors duration-300">
    {/* Top Application System Bar Navigation */}
    <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white print:hidden px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-orange-600">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center md:h-14 md:w-14 flex-shrink-0">
          <Zap className="h-5 w-5 md:h-7 md:w-7 text-white fill-white animate-pulse" />
        </div>
        <div>
          <h1 className="text-sm font-black md:text-xl tracking-tight">
            Grid Token Portal
          </h1>
          <p className="text-xs text-white/80">Electricity Utility Node</p>
        </div>
      </div>
      
      <div className="rounded-2xl bg-white/15 backdrop-blur px-4 py-2 w-full sm:w-auto flex items-center justify-between sm:justify-end gap-4 border border-white/10">
        <p className="text-[10px] uppercase font-bold tracking-wider text-white/80 md:text-xs">
          Wallet Balance
        </p>
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/20 px-3 py-1">
          <p className="text-sm font-black md:text-lg font-mono">
            {walletBalance === null ? (
              <span className="text-xs font-normal text-white/70 animate-pulse">
                Checking...
              </span>
            ) : (
              `₦${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
            )}
          </p>
        </div>
      </div>
    </header>

    {/* Main Terminal Grid Workspace */}
    <div className="grid grid-cols-1 xl:grid-cols-12 min-h-[calc(100vh-5rem)] print:hidden gap-6 p-4 sm:p-8 lg:p-10">
      {/* Left Hand: Interactive Transaction Pipeline Form */}
      <section className="xl:col-span-5 rounded-[32px] border border-border/60 bg-muted/20 p-5 sm:p-8 flex flex-col justify-between shadow-sm">
        <div className="space-y-6 max-w-md mx-auto w-full">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Utility Parameters
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Authorize real-time distribution tokens to prepaid and postpaid power grids.
            </p>
          </div>

          <form
            id="electricity-form"
            onSubmit={handlePurchase}
            className="space-y-5"
          >
            {/* Disco Operator Identification Selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Distribution Company (Disco)
              </label>
              <Select
                value={selectedDisco}
                onValueChange={(val) => {
                  setSelectedDisco(val);
                  setCustomerName("");
                  setIsVerified(false);
                }}
              >
                <SelectTrigger className="bg-background border-input h-11 rounded-xl">
                  <SelectValue placeholder="Select Distribution Vendor" />
                </SelectTrigger>
                <SelectContent>
                  {discoProviders.map((disco) => (
                    <SelectItem key={disco} value={disco}>
                      {disco} Distribution PLC
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grid Topology Meter Classification Type */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Meter Layout Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["prepaid", "postpaid"] as Array<MeterType>).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setMeterType(type);
                      setCustomerName("");
                      setIsVerified(false);
                    }}
                    className={`h-11 rounded-xl font-bold border capitalize transition-all text-xs flex items-center justify-center gap-2 ${
                      meterType === type
                        ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500 text-foreground"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        meterType === type ? "bg-amber-500" : "bg-muted-foreground/40"
                      }`}
                    />
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Asset Hardware Number Entry Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Meter Serial Number
              </label>
              <div className="relative flex items-center">
                <Input
                  type="text"
                  maxLength={13}
                  placeholder="Enter 11 or 13-digit meter number"
                  value={meterNumber}
                  onChange={(e) => {
                    setMeterNumber(e.target.value.replace(/\D/g, ""));
                    setCustomerName("");
                    setIsVerified(false);
                  }}
                  className="bg-background border-input h-11 rounded-xl pr-28 font-mono tracking-wider"
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={isValidating || isMinting || meterNumber.length < 11}
                  onClick={handleValidateMeter}
                  className="absolute right-1.5 h-8 rounded-lg bg-amber-500 text-black hover:bg-amber-600 text-[11px] font-bold px-2.5 shadow-sm"
                >
                  {isValidating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    "Verify ID"
                  )}
                </Button>
              </div>
            </div>

            {/* Value and Secure Pin input modules */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Amount (₦)
                </label>
                <Input
                  type="number"
                  min="500"
                  step="100"
                  placeholder="Min ₦500"
                  disabled={!isVerified}
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setAmount("");
                      return;
                    }
                    if (Number(value) < 0) return;
                    setAmount(value);
                  }}
                  className="bg-background border-input h-11 rounded-xl font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Transaction Pin
                </label>
                <Input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  disabled={!isVerified}
                  value={paymentPin}
                  onChange={(e) => {
                    setPaymentPin(e.target.value.replace(/\D/g, "").slice(0, 4));
                  }}
                  className="bg-background border-input h-11 rounded-xl text-center font-black tracking-widest"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Action verification checkout block frame */}
        <div className="mt-8 border-t border-border/80 pt-6 max-w-md mx-auto w-full">
          <Button
            type="submit"
            form="electricity-form"
            disabled={isMinting || !isVerified}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-lg shadow-orange-500/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            {isMinting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Provisioning Grid Tokens...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Confirm & Transact Value
              </>
            )}
          </Button>
        </div>
      </section>

      {/* Right Hand Side: Telemetry Interface */}
      <section className="xl:col-span-7 flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-amber-500/5 via-background to-orange-500/5 relative overflow-hidden rounded-[32px] border border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_0.5px,transparent_0.5px)] dark:bg-[radial-gradient(#d97706_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-10" />

        <div className="relative z-10 w-full max-w-md">
          <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block text-center mb-3">
            Live Core Interface Transaction Preview
          </span>

          <Card className="w-full overflow-hidden rounded-[24px] border border-border bg-card shadow-2xl transition-all duration-300">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white relative">
              <div className="absolute right-4 top-4 opacity-15">
                <Zap className="w-16 h-16 fill-white" />
              </div>
              <h2 className="text-xl font-black tracking-tight">
                Electricity Payment
              </h2>
              <p className="text-white/80 text-xs font-medium mt-0.5">
                Instant grid network settlement
              </p>
            </div>

            <CardContent className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border/80 p-3.5 bg-muted/30">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">
                    Provider
                  </p>
                  <p className="font-bold text-sm text-foreground tracking-wide">
                    {selectedDisco || "IKEDC"}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/80 p-3.5 bg-muted/30">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">
                    Meter Type
                  </p>
                  <p className="font-bold text-sm text-foreground capitalize">
                    {meterType}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border/80 p-3.5 bg-muted/30">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">
                  Meter Identifier Target
                </p>
                <p className="font-mono font-bold text-sm tracking-widest text-foreground">
                  {meterNumber
                    ? meterNumber.replace(/.(?=.{4})/g, "*")
                    : "***********"}
                </p>
              </div>

              <div className="rounded-2xl border border-border/80 p-3.5 bg-muted/30 relative">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1">
                  Customer Registry Owner
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {isVerified && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  )}
                  <p
                    className={`font-bold text-sm uppercase truncate w-full ${
                      isVerified
                        ? "text-foreground"
                        : "text-muted-foreground italic"
                    }`}
                  >
                    {customerName || "Verify meter to load customer details"}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl p-4 bg-gradient-to-br from-orange-500/15 to-orange-500/5 border border-orange-500/10">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                  Purchase Consideration Amount
                </p>
                <p className="text-3xl font-black text-amber-600 dark:text-amber-500 tracking-tight font-mono">
                  ₦
                  {Number(amount || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>

    {/* Transaction Completion Success Receipt Overlay Layer Modal */}
    {isModalOpen && activeReceipt && (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto print:absolute print:inset-0 print:bg-white print:p-0">
        <div className="bg-background border border-border rounded-[28px] max-w-md w-full flex flex-col shadow-2xl overflow-hidden print:border-none print:shadow-none print:w-full">
          {/* Header Configuration Management Panel */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40 print:hidden">
            <span className="text-xs font-bold tracking-tight text-muted-foreground uppercase">
              Transaction Settled
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={executeSystemReceiptPrint}
                className="h-8 text-xs font-bold gap-1.5 rounded-lg"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Receipt Payload Core Render Wrapper */}
          <div className="p-6 font-mono text-xs space-y-6 text-center print:p-0 print:text-black">
            <div className="border-b border-dashed border-border pb-4 print:border-black">
              <h3 className="font-black text-base uppercase tracking-tight text-foreground print:text-black">
                Alifat Connect
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5 print:text-black">
                Digital Grid Service Voucher
              </p>
            </div>

            <div className="space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground print:text-black">
                  REFERENCE:
                </span>
                <span className="font-bold text-foreground print:text-black">
                  {activeReceipt.reference}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground print:text-black">
                  DISCO ENGINE:
                </span>
                <span className="font-bold text-foreground print:text-black">
                  {activeReceipt.provider}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground print:text-black">
                  METER NO:
                </span>
                <span className="font-bold text-foreground print:text-black">
                  {activeReceipt.meterNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground print:text-black">
                  METRIC MODE:
                </span>
                <span className="font-bold text-foreground uppercase print:text-black">
                  {activeReceipt.meterType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground print:text-black">
                  CLIENT:
                </span>
                <span className="font-bold text-foreground uppercase tracking-tighter truncate max-w-[180px] print:text-black">
                  {activeReceipt.customerName}
                </span>
              </div>
              <div className="flex justify-between border-t border-dashed border-border pt-2 mt-2 print:border-black">
                <span className="text-muted-foreground font-bold print:text-black">
                  AMOUNT PAID:
                </span>
                <span className="font-bold text-foreground print:text-black">
                  ₦{activeReceipt.amount.toLocaleString()}.00
                </span>
              </div>
            </div>

            {/* Conditional processing block based on presence of prepaid network parameters */}
            {activeReceipt.token && (
              <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 my-4 space-y-1 print:bg-zinc-100 print:border-black">
                <span className="text-[9px] font-bold tracking-widest text-amber-600 dark:text-amber-400 block print:text-black uppercase">
                  Credit Recharge Token PIN
                </span>
                <p className="text-xl font-black tracking-widest text-amber-600 dark:text-amber-500 font-mono select-all print:text-black">
                  {activeReceipt.token}
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-dashed border-border text-[9px] text-muted-foreground text-center space-y-1 print:text-black print:border-black">
              <p>
                Generated at:{" "}
                {new Date(activeReceipt.createdAt).toLocaleString()}
              </p>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center justify-center gap-1 print:text-black">
                <ShieldCheck className="w-3.5 h-3.5" /> Core Payment Certified
              </p>
            </div>
          </div>
        </div>
      </div>
    )}
  </main>
);
}
