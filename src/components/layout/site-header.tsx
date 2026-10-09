"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { Logo } from "@/components/ui/logo";
import { mainNav, type NavItem } from "@/config/site";
import { cn } from "@/lib/cn";

function NavEntry({
  item,
  onNavigate,
  className,
}: {
  item: NavItem;
  onNavigate?: () => void;
  className?: string;
}) {
  if (item.comingSoon) {
    return (
      <span
        aria-disabled="true"
        className={cn("inline-flex items-center gap-2 text-subtle", className)}
      >
        {item.label}
        <Badge tone="outline">Soon</Badge>
      </span>
    );
  }
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn("text-muted transition-colors hover:text-ink", className)}
    >
      {item.label}
    </Link>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || menuOpen
          ? "bg-canvas/95 shadow-lg shadow-black/40 backdrop-blur"
          : "bg-gradient-to-b from-black/80 to-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center gap-8 px-4 sm:px-8 lg:px-12">
        <Link href="/" aria-label="MotionFlix home" onClick={closeMenu}>
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-6 text-sm">
            {mainNav.map((item) => (
              <li key={item.href}>
                <NavEntry item={item} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {/* Auth is not implemented yet (Phase 2). Shown disabled on purpose. */}
          <span
            aria-disabled="true"
            title="Sign-in arrives with Supabase Auth in Phase 2"
            className="hidden items-center gap-2 rounded-md border border-line px-3 py-1.5 text-sm text-subtle sm:inline-flex"
          >
            Sign in
            <Badge tone="outline">Soon</Badge>
          </span>

          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-md text-ink hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-ink md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <CloseIcon className="size-6" />
            ) : (
              <MenuIcon className="size-6" />
            )}
          </button>
        </div>
      </div>

      <nav
        id="mobile-nav"
        aria-label="Mobile"
        hidden={!menuOpen}
        className="border-t border-line bg-canvas md:hidden"
      >
        <ul className="flex flex-col px-4 py-2">
          {mainNav.map((item) => (
            <li key={item.href}>
              <NavEntry
                item={item}
                onNavigate={closeMenu}
                className="flex py-3 text-base"
              />
            </li>
          ))}
          <li className="flex items-center gap-2 py-3 text-base text-subtle sm:hidden">
            Sign in <Badge tone="outline">Soon</Badge>
          </li>
        </ul>
      </nav>
    </header>
  );
}
