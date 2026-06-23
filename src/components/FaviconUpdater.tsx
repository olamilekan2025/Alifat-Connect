"use client";

import { useEffect } from "react";

export default function FaviconUpdater({ url }: { url?: string }) {
  useEffect(() => {
    if (!url) return;

    const link =
      document.querySelector<HTMLLinkElement>("link[rel*='icon']") ||
      document.createElement("link") as HTMLLinkElement;

    link.rel = "icon";
    link.type = "image/x-icon";
    link.href = `${url}?v=${Date.now()}`; // cache bust

    document.head.appendChild(link);
  }, [url]);

  return null;
}