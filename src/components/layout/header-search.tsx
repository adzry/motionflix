"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

const DEBOUNCE_MS = 250;

/**
 * Expanding search box. Typing navigates to /search?q=… which filters the
 * library (currently the sample catalog) on the server.
 */
export function HeaderSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const urlQuery = pathname === "/search" ? (params.get("q") ?? "") : "";
  const [open, setOpen] = useState(urlQuery !== "");
  const [query, setQuery] = useState(urlQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<number | undefined>(undefined);

  // Leaving the search page collapses and clears the box (state adjusted
  // during render, so the input keeps focus while typing on /search).
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    if (pathname !== "/search") {
      setQuery("");
      setOpen(false);
    }
  }

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const navigate = (value: string) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const href = value.trim() ? `/search?q=${encodeURIComponent(value.trim())}` : "/search";
      if (pathname === "/search") router.replace(href, { scroll: false });
      else router.push(href);
    }, DEBOUNCE_MS);
  };

  const openBox = () => {
    setOpen(true);
    // Focus synchronously so the very first keystroke lands in the input.
    inputRef.current?.focus();
  };

  return (
    <div
      role="search"
      className={cn(
        "flex h-9 items-center border transition-[width,background-color,border-color] duration-300 ease-cinema",
        open ? "w-[min(16rem,52vw)] border-white/80 bg-black/80" : "w-9 border-transparent",
      )}
    >
      <button
        type="button"
        aria-label="Search"
        onClick={() => (open ? inputRef.current?.focus() : openBox())}
        className="flex size-9 shrink-0 items-center justify-center text-ink"
      >
        <SearchIcon className="size-5" />
      </button>
      <input
        ref={inputRef}
        type="search"
        value={query}
        tabIndex={open ? 0 : -1}
        aria-label="Search titles, genres, categories"
        placeholder="Titles, genres, categories"
        onChange={(e) => {
          setQuery(e.target.value);
          navigate(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            inputRef.current?.blur();
          }
        }}
        onBlur={() => {
          if (!query) setOpen(false);
        }}
        className={cn(
          "h-full min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-subtle [&::-webkit-search-cancel-button]:hidden",
          !open && "pointer-events-none w-0",
        )}
      />
      {open && query && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setQuery("");
            navigate("");
            inputRef.current?.focus();
          }}
          className="flex size-8 shrink-0 items-center justify-center text-muted hover:text-ink"
        >
          <CloseIcon className="size-4" />
        </button>
      )}
    </div>
  );
}

/** Static stand-in rendered while search params resolve. */
export function HeaderSearchFallback() {
  return (
    <span className="flex size-9 items-center justify-center text-ink">
      <SearchIcon className="size-5" />
    </span>
  );
}
