"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Loader2, Shield } from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VerifyResetPinPage() {
  const router = useRouter();

  const [token, setToken] =
    useState("");

  const [newPin, setNewPin] =
    useState("");

  const [confirmPin, setConfirmPin] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleVerify() {
    try {
      if (
        !token ||
        !newPin ||
        !confirmPin
      ) {
        toast.error(
          "Fill all fields",
        );

        return;
      }

      if (
        newPin.length !== 4
      ) {
        toast.error(
          "PIN must be 4 digits",
        );

        return;
      }

      if (
        newPin !== confirmPin
      ) {
        toast.error(
          "PIN does not match",
        );

        return;
      }

      setLoading(true);

      const response =
        await fetch(
          "/api/settings/verify-reset-pin",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              token,
              newPin,
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        toast.error(
          data.message ||
            "Verification failed",
        );

        return;
      }

      toast.success(
        "Payment PIN reset successful",
      );

      router.push(
        "/dashboard/settings",
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-3xl">
        <CardHeader>
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900">
            <Shield className="h-6 w-6" />
          </div>

          <CardTitle>
            Verify Payment PIN Reset
          </CardTitle>

          <CardDescription>
            Enter the verification token
            sent to your email and create
            a new payment PIN.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Verification Token
            </label>

            <Input
              placeholder="Enter token"
              value={token}
              onChange={(e) =>
                setToken(
                  e.target.value,
                )
              }
              className="h-12 rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              New PIN
            </label>

            <Input
              type="password"
              maxLength={4}
              placeholder="****"
              value={newPin}
              onChange={(e) =>
                setNewPin(
                  e.target.value.replace(
                    /\D/g,
                    "",
                  ),
                )
              }
              className="h-12 rounded-2xl text-center tracking-[8px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Confirm PIN
            </label>

            <Input
              type="password"
              maxLength={4}
              placeholder="****"
              value={confirmPin}
              onChange={(e) =>
                setConfirmPin(
                  e.target.value.replace(
                    /\D/g,
                    "",
                  ),
                )
              }
              className="h-12 rounded-2xl text-center tracking-[8px]"
            />
          </div>

          <Button
            onClick={handleVerify}
            disabled={loading}
            className="h-12 w-full rounded-2xl"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify & Reset PIN"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}