"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-zinc-950 py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="text-center py-20">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            We encountered an error while loading customer reviews.
          </p>
          <button
            onClick={reset}
            className="bg-[#D4AF37] hover:bg-[#B89430] text-black font-semibold px-8 py-6 rounded-full transition-all duration-300 hover:scale-105"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
