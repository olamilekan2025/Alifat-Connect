// // src/components/pricing/pricing-plans.tsx
// import Link from "next/link";
// import {
//   ArrowRight,
//   CheckCircle2,
//   Sparkles,
// } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   Card,
//   CardContent,
//   CardHeader,
// } from "@/components/ui/card";

// const plans = [
//   {
//     title: "Starter",
//    description:"Everything you need to buy airtime, data, pay bills, and manage your wallet.",
//     price: "Free",
//     highlight: false,
//     features: [
//      "Free account",
// "Wallet",
// "Buy airtime",
// "Buy data",
// "Pay bills",
// "Transaction history"
//     ],
//   },
//   {
//     title: "Premium",
//     description:" Unlocked after account verification and active usage.",
//     price: "Free Upgrade",
//     note: "Unlocked automatically",
//     highlight: true,
//     features: [
//    "Lower transaction rates",
// "Higher wallet limits",
// "Priority support",
// "Exclusive promotions",
// "Faster transaction processing"
//     ],
//   },
//   {
//     title: "Enterprise",
//     description: "Custom payment solutions for businesses and organizations.",
//     price: "Contact Us",
//     highlight: false,
//     features: [
//     "Bulk payments",
// "Dedicated account manager",
// "API integration",
// "Custom pricing",
// "Priority support"
//     ],
//   },
// ];

// export default function PricingPlans() {
//   return (
//     <section className="bg-gray-100 py-16 dark:bg-black">
//       <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
//         {/* Section Header */}
//         <div className="mx-auto mb-16 max-w-3xl text-center">
//           <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
//            Grow With Alifat Connect
//           </p>

//           <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl dark:text-white">
//            One Account. More Benefits as You Grow.
//           </h2>

//           <p className="mt-5 text-lg leading-8 text-gray-600 dark:text-slate-300">
//            Every account starts free. As you verify your account and transact more, you'll unlock better rates, higher limits, and additional benefits.
//           </p>
//         </div>

//         {/* Pricing Cards */}
//         <div className="grid gap-8 lg:grid-cols-3">
//           {plans.map((plan) => (
//             <Card
//               key={plan.title}
//               className={`relative rounded-[2rem] border transition-all duration-300 dark:bg-zinc-950 ${
//                 plan.highlight
//                   ? "border-[#D4AF37] shadow-2xl shadow-[#D4AF37]/10"
//                   : "border-gray-200 bg-white shadow-sm hover:-translate-y-1 hover:shadow-xl dark:border-white dark:hover:-translate-y-1 dark:hover:shadow-xl dark:hover:shadow-white/10"
//               }`}
//             >
//               {/* Most Popular Badge */}
//               {plan.highlight && (
//                 <Badge className="absolute left-1/2 top-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4AF37] px-4 py-1.5 text-black hover:bg-[#D4AF37]">
//                   <Sparkles className="mr-1 h-4 w-4" />
//                   Most Popular
//                 </Badge>
//               )}

//               <CardHeader className="p-8 pb-4 text-center">
//                 <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
//                   {plan.title}
//                 </h3>

//                 <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-slate-400">
//                   {plan.description}
//                 </p>

//                 <div className="mt-6">
//                   <span className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
//                     {plan.price}
//                   </span>

//                   {plan.note && (
//                     <p className="mt-2 text-sm font-medium text-[#B8860B] dark:text-[#F7E28A]">
//                       {plan.note}
//                     </p>
//                   )}
//                 </div>
//               </CardHeader>

//               <CardContent className="p-8 pt-4">
//                 <ul className="space-y-4">
//                   {plan.features.map((feature) => (
//                     <li
//                       key={feature}
//                       className="flex items-start gap-3"
//                     >
//                       <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#D4AF37]" />
//                       <span className="text-sm text-gray-600 dark:text-slate-300">
//                         {feature}
//                       </span>
//                     </li>
//                   ))}
//                 </ul>

//                 <Button
//                   asChild
//                   size="lg"
//                   className={`mt-8 w-full rounded-full ${
//                     plan.highlight
//                       ? "bg-black text-white hover:bg-[#D4AF37] hover:text-black dark:bg-[#D4AF37] dark:text-black dark:hover:bg-[#E6C55A]"
//                       : "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-white dark:text-black dark:hover:bg-[#D4AF37] dark:hover:text-white"
//                   }`}
//                 >
//                   <Link
//                     href={
//                       plan.title === "Enterprise"
//                         ? "/contact"
//                         : "/auth/signup"
//                     }
//                   >
//                     {plan.title === "Enterprise"
//                       ? "Contact Sales"
//                       : "Get Started"}
//                     <ArrowRight className="ml-2 h-4 w-4" />
//                   </Link>
//                 </Button>
//               </CardContent>
//             </Card>
            
//           ))}
//         </div>
//       </div>

//       <div className="mx-auto mt-16 max-w-4xl px-4 md:px-6 lg:px-8">
//   <div className="rounded-3xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-8 text-center dark:border-[#D4AF37]/30 dark:bg-[#D4AF37]/10">
//     <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
//       How Membership Works
//     </h3>

//     <p className="mt-4 text-base leading-8 text-gray-600 dark:text-slate-300">
//       Every new account starts as a{" "}
//       <span className="font-semibold text-[#B8860B] dark:text-[#F7E28A]">
//         Starter
//       </span>{" "}
//       member. As you verify your account and continue using Alifat Connect,
//       you'll automatically unlock{" "}
//       <span className="font-semibold text-[#B8860B] dark:text-[#F7E28A]">
//         Premium
//       </span>{" "}
//       benefits, including lower transaction rates, higher wallet limits, and
//       priority support. Businesses and organizations with larger payment needs
//       can contact us for an{" "}
//       <span className="font-semibold text-[#B8860B] dark:text-[#F7E28A]">
//         Enterprise
//       </span>{" "}
//       solution.
//     </p>
//   </div>
// </div>
//     </section>
//   );
// }


import Link from "next/link";
import { ArrowRight, Check, Sparkles, Building2, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const plans = [
  {
    title: "Starter",
    description: "Everything you need to buy airtime, data, pay bills, and manage your wallet.",
    price: "Free",
    highlight: false,
    icon: ShieldCheck,
    features: [
      "Free personal account",
      "Secure digital wallet",
      "Instant airtime & data top-up",
      "Utility bill payments",
      "Real-time transaction history"
    ],
  },
  {
    title: "Premium",
    description: "Unlocked automatically after account verification and active account usage.",
    price: "Free Upgrade",
    note: "Unlocked automatically",
    highlight: true,
    icon: Zap,
    features: [
      "Lower transaction rates",
      "Higher daily wallet limits",
      "Priority customer support",
      "Exclusive promotions & rewards",
      "Faster transaction processing"
    ],
  },
  {
    title: "Enterprise",
    description: "Custom payment solutions tailored for businesses, sub-agents, and organizations.",
    price: "Contact Us",
    highlight: false,
    icon: Building2,
    features: [
      "Automated bulk payments",
      "Dedicated account manager",
      "Full API integration access",
      "Custom high-volume pricing",
      "24/7 Priority support SLA"
    ],
  },
];

export default function PricingPlans() {
  return (
    <section className="bg-zinc-50 py-20 dark:bg-zinc-950 transition-colors gap-20  duration-300">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <Badge variant="outline" className="border-[#D4AF37] text-[#D4AF37] dark:text-[#D4AF37] px-3 py-1 text-xs font-semibold tracking-wider uppercase">
            Grow With Alifat Connect
          </Badge>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-zinc-900 md:text-5xl dark:text-white">
            One Account. More Benefits as You Grow.
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Every account starts free. As you verify your identity and transact more, you will automatically unlock lower rates, higher limits, and additional benefits.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.title}
                className={`relative flex flex-col justify-between rounded-3xl border transition-all duration-300 ${
                  plan.highlight
                    ? " border-4 border-[#D4AF37] bg-white dark:bg-zinc-900 shadow-xl shadow-amber-500/5 ring-1 ring-amber-500/20"
                    : "border-black bg-white dark:border-white dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm"
                }`}
              >
                {plan.highlight && (
                  <Badge className="absolute -top-3 left-6 rounded-full bg-[#D4AF37] px-4 py-1 text-xs font-medium text-white shadow-sm border-0">
                    <Sparkles className="mr-1 h-3.5 w-3.5 fill-white/20" />
                    Most Popular
                  </Badge>
                )}

                <CardHeader className="p-8 pb-0 text-left">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                    plan.highlight 
                      ? "bg-amber-500/10 border-[#D4AF37] text-amber-600 dark:text-amber-400" 
                      : "bg-black dark:bg-zinc-800 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                  }`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  <h3 className="mt-5 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    {plan.title}
                  </h3>

                  <p className="mt-2 min-h-[48px] text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {plan.description}
                  </p>

                  <div className="mt-6 flex flex-col items-start gap-1">
                    <span className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                      {plan.price}
                    </span>
                    {plan.note && (
                      <span className="text-xs font-medium text-black dark:text-white bg-[#D4AF37] px-2 py-0.5 rounded-md mt-1">
                        {plan.note}
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col flex-1 p-8 pt-6 justify-between">
                  <div className="h-px bg-zinc-100 dark:bg-zinc-800 w-full mb-6" />
                  
                  <ul className="space-y-3.5 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div className={`mt-0.5 rounded-full p-0.5 shrink-0 ${
                          plan.highlight ? "bg-[#D4AF37] text-black dark:text-white" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}>
                          <Check className="h-3.5 w-3.5 stroke-[3] " />
                        </div>
                        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    size="lg"
                    className={`mt-8 w-full rounded-2xl font-semibold shadow-sm transition-all ${
                      plan.highlight
                        ? "bg-zinc-900 text-black bg-[#D4AF37] dark:text-black dark:hover:bg-white"
                        : "bg-zinc-100 text-zinc-900 hover:bg-black dark:bg-zinc-800 dark:text-white dark:hover:bg-[#D4AF37]"
                    }`}
                  >
                    <Link href={plan.title === "Enterprise" ? "/contact" : "/auth/signup"}>
                      {plan.title === "Enterprise" ? "Contact Sales" : "Get Started"}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <br />
        <br />


        {/* Info Explainer Footer Box */}
        <div className="mx-auto mt-20 max-w-4xl px-4">
          <div className="rounded-3xl border border-black bg-white p-8 dark:border-white dark:bg-black shadow-sm">
            <h4 className="text-lg font-bold text-zinc-900 dark:text-white text-center md:text-left">
              💡 How Membership Progression Works
            </h4>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 text-center md:text-left">
              Every new user instantly starts on the <span className="font-semibold text-zinc-950 dark:text-zinc-200">Starter</span> tier. By completing account verification milestones and retaining consistent transaction volumes, your account naturally levels up to <span className="font-semibold text-zinc-950 dark:text-zinc-200">Premium</span> to enjoy system-wide reduced transaction rates and expanded operational wallet volumes. High-frequency enterprise structures can migrate straight into custom contract spaces.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}