"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Mail,
  Smartphone,
  Fingerprint,
  KeyRound,
  Clock3,
  CheckCircle2,
  Save,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useSecurity } from "../../../../hooks/use-security";

export function AuthenticationSettings() {
  const { data, loading, error, refresh } = useSecurity();

  const [saving, setSaving] = useState(false);

  if (loading) {
    return (
      <Card className="rounded-3xl p-8">
        Loading authentication settings...
      </Card>
    );
  }

  if (error) {
    return <Card className="rounded-3xl p-8 text-red-500">{error}</Card>;
  }

  if (!data) return null;

  const settings = data.authentication as Record<string, any>;

  const rows = [
    {
      key: "twoFA",
      title: "Two-Factor Authentication",
      description: "Require OTP before admin login.",
      icon: ShieldCheck,
    },
    {
      key: "emailVerification",
      title: "Email Verification",
      description: "Verify administrator email address.",
      icon: Mail,
    },
    {
      key: "smsOtp",
      title: "SMS OTP",
      description: "Send one-time password via SMS.",
      icon: Smartphone,
    },
    {
      key: "biometric",
      title: "Biometric Login",
      description: "Allow Face ID / Fingerprint.",
      icon: Fingerprint,
    },
    {
      key: "adminPin",
      title: "Admin PIN",
      description: "Require PIN before sensitive actions.",
      icon: KeyRound,
    },
  ] as const;

  const updateSetting = async (
    key: keyof typeof settings,
    value: boolean | number,
  ) => {
    setSaving(true);

    try {
      const res = await fetch("/api/admin/security/settings/save", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...settings,
          [key]: value,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save settings");
      }

      await refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="rounded-3xl border bg-white shadow-2xl backdrop-blur-xl dark:border-white/20 dark:bg-black">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Authentication Settings</CardTitle>

            <p className="mt-2 text-sm text-muted-foreground">
              Configure administrator authentication and account protection.
            </p>
          </div>

          <Badge className="gap-1 bg-green-500">
            <CheckCircle2 className="h-4 w-4" />
            Protected
          </Badge>
        </CardHeader>

        <CardContent className="space-y-5">
          {rows.map((item) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.key}
                whileHover={{ scale: 1.01 }}
                className="flex items-center justify-between rounded-2xl border bg-background/60 p-5"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-primary/10 p-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>

                  <div>
                    <h4 className="font-semibold">{item.title}</h4>

                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>

                <Switch
                  disabled={saving}
                  checked={Boolean(settings[item.key])}
                  onCheckedChange={(checked) =>
                    updateSetting(item.key, checked)
                  }
                />
              </motion.div>
            );
          })}

          <div className="rounded-2xl border bg-background/60 p-5">
            <div className="mb-4 flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-primary" />

              <div>
                <h4 className="font-semibold">Session Timeout</h4>

                <p className="text-sm text-muted-foreground">
                  Automatically log out inactive administrators.
                </p>
              </div>
            </div>

            <Select
              disabled={saving}
              value={String(settings.sessionTimeout)}
              onValueChange={(value) =>
                updateSetting("sessionTimeout", Number(value))
              }
            >
              <SelectTrigger className="w-full md:w-72">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="15">15 Minutes</SelectItem>

                <SelectItem value="30">30 Minutes</SelectItem>

                <SelectItem value="60">1 Hour</SelectItem>

                <SelectItem value="120">2 Hours</SelectItem>

                <SelectItem value="240">4 Hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-green-50 p-5 dark:bg-green-950/20">
            <div>
              <h4 className="font-semibold text-green-700 dark:text-green-300">
                Authentication Status
              </h4>

              <p className="text-sm text-muted-foreground">
                Your administrator authentication is secure.
              </p>
            </div>

            <Badge
              className={
                [
                  settings.twoFA,
                  settings.emailVerification,
                  settings.smsOtp,
                  settings.biometric,
                  settings.adminPin,
                ].filter(Boolean).length >= 4
                  ? "bg-green-500 text-white"
                  : "bg-orange-500 text-white"
              }
            ></Badge>
          </div>

          <div className="flex justify-end">
            <Button disabled={saving} size="lg" className="rounded-xl px-8">
              <Save className="mr-2 h-4 w-4" />

              {saving ? "Saving Changes..." : "All Changes Saved"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
