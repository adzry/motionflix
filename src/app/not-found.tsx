import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-gutter text-center">
      <p className="font-display text-8xl text-flare">404</p>
      <h1 className="mt-2 text-3xl font-bold">Lost your way?</h1>
      <p className="mt-3 max-w-md text-muted">
        This page isn&apos;t in your library. You&apos;ll find plenty to explore on the home page.
      </p>
      <Link
        href="/"
        className={buttonStyles({ className: "mt-8" })}
      >
        MotionFlix Home
      </Link>
    </div>
  );
}
