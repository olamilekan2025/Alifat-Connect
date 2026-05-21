// src/components/about/mission-vision.tsx
import { Eye, Target } from "lucide-react";

const items = [
  {
    title: "Our Mission",
    description:
      "To provide fast, secure, and affordable digital payment services that simplify everyday transactions for individuals and businesses.",
    icon: Target,
  },
  {
    title: "Our Vision",
    description:
      "To become Africa's most trusted platform for seamless digital services and financial convenience.",
    icon: Eye,
  },
];

export default function MissionVision() {
  return (
    <section className="relative overflow-hidden bg-gray-50 py-24 md:py-10 dark:bg-black">
      {/* Background Glow */}
      {/* <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-[#D4AF37]/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-black/5 blur-3xl dark:bg-white/5" /> */}

      {/* Dot Pattern */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.04]"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="mission-pattern"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="2"
              cy="2"
              r="2"
              fill="#D4AF37"
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#mission-pattern)"
        />
      </svg>

      <div className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
            Mission & Vision
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl dark:text-white">
            Driven by Purpose.
            <span className="block bg-gradient-to-r from-[#D4AF37] via-[#E6C55A] to-[#B8860B] bg-clip-text text-transparent">
              Inspired by Innovation.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-slate-400">
            Our mission and vision guide everything we do as we build a
            trusted platform for seamless digital payments across Africa.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-8 lg:grid-cols-2">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="
                  group relative overflow-hidden rounded-[2rem]
                  border border-gray-200 bg-white
                  p-8 md:p-10
                  shadow-[0_20px_60px_rgba(0,0,0,0.06)]
                  transition-all duration-500
                  hover:-translate-y-2
                  hover:border-[#D4AF37]/30
                  hover:shadow-[0_30px_80px_rgba(0,0,0,0.10)]
                  dark:border-white
                  dark:border-slate-800
                  dark:bg-zinc-900
                  dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]
                "
              >
                {/* Top Gradient Bar */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#D4AF37] via-[#F7E28A] to-[#D4AF37]" />

                {/* Hover Glow */}
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#D4AF37]/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Icon */}
                <div className="relative mb-8 flex h-13 w-13 items-center justify-center rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] transition-all duration-300 group-hover:bg-[#D4AF37] group-hover:text-black">
                  <Icon className="h-5 w-5" />
                </div>

                {/* Title */}
                <h3 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="mt-5 text-lg leading-8 text-gray-600 dark:text-slate-400">
                  {item.description}
                </p>

                {/* Bottom Accent */}
                <div className="mt-8 h-px w-full bg-gradient-to-r from-[#D4AF37]/40 to-transparent" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}