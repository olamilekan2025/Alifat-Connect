// "use client";

// import {
//   Suspense,
//   useEffect,
//   useState,
// } from "react";

// import {
//   useSearchParams,
//   useRouter,
// } from "next/navigation";

// import { toast } from "sonner";

// import Link from "next/link";

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

// import { Input } from "@/components/ui/input";

// import { Button } from "@/components/ui/button";
// import { signIn } from "next-auth/react";

// import {
//   Eye,
//   EyeOff,
//   MailCheck,
//   Loader2,
// } from "lucide-react";

// function VerifyLoginContent() {
//   const router = useRouter();

//   const searchParams =
//     useSearchParams();

//   const email =
//     searchParams.get("email") || "";

//   const [password, setPassword] =
//     useState("");

//   const [code, setCode] =
//     useState("");

//   const [loading, setLoading] =
//     useState(false);

//   const [
//     showPassword,
//     setShowPassword,
//   ] = useState(false);

//   useEffect(() => {
//     if (!email) {
//       toast.error("Missing email");

//       router.replace(
//         "/auth/login"
//       );
//     }
//   }, [email, router]);

//   async function onSubmit(
//     e: React.FormEvent
//   ) {
//     e.preventDefault();

//     if (!code.trim()) {
//       toast.error(
//         "Verification code is required"
//       );

//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await fetch(
//         "/api/auth/verify-login",
//         {
//           method: "POST",

//           headers: {
//             "Content-Type":
//               "application/json",
//           },

//           body: JSON.stringify({
//             email,
//             code,
//             password,
//           }),
//         }
//       );

//       const data = await res
//         .json()
//         .catch(() => ({}));

//       if (!res.ok) {
//         toast.error(
//           data?.error ||
//             "Verification failed"
//         );

//         return;
//       }

//     const loginResult =
//   await signIn(
//     "credentials",
//     {
//       email,
//       password,

//       adminVerified: true,

//       redirect: false,
//     }
//   );

// if (loginResult?.error) {
//   toast.error(
//     loginResult.error
//   );

//   return;
// }

// toast.success(
//   "Admin login successful"
// );

// router.push("/admin-dashboard");
//     } catch {
//       toast.error(
//         "Verification failed"
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 dark:bg-black">
//       {/* BACKGROUND OVERLAY */}
//       <div className="absolute inset-0 bg-black/70" />

//       {/* TOP SVG */}
//       <svg
//         className="absolute top-0 left-0 h-32 w-full lg:h-25"
//         xmlns="http://www.w3.org/2000/svg"
//         viewBox="0 0 1440 320"
//         preserveAspectRatio="none"
//       >
//         <defs>
//           <linearGradient
//             id="topGlow"
//             x1="0"
//             x2="1"
//           >
//             <stop
//               offset="0%"
//               stopColor="#D4AF37"
//               stopOpacity="0.95"
//             />

//             <stop
//               offset="35%"
//               stopColor="#D4AF37"
//               stopOpacity="0.82"
//             />

//             <stop
//               offset="100%"
//               stopColor="#D4AF37"
//               stopOpacity="0.45"
//             />
//           </linearGradient>
//         </defs>

//         <path
//           fill="url(#topGlow)"
//           d="
//             M0,160
//             C240,260 480,40 720,160
//             C960,260 1200,60 1440,160
//             L1440,0
//             L0,0
//             Z
//           "
//         />
//       </svg>

//       {/* BOTTOM SVG */}
//       <svg
//         className="absolute bottom-0 left-0 h-32 w-full lg:h-25"
//         xmlns="http://www.w3.org/2000/svg"
//         viewBox="0 0 1440 320"
//         preserveAspectRatio="none"
//       >
//         <defs>
//           <linearGradient
//             id="bottomGlow"
//             x1="1"
//             x2="0"
//           >
//             <stop
//               offset="0%"
//               stopColor="#D4AF37"
//               stopOpacity="0.92"
//             />

//             <stop
//               offset="35%"
//               stopColor="#D4AF37"
//               stopOpacity="0.78"
//             />

//             <stop
//               offset="100%"
//               stopColor="#D4AF37"
//               stopOpacity="0.40"
//             />
//           </linearGradient>
//         </defs>

//         <path
//           fill="url(#bottomGlow)"
//           d="
//             M0,160
//             C240,60 480,280 720,160
//             C960,40 1200,240 1440,160
//             L1440,320
//             L0,320
//             Z
//           "
//         />
//       </svg>

//       {/* CARD */}
//       <Card className="relative z-10 w-full max-w-md overflow-hidden rounded-[34px] border bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-3xl dark:border-white/10">
//         <CardHeader className="space-y-4 text-center">
//           <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-yellow-500/10">
//             <MailCheck className="h-8 w-8 text-yellow-400" />
//           </div>

//           <div className="space-y-2">
//             <CardTitle className="text-3xl font-black tracking-tight dark:text-white">
//               Verify Login
//             </CardTitle>

//             <CardDescription className="text-base leading-relaxed dark:text-zinc-300">
//               Enter the verification
//               code sent to
//               <span className="ml-1 font-semibold dark:text-yellow-400">
//                 {email}
//               </span>
//             </CardDescription>
//           </div>
//         </CardHeader>

//         <CardContent className="space-y-6 px-8 pb-8">
//           <form
//             onSubmit={onSubmit}
//             className="space-y-5"
//           >
//             {/* PASSWORD */}
//             <div className="space-y-2">
//               <label className="text-sm font-medium text-zinc-400 dark:text-zinc-300">
//                 Password
//               </label>

//               <div className="relative">
//                 <Input
//                   type={
//                     showPassword
//                       ? "text"
//                       : "password"
//                   }
//                   placeholder="Enter password"
//                   value={password}
//                   onChange={(e) =>
//                     setPassword(
//                       e.target.value
//                     )
//                   }
//                   className="h-14 rounded-2xl border bg-white/5 px-4 pr-12 text-white placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-yellow-500 dark:border-white/10"
//                   required
//                 />

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setShowPassword(
//                       (prev) =>
//                         !prev
//                     )
//                   }
//                   className="absolute top-1/2 right-4 -translate-y-1/2 text-zinc-400 transition hover:text-white"
//                 >
//                   {showPassword ? (
//                     <EyeOff size={18} />
//                   ) : (
//                     <Eye size={18} />
//                   )}
//                 </button>
//               </div>
//             </div>

//             {/* CODE */}
//             <div className="space-y-2">
//               <label className="text-sm font-medium text-zinc-400 dark:text-zinc-300">
//                 Verification Code
//               </label>

//               <Input
//                 placeholder="Enter 6-digit code"
//                 value={code}
//                 onChange={(e) =>
//                   setCode(
//                     e.target.value
//                   )
//                 }
//                 maxLength={6}
//                 className="h-14 rounded-2xl border bg-white/5 px-4 text-center text-xl font-bold tracking-[8px] text-white placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-yellow-500 dark:border-white/10"
//                 required
//               />
//             </div>

//             {/* BUTTON */}
//             <Button
//               type="submit"
//               disabled={
//                 loading || !email
//               }
//               className="h-14 w-full rounded-2xl bg-yellow-500 text-base font-bold text-black transition-all hover:bg-yellow-400 hover:shadow-lg hover:shadow-yellow-500/20"
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//                   Verifying...
//                 </>
//               ) : (
//                 "Verify Login"
//               )}
//             </Button>
//           </form>

//           {/* FOOTER */}
//           <div className="text-center text-sm text-zinc-400">
//             Wrong email?{" "}
//             <Link
//               href="/auth/login"
//               className="font-semibold text-yellow-400 hover:underline"
//             >
//               Go back
//             </Link>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// export default function VerifyLoginPage() {
//   return (
//     <Suspense fallback={null}>
//       <VerifyLoginContent />
//     </Suspense>
//   );
// }







"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { signIn } from "next-auth/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, MailCheck, Loader2, RefreshCw } from "lucide-react";

function VerifyLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Timer state for resending code cooldown (60 seconds)
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!email) {
      toast.error("Missing email");
      router.replace("/auth/login");
    }
  }, [email, router]);

  // Handle countdown tracking
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Triggered when pressing Resend Code
  async function handleResendCode() {
    if (!email || countdown > 0) return;

    setResending(true);
    try {
    const res = await fetch(
  "/api/auth/resend-login-code",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
    }),
  }
);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.error || "Failed to resend code");
        return;
      }

      toast.success("A fresh verification code has been dispatched!");
      setCountdown(60); // Restrict triggers for 60 seconds
    } catch {
      toast.error("Network error resending code");
    } finally {
      setResending(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!code.trim()) {
      toast.error("Verification code is required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data?.error || "Verification failed");
        return;
      }

      const loginResult = await signIn("credentials", {
        email,
        password,
        adminVerified: true,
        redirect: false,
      });

      if (loginResult?.error) {
        toast.error(loginResult.error);
        return;
      }

      toast.success("Admin login successful");
      router.push("/admin-dashboard");
    } catch {
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 dark:bg-black">
      {/* BACKGROUND OVERLAY */}
      <div className="absolute inset-0 bg-black/70" />

      {/* TOP SVG */}
      <svg
        className="absolute top-0 left-0 h-32 w-full lg:h-25"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="topGlow" x1="0" x2="1">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#D4AF37" stopOpacity="0.82" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.45" />
          </linearGradient>
        </defs>
        <path
          fill="url(#topGlow)"
          d="M0,160 C240,260 480,40 720,160 C960,260 1200,60 1440,160 L1440,0 L0,0 Z"
        />
      </svg>

      {/* BOTTOM SVG */}
      <svg
        className="absolute bottom-0 left-0 h-32 w-full lg:h-25"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="bottomGlow" x1="1" x2="0">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.92" />
            <stop offset="35%" stopColor="#D4AF37" stopOpacity="0.78" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.40" />
          </linearGradient>
        </defs>
        <path
          fill="url(#bottomGlow)"
          d="M0,160 C240,60 480,280 720,160 C960,40 1200,240 1440,160 L1440,320 L0,320 Z"
        />
      </svg>

      {/* CARD */}
      <Card className="relative z-10 w-full max-w-md overflow-hidden rounded-[34px] border bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-3xl dark:border-white/10">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-yellow-500/10">
            <MailCheck className="h-8 w-8 text-yellow-400" />
          </div>

          <div className="space-y-2">
            <CardTitle className="text-3xl font-black tracking-tight dark:text-white">
              Verify Login
            </CardTitle>

            <CardDescription className="text-base leading-relaxed dark:text-zinc-300">
              Enter the verification code sent to
              <span className="ml-1 font-semibold dark:text-yellow-400">
                {email}
              </span>
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pb-8">
          <form onSubmit={onSubmit} className="space-y-5">
            {/* PASSWORD */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 dark:text-zinc-300">
                Password
              </label>

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 rounded-2xl border bg-white/5 px-4 pr-12 text-white placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-yellow-500 dark:border-white/10"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-zinc-400 transition hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* CODE */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-400 dark:text-zinc-300">
                  Verification Code
                </label>
                
                {/* Resend Actions Link */}
                <button
                  type="button"
                  disabled={resending || countdown > 0}
                  onClick={handleResendCode}
                  className="text-xs font-semibold text-yellow-400 hover:underline disabled:text-zinc-500 disabled:no-underline flex items-center gap-1"
                >
                  {resending && <RefreshCw className="h-3 w-3 animate-spin" />}
                  {countdown > 0 ? `Resend in ${countdown}s` : "Resend code?"}
                </button>
              </div>

              <Input
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                className="h-14 rounded-2xl border bg-white/5 px-4 text-center text-xl font-bold tracking-[8px] text-white placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-yellow-500 dark:border-white/10"
                required
              />
            </div>

            {/* BUTTON */}
            <Button
              type="submit"
              disabled={loading || !email}
              className="h-14 w-full rounded-2xl bg-yellow-500 text-base font-bold text-black transition-all hover:bg-yellow-400 hover:shadow-lg hover:shadow-yellow-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Login"
              )}
            </Button>
          </form>

          {/* FOOTER */}
          <div className="text-center text-sm text-zinc-400">
            Wrong email?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-yellow-400 hover:underline"
            >
              Go back
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyLoginPage() {
  return (
    <Suspense fallback={null}>
      <VerifyLoginContent />
    </Suspense>
  );
}