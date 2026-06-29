"use client";

import { useEffect, useState } from "react";

import {
  ShieldCheck,
  Lock,
  Smartphone,
  Activity,
  AlertTriangle,
  FileText,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SecurityScore } from "../../admin-dashboard/security/security-score";
import { AuthenticationSettings } from "../../admin-dashboard/security/authentication-settings";

export default function SecurityPage() {
    const [security, setSecurity] = useState<any>(null);

    useEffect(() => {
        fetch("/api/admin/security/overview")
            .then((r) => r.json())
            .then(setSecurity);
    }, []);

  const cards = [
  {
    title: "Security Score",
    value:
      security?.overview?.securityScore != null
        ? `${security.overview.securityScore}%`
        : "--",
    subtitle: "Overall Protection",
    icon: ShieldCheck,
    color: "text-green-500",
  },
  {
    title: "Authentication",
    value:
      security?.overview?.authentication ??
      "--",
    subtitle: "Admin Verification",
    icon: Lock,
    color: "text-blue-500",
  },
  {
    title: "Active Devices",
    value:
      security?.overview?.activeDevices ??
      0,
    subtitle: "Trusted Sessions",
    icon: Smartphone,
    color: "text-purple-500",
  },
  {
    title: "Security Alerts",
    value:
      security?.overview?.alerts ??
      0,
    subtitle: "Require Attention",
    icon: AlertTriangle,
    color: "text-orange-500",
  },
];

  return (
  <>
    <div className=" bg-white dark:bg-black  ">
      <div className="mx-auto max-w-7xl space-y-8 px-4 md:px-2 py-10">
        {/* Header */}

       <div className="rounded-3xl bg-gradient-to-br from-[#B8860B] via-[#FFD700] to-[#C99700] p-3 md:p-8 text-white shadow-2xl ring-1 ring-yellow-300/30">
          <h1 className="text-4xl font-bold">
            Security Center
          </h1>

          <p className="mt-3 max-w-2xl text-blue-100">
            Protect your VTU platform, monitor administrator activity,
            manage authentication, and respond to security threats
            from one central dashboard.
          </p>
        </div>

        {/* Overview */}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <Card
                key={card.title}
                className="rounded-2xl border-0 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm text-slate-500">
                    {card.title}
                  </CardTitle>

                  <Icon className={`h-6 w-6 ${card.color}`} />
                </CardHeader>

                <CardContent>
                  <h2 className="text-3xl font-bold">
                    {card.value}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    {card.subtitle}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Sections */}

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
            </CardHeader>

            <CardContent>
              Authentication settings will go here.
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle>Login Protection</CardTitle>
            </CardHeader>

            <CardContent>
              Login protection settings will go here.
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle>Password Policy</CardTitle>
            </CardHeader>

            <CardContent>
              Password policy configuration.
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
            </CardHeader>

            <CardContent>
              Recent administrator activities.
            </CardContent>
          </Card>
        </div>
         <SecurityScore />

      <AuthenticationSettings />
      </div>
         
    </div>

      </>
  );
}