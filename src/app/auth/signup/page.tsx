"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import GoogleIcon from "@/components/icons/google-icon";
import { Eye, EyeOff } from "lucide-react";

/* ✅ Nigeria phone formatter */
function formatNigeriaPhone(value: string) {
  let v = value.replace(/\D/g, "");

  if (v.startsWith("0")) {
    v = "234" + v.slice(1);
  }

  if (v.startsWith("234")) {
    return "+" + v.slice(0, 13);
  }

  return value;
}

export default function SignupPage() {
  const router = useRouter();

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname: firstname.trim(),
          lastname: lastname.trim(),
          address: address.trim(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          password,
          role: "User",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data?.error || "Signup failed");
        return;
      }

      toast.success(
        "Signup successful. Check your email for verification code.",
      );

      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    } catch {
      toast.error("Signup failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    try {
      setGoogleLoading(true);

      await signIn("google", {
        callbackUrl: "/",
      });
    } catch {
      toast.error("Google signup failed");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* TOP SVG */}
      {/* TOP SVG */}
      <svg
        className="absolute top-0 left-0 h-25 w-full  lg:h-30"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="topGlow" x1="0" x2="1">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#D4AF37" stopOpacity="0.88" />
            <stop offset="70%" stopColor="#D4AF37" stopOpacity="0.78" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.60" />
          </linearGradient>
        </defs>

        <path
          fill="url(#topGlow)"
          d="
      M0,160
      C240,260 480,40 720,160
      C960,260 1200,60 1440,160
      L1440,0
      L0,0
      Z
    "
        />
      </svg>

      {/* BOTTOM SVG */}
      <svg
        className="absolute bottom-0 left-0 h-25 w-full lg:h-30 "
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="bottomGlow" x1="1" x2="0">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.92" />
            <stop offset="35%" stopColor="#D4AF37" stopOpacity="0.84" />
            <stop offset="70%" stopColor="#D4AF37" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.50" />
          </linearGradient>
        </defs>

        <path
          fill="url(#bottomGlow)"
          d="
      M0,160
      C240,60 480,280 720,160
      C960,40 1200,240 1440,160
      L1440,320
      L0,320
      Z
    "
        />
      </svg>
      <Card className="w-full max-w-md border dark:border-white">
        <CardHeader className="text-center space-y-2 dark:text-white px-6 pt-10 ">
          <CardTitle className="text-2xl">Create Account</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* FORM */}
          <form onSubmit={onSubmit} className="space-y-3">
            {/* ROW 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                placeholder="First name"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                required
              />

              <Input
                placeholder="Last name"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                required
              />
            </div>

            {/* ROW 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />

              <Input
                placeholder="Phone number (+234...)"
                value={phone}
                onChange={(e) => setPhone(formatNigeriaPhone(e.target.value))}
                required
              />
            </div>

            {/* ROW 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  minLength={6}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              className="w-full mt-2 h-12 rounded-2xl bg-yellow-500 hover:bg-yellow-600 text-white font-semibold disabled:bg-yellow-300 disabled:text-gray-500"
              disabled={
                loading ||
                !firstname ||
                !lastname ||
                !address ||
                !phone ||
                !email ||
                !password
              }
            >
              {loading ? "Creating..." : "Create account"}
            </Button>
          </form>

          {/* DIVIDER */}
          <div className="flex items-center gap-3">
            <Separator className="flex-1  border dark:border-gray-500" />
            <span className="text-xs text-muted-foreground dark:bg-white px-2 font-medium dark:text-black">
              OR CONTINUE WITH
            </span>
            <Separator className="flex-1 border dark:border-gray-500" />
          </div>

          {/* GOOGLE SIGNUP */}
          <Button
            variant="outline"
            className="w-full flex items-center gap-2 dark:border-white dark:text-white"
            onClick={handleGoogleSignup}
            disabled={googleLoading}
          >
            <GoogleIcon />
            {googleLoading ? "Signing up..." : "Continue with Google"}
          </Button>

          {/* LOGIN LINK */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="/auth/login" className="text-primary hover:underline">
              Login
            </a>
          </p>

          {/* TERMS (TEXT ONLY) */}
          <p className="text-center text-xs text-muted-foreground">
            By creating an account, you agree to our{" "}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
