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
    <main className="flex min-h-screen w-full items-center justify-center bg-background text-foreground px-4 pt-20 transition-colors duration-300">


      <Card className="w-full max-w-md border-border bg-card/70 dark:bg-card/40 backdrop-blur-xl rounded-2xl shadow-xl z-10">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
            <GraduationCap className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Education Bills</CardTitle>
          <CardDescription className="text-muted-foreground">
            Purchase exam result checkers and registration tokens instantly.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Service Provider Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Examination</label>
              <Select onValueChange={(value) => setProvider(value)}>
                <SelectTrigger className="w-full bg-background border-input h-11 text-foreground focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Choose exam provider" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
                  <SelectItem value="waec">WAEC Result Scratch Card</SelectItem>
                  <SelectItem value="neco">NECO Token</SelectItem>
                  <SelectItem value="jamb">JAMB UTME / DE Form</SelectItem>
                  <SelectItem value="nabteb">NABTEB Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dynamic Field conditional on Provider */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {provider === "jamb" ? "JAMB Profile Code" : "Candidate Phone Number"}
              </label>
              <Input 
                type="text" 
                placeholder={provider === "jamb" ? "e.g. 5501234567" : "e.g. 08123456789"}
                value={profileId}
                onChange={(e) => setProfileId(e.target.value)}
                className="bg-background border-input h-11 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            {/* Quantity Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quantity</label>
              <Select defaultValue="1" onValueChange={(value) => setQuantity(value)}>
                <SelectTrigger className="w-full bg-background border-input h-11 text-foreground focus:ring-2 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
                  {["1", "2", "3", "4", "5"].map((num) => (
                    <SelectItem key={num} value={num}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Order Summary Pricing Simulation */}
            {provider && (
              <div className="rounded-xl bg-muted/50 p-3 border border-border flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Payable:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-base">
                  ₦{provider === "waec" ? 3500 * Number(quantity) : provider === "neco" ? 1200 * Number(quantity) : provider === "nabteb" ? 3000 * Number(quantity) : 4700 * Number(quantity)}
                </span>
              </div>
            )}

            {/* Action Button */}
            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 dark:disabled:bg-blue-800 font-bold text-white transition-all rounded-xl mt-2 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Generate Token"
              )}
            </Button>

            {/* Instant Delivery Tag */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-500 font-medium pt-1">
              <CheckCircle2 className="w-4 h-4" />
              Pins are sent instantly via SMS & Email
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}