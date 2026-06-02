"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from "sonner";

export default function EducationBillPage() {
  const [provider, setProvider] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [profileId, setProfileId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !profileId) {
      toast.error("Validation Error", {
        description: "Please fill in all required fields before proceeding."
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/education/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, profileId, quantity }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to process token request.");
      }

      toast.success("Transaction Successful", {
        description: `Generated ${quantity} pin(s). ID: ${data.data.transactionId}`,
        action: {
          label: "View Pins",
          onClick: () => console.log(data.data.items),
        },
      });
      
      setProfileId("");
    } catch (err: any) {
      toast.error("Transaction Failed", {
        description: err.message || "Connection timeout. Please check your balance.",
      });
    } finally {
      setIsLoading(false);
    }


    
  };

  return (
  <main className="w-full px-1 pt-6 md:px-6 lg:px-8">
    <div className="mx-auto w-full max-w-3xl">
      <Card className="overflow-hidden rounded-3xl border-border bg-card/80 shadow-xl backdrop-blur-xl">
        <CardHeader className="space-y-4 px-5 py-6 text-center sm:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <GraduationCap className="h-7 w-7" />
          </div>

          <div>
            <CardTitle className="text-2xl font-bold sm:text-3xl">
              Education Bills
            </CardTitle>

            <CardDescription className="mt-2 text-sm sm:text-base">
              Purchase exam result checkers and registration tokens instantly.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-5 pb-6 sm:px-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* EXAM TYPE */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Select Examination
              </label>

              <Select
                value={provider}
                onValueChange={setProvider}
              >
                <SelectTrigger className="h-12 w-full">
                  <SelectValue placeholder="Choose exam provider" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="waec">
                    WAEC Result Scratch Card
                  </SelectItem>

                  <SelectItem value="neco">
                    NECO Token
                  </SelectItem>

                  <SelectItem value="jamb">
                    JAMB UTME / DE Form
                  </SelectItem>

                  <SelectItem value="nabteb">
                    NABTEB Card
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* PROFILE */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {provider === "jamb"
                  ? "JAMB Profile Code"
                  : "Candidate Phone Number"}
              </label>

              <Input
                type="text"
                value={profileId}
                disabled={isLoading}
                placeholder={
                  provider === "jamb"
                    ? "e.g. 5501234567"
                    : "e.g. 08123456789"
                }
                onChange={(e) =>
                  setProfileId(e.target.value)
                }
                className="h-12"
              />
            </div>

            {/* QUANTITY */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quantity
              </label>

              <Select
                value={quantity}
                onValueChange={setQuantity}
              >
                <SelectTrigger className="h-12 w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {["1", "2", "3", "4", "5"].map(
                    (num) => (
                      <SelectItem
                        key={num}
                        value={num}
                      >
                        {num}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* SUMMARY */}
            {provider && (
              <div className="rounded-2xl border border-border bg-muted/50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Payable
                  </span>

                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    ₦
                    {provider === "waec"
                      ? 3500 * Number(quantity)
                      : provider === "neco"
                        ? 1200 *
                          Number(quantity)
                        : provider ===
                            "nabteb"
                          ? 3000 *
                            Number(quantity)
                          : 4700 *
                            Number(quantity)}
                  </span>
                </div>
              </div>
            )}

            {/* BUTTON */}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full rounded-2xl bg-[#D4AF37] text-white hover:bg-white hover:text-[black] border-2 border-[#D4AF37] hover:border-[#D4AF37] transition-colors duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Generate Token"
              )}
            </Button>

            {/* FOOTER */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-center text-xs font-medium text-emerald-600 dark:text-emerald-500">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                Pins are sent instantly via SMS & Email
              </span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  </main>
);
  
}