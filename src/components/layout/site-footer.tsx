import Link from "next/link";
import { categories } from "@/config/categories";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-5xl px-gutter pt-16 pb-10 text-[13px] text-subtle">
      <nav aria-label="Footer">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          <li><Link href="/" className="hover:underline">Home</Link></li>
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/browse/${c.slug}`} className="hover:underline">{c.title}</Link>
            </li>
          ))}
          <li><Link href="/search" className="hover:underline">Search</Link></li>
        </ul>
      </nav>
      <p className="mt-8">
        {siteConfig.name} is a private, personal library for Claude Motion Studio
        renders. Sample titles and artwork are placeholders.
      </p>
      <p className="mt-2">Not affiliated with Netflix.</p>
    </footer>
  );
}
