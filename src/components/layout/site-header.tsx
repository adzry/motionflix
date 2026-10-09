"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useLibraryUI } from "@/components/library/library-provider";
import { Badge } from "@/components/ui/badge";
import { BellIcon, ChevronDownIcon } from "@/components/ui/icons";
import { Logo } from "@/components/ui/logo";
import { mainNav, type NavItem } from "@/config/site";
import { cn } from "@/lib/cn";
import { unavailable } from "@/lib/feature-status";
import { useDismiss } from "@/lib/use-dismiss";
import { HeaderSearch, HeaderSearchFallback } from "./header-search";
import { ProfileMenu } from "./profile-menu";

function isActive(item: NavItem, pathname: string) {
  return item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
}

function NavLink({
  item,
  pathname,
  className,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  className?: string;
  onNavigate?: () => void;
}) {
  const { notify } = useLibraryUI();
  if (item.comingSoon) {
    return (
      <button
        type="button"
        onClick={() => {
          onNavigate?.();
          notify(unavailable.myList);
        }}
        className={cn("inline-flex items-center gap-1.5 text-[#b3b3b3]/70 transition-colors hover:text-[#b3b3b3]", className)}
      >
        {item.label}
        <Badge tone="outline" className="px-1 py-0 text-[9px]">Soon</Badge>
      </button>
    );
  }
  const active = isActive(item, pathname);
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "transition-colors",
        active ? "font-semibold text-ink" : "text-[#e5e5e5] hover:text-[#b3b3b3]",
        className,
      )}
    >
      {item.label}
    </Link>
  );
}

/** "Browse ▾" dropdown used between tablet and desktop widths. */
function BrowseMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  return (
    <div ref={ref} className="relative lg:hidden">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-sm font-semibold"
      >
        Browse
        <ChevronDownIcon className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ul className="animate-fade-in absolute top-full left-1/2 mt-4 w-56 -translate-x-1/2 border-t-2 border-ink bg-black/95 py-2 text-center text-sm shadow-pop">
          {mainNav.map((item) => (
            <li key={item.href}>
              <NavLink item={item} pathname={pathname} onNavigate={close} className="flex w-full justify-center py-2.5 hover:bg-white/5" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { notify } = useLibraryUI();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const categoryItems = mainNav.filter((i) => i.href.startsWith("/browse/"));

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        scrolled ? "bg-canvas" : "bg-gradient-to-b from-black/80 via-black/40 to-transparent",
      )}
    >
      <div className="flex h-14 items-center gap-5 px-gutter md:h-[68px] lg:gap-10">
        <Link href="/" aria-label="MotionFlix home" className="shrink-0">
          <Logo compact className="inline-block text-[40px] md:hidden" />
          <Logo className="hidden text-[34px] md:inline-block lg:text-[38px]" />
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <BrowseMenu pathname={pathname} />
          <ul className="hidden items-center gap-5 text-sm lg:flex">
            {mainNav.map((item) => (
              <li key={item.href}>
                <NavLink item={item} pathname={pathname} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-3 sm:gap-5">
          <Suspense fallback={<HeaderSearchFallback />}>
            <HeaderSearch />
          </Suspense>
          <button
            type="button"
            aria-label="Notifications (not available yet)"
            onClick={() => notify(unavailable.notifications)}
            className="hidden text-ink sm:block"
          >
            <BellIcon className="size-5" />
          </button>
          <ProfileMenu />
        </div>
      </div>

      {/* Mobile category chips, like the streaming apps' top filters. */}
      <nav aria-label="Categories" className="md:hidden">
        <ul className="scrollbar-none flex gap-2 overflow-x-auto px-gutter pb-2.5">
          {categoryItems.map((item) => {
            const active = isActive(item, pathname);
            return (
              <li key={item.href} className="shrink-0">
                <Link
                  href={active ? "/" : item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "block rounded-full border px-3.5 py-1 text-sm whitespace-nowrap transition-colors",
                    active ? "border-ink bg-ink text-canvas" : "border-white/50 text-ink",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
