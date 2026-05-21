"use client";

import Image from "next/image";

const brands = [
  { name: "MTN", logo: "/brands/mtn.png" },
  { name: "Airtel", logo: "/brands/airtel.png" },
  { name: "Glo", logo: "/brands/glo.png" },
  { name: "9mobile", logo: "/brands/9mobile.png" },
  { name: "DStv", logo: "/brands/dstv.png" },
  { name: "GOtv", logo: "/brands/gotv.png" },
  { name: "Startimes", logo: "/brands/startimes.png" },
  { name: "Spectranet", logo: "/brands/spectranet.png" },
  { name: "SWIFT", logo: "/brands/swift.png" },
];

export default function TrustedBrands() {
  return (
    <section className="py-20 bg-gray-50 overflow-hidden">

      <div className="max-w-7xl mx-auto ">

        {/* Heading */}
        <div className="text-center px-4 mb-14">

          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
            Trusted Services
          </p>

          <h2 className="mt-4 text-3xl md:text-5xl font-bold text-gray-900">
            Networks & Bills You Use Everyday
          </h2>

        </div>

        {/* Slider */}
        <div className="relative group">

          {/* Left Fade */}
          <div className="absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-white to-transparent pointer-events-none" />

          {/* Right Fade */}
          <div className="absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-white to-transparent pointer-events-none" />

          {/* Moving Track */}
          <div className="slider-track group-hover:[animation-play-state:paused]  ">

            {[...brands, ...brands].map((brand, index) => (
              <div
                key={index}
                className="flex h-18 w-44 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={120}
                  height={50}
                  className="h-10 w-auto object-contain"
                />
              </div>
            ))}

          </div>

        </div>

      </div>
    </section>
  );
}
