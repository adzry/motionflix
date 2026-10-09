"use client";

import { useCallback, useRef, useState } from "react";
import { useLibraryUI } from "@/components/library/library-provider";
import { Badge } from "@/components/ui/badge";
import { ChevronDownIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { unavailable } from "@/lib/feature-status";
import { useDismiss } from "@/lib/use-dismiss";

function Avatar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("rounded", className)} aria-hidden="true" focusable="false">
      <rect width="32" height="32" fill="#e50914" />
      <rect width="32" height="32" fill="url(#mf-avatar)" />
      <defs>
        <linearGradient id="mf-avatar" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff6a3d" />
          <stop offset="1" stopColor="#b0060f" />
        </linearGradient>
      </defs>
      <circle cx="11" cy="13" r="2" fill="#fff" />
      <circle cx="21" cy="13" r="2" fill="#fff" />
      <path d="M10 20q6 5 12 0" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

const soonItems = ["Manage Profiles", "Account", "Help Center"];

/**
 * Profile area. There is only one (sample) owner profile until Supabase Auth
 * lands in Phase 2; every account action is marked "Soon".
 */
export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { notify } = useLibraryUI();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  const soon = () => {
    setOpen(false);
    notify(unavailable.profiles);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Profile menu"
        onClick={() => setOpen((o) => !o)}
        className="group flex items-center gap-1.5 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        <Avatar className="size-8" />
        <ChevronDownIcon className={cn("hidden size-4 transition-transform duration-200 md:block", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="menu"
          className="animate-fade-in absolute top-full right-0 mt-3 w-60 border border-white/15 bg-black/95 py-2 text-sm shadow-pop"
        >
          <span aria-hidden="true" className="absolute -top-2 right-6 size-0 border-x-8 border-b-8 border-x-transparent border-b-white/80" />
          <div className="flex items-center gap-3 px-4 py-2">
            <Avatar className="size-8" />
            <span>
              <span className="block font-semibold">Owner</span>
              <span className="block text-xs text-subtle">Sample profile</span>
            </span>
          </div>
          {soonItems.map((label) => (
            <button
              key={label}
              type="button"
              role="menuitem"
              onClick={soon}
              className="flex w-full items-center justify-between px-4 py-2 text-left text-muted hover:underline"
            >
              {label}
              <Badge tone="outline">Soon</Badge>
            </button>
          ))}
          <div className="my-2 border-t border-white/15" />
          <button
            type="button"
            role="menuitem"
            onClick={soon}
            className="flex w-full items-center justify-between px-4 py-2 text-left hover:underline"
          >
            Sign in to MotionFlix
            <Badge tone="outline">Phase 2</Badge>
          </button>
        </div>
      )}
    </div>
  );
}
