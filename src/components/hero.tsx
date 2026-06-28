// "use client";

// import Link from "next/link";
// import { ArrowRight } from "lucide-react";

// export default function Hero() {
//   return (
// <section className="relative flex md:min-h-screen   py-10 overflow-hidden bg-white px-4 dark:bg-black md:px-6 md:px-8 md:py-20 ">
//       {/* SVG Background */}
//       <div className="pointer-events-none absolute inset-0">
//         <svg
//           className="absolute left-0 top-0 h-full w-full"
//           viewBox="0 0 1440 800"
//           fill="none"
//           xmlns="http://www.w3.org/2000/svg"
//         >
//           {/* Blue Blur */}
//           <circle
//             cx="250"
//             cy="150"
//             r="220"
//             fill="#2563EB"
//             fillOpacity="0.12"
//           />

//           {/* Green Blur */}
//           <circle
//             cx="1200"
//             cy="600"
//             r="260"
//             fill="#10B981"
//             fillOpacity="0.12"
//           />

//           {/* Lines */}
//           <path
//             d="M0 200C250 350 450 50 700 200C950 350 1150 150 1440 300"
//             stroke="#2563EB"
//             strokeOpacity="0.1"
//             strokeWidth="3"
//           />

//           <path
//             d="M0 500C250 650 450 350 700 500C950 650 1150 450 1440 600"
//             stroke="#10B981"
//             strokeOpacity="0.1"
//             strokeWidth="3"
//           />
//         </svg>
//       </div>

//       {/* Content */}
//       <div className="relative mx-auto max-w-7xl px-4 py-15 md:px-6 lg:px-8">
//         <div className="mx-auto max-w-3xl text-center">
//           {/* Badge */}
//           <div className="mb-6 inline-flex items-center rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-4 py-2 text-sm font-medium text-[#B8860B]">
//             Fast & Secure VTU Platform
//           </div>

//           {/* Heading */}
//           <h1 className="text-3xl font-extrabold leading-tight text-gray-900 md:text-9x1 dark:text-white md:text-7xl md:justify-center md:items-center md:flex md:flex-col">
//             Buy Data, <span className="text-[#D4AF37]"> Airtime </span>
//             & Pay Bills Instantly
           
//           </h1>

//           {/* Description */}
//           <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
//             Simple, fast, and reliable digital payment services for everyone.
//           </p>

//           {/* Buttons */}
//           <div className="mt-8 flex items-center justify-center gap-4 sm:flex-row">
//             <Link
//               href="/auth/signup"
//               className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-5 py-2 text-xs font-semibold text-black transition hover:bg-black hover:text-white md:hover:bg-[#D4AF37] md:hover:text-black md:px-6 md:py-3 md:text-sm"
//             >
//               Get Started
//               <ArrowRight className="h-5 w-5" />
//             </Link>

//             <Link
//               href="/price"
//               className="inline-flex items-center text-xs gap-2 rounded-full border border-gray-300 bg-black px-5 py-3 font-semibold text-white transition hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black dark:border-slate-700 dark:bg-white dark:text-black md:hover:border-[#D4AF37] md:hover:bg-[#D4AF37] md:hover:text-black md:px-6 md:py-3 md:text-sm "
//             >
//               View Pricing
//             </Link>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }



// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { ArrowRight, Wifi, Phone, Zap, Tv } from "lucide-react";

// export default function Hero() {
//   const [activeTab, setActiveTab] = useState("data");

//   const services = [
//     { id: "data", label: "Buy Data", icon: Wifi, color: "text-blue-500" },
//     { id: "airtime", label: "Airtime", icon: Phone, color: "text-green-500" },
//     { id: "electricity", label: "Electricity", icon: Zap, color: "text-amber-500" },
//     { id: "cable", label: "Cable TV", icon: Tv, color: "text-purple-500" },
//   ];

//   return (
//     <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-slate-50 px-4 py-16 dark:bg-zinc-950 md:px-8 md:py-28">
      
//       {/* PREMIUM BACKGROUND ARCHITECTURE */}
//       <div className="pointer-events-none absolute inset-0 z-0">
//         {/* Subtle Fine Mesh Grid Pattern */}
//         <svg
//           className="absolute inset-0 h-full w-full opacity-[0.15] dark:opacity-[0.07]"
//           width="100%"
//           height="100%"
//           xmlns="http://www.w3.org/2000/svg"
//         >
//           <defs>
//             <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
//               <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-900 dark:text-white" />
//             </pattern>
//           </defs>
//           <rect width="100%" height="100%" fill="url(#grid)" />
//         </svg>

//         {/* Ambient Premium Blurs */}
//         <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-blue-600/20 to-amber-400/10 blur-[120px] dark:from-blue-900/30 dark:to-amber-500/5" />
//         <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-gradient-to-br from-emerald-600/15 to-blue-500/10 blur-[140px] dark:from-emerald-900/20 dark:to-zinc-900/10" />
//       </div>

//       {/* MAIN CONTENT CONTAINER */}
//       <div className="relative z-10 mx-auto max-w-5xl text-center">
        
//         {/* Modern Animated Glow Badge */}
//         <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 text-xs font-semibold tracking-wide text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-400 backdrop-blur-md">
//           <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
//           Fast & Secure VTU Platform
//         </div>

//         {/* Premium Typography with Gradients */}
//         <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl dark:text-white">
//           Buy Data, <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-transparent dark:from-amber-400 dark:to-yellow-300">Airtime</span> <br className="hidden md:inline"/>
//           & Pay Bills Instantly
//         </h1>

//         {/* Tailored Subtitle Description */}
//         <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-zinc-400 md:text-xl">
//           Experience ultra-fast automated dispatching. Top up your mobile subscriptions, manage utility payments, and keep things running without a hitch.
//         </p>

//         {/* Primary Call to Actions */}
//         <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
//           <Link
//             href="/auth/signup"
//             className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-sm font-bold text-black shadow-lg shadow-amber-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-amber-500/30 sm:w-auto"
//           >
//             Get Started Instantly
//             <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
//           </Link>

//           <Link
//             href="/price"
//             className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:bg-zinc-800 sm:w-auto"
//           >
//             Check Wholesale Pricing
//           </Link>
//         </div>

//         {/* INTERACTIVE VTU WIDGET PREVIEW */}
//         <div className="mt-16 overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-2xl backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/50 max-w-3xl mx-auto">
//           {/* Tabs */}
//           <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
//             {services.map((service) => {
//               const IconComponent = service.icon;
//               return (
//                 <button
//                   key={service.id}
//                   onClick={() => setActiveTab(service.id)}
//                   className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
//                     activeTab === service.id
//                       ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-black"
//                       : "text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
//                   }`}
//                 >
//                   <IconComponent className={`h-4 w-4 ${activeTab === service.id ? "text-amber-400" : service.color}`} />
//                   {service.label}
//                 </button>
//               );
//             })}
//           </div>

//           {/* Quick Config Sandbox Panel */}
//           <div className="mt-4 rounded-2xl bg-slate-50 p-6 text-left dark:bg-zinc-950/50 border border-slate-100 dark:border-zinc-900">
//             <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
//               ⚡ Instant Portal Preview
//             </p>
//             <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
//               <div>
//                 <h4 className="text-base font-bold text-slate-900 dark:text-white capitalize">
//                   {activeTab} Dispatch System Active
//                 </h4>
//                 <p className="text-xs text-slate-500 dark:text-zinc-400">
//                   Avg. processing time: <span className="font-medium text-emerald-500">~2.4 seconds</span>
//                 </p>
//               </div>
//               <Link 
//                 href={`/auth/signup?intent=${activeTab}`}
//                 className="inline-flex items-center justify-center gap-1 rounded-lg bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-700 hover:bg-amber-500/20 dark:bg-amber-400/10 dark:text-amber-400 transition"
//               >
//                 Proceed with Transaction
//                 <ArrowRight className="h-3 w-3" />
//               </Link>
//             </div>
//           </div>
//         </div>

//       </div>
//     </section>
//   );
// }




"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Wifi, Phone, Zap, Tv } from "lucide-react";

export default function Hero() {
  const [activeTab, setActiveTab] = useState("data");

  const services = [
    { id: "data", label: "Buy Data", icon: Wifi, color: "text-blue-500" },
    { id: "airtime", label: "Airtime", icon: Phone, color: "text-green-500" },
    { id: "electricity", label: "Electricity", icon: Zap, color: "text-amber-500" },
    { id: "cable", label: "Cable TV", icon: Tv, color: "text-purple-500" },
  ];

  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-slate-50 px-4 py-22 md:py-16 dark:bg-zinc-950 md:px-8 md:py-28">
      
      {/* PREMIUM BACKGROUND ARCHITECTURE WITH MOVING LINE SVG */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Subtle Fine Mesh Grid Pattern */}
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.15] dark:opacity-[0.07]"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-900 dark:text-white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Animated Moving Laser Lines Overlay */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1440 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          {/* Upper Track & Glowing Laser */}
          <path
            d="M-100 200 C 350 350, 550 50, 800 200 C 1050 350, 1250 150, 1600 250"
            stroke="currentColor"
            className="text-slate-200/50 dark:text-zinc-900/40"
            strokeWidth="1.5"
          />
          <path
            d="M-100 200 C 350 350, 550 50, 800 200 C 1050 350, 1250 150, 1600 250"
            stroke="url(#vtu-laser-1)"
            strokeWidth="2.5"
            strokeDasharray="120 400"
            className="animate-[vtuMoveLine_8s_linear_infinite]"
          />

          {/* Lower Track & Glowing Laser */}
          <path
            d="M-100 550 C 300 650, 550 350, 850 550 C 1100 700, 1250 450, 1600 500"
            stroke="currentColor"
            className="text-slate-200/50 dark:text-zinc-900/40"
            strokeWidth="1.5"
          />
          <path
            d="M-100 550 C 300 650, 550 350, 850 550 C 1100 700, 1250 450, 1600 500"
            stroke="url(#vtu-laser-2)"
            strokeWidth="2.5"
            strokeDasharray="180 500"
            className="animate-[vtuMoveLine_12s_linear_infinite_reverse]"
          />

          {/* Color Gradients for the Laser Streams */}
          <defs>
            <linearGradient id="vtu-laser-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0" />
              <stop offset="50%" stopColor="#D4AF37" stopOpacity="1" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="vtu-laser-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0" />
              <stop offset="50%" stopColor="#2563EB" stopOpacity="1" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Ambient Premium Blurs */}
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-blue-600/20 to-amber-400/10 blur-[120px] dark:from-blue-900/30 dark:to-amber-500/5" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-gradient-to-br from-emerald-600/15 to-blue-500/10 blur-[140px] dark:from-emerald-900/20 dark:to-zinc-900/10" />
      </div>

      {/* Global Style Injector for CSS Keyframe Animations */}
      <style jsx global>{`
        @keyframes vtuMoveLine {
          0% { strokeDashoffset: 520; }
          100% { strokeDashoffset: -520; }
        }
      `}</style>

      {/* MAIN CONTENT CONTAINER */}
      <div className="relative z-10 mx-auto max-w-5xl text-center">
        
        {/* Modern Animated Glow Badge */}
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[#D4AF37] bg-amber-500/5 px-4 py-1.5 text-xs font-semibold tracking-wide text-[#D4AF37]  dark:border-[#D4AF37] dark:bg-amber-400/10 dark:text-amber-400 backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse" />
          Fast & Secure VTU Platform
        </div>

        {/* Premium Typography with Gradients */}
        <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl dark:text-white">
          Buy Data, <span className="bg-[#D4AF37] to-amber-600 bg-clip-text text-transparent dark:from-amber-400 dark:to-yellow-300">Airtime</span> <br className="hidden md:inline"/>
          & Pay Bills Instantly
        </h1>

        {/* Tailored Subtitle Description */}
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-zinc-400 md:text-xl">
          Experience ultra-fast automated dispatching. Top up your mobile subscriptions, manage utility payments, and keep things running without a hitch.
        </p>

        {/* Primary Call to Actions */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/auth/signup"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3.5 text-sm font-bold text-black shadow-lg shadow-amber-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-[#D4AF37] sm:w-auto"
          >
            Get Started Instantly
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/price"
            className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:bg-zinc-800 sm:w-auto"
          >
            Check Wholesale Pricing
          </Link>
        </div>

        {/* INTERACTIVE VTU WIDGET PREVIEW */}
        <div className="mt-16 overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-2xl backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/50 max-w-3xl mx-auto">
          {/* Tabs */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {services.map((service) => {
              const IconComponent = service.icon;
              return (
                <button
                  key={service.id}
                  onClick={() => setActiveTab(service.id)}
                  className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    activeTab === service.id
                      ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-black"
                      : "text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  <IconComponent className={`h-4 w-4 ${activeTab === service.id ? "text-amber-400" : service.color}`} />
                  {service.label}
                </button>
              );
            })}
          </div>

          {/* Quick Config Sandbox Panel */}
          <div className="mt-4 rounded-2xl bg-slate-50 p-6 text-left dark:bg-zinc-950/50 border border-slate-100 dark:border-zinc-900">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              ⚡ Instant Portal Preview
            </p>
            <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white capitalize">
                  {activeTab} Dispatch System Active
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Avg. processing time: <span className="font-medium text-emerald-500">~2.4 seconds</span>
                </p>
              </div>
              <Link 
                href={`/auth/signup?intent=${activeTab}`}
                className="inline-flex items-center justify-center gap-1 rounded-lg bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-[#D4AF37]  hover:bg-amber-500/20 dark:bg-amber-400/10 dark:text-amber-400 transition"
              >
                Proceed with Transaction
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}