"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  UserCheck,
  Lock,
  Smartphone,
  Globe,
  History,
  Activity,
  AlertTriangle,
  Sliders,
  TrendingUp,
  Fingerprint,
  Loader2,
} from "lucide-react";

interface LoginSession {
  _id?: string;
  id: string;
  device: string;
  ipAddress: string;
  location: string;
  timestamp: string;
  isCurrent: boolean;
}

export default function ManageWalletControlsPage() {
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [loginHistory, setLoginHistory] = useState<LoginSession[]>([]);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [dailyLimit, setDailyLimit] = useState("50000");

  const [twoFactorAuth, setTwoFactorAuth] = useState<boolean>(true);
  const [biometricUnlock, setBiometricUnlock] = useState<boolean>(false);
  const [emailAlerts, setEmailAlerts] = useState<boolean>(true);

  async function loadSettings() {
    try {
      setLoading(true);
const res = await fetch("/api/manage-wallet");

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Server returned status ${res.status}:`, errorText);
        return;
      }

      const json = await res.json();
      if (!json.success) return;

      setDailyLimit(String(json.data.dailyLimit || "0"));
      setTwoFactorAuth(!!json.data.twoFactorAuth);
      setBiometricUnlock(!!json.data.biometricUnlock);
      setEmailAlerts(!!json.data.emailAlerts);
      setLoginHistory(json.data.loginHistory || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function savePreferences(payload: Record<string, unknown>) {
    try {
      await fetch("/api/manage-wallet", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function saveDailyLimit() {
    try {
      setSaving(true);
      const res = await fetch("/api/manage-wallet", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dailyLimit: dailyLimit }),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message);
        return;
      }
      alert("Ceiling threshold modified successfully!");
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^\d{4}$/.test(newPin)) {
      alert("PIN must be exactly 4 digits");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/manage-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_PIN",
          currentPin,
          newPin,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message);
        return;
      }

      setPinChangeSuccess(true);
      setCurrentPin("");
      setNewPin("");

      setTimeout(() => {
        setPinChangeSuccess(false);
      }, 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full bg-background text-foreground pb-16">
      <section className="bg-gradient-to-b from-orange-500/10 via-transparent to-transparent border-b border-border/40 py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-500 uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Security & Controls Core
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Manage Wallet Security
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure transaction authorization credentials, update liquidity speed bounds, and inspect active access points.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="rounded-3xl bg-black text-white border-0">
            <CardContent className="p-6">
              <ShieldCheck className="h-8 w-8 text-orange-500 mb-3" />
              <p className="text-xs uppercase opacity-70">Security Score</p>
              <h2 className="text-3xl font-black">98%</h2>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <TrendingUp className="h-8 w-8 mb-3 text-orange-500" />
              <p className="text-xs uppercase">Daily Limit</p>
              <h2 className="text-3xl font-black">
                ₦{Number(dailyLimit || 0).toLocaleString()}
              </h2>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <Activity className="h-8 w-8 mb-3 text-orange-500" />
              <p className="text-xs uppercase">Active Sessions</p>
              <h2 className="text-3xl font-black">
                {loginHistory.filter((s) => s.isCurrent).length}
              </h2>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <Card className="rounded-[22px] border border-border/80 bg-card shadow-sm overflow-hidden">
            <CardHeader className="border-b border-border/40 bg-muted/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-500/10 rounded-lg text-orange-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-black tracking-tight">
                    Transaction PIN Management
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Update your 4-digit processing token used to sign off actions.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleUpdatePin} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase">
                      Current Transaction PIN
                    </label>
                    <div className="relative flex items-center">
                      <Input
                        type={showCurrentPin ? "text" : "password"}
                        maxLength={4}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="••••"
                        value={currentPin}
                        onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))}
                        className="bg-background font-mono tracking-widest text-center h-10 rounded-xl text-sm pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPin(!showCurrentPin)}
                        className="absolute right-3 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrentPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase">
                      New 4-Digit Secure PIN
                    </label>
                    <div className="relative flex items-center">
                      <Input
                        type={showNewPin ? "text" : "password"}
                        maxLength={4}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="••••"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                        className="bg-background font-mono tracking-widest text-center h-10 rounded-xl text-sm pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPin(!showNewPin)}
                        className="absolute right-3 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {pinChangeSuccess && (
                  <div className="text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 p-2.5 rounded-xl font-bold">
                    System Configuration Updated: Security PIN modified successfully.
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-orange-500 text-white hover:bg-orange-600 rounded-xl text-xs font-bold h-10 w-full sm:w-auto px-6"
                >
                  Apply Security Hash
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-[22px] border border-border/80 bg-card shadow-sm overflow-hidden">
            <CardHeader className="border-b border-border/40 bg-muted/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-500/10 rounded-lg text-orange-500">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-black tracking-tight">
                    Velocity Guardrails & Limits
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Throttle systemic data/airtime payout volumes to protect assets.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-muted-foreground uppercase tracking-wide text-[11px]">
                    Daily Cumulative Spend Ceiling
                  </span>
                  <span className="font-mono font-bold text-orange-500">Max Limit: ₦5,000,000</span>
                </div>
                <div className="flex gap-3">
                  <div className="relative flex items-center flex-1">
                    <span className="absolute left-3 text-xs font-bold text-muted-foreground font-mono">₦</span>
                    <Input
                      type="text"
                      value={dailyLimit === "" ? "" : Number(dailyLimit).toLocaleString()}
                      onChange={(e) => setDailyLimit(e.target.value.replace(/\D/g, ""))}
                      className="bg-background pl-7 font-mono font-bold h-10 rounded-xl text-xs"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={saveDailyLimit}
                    disabled={saving}
                    className="rounded-xl text-xs font-bold h-10 border-input bg-card"
                  >
                    {saving ? "Saving..." : "Save Guardrail"}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground italic">
                  * Any processing execution exceeding this numeric baseline triggers global cryptographic PIN blocks until the next calendar phase.
                </p>
              </div>

              <hr className="border-border/60" />

              <div className="flex items-center justify-between bg-muted/30 p-3 rounded-xl border border-border/40">
                <div className="space-y-0.5">
                  <div className="text-xs font-black flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-orange-500" /> Account Identity State: Tier 2 Node
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    BVN / NIN records confirmed in core telemetry databases.
                  </p>
                </div>
                <span className="text-[9px] font-black tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-md uppercase">
                  Verified
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card className="rounded-[22px] border border-border/80 bg-card shadow-sm p-5 space-y-4">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-orange-500" /> Operational Frameworks
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 hover:bg-muted/20 rounded-xl transition-all">
                <div className="space-y-0.5 pr-2">
                  <div className="text-xs font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3 text-muted-foreground" /> Two-Factor Outbound Intercept
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Force OTP check for balances above N10,000.
                  </div>
                </div>
                <Switch
                  checked={twoFactorAuth}
                  onCheckedChange={(value) => {
                    setTwoFactorAuth(value);
                    savePreferences({ twoFactorAuth: value });
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-2.5 hover:bg-muted/20 rounded-xl transition-all">
                <div className="space-y-0.5 pr-2">
                  <div className="text-xs font-bold flex items-center gap-1">
                    <Fingerprint className="w-3 h-3 text-muted-foreground" /> Biometric Token Signature
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Authorize mobile processes via local secure enclave.
                  </div>
                </div>
                <Switch
                  checked={biometricUnlock}
                  onCheckedChange={(value) => {
                    setBiometricUnlock(value);
                    savePreferences({ biometricUnlock: value });
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-2.5 hover:bg-muted/20 rounded-xl transition-all">
                <div className="space-y-0.5 pr-2">
                  <div className="text-xs font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-muted-foreground" /> Push Clearing Messages
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Dispatch instant email logs upon internal asset distribution.
                  </div>
                </div>
                <Switch
                  checked={emailAlerts}
                  onCheckedChange={(value) => {
                    setEmailAlerts(value);
                    savePreferences({ emailAlerts: value });
                  }}
                />
              </div>
            </div>
          </Card>

          <Card className="rounded-[22px] border border-border/80 bg-card shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border/40 bg-muted/10">
              <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-orange-500" /> Live Footprint Diagnostics
              </h3>
            </div>
            <CardContent className="p-4 space-y-3">
              {loginHistory.map((session, index) => (
                <div
                  key={session.id || session._id || index}
                  className={`p-3 rounded-xl border flex items-start gap-2.5 transition-all ${
                    session.isCurrent
                      ? "bg-gradient-to-r from-orange-500/5 to-transparent border-orange-500/20"
                      : "bg-muted/20 border-border/40"
                  }`}
                >
                  {session.device?.includes("Mobile") ? (
                    <Smartphone className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  ) : (
                    <Globe className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  )}

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-bold truncate text-foreground">{session.device}</div>
                      {session.isCurrent && (
                        <span className="text-[8px] font-black tracking-widest text-orange-500 bg-orange-500/10 px-1.5 py-0.5 border border-orange-500/20 rounded uppercase shrink-0">
                          Active Node
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-muted-foreground font-mono">
                      <span>IP: {session.ipAddress}</span>
                      <span>•</span>
                      <span>{session.location}</span>
                    </div>
                    <div className="text-[9px] text-muted-foreground/80 font-medium">
                      {session.timestamp ? new Date(session.timestamp).toLocaleString() : "Unknown date"}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}