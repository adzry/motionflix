import { cn } from "@/lib/cn";
import type { TitleStyle } from "@/types/video";

const styles: Record<TitleStyle, string> = {
  display: "font-display uppercase tracking-wide leading-[0.9]",
  serif: "font-serif leading-[0.95]",
  grotesk: "font-grotesk font-bold tracking-tight leading-[0.95]",
};

/**
 * Stylised title lettering laid over artwork — a stand-in for the per-title
 * logo treatments streaming apps use.
 */
export function TitleTreatment({
  title,
  style,
  as: Tag = "p",
  className,
  id,
}: {
  title: string;
  style: TitleStyle;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  id?: string;
}) {
  return (
    <Tag id={id} className={cn("text-shadow-title text-balance text-ink", styles[style], className)}>
      {title}
    </Tag>
  );
}
