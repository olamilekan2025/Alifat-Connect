"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  AlertCircle,
  Clock,
  Save,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useSecurity } from "../../../../hooks/use-security";

export function LoginProtection() {
  const { data, loading, error, refresh } = useSecurity();
  const [saving, setSaving] = useState(false);

  if (loading) {
    return (
      <Card className="rounded-3xl p-8">
        Loading login protection settings...
      </Card>
    );
  }

  if (error) {
    return <Card className="rounded-3xl p-8 text-red-500">{error}</Card>;
  }

  if (!data) return null;

  const settings = data.authentication as Record<string, any>;

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
            <CardTitle className="text-2xl">Login Protection</CardTitle>

            <p className="mt-2 text-sm text-muted-foreground">
              Configure failed login attempts and account lockout policies.
            </p>
          </div>

          <Badge className="gap-1 bg-blue-500">
            <Shield className="h-4 w-4" />
            Active
          </Badge>
        </CardHeader>

        <CardContent className="space-y-5">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="flex items-center justify-between rounded-2xl border bg-background/60 p-5"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-primary/10 p-3">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>

              <div>
                <h4 className="font-semibold">Emergency Lockdown</h4>

                <p className="text-sm text-muted-foreground">
                  Immediately block all admin access when enabled.
                </p>
              </div>
            </div>

            <Switch
              disabled={saving}
              checked={Boolean(settings.lockdown)}
              onCheckedChange={(checked) =>
                updateSetting("lockdown", checked)
              }
            />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            className="flex items-center justify-between rounded-2xl border bg-background/60 p-5"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-primary/10 p-3">
                <Lock className="h-6 w-6 text-primary" />
              </div>

              <div>
                <h4 className="font-semibold">Login Notifications</h4>

                <p className="text-sm text-muted-foreground">
                  Send email alerts for new admin logins.
                </p>
              </div>
            </div>

            <Switch
              disabled={saving}
              checked={Boolean(settings.loginNotifications)}
              onCheckedChange={(checked) =>
                updateSetting("loginNotifications", checked)
              }
            />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            className="flex items-center justify-between rounded-2xl border bg-background/60 p-5"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-primary/10 p-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>

              <div>
                <h4 className="font-semibold">Remember Devices</h4>

                <p className="text-sm text-muted-foreground">
                  Allow trusted devices to skip 2FA verification.
                </p>
              </div>
            </div>

            <Switch
              disabled={saving}
              checked={Boolean(settings.rememberDevices)}
              onCheckedChange={(checked) =>
                updateSetting("rememberDevices", checked)
              }
            />
          </motion.div>

          <div className="rounded-2xl border bg-background/60 p-5">
            <div className="mb-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-primary" />

              <div>
                <h4 className="font-semibold">Max Failed Attempts</h4>

                <p className="text-sm text-muted-foreground">
                  Lock account after this many failed login attempts.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="20"
                value={settings.maxFailedAttempts || 5}
                onChange={(e) =>
                  updateSetting("maxFailedAttempts", Number(e.target.value))
                }
                disabled={saving}
                className="flex-1"
              />
              <span className="text-2xl font-bold">
                {settings.maxFailedAttempts || 5}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border bg-background/60 p-5">
            <div className="mb-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />

              <div>
                <h4 className="font-semibold">Account Lock Duration</h4>

                <p className="text-sm text-muted-foreground">
                  How long to lock account after failed attempts.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={settings.accountLockDuration || 30}
                onChange={(e) =>
                  updateSetting("accountLockDuration", Number(e.target.value))
                }
                disabled={saving}
                className="flex-1"
              />
              <span className="text-2xl font-bold">
                {settings.accountLockDuration || 30}m
              </span>
            </div>
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
