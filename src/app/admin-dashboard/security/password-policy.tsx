"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Key,
  CheckCircle2,
  XCircle,
  Save,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSecurity } from "../../../../hooks/use-security";

export function PasswordPolicy() {
  const { data, loading, error, refresh } = useSecurity();
  const [saving, setSaving] = useState(false);

  if (loading) {
    return (
      <Card className="rounded-3xl p-8">
        Loading password policy settings...
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
    value: number,
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

  const passwordPolicy = settings.passwordPolicy || 95;
  const apiSecurity = settings.apiSecurity || 95;

  const getPolicyStatus = (score: number) => {
    if (score >= 90) return { text: "Strong", color: "bg-green-500" };
    if (score >= 75) return { text: "Good", color: "bg-blue-500" };
    return { text: "Weak", color: "bg-orange-500" };
  };

  const passwordStatus = getPolicyStatus(passwordPolicy);
  const apiStatus = getPolicyStatus(apiSecurity);

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="rounded-3xl border bg-white shadow-2xl backdrop-blur-xl dark:border-white/20 dark:bg-black">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Password Policy</CardTitle>

            <p className="mt-2 text-sm text-muted-foreground">
              Configure password strength requirements and API security.
            </p>
          </div>

          <Badge className="gap-1 bg-purple-500">
            <Key className="h-4 w-4" />
            Configured
          </Badge>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="rounded-2xl border bg-background/60 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-semibold">Password Strength Score</h4>
                  <p className="text-sm text-muted-foreground">
                    Minimum required password complexity
                  </p>
                </div>
              </div>
              <Badge className={passwordStatus.color}>{passwordStatus.text}</Badge>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={passwordPolicy}
                onChange={(e) =>
                  updateSetting("passwordPolicy", Number(e.target.value))
                }
                disabled={saving}
                className="flex-1"
              />
              <span className="text-2xl font-bold">{passwordPolicy}%</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                {passwordPolicy >= 80 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span>Min 8 characters</span>
              </div>
              <div className="flex items-center gap-2">
                {passwordPolicy >= 70 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span>Uppercase & lowercase</span>
              </div>
              <div className="flex items-center gap-2">
                {passwordPolicy >= 85 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span>Numbers required</span>
              </div>
              <div className="flex items-center gap-2">
                {passwordPolicy >= 90 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span>Special characters</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-background/60 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-semibold">API Security Score</h4>
                  <p className="text-sm text-muted-foreground">
                    API endpoint protection level
                  </p>
                </div>
              </div>
              <Badge className={apiStatus.color}>{apiStatus.text}</Badge>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={apiSecurity}
                onChange={(e) =>
                  updateSetting("apiSecurity", Number(e.target.value))
                }
                disabled={saving}
                className="flex-1"
              />
              <span className="text-2xl font-bold">{apiSecurity}%</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                {apiSecurity >= 80 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span>Rate limiting</span>
              </div>
              <div className="flex items-center gap-2">
                {apiSecurity >= 70 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span>IP whitelisting</span>
              </div>
              <div className="flex items-center gap-2">
                {apiSecurity >= 85 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span>Request signing</span>
              </div>
              <div className="flex items-center gap-2">
                {apiSecurity >= 90 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span>Encrypted payloads</span>
              </div>
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
