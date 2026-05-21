"use client";

import Link from "next/link";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { signIn } from "next-auth/react";

import { toast } from "sonner";

import {
  Eye,
  EyeOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";

import { Checkbox } from "@/components/ui/checkbox";

import GoogleIcon from "@/components/icons/google-icon";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [acceptedTerms, setAcceptedTerms] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [googleLoading, setGoogleLoading] =
    useState(false);

  async function onSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!email || !password) {
      toast.error(
        "Email and password are required"
      );

      return;
    }

    if (!acceptedTerms) {
      toast.error(
        "Please accept Terms & Privacy Policy"
      );

      return;
    }

    setLoading(true);

    try {
      const result = await signIn(
        "credentials",
        {
          email: email
            .trim()
            .toLowerCase(),

          password,

          redirect: false,
        }
      );

      if (!result) {
        toast.error(
          "Unable to login"
        );

        return;
      }

      if (result.error) {
        toast.error(
          "Invalid email or password"
        );

        return;
      }

      toast.success(
        "Login successful"
      );

      // IMPORTANT
      router.refresh();

      // SHORT DELAY TO ALLOW SESSION UPDATE
      setTimeout(async () => {
        try {
          const sessionRes = await fetch(
            "/api/auth/session",
            {
              cache: "no-store",
            }
          );

          const session =
            await sessionRes.json();

          const role =
            session?.user?.role;

          if (role === "Admin") {
            router.replace("/admin");
          } else if (
            role === "Moderator"
          ) {
            router.replace(
              "/moderator"
            );
          } else {
            router.replace(
              "/dashboard"
            );
          }

          router.refresh();
        } catch {
          router.replace(
            "/dashboard"
          );
        }
      }, 500);
    } catch (error) {
      console.error(error);

      toast.error(
        "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    if (!acceptedTerms) {
      toast.error(
        "Accept Terms & Privacy Policy first"
      );

      return;
    }

    try {
      setGoogleLoading(true);

      await signIn("google", {
        callbackUrl: "/dashboard",
      });
    } catch (error) {
      toast.error(
        "Google login failed"
      );
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white dark:bg-black px-4 py-10  ">
      {/* TOP GLOW */}
      <svg
        className="absolute left-0 top-0 h-25 w-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="topGlow"
            x1="0"
            x2="1"
          >
            <stop
              offset="0%"
              stopColor="#D4AF37"
              stopOpacity="0.95"
            />

            <stop
              offset="100%"
              stopColor="#D4AF37"
              stopOpacity="0.35"
            />
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

      {/* BOTTOM GLOW */}
      <svg
        className="absolute bottom-0 left-0 h-25 w-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="bottomGlow"
            x1="1"
            x2="0"
          >
            <stop
              offset="0%"
              stopColor="#D4AF37"
              stopOpacity="0.92"
            />

            <stop
              offset="100%"
              stopColor="#D4AF37"
              stopOpacity="0.35"
            />
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

      {/* CARD */}
      <Card className="relative z-10 w-full max-w-md rounded-3xl border border-black/10 dark:border-white/10 bg-white/10   backdrop-blur-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-black dark:text-white">
            Welcome Back
          </CardTitle>

          <CardDescription className="text-zinc-500 dark:text-zinc-400">
            Login to continue to your
            dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={onSubmit}
            className="space-y-5"
          >
            {/* EMAIL */}
            <div className="space-y-1">
              <label className="text-sm text-zinc-400 dark:text-zinc-500">
                Email
              </label>

              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                className="h-10 rounded-2xl border-black dark:border-white/10  bg-white/5 dark:text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-yellow-500"
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <label className="text-sm text-zinc-400 dark:text-zinc-500">
                Password
              </label>

              <div className="relative">
                <Input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  className="h-10 rounded-2xl  border-black dark:border-white/10  bg-white/5 pr-12 dark:text-white placeholder:text-black dark:placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-yellow-500"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) =>
                        !prev
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff
                      size={18}
                    />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* FORGOT PASSWORD */}
            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-yellow-400 transition hover:text-yellow-300"
              >
                Forgot password?
              </Link>
            </div>

            {/* TERMS */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={
                  acceptedTerms
                }
                onCheckedChange={(
                  val
                ) =>
                  setAcceptedTerms(
                    !!val
                  )
                }
              />

              <label
                htmlFor="terms"
                className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-300"
              >
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-yellow-400 hover:underline"
                >
                  Terms
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-yellow-400 hover:underline"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* LOGIN BUTTON */}
            <Button
              type="submit"
              disabled={
                loading ||
                !acceptedTerms
              }
              className="h-10 w-full rounded-2xl bg-yellow-500 font-semibold text-black transition hover:bg-yellow-400"
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </Button>
          </form>

          {/* DIVIDER */}
          <div className="flex items-center gap-3 p-4">
            <Separator className="flex-1  border dark:border-gray-500" />
            <span className="text-xs text-muted-foreground dark:bg-white px-2 font-medium dark:text-black">
              OR CONTINUE WITH
            </span>
            <Separator className="flex-1 border dark:border-gray-500" />
          </div>

          {/* GOOGLE */}
          <Button
            type="button"
            variant="outline"
            onClick={
              handleGoogleLogin
            }
            disabled={
              googleLoading ||
              !acceptedTerms
            }
            className="h-10 w-full rounded-2xl border-black dark:border-white/10 bg-white/5 dark:text-white transition hover:bg-white/10"
          >
            <GoogleIcon />

            <span className="ml-2">
              {googleLoading
                ? "Loading..."
                : "Continue with Google"}
            </span>
          </Button>

          {/* FOOTER */}
          <div className="mt-6 text-center text-sm text-zinc-400">
            Don’t have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-yellow-400 hover:underline"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}