"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";

import "react-circular-progressbar/dist/styles.css";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSecurity } from "../../../../hooks/use-security";

export function SecurityScore() {
  const { data, loading, error } = useSecurity();

  if (loading) {
    return (
      <Card className="rounded-3xl p-8 flex justify-center items-center">
        Loading security score...
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="rounded-3xl p-8 text-red-500">
        {error}
      </Card>
    );
  }

  const score = data?.overview?.securityScore ?? 0;

  const alerts = data?.overview?.alerts ?? 0;

  const loginHealth = Math.max(0, 100 - alerts * 2);

  const authentication = data?.authentication as any;

  const passwordPolicy = authentication?.passwordPolicy ?? 95;

  const apiSecurity = authentication?.apiSecurity ?? 95;

  const twoFA = authentication?.twoFA ?? false;

  const status =
    score >= 90
      ? "Excellent"
      : score >= 75
      ? "Good"
      : "Needs Attention";

  const badgeColor =
    score >= 90
      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
      : score >= 75
      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
      : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden  rounded-3xl mb-10 border border-white/30 bg-white shadow-2xl backdrop-blur-xl dark:border-white/20 dark:bg-black">
        <div className="grid gap-8 p-7 lg:grid-cols-[220px_1fr]">

          {/* Left */}

          <div className="flex flex-col items-center justify-center">

            <div className="h-44 w-44">
              <CircularProgressbar
                value={score}
                text={`${score}%`}
                strokeWidth={10}
                styles={buildStyles({
                  textSize: "18px",
                  pathColor:
                    score >= 90
                      ? "#22c55e"
                      : score >= 75
                      ? "#3b82f6"
                      : "#f97316",
                  trailColor: "#E5E7EB",
                  textColor:
                    score >= 90
                      ? "#16A34A"
                      : score >= 75
                      ? "#2563EB"
                      : "#EA580C",
                })}
              />
            </div>

            <Badge className={`mt-6 ${badgeColor}`}>
              {status}
            </Badge>

          </div>

          {/* Right */}

          <div className="space-y-6">

            <div>
              <h2 className="text-2xl font-bold">
                Security Score
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Overall platform protection based on
                authentication, password policy,
                API security and administrator activity.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">

              <div className="rounded-2xl bg-green-50 border dark:border-white/20 p-4 dark:bg-green-950/30">
                <ShieldCheck className="mb-2 h-8 w-8 text-green-600" />

                <h4 className="font-semibold">
                  Authentication
                </h4>

                <p className="text-sm text-muted-foreground">
                  {twoFA ? "Enabled" : "Disabled"}
                </p>
              </div>

              <div className="rounded-2xl bg-blue-50 border dark:border-white/20 p-4 dark:bg-blue-950/30">
                <TrendingUp className="mb-2 h-8 w-8 text-blue-600" />

                <h4 className="font-semibold">
                  Login Health
                </h4>

                <p className="text-sm text-muted-foreground">
                  {loginHealth}% Safe
                </p>
              </div>

              <div className="rounded-2xl bg-orange-50 border dark:border-white/20 p-4 dark:bg-orange-950/30">
                <ShieldAlert className="mb-2 h-8 w-8 text-orange-600" />

                <h4 className="font-semibold">
                  Risk Alerts
                </h4>

                <p className="text-sm text-muted-foreground">
                  {alerts} Pending
                </p>
              </div>

            </div>

            <div className="space-y-5">

              {/* 2FA */}

              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span>Two-Factor Authentication</span>
                  <span className="font-semibold text-green-600">
                    {twoFA ? "100%" : "0%"}
                  </span>
                </div>

                <div className="h-2 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-green-500 transition-all"
                    style={{
                      width: twoFA ? "100%" : "0%",
                    }}
                  />
                </div>
              </div>

              {/* Password */}

              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span>Password Policy</span>

                  <span className="font-semibold text-blue-600">
                    {passwordPolicy}%
                  </span>
                </div>

                <div className="h-2 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-blue-500 transition-all"
                    style={{
                      width: `${passwordPolicy}%`,
                    }}
                  />
                </div>
              </div>

              {/* API */}

              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span>API Security</span>

                  <span className="font-semibold text-orange-500">
                    {apiSecurity}%
                  </span>
                </div>

                <div className="h-2 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-orange-500 transition-all"
                    style={{
                      width: `${apiSecurity}%`,
                    }}
                  />
                </div>
              </div>

            </div>

          </div>

        </div>
      </Card>
    </motion.div>
  );
}