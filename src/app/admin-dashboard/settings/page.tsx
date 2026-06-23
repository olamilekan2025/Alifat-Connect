"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Save,
  Shield,
  Palette,
  User,
  KeyRound,
  CreditCard,
  Mail,
  Bell,
  Users,
  Wrench,
  HardDrive,
  BarChart3,
  Search,
  RefreshCw,
  RotateCcw,
  Download,
  Upload,
  AlertTriangle,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type AdminSettings = any;

type AuditRow = {
  id: string;
  createdAt: string | Date;
  administrator: string;
  actionPerformed: string;
  targetResource: string;
  ipAddress: string;
  status: string;
};

const initialForm = {
  platformName: "",
  supportEmail: "",
  contactPhone: "",
  defaultCurrency: "NGN",
  timeZone: "Africa/Lagos",
  maintenanceMode: false,

  branding: {
    logoUrl: "",
    faviconUrl: "",
    loginImageUrl: "",
    primaryAccentColor: "#F59E0B",
    footerText: "",
    copyrightText: "",
  },

 adminProfile: {
  adminName: "",
  email: "",
  phone: "",
  role: "Administrator",
  twoFactorEnabled: false,
  lastLoginAt: null,
  lastPasswordChange: null,
  lastLoginIp: "",
  lastDevice: "",
  sessionCreatedAt: null,
},

  security: {
    forceEmailVerification: false,
    maximumLoginAttempts: 5,
    sessionTimeoutMinutes: 60,
    passwordPolicy: {
      minimumLength: 8,
      requireSpecialCharacters: true,
    },
    ipWhitelist: [],
    registrationEnabled: true,
    defaultRoleForNewUsers: "user",
    requireKycVerification: false,
    autoBanSuspiciousAccounts: false,
    maximumDevicesPerAccount: 5,
  },

  payment: {
    depositEnabled: true,
    withdrawalEnabled: true,

    airtimeEnabled: true,
    dataEnabled: true,
    cableEnabled: true,
    electricityEnabled: true,

    minimumDepositAmount: 100,
    maximumDepositAmount: 1000000,
    minimumWithdrawalAmount: 100,
    maximumWithdrawalAmount: 500000,
    transactionFeePercentage: 0,
  },

  email: {
    smtpHost: "",
    smtpPort: 587,
    smtpUsername: "",
    smtpPassword: "",
    senderEmail: "",
    senderName: "",
  },

  notifications: {
    enableEmailNotifications: true,
    enablePushNotifications: false,
    enableLoginAlerts: true,
    enableWithdrawalAlerts: true,
    enableDepositAlerts: true,
  },
};

function deepMerge(base: any, patch: any): any {
  if (!patch) return base;
  const out = { ...base };
  for (const key of Object.keys(patch)) {
    const pv = patch[key];
    if (
      pv &&
      typeof pv === "object" &&
      !Array.isArray(pv) &&
      base[key] &&
      typeof base[key] === "object"
    ) {
      out[key] = deepMerge(base[key], pv);
    } else {
      out[key] = pv;
    }
  }
  return out;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-semibold text-slate-500">{children}</div>;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>(initialForm);
  const [originalSettings, setOriginalSettings] =
    useState<AdminSettings>(initialForm);
    const [backups, setBackups] = useState<
  {
    id: string;
    name: string;
    description: string;
  }[]
>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  

  const [currentPassword, setCurrentPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
  const getPasswordStrength = (password: string) => {
    if (!password) {
      return {
        label: "Not entered",
        textClass: "text-slate-500",
        borderClass: "border-slate-200 dark:border-slate-800",
      };
    }

    if (password.length < 8) {
      return {
        label: "Weak",
        textClass: "text-red-600",
        borderClass: "border-red-300 dark:border-red-800",
      };
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

    if (score <= 2) {
      return {
        label: "Medium",
        textClass: "text-amber-600",
        borderClass: "border-amber-300 dark:border-amber-800",
      };
    }

    return {
      label: "Strong",
      textClass: "text-green-600",
      borderClass: "border-green-300 dark:border-green-800",
    };
  };

  const passwordStrength = getPasswordStrength(newPassword);

const handleChangePassword = async () => {
  if (!currentPassword || !newPassword || !confirmPassword) {
    toast.error("Please fill all fields");
    return;
  }

  if (newPassword !== confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  setChangingPassword(true);

  try {
    const res = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });

    const data = await res.json();

    if (data.success) {
      toast.success("Password updated successfully");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(data.message || "Failed to update password");
    }
  } catch (err) {
    toast.error("Something went wrong");
  } finally {
    setChangingPassword(false);
  }
};


  const [activeTab, setActiveTab] = useState<
    | "general"
    | "branding"
    | "profile"
    | "security"
    | "payment"
    | "email"
    | "notifications"
    | "users"
    | "maintenance"
    | "backup"
    | "analytics"
    | "audit"
  >("general");

  const [auditQ, setAuditQ] = useState("");
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditRows, setAuditRows] = useState<AuditRow[]>([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (ignore) return;
        const merged = deepMerge(initialForm, data?.settings || {});
        setSettings(merged);
        setOriginalSettings(structuredClone(merged));
      } catch {
        toast.error("Failed to load admin settings");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const saveAll = async () => {
    if (saving) return;
    if (!settings.platformName.trim()) {
      toast.error("Platform name is required");
      return;
    }

    if (!settings.supportEmail.trim()) {
      toast.error("Support email is required");
      return;
    }

    if (
      settings.branding.primaryAccentColor &&
      !/^#([0-9A-F]{3}){1,2}$/i.test(settings.branding.primaryAccentColor)
    ) {
      toast.error("Invalid accent color");
      return;
    }

    if (
      settings.payment.minimumDepositAmount >
      settings.payment.maximumDepositAmount
    ) {
      toast.error("Minimum deposit cannot exceed maximum deposit.");
      return;
    }

    if (
      settings.payment.minimumWithdrawalAmount >
      settings.payment.maximumWithdrawalAmount
    ) {
      toast.error("Minimum withdrawal cannot exceed maximum withdrawal.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Save failed");
      }
      toast.success("Settings saved successfully");
      setOriginalSettings(structuredClone(settings));
    } catch (e: any) {
      toast.error(e?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const loadAudit = async (page = 1) => {
    setAuditLoading(true);
    try {
      const params = new URLSearchParams();
      if (auditQ.trim()) params.set("q", auditQ.trim());
      params.set("page", String(page));
      params.set("limit", "20");

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      const data = await res.json();
      if (!data?.success)
        throw new Error(data?.message || "Failed to load audit logs");

      setAuditRows(data?.data || []);
      setAuditPage(data?.page || page);
      setAuditTotalPages(data?.totalPages || 1);
    } catch {
      toast.error("Failed to load audit logs");
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "audit") loadAudit(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const actionBlocker = saving || loading;




  const handleSignOutAllDevices = async () => {
  try {
    const res = await fetch("/api/admin/logout-all", {
      method: "POST",
    });

    const data = await res.json();

    if (data.success) {
      toast.success("All other sessions have been signed out.");
    } else {
      toast.error(data.message || "Unable to sign out other devices.");
    }
  } catch {
    toast.error("Something went wrong.");
  }
};


  const TabButton = ({
    id,
    label,
    icon,
  }: {
    id: typeof activeTab;
    label: string;
    icon: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={
        "group flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-all duration-200 " +
        (activeTab === id
          ? "border-yellow-400 bg-yellow-400/10 text-yellow-700 dark:text-yellow-400 dark:border-yellow-500"
          : "border-slate-200 bg-white/60 text-slate-700 hover:bg-white dark:border-slate-800 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10")
      }
    >
      <span className="text-slate-600 dark:text-slate-300 group-hover:text-yellow-600">
        {icon}
      </span>
      {label}
    </button>
  );
  const SectionHeader = ({
    title,
    subtitle,
  }: {
    title: string;
    subtitle: string;
  }) => (
    <div className="mb-6">
      <div className="flex items-center gap-3 ">
        <div className="h-10 w-10 rounded-2xl bg-yellow-400/10 flex items-center justify-center border border-yellow-300/40 dark:border-yellow-500/30">
          <Save className="h-5 w-5 text-yellow-700 dark:text-yellow-400" />
        </div>

        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            {title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );

  const renderGeneral = () => (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/20 dark:bg-neutral-950">
        <SectionHeader
          title="⚙️ General Settings"
          subtitle="Platform identity, availability, and core defaults."
        />

        <div className="grid gap-4">
          <div className="grid gap-2">
            <FieldLabel>Platform name</FieldLabel>
            <Input
              value={settings.platformName}
              onChange={(e) =>
                setSettings((s: any) => ({
                  ...s,
                  platformName: e.target.value,
                }))
              }
              placeholder="e.g. Alifat Connect"
            />
          </div>

          <div className="grid gap-2">
            <FieldLabel>Support email</FieldLabel>
            <Input
              value={settings.supportEmail}
              onChange={(e) =>
                setSettings((s: any) => ({
                  ...s,
                  supportEmail: e.target.value,
                }))
              }
              placeholder="support@domain.com"
            />
          </div>

          <div className="grid gap-2">
            <FieldLabel>Contact phone number</FieldLabel>
            <Input
              value={settings.contactPhone}
              onChange={(e) =>
                setSettings((s: any) => ({
                  ...s,
                  contactPhone: e.target.value,
                }))
              }
              placeholder="+234 ..."
            />
          </div>

          <div className="grid gap-2">
            <FieldLabel>Default currency</FieldLabel>
            <Input
              value={settings.defaultCurrency}
              onChange={(e) =>
                setSettings((s: any) => ({
                  ...s,
                  defaultCurrency: e.target.value,
                }))
              }
              placeholder="NGN"
            />
          </div>

          <div className="grid gap-2">
            <FieldLabel>Time zone</FieldLabel>
            <Input
              value={settings.timeZone}
              onChange={(e) =>
                setSettings((s: any) => ({ ...s, timeZone: e.target.value }))
              }
              placeholder="Africa/Lagos"
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            <div>
              <div className="text-sm font-bold">Maintenance mode</div>
              <div className="text-xs text-slate-500">
                Show maintenance banner & restrict actions (if wired).
              </div>
            </div>
            <Switch
              checked={Boolean(settings.maintenanceMode)}
              onCheckedChange={(v) =>
                setSettings((s: any) => ({ ...s, maintenanceMode: v }))
              }
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              type="button"
              disabled={actionBlocker}
              onClick={() => setSettings(structuredClone(originalSettings))}
            >
              Reset
            </Button>
            <Button type="button" onClick={saveAll} disabled={actionBlocker}>
              <Save className="mr-2 h-4 w-4" />
              Save changes
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/20 dark:bg-neutral-950">
        <h3 className="text-lg font-black">Premium Controls</h3>
        <p className="mt-1 text-sm text-slate-600">
          Fast toggles and clear status signals for administrators.
        </p>

        <div className="mt-5 grid gap-4">
          <div className="rounded-2xl border bg-white/70 dark:bg-black p-4">
            <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/5">
              <div>
                <div className="text-sm font-bold">Platform availability</div>
                <div className="text-xs text-slate-500">
                  Maintenance mode changes system behavior.
                </div>
              </div>
              <div
                className={
                  settings.maintenanceMode ? "text-red-600" : "text-emerald-600"
                }
              >
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 text-sm font-semibold">
              {settings.maintenanceMode
                ? "MAINTENANCE: ON"
                : "MAINTENANCE: OFF"}
            </div>
          </div>

          <div className="rounded-2xl border bg-white/70 dark:bg-black p-4">
            <div className="text-sm font-bold">Operational defaults</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl border bg-slate-50 dark:bg-neutral-950 p-3">
                <div className="text-xs text-slate-500">Currency</div>
                <div className="font-black">{settings.defaultCurrency}</div>
              </div>
              <div className="rounded-xl border bg-slate-50 dark:bg-neutral-950 p-3">
                <div className="text-xs text-slate-500">Time zone</div>
                <div className="font-black">{settings.timeZone}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // other tabs share similar layout; to keep performance, we render most fields only as required.
  // Premium UI: use sub-sections with cards.

  const renderBranding = () => (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-2xl border bg-white dark:bg-black p-5 shadow-sm">
        <h2 className="text-lg font-black tracking-tight">🎨 Branding</h2>
        <p className="mt-1 text-sm text-slate-500">
          Logo, favicon, login image, and the accent color.
        </p>

        <div className="mt-5 grid gap-4">
          <div className="grid gap-2">
            <FieldLabel>Primary accent color</FieldLabel>
            <>
              <div className="flex gap-3">
                <Input
                  type="color"
                  value={settings.branding.primaryAccentColor}
                  onChange={(e) =>
                    setSettings((s: any) => ({
                      ...s,
                      branding: {
                        ...s.branding,
                        primaryAccentColor: e.target.value,
                      },
                    }))
                  }
                  className="w-20"
                />

                <Input
                  value={settings.branding.primaryAccentColor}
                  onChange={(e) =>
                    setSettings((s: any) => ({
                      ...s,
                      branding: {
                        ...s.branding,
                        primaryAccentColor: e.target.value,
                      },
                    }))
                  }
                  placeholder="#F59E0B"
                />
              </div>
            </>
          </div>

          <div className="grid gap-2">
            <FieldLabel>Footer text</FieldLabel>
            <Input
              value={settings.branding.footerText}
              onChange={(e) =>
                setSettings((s: any) => ({
                  ...s,
                  branding: { ...s.branding, footerText: e.target.value },
                }))
              }
            />
          </div>

          <div className="grid gap-2">
            <FieldLabel>Copyright text</FieldLabel>
            <Input
              value={settings.branding.copyrightText}
              onChange={(e) =>
                setSettings((s: any) => ({
                  ...s,
                  branding: { ...s.branding, copyrightText: e.target.value },
                }))
              }
            />
          </div>

          <div className="grid gap-2">
            <FieldLabel>Upload logo (URL)</FieldLabel>
            <Input
              value={settings.branding.logoUrl}
              onChange={(e) =>
                setSettings((s: any) => ({
                  ...s,
                  branding: { ...s.branding, logoUrl: e.target.value },
                }))
              }
              placeholder="https://..."
            />
          </div>

          <div className="grid gap-2">
            <FieldLabel>Upload favicon (URL)</FieldLabel>
            <Input
              value={settings.branding.faviconUrl}
              onChange={(e) =>
                setSettings((s: any) => ({
                  ...s,
                  branding: { ...s.branding, faviconUrl: e.target.value },
                }))
              }
              placeholder="https://..."
            />
          </div>

          <div className="grid gap-2">
            <FieldLabel>Upload login image (URL)</FieldLabel>
            <Input
              value={settings.branding.loginImageUrl}
              onChange={(e) =>
                setSettings((s: any) => ({
                  ...s,
                  branding: { ...s.branding, loginImageUrl: e.target.value },
                }))
              }
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" onClick={saveAll} disabled={actionBlocker}>
              <Save className="mr-2 h-4 w-4" /> Save changes
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white dark:bg-black p-5 shadow-sm">
        <h3 className="text-sm font-bold">Preview</h3>
        <p className="mt-1 text-xs text-slate-500">
          Accent and footer/copyright snapshot.
        </p>
        <div className="mt-4 rounded-2xl border p-4">
          <div className="flex items-center justify-between">
            <div className="font-black">
              {settings.platformName || "Platform"}
            </div>

            <div
              className="h-9 w-9 rounded-xl"
              style={{
                background: settings.branding.primaryAccentColor || "#F59E0B",
              }}
            />
          </div>

          {/* Logo Preview */}
          {settings.branding.logoUrl && (
            <img
              src={settings.branding.logoUrl}
              alt="Logo"
              className="mt-4 h-16 w-16 rounded-lg border object-contain"
            />
          )}

          {/* Favicon Preview */}
          {settings.branding.faviconUrl && (
            <img
              src={settings.branding.faviconUrl}
              alt="Favicon"
              className="mt-3 h-8 w-8 rounded border object-contain"
            />
          )}

          {/* Login Image Preview */}
          {settings.branding.loginImageUrl && (
            <img
              src={settings.branding.loginImageUrl}
              alt="Login"
              className="mt-4 w-full rounded-xl border object-cover"
            />
          )}

          <div className="mt-4 text-sm text-slate-600">
            {settings.branding.footerText || "Footer text"}
          </div>

          <div className="mt-1 text-xs text-slate-500">
            {settings.branding.copyrightText || "© Copyright"}
          </div>
        </div>
      </div>
    </div>
  );

const renderProfile = () => (
  <div className="grid gap-6 xl:grid-cols-3">
    {/* PROFILE SECTION */}
    <div className="xl:col-span-2 rounded-2xl border bg-white dark:bg-black p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black">👤 Admin Profile</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage your administrator account information and security settings.
          </p>
        </div>

        <Button
          type="button"
          onClick={saveAll}
          disabled={actionBlocker}
        >
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {/* SAFE FALLBACK OBJECT */}
      {(() => {
        const profile = settings?.adminProfile || {};

        return (
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {/* NAME */}
            <div className="grid gap-2">
              <FieldLabel>Admin Name</FieldLabel>
              <Input
                value={profile.adminName || ""}
                onChange={(e) =>
                  setSettings((s: any) => ({
                    ...s,
                    adminProfile: {
                      ...s.adminProfile,
                      adminName: e.target.value,
                    },
                  }))
                }
              />
            </div>

            {/* EMAIL */}
            <div className="grid gap-2">
              <FieldLabel>Email Address</FieldLabel>
              <Input
                type="email"
                value={profile.email || ""}
                onChange={(e) =>
                  setSettings((s: any) => ({
                    ...s,
                    adminProfile: {
                      ...s.adminProfile,
                      email: e.target.value,
                    },
                  }))
                }
              />
            </div>

            {/* PHONE */}
            <div className="grid gap-2">
              <FieldLabel>Phone Number</FieldLabel>
              <Input
                value={profile.phone || ""}
                onChange={(e) =>
                  setSettings((s: any) => ({
                    ...s,
                    adminProfile: {
                      ...s.adminProfile,
                      phone: e.target.value,
                    },
                  }))
                }
              />
            </div>

            {/* ROLE */}
            <div className="grid gap-2">
              <FieldLabel>Role</FieldLabel>
              <Input readOnly value={profile.role || "Administrator"} />
            </div>

            {/* LAST LOGIN */}
            <div className="grid gap-2">
              <FieldLabel>Last Login</FieldLabel>
              <Input
                readOnly
                value={
                  profile.lastLoginAt
                    ? new Date(profile.lastLoginAt).toLocaleString()
                    : "N/A"
                }
              />
            </div>

            {/* PASSWORD CHANGE */}
            <div className="grid gap-2">
              <FieldLabel>Last Password Change</FieldLabel>
              <Input
                readOnly
                value={
                  profile.lastPasswordChange
                    ? new Date(profile.lastPasswordChange).toLocaleString()
                    : "Never"
                }
              />
            </div>
          </div>
        );
      })()}

      {/* 2FA */}
      <div className="mt-6 flex items-center justify-between rounded-xl border p-4">
        <div>
          <h4 className="font-semibold">Two-Factor Authentication</h4>
          <p className="text-sm text-slate-500">
            Require an additional verification step when signing in.
          </p>
        </div>

        <Switch
          checked={Boolean(settings?.adminProfile?.twoFactorEnabled)}
          onCheckedChange={(value) =>
            setSettings((s: any) => ({
              ...s,
              adminProfile: {
                ...s.adminProfile,
                twoFactorEnabled: value,
              },
            }))
          }
        />
      </div>
    </div>

    {/* PASSWORD CARD */}
    <div className="rounded-2xl border bg-white dark:bg-black p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <KeyRound className="h-5 w-5" />
        <h3 className="font-bold">Change Password</h3>
      </div>

      <div className="mt-5 space-y-4">
        <Input
  type="password"
  value={currentPassword}
  onChange={(e) => setCurrentPassword(e.target.value)}
  placeholder="Current password"
/>
        <Input
  type="password"
  value={newPassword}
  onChange={(e) => setNewPassword(e.target.value)}
  placeholder="New password"
/>
        <Input
  type="password"
  value={confirmPassword}
  onChange={(e) => setConfirmPassword(e.target.value)}
  placeholder="Confirm password"
/>

        <div
  className={`rounded-lg border p-3 text-sm ${passwordStrength.borderClass}`}
>
  <div className="flex items-center justify-between">
    <span className="text-slate-500">Password Strength</span>

    <span className={`font-semibold ${passwordStrength.textClass}`}>
      {passwordStrength.label}
    </span>
  </div>

  <div className="mt-2 text-xs text-slate-500">
    Use at least 8 characters and include uppercase letters, lowercase letters,
    numbers, and special characters for a stronger password.
  </div>
</div>

  <Button
  onClick={handleChangePassword}
  className="w-full flex items-center justify-center gap-2"
  disabled={changingPassword}
>
  {changingPassword ? (
    <>
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      Updating...
    </>
  ) : (
    <>
      <KeyRound className="mr-2 h-4 w-4" />
      Update Password
    </>
  )}
</Button>
      </div>
    </div>

    {/* SECURITY */}
    {(() => {
      const profile = settings?.adminProfile ?? {};
      return (
        <div className="xl:col-span-3 rounded-2xl border bg-white dark:bg-black p-6 shadow-sm">
          <h3 className="text-lg font-bold">🔐 Security Information</h3>

          <div className="mt-5 grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border p-4">
              <div className="text-xs text-slate-500">Last Login IP</div>
              <div className="mt-2 font-semibold break-all">
                {profile.lastLoginIp ?? "Unknown"}
              </div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="text-xs text-slate-500">Device / Browser</div>
              <div className="mt-2 font-semibold break-words">
                {profile.lastDevice ?? "Unknown Device"}
              </div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="text-xs text-slate-500">Session Created</div>
              <div className="mt-2 font-semibold">
                {profile.sessionCreatedAt
                  ? new Date(profile.sessionCreatedAt).toLocaleString()
                  : "Not Available"}
              </div>
            </div>

            <div className="rounded-xl border p-4 flex flex-col justify-between">
              <div>
                <div className="text-xs text-slate-500">
                  Active Sessions
                </div>
                <div className="mt-2 font-semibold">
                  Manage logged-in devices
                </div>
              </div>

              <Button
                variant="destructive"
                className="mt-4 w-full"
                onClick={handleSignOutAllDevices}
              >
                Sign Out All Devices
              </Button>
            </div>
          </div>
        </div>
      );
    })()}

  </div>
);
  const renderSecurity = () => (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-2xl border bg-white dark:bg-black p-5 shadow-sm">
        <h2 className="text-lg font-black tracking-tight">🔐 Security</h2>
        <p className="mt-1 text-sm text-slate-500">
          Authentication, password policy, and user access controls.
        </p>

        <div className="mt-5 grid gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold">Force email verification</div>
              <div className="text-xs text-slate-500">
                Require verified email for login.
              </div>
            </div>
            <Switch
              checked={Boolean(settings.security.forceEmailVerification)}
              onCheckedChange={(v) =>
                setSettings((s: any) => ({
                  ...s,
                  security: { ...s.security, forceEmailVerification: v },
                }))
              }
            />
          </div>

          <div className="grid gap-2">
            <FieldLabel>Maximum login attempts</FieldLabel>
            <Input
              type="number"
              value={settings.security.maximumLoginAttempts}
              onChange={(e) =>
                setSettings((s: any) => ({
                  ...s,
                  security: {
                    ...s.security,
                    maximumLoginAttempts: Number(e.target.value || 0),
                  },
                }))
              }
            />
          </div>

          <div className="grid gap-2">
            <FieldLabel>Session timeout (minutes)</FieldLabel>
            <Input
              type="number"
              value={settings.security.sessionTimeoutMinutes}
              onChange={(e) =>
                setSettings((s: any) => ({
                  ...s,
                  security: {
                    ...s.security,
                    sessionTimeoutMinutes: Number(e.target.value || 0),
                  },
                }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <FieldLabel>Password minimum length</FieldLabel>
              <Input
                type="number"
                value={settings.security.passwordPolicy.minimumLength}
                onChange={(e) =>
                  setSettings((s: any) => ({
                    ...s,
                    security: {
                      ...s.security,
                      passwordPolicy: {
                        ...s.security.passwordPolicy,
                        minimumLength: Number(e.target.value || 0),
                      },
                    },
                  }))
                }
              />
            </div>
            <div className="flex items-center gap-3 rounded-xl border p-3 mt-5">
              <div>
                <div className="text-sm font-bold">Special characters</div>
                <div className="text-xs text-slate-500">
                  Require non-alphanumeric characters.
                </div>
              </div>
              <div className="ml-auto">
                <Switch
                  checked={Boolean(
                    settings.security.passwordPolicy.requireSpecialCharacters,
                  )}
                  onCheckedChange={(v) =>
                    setSettings((s: any) => ({
                      ...s,
                      security: {
                        ...s.security,
                        passwordPolicy: {
                          ...s.security.passwordPolicy,
                          requireSpecialCharacters: v,
                        },
                      },
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <FieldLabel>IP whitelist (comma separated)</FieldLabel>
            <Input
              value={(settings.security.ipWhitelist || []).join(",")}
              onChange={(e) =>
                setSettings((s: any) => ({
                  ...s,
                  security: {
                    ...s.security,
                    ipWhitelist: e.target.value
                      .split(",")
                      .map((x) => x.trim())
                      .filter(Boolean),
                  },
                }))
              }
              placeholder="e.g. 41.0.0.1, 105.0.0.2"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button type="button" onClick={saveAll} disabled={actionBlocker}>
            <Save className="mr-2 h-4 w-4" /> Save changes
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white dark:bg-black p-5 shadow-sm">
        <h3 className="text-sm font-bold">Registration & user controls</h3>
        <p className="mt-1 text-xs text-slate-500">
          These affect the user layer.
        </p>

        <div className="mt-4 grid gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold">Enable registration</div>
              <div className="text-xs text-slate-500">
                Allow new users to sign up.
              </div>
            </div>
            <Switch
              checked={Boolean(settings.security.registrationEnabled)}
              onCheckedChange={(v) =>
                setSettings((s: any) => ({
                  ...s,
                  security: { ...s.security, registrationEnabled: v },
                }))
              }
            />
          </div>

          <div className="grid gap-2">
            <FieldLabel>Default role for new users</FieldLabel>
            <Input
              value={settings.security.defaultRoleForNewUsers}
              onChange={(e) =>
                setSettings((s: any) => ({
                  ...s,
                  security: {
                    ...s.security,
                    defaultRoleForNewUsers: e.target.value,
                  },
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold">Require KYC verification</div>
              <div className="text-xs text-slate-500">
                Block actions until KYC success.
              </div>
            </div>
            <Switch
              checked={Boolean(settings.security.requireKycVerification)}
              onCheckedChange={(v) =>
                setSettings((s: any) => ({
                  ...s,
                  security: { ...s.security, requireKycVerification: v },
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold">
                Auto-ban suspicious accounts
              </div>
              <div className="text-xs text-slate-500">
                Enforce risk-based blocks.
              </div>
            </div>
            <Switch
              checked={Boolean(settings.security.autoBanSuspiciousAccounts)}
              onCheckedChange={(v) =>
                setSettings((s: any) => ({
                  ...s,
                  security: { ...s.security, autoBanSuspiciousAccounts: v },
                }))
              }
            />
          </div>

          <div className="grid gap-2">
            <FieldLabel>Maximum devices per account</FieldLabel>
            <Input
              type="number"
              value={settings.security.maximumDevicesPerAccount}
              onChange={(e) =>
                setSettings((s: any) => ({
                  ...s,
                  security: {
                    ...s.security,
                    maximumDevicesPerAccount: Number(e.target.value || 0),
                  },
                }))
              }
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" onClick={saveAll} disabled={actionBlocker}>
              <Save className="mr-2 h-4 w-4" /> Save changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="rounded-2xl border bg-white dark:bg-black p-5 shadow-sm">
      <h2 className="text-lg font-black tracking-tight">💸 Payment Settings</h2>
      <p className="mt-1 text-sm text-slate-500">
        Deposit and withdrawal availability plus amount limits & fees.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
          <div>
            <div className="text-sm font-bold">Deposit enabled</div>
            <div className="text-xs text-slate-500">
              Allow users to fund wallet.
            </div>
          </div>
          <Switch
            checked={Boolean(settings.payment.depositEnabled)}
            onCheckedChange={(v) =>
              setSettings((s: any) => ({
                ...s,
                payment: { ...s.payment, depositEnabled: v },
              }))
            }
          />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
          <div>
            <div className="text-sm font-bold">Withdrawal enabled</div>
            <div className="text-xs text-slate-500">
              Allow users to cash out.
            </div>
          </div>
          <Switch
            checked={Boolean(settings.payment.withdrawalEnabled)}
            onCheckedChange={(v) =>
              setSettings((s: any) => ({
                ...s,
                payment: { ...s.payment, withdrawalEnabled: v },
              }))
            }
          />
        </div>

        <div className="grid gap-2">
          <FieldLabel>Minimum deposit amount</FieldLabel>
          <Input
            type="number"
            value={settings.payment.minimumDepositAmount}
            onChange={(e) =>
              setSettings((s: any) => ({
                ...s,
                payment: {
                  ...s.payment,
                  minimumDepositAmount: Number(e.target.value || 0),
                },
              }))
            }
          />
        </div>
        <div className="grid gap-2">
          <FieldLabel>Maximum deposit amount</FieldLabel>
          <Input
            type="number"
            value={settings.payment.maximumDepositAmount}
            onChange={(e) =>
              setSettings((s: any) => ({
                ...s,
                payment: {
                  ...s.payment,
                  maximumDepositAmount: Number(e.target.value || 0),
                },
              }))
            }
          />
        </div>

        <div className="grid gap-2">
          <FieldLabel>Minimum withdrawal amount</FieldLabel>
          <Input
            type="number"
            value={settings.payment.minimumWithdrawalAmount}
            onChange={(e) =>
              setSettings((s: any) => ({
                ...s,
                payment: {
                  ...s.payment,
                  minimumWithdrawalAmount: Number(e.target.value || 0),
                },
              }))
            }
          />
        </div>
        <div className="grid gap-2">
          <FieldLabel>Maximum withdrawal amount</FieldLabel>
          <Input
            type="number"
            value={settings.payment.maximumWithdrawalAmount}
            onChange={(e) =>
              setSettings((s: any) => ({
                ...s,
                payment: {
                  ...s.payment,
                  maximumWithdrawalAmount: Number(e.target.value || 0),
                },
              }))
            }
          />
        </div>

        <div className="grid gap-2 lg:col-span-2">
          <FieldLabel>Transaction fee percentage</FieldLabel>
          <Input
            type="number"
            value={settings.payment.transactionFeePercentage}
            onChange={(e) =>
              setSettings((s: any) => ({
                ...s,
                payment: {
                  ...s.payment,
                  transactionFeePercentage: Number(e.target.value || 0),
                },
              }))
            }
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-5">
        <Button type="button" onClick={saveAll} disabled={actionBlocker}>
          <Save className="mr-2 h-4 w-4" /> Save changes
        </Button>
      </div>
    </div>
  );

  const renderEmail = () => (
    <div className="rounded-2xl border bg-white dark:bg-black p-5 shadow-sm">
      <h2 className="text-lg font-black tracking-tight">📧 Email Settings</h2>
      <p className="mt-1 text-sm text-slate-500">
        SMTP configuration for transactional emails.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="grid gap-2">
          <FieldLabel>SMTP host</FieldLabel>
          <Input
            value={settings.email.smtpHost}
            onChange={(e) =>
              setSettings((s: any) => ({
                ...s,
                email: {
                  ...s.email,
                  smtpHost: e.target.value, // ✅ CORRECT
                },
              }))
            }
          />
        </div>
        <div className="grid gap-2">
          <FieldLabel>SMTP port</FieldLabel>
          <Input
            type="number"
            value={settings.email.smtpPort}
            onChange={(e) =>
              setSettings((s: any) => ({
                ...s,
                email: { ...s.email, smtpPort: Number(e.target.value) },
              }))
            }
          />
        </div>
        <div className="grid gap-2">
          <FieldLabel>SMTP username</FieldLabel>
          <Input
            value={settings.email.smtpUsername}
            onChange={(e) =>
              setSettings((s: any) => ({
                ...s,
                email: { ...s.email, smtpUsername: e.target.value },
              }))
            }
          />
        </div>
        <div className="grid gap-2">
          <FieldLabel>SMTP password</FieldLabel>
          <Input
            type="password"
            value={settings.email.smtpPassword}
            onChange={(e) =>
              setSettings((s: any) => ({
                ...s,
                email: { ...s.email, smtpPassword: e.target.value },
              }))
            }
          />
        </div>
        <div className="grid gap-2">
          <FieldLabel>Sender email</FieldLabel>
          <Input
            value={settings.email.senderEmail}
            onChange={(e) =>
              setSettings((s: any) => ({
                ...s,
                email: { ...s.email, senderEmail: e.target.value },
              }))
            }
          />
        </div>
        <div className="grid gap-2">
          <FieldLabel>Sender name</FieldLabel>
          <Input
            value={settings.email.senderName}
            onChange={(e) =>
              setSettings((s: any) => ({
                ...s,
                email: { ...s.email, senderName: e.target.value },
              }))
            }
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-5">
        <Button variant="outline" type="button" disabled>
          Test email
        </Button>
        <Button type="button" onClick={saveAll} disabled={actionBlocker}>
          <Save className="mr-2 h-4 w-4" /> Save changes
        </Button>
      </div>
    </div>
  );

  const renderNotifications = () => {
    const n = {
      enableEmailNotifications: false,
      enablePushNotifications: false,
      enableLoginAlerts: false,
      enableWithdrawalAlerts: false,
      enableDepositAlerts: false,
      ...settings?.notifications,
    };

    return (
      <div className="rounded-2xl border bg-white dark:bg-black p-5 shadow-sm">
        <h2 className="text-lg font-black tracking-tight">
          📱 Notification Settings
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Control email/push alerts and categories.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {/* Email */}
          <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
            <div>
              <div className="text-sm font-bold">
                Enable email notifications
              </div>
              <div className="text-xs text-slate-500">
                Send alerts to user inbox.
              </div>
            </div>

            <Switch
              checked={!!n.enableEmailNotifications}
              onCheckedChange={(v) =>
                setSettings((s: any) => ({
                  ...s,
                  notifications: {
                    ...s.notifications,
                    enableEmailNotifications: v,
                  },
                }))
              }
            />
          </div>

          {/* Push */}
          <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
            <div>
              <div className="text-sm font-bold">Enable push notifications</div>
              <div className="text-xs text-slate-500">
                Send in-app or device push.
              </div>
            </div>

            <Switch
              checked={!!n.enablePushNotifications}
              onCheckedChange={(v) =>
                setSettings((s: any) => ({
                  ...s,
                  notifications: {
                    ...s.notifications,
                    enablePushNotifications: v,
                  },
                }))
              }
            />
          </div>

          {/* Login */}
          <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
            <div>
              <div className="text-sm font-bold">Enable login alerts</div>
              <div className="text-xs text-slate-500">
                Notify on sign-in events.
              </div>
            </div>

            <Switch
              checked={!!n.enableLoginAlerts}
              onCheckedChange={(v) =>
                setSettings((s: any) => ({
                  ...s,
                  notifications: {
                    ...s.notifications,
                    enableLoginAlerts: v,
                  },
                }))
              }
            />
          </div>

          {/* Withdrawal */}
          <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
            <div>
              <div className="text-sm font-bold">Enable withdrawal alerts</div>
              <div className="text-xs text-slate-500">
                Notify on withdrawals.
              </div>
            </div>

            <Switch
              checked={!!n.enableWithdrawalAlerts}
              onCheckedChange={(v) =>
                setSettings((s: any) => ({
                  ...s,
                  notifications: {
                    ...s.notifications,
                    enableWithdrawalAlerts: v,
                  },
                }))
              }
            />
          </div>

          {/* Deposit */}
          <div className="flex items-center justify-between gap-4 rounded-xl border p-4 lg:col-span-2">
            <div>
              <div className="text-sm font-bold">Enable deposit alerts</div>
              <div className="text-xs text-slate-500">
                Notify on deposits and confirmations.
              </div>
            </div>

            <Switch
              checked={!!n.enableDepositAlerts}
              onCheckedChange={(v) =>
                setSettings((s: any) => ({
                  ...s,
                  notifications: {
                    ...s.notifications,
                    enableDepositAlerts: v,
                  },
                }))
              }
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-5">
          <Button type="button" onClick={saveAll} disabled={actionBlocker}>
            <Save className="mr-2 h-4 w-4" /> Save changes
          </Button>
        </div>
      </div>
    );
  };

  const renderMaintenance = () => (
    <div className="rounded-2xl border bg-white dark:bg-black p-5 shadow-sm">
      <h2 className="text-lg font-black tracking-tight">
        🛠️ Maintenance Tools
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Operational controls (requires backend wiring).
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {[
          "Clear cache",
          "Rebuild indexes",
          "Refresh statistics",
          "Restart background jobs",
        ].map((t) => (
          <div key={t} className="rounded-xl border bg-white dark:bg-black p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold">{t}</div>
                <div className="text-xs text-slate-500">
                  Runs a maintenance task safely.
                </div>
              </div>
              <Button variant="outline" disabled>
                <RefreshCw className="mr-2 h-4 w-4" /> Run
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3 pt-5">
        <Button variant="outline" disabled>
          Export logs
        </Button>
      </div>
    </div>
  );

  const renderBackup = () => (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-black">
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight">
          💾 Backup & Restore
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Protect your VTU platform by creating backups and restoring data when
          necessary.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Create Backup */}
        <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
          <h3 className="font-semibold">Create Database Backup</h3>
          <p className="mt-1 text-sm text-slate-500">
            Generate a fresh backup of your application database.
          </p>
          {/* // Create Backup */}
          <Button
            className="mt-4"
            onClick={async () => {
              await toast.promise(
                fetch("/api/admin/backup", {
                  method: "POST",
                }).then(async (res) => {
                  const data = await res.json();

                  if (!res.ok || !data.success) {
                    throw new Error(data.message || "Failed to create backup");
                  }

                  return data;
                }),
                {
                  loading: "Creating backup...",
                  success: "Backup created successfully.",
                  error: (err) => err.message || "Failed to create backup.",
                },
              );
            }}
          >
            <HardDrive className="mr-2 h-4 w-4" />
            Create Backup
          </Button>
        </div>

        {/* Download */}
        <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
          <h3 className="font-semibold">Download Latest Backup</h3>
          <p className="mt-1 text-sm text-slate-500">
            Download the most recently generated backup file.
          </p>
          {/* // Download */}
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              toast.success("Starting backup download...");
              window.open("/api/admin/backup/download", "_blank");
            }}
          >
            <HardDrive className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>

        {/* History */}
        <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
          <h3 className="font-semibold">Backup History</h3>
          <p className="mt-1 text-sm text-slate-500">
            View all previously created backup files.
          </p>
          {/* // History */}
          <Button
  variant="outline"
  className="mt-4"
  onClick={async () => {
    try {
      const res = await fetch("/api/admin/backup");
      const data = await res.json();

      if (data.success) {
        setBackups(data.backups || []);
        toast.success(`Loaded ${data.backups.length} backup(s).`);
      } else {
        toast.error("Failed to load backup history.");
      }
    } catch {
      toast.error("Failed to load backup history.");
    }
  }}
>
  <HardDrive className="mr-2 h-4 w-4" />
  View History
</Button>

{backups.length > 0 && (
  <div className="mt-6 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
    <h3 className="mb-3 font-semibold">Available Backups</h3>

    <ul className="space-y-2">
      {backups.map((backup) => (
  <li key={backup.id}>
    <div>{backup.name}</div>
    <div>{backup.description}</div>
  </li>
))}
    </ul>
  </div>
)}
        </div>

        {/* Restore */}
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/20">
          <h3 className="font-semibold text-red-700 dark:text-red-400">
            Restore Backup
          </h3>
          <p className="mt-1 text-sm text-red-600 dark:text-red-300">
            Restoring will overwrite current data. Proceed only if you
            understand the consequences.
          </p>
          {/* // Restore */}
          <Button
            variant="destructive"
            className="mt-4"
            onClick={async () => {
              const confirmed = window.confirm(
                "Are you sure you want to restore the backup? This may overwrite current data.",
              );

              if (!confirmed) {
                toast.info("Restore cancelled.");
                return;
              }

              try {
                const res = await fetch("/api/admin/backup/restore", {
                  method: "POST",
                });

                const data = await res.json();

                if (data.success) {
                  toast.success(
                    data.message || "Backup restored successfully.",
                  );
                } else {
                  toast.error(data.message || "Restore failed.");
                }
              } catch {
                toast.error("Something went wrong during restore.");
              }
            }}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restore
          </Button>
        </div>
      </div>
    </div>
  );
  const renderAnalytics = () => (
    <div className="rounded-2xl border bg-white dark:bg-black p-5 shadow-sm">
      <h2 className="text-lg font-black tracking-tight">📊 Analytics</h2>
      <p className="mt-1 text-sm text-slate-500">
        Admin KPIs loaded from existing stats endpoint.
      </p>

      <AnalyticsBlock />
    </div>
  );

  const AnalyticsBlock = () => {
    const [stats, setStats] = useState<any>(null);
    const [sLoading, setSLoading] = useState(true);

    useEffect(() => {
      let ignore = false;
      async function load() {
        try {
          const res = await fetch("/api/admin/stats");
          const data = await res.json();
          if (ignore) return;
          setStats(data);
        } catch {
          toast.error("Failed to load analytics");
        } finally {
          if (!ignore) setSLoading(false);
        }
      }
      load();
      return () => {
        ignore = true;
      };
    }, []);

    if (sLoading) {
      return (
        <div className="mt-5 text-sm text-slate-500">Loading analytics...</div>
      );
    }

    return (
      <div className="mt-5 grid gap-4 lg:grid-cols-4">
        <Kpi title="Total users" value={stats?.totalUsers ?? 0} />
        <Kpi title="Active users" value={stats?.verifiedUsers ?? 0} />
        <Kpi
          title="Revenue summary"
          value={`₦${Number(stats?.totalRevenue ?? 0).toLocaleString()}`}
        />
        <Kpi title="Transaction volume" value={stats?.totalTransactions ?? 0} />
      </div>
    );
  };

  const Kpi = ({ title, value }: { title: string; value: React.ReactNode }) => (
    <div className="rounded-2xl border bg-gradient-to-br from-white to-slate-50 p-4">
      <div className="text-xs font-semibold text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-black">{value}</div>
      <div className="mt-1 text-xs text-slate-500">Premium KPI</div>
    </div>
  );

  const renderAudit = () => (
    <div className="rounded-2xl border bg-white dark:bg-black p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black tracking-tight">📝 Audit Log</h2>
          <p className="mt-1 text-sm text-slate-500">
            Searchable admin actions: time, administrator, action, target, IP,
            status.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={auditQ}
            onChange={(e) => setAuditQ(e.target.value)}
            placeholder="Search audit logs..."
            className="pl-9"
            onKeyDown={(e) => {
              if (e.key === "Enter") loadAudit(1);
            }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Button
          variant="outline"
          disabled={auditLoading}
          onClick={() => loadAudit(1)}
        >
          <Search className="mr-2 h-4 w-4" /> Search
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="p-3">Time</th>
              <th className="p-3">Administrator</th>
              <th className="p-3">Action performed</th>
              <th className="p-3">Target resource</th>
              <th className="p-3">IP address</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {auditLoading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            ) : auditRows.length ? (
              auditRows.map((r) => {
                const status = r.status || "";
                const isFail = status.toLowerCase().includes("fail");
                return (
                  <tr key={r.id} className="border-t hover:bg-slate-50/60">
                    <td className="p-3 font-mono">
                      {r.createdAt
                        ? new Date(r.createdAt).toLocaleString()
                        : "-"}
                    </td>
                    <td className="p-3">{r.administrator}</td>
                    <td className="p-3">{r.actionPerformed}</td>
                    <td className="p-3">{r.targetResource}</td>
                    <td className="p-3 font-mono">{r.ipAddress}</td>
                    <td className="p-3">
                      <span
                        className={
                          isFail
                            ? "text-rose-600 font-bold"
                            : "text-emerald-600 font-bold"
                        }
                      >
                        {status || "-"}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  No audit logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        <Button
          variant="outline"
          disabled={auditPage <= 1 || auditLoading}
          onClick={() => loadAudit(Math.max(1, auditPage - 1))}
        >
          Prev
        </Button>
        <div className="text-sm text-slate-600">
          Page {auditPage} of {auditTotalPages}
        </div>
        <Button
          variant="outline"
          disabled={auditPage >= auditTotalPages || auditLoading}
          onClick={() => loadAudit(auditPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-yellow-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 font-sans text-slate-900 dark:bg-black dark:text-slate-50 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight md:text-3xl">
          Admin Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Premium configuration hub for platform operations.
        </p>
      </div>

      <div className="rounded-3xl border bg-white/70 dark:bg-black p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <TabButton
              id="general"
              label="General"
              icon={<Shield className="h-4 w-4" />}
            />
            <TabButton
              id="branding"
              label="Branding"
              icon={<Palette className="h-4 w-4" />}
            />
            <TabButton
              id="profile"
              label="Profile"
              icon={<User className="h-4 w-4" />}
            />
            <TabButton
              id="security"
              label="Security"
              icon={<KeyRound className="h-4 w-4" />}
            />
            <TabButton
              id="payment"
              label="Payments"
              icon={<CreditCard className="h-4 w-4" />}
            />
            <TabButton
              id="email"
              label="Email"
              icon={<Mail className="h-4 w-4" />}
            />
            <TabButton
              id="notifications"
              label="Notifications"
              icon={<Bell className="h-4 w-4" />}
            />
            <TabButton
              id="maintenance"
              label="Maintenance"
              icon={<Wrench className="h-4 w-4" />}
            />
            <TabButton
              id="backup"
              label="Backup"
              icon={<HardDrive className="h-4 w-4" />}
            />
            <TabButton
              id="analytics"
              label="Analytics"
              icon={<BarChart3 className="h-4 w-4" />}
            />
            <TabButton
              id="audit"
              label="Audit log"
              icon={<Search className="h-4 w-4" />}
            />
          </div>

          <div className="mt-4 lg:mt-0 lg:w-[360px]">
            <div className="rounded-2xl border border-yellow-200 bg-yellow-400/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold">Quick actions</div>
                  <div className="text-xs text-slate-600">
                    Save current config and validate updates.
                  </div>
                </div>
                <div className="h-9 w-9 rounded-xl bg-yellow-400 flex items-center justify-center text-black font-black">
                  ✓
                </div>
              </div>

              <div className="mt-3 grid gap-2">
                <Button
                  type="button"
                  onClick={saveAll}
                  disabled={actionBlocker}
                >
                  <Save className="mr-2 h-4 w-4" /> Save changes
                </Button>
                <Button variant="outline" type="button" disabled>
                  <Upload className="mr-2 h-4 w-4" /> Upload presets
                </Button>
              </div>

              <div className="mt-3 text-xs text-slate-600">
                Note: Maintenance/Backup/Email-test are UI placeholders until
                corresponding admin endpoints are wired.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === "general" && renderGeneral()}
        {activeTab === "branding" && renderBranding()}
        {activeTab === "profile" && renderProfile()}
        {activeTab === "security" && renderSecurity()}
        {activeTab === "payment" && renderPayment()}
        {activeTab === "email" && renderEmail()}
        {activeTab === "notifications" && renderNotifications()}
        {activeTab === "maintenance" && renderMaintenance()}
        {activeTab === "backup" && renderBackup()}
        {activeTab === "analytics" && renderAnalytics()}
        {activeTab === "audit" && renderAudit()}
      </div>
    </div>
  );
}
