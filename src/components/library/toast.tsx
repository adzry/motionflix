"use client";

import { useEffect } from "react";

const DURATION_MS = 4000;

export function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, DURATION_MS);
    return () => window.clearTimeout(t);
  }, [onDone]);

  return (
    <div
      role="status"
      className="animate-toast-in fixed bottom-6 left-1/2 z-[90] w-[min(92vw,30rem)] -translate-x-1/2 rounded-md border-l-4 border-flare bg-surface-raised px-4 py-3 text-sm text-ink shadow-pop"
    >
      {message}
    </div>
  );
}
