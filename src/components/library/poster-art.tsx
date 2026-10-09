import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { PosterArt as PosterArtSpec } from "@/types/video";

/**
 * Original, procedurally generated placeholder artwork.
 *
 * Renders a 16:9 abstract composition from a hue + motif so the UI can be
 * designed without any third-party or copyrighted imagery. Purely decorative;
 * real posters will come from R2 in a later phase.
 *
 * Positioning is left to the caller (pass `relative` or `absolute`).
 *
 * No SVG <defs>/ids are used, so the same title can safely render many times
 * on one page.
 */

const W = 160;
const H = 90;

function wavePath(y: number, amp: number, phase: number) {
  const pts: string[] = [];
  for (let x = 0; x <= W; x += 8) {
    const yy = y + Math.sin((x / W) * Math.PI * 2 + phase) * amp;
    pts.push(`${x === 0 ? "M" : "L"}${x} ${yy.toFixed(2)}`);
  }
  return pts.join(" ");
}

function Motif({ motif, hue }: PosterArtSpec): ReactNode {
  const light = `hsl(${hue} 95% 72%)`;
  const mid = `hsl(${hue} 85% 55%)`;
  const alt = `hsl(${(hue + 40) % 360} 90% 65%)`;

  switch (motif) {
    case "orbit":
      return (
        <g fill="none" stroke={light} strokeWidth={0.6} opacity={0.85}>
          <ellipse cx={104} cy={46} rx={46} ry={16} transform="rotate(-18 104 46)" />
          <ellipse cx={104} cy={46} rx={30} ry={10} transform="rotate(-18 104 46)" />
          <circle cx={104} cy={46} r={10} fill={mid} stroke="none" />
          <circle cx={63} cy={56} r={3} fill={alt} stroke="none" />
          <circle cx={130} cy={33} r={2} fill={light} stroke="none" />
        </g>
      );
    case "waves":
      return (
        <g fill="none" strokeWidth={1.2} strokeLinecap="round">
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              d={wavePath(30 + i * 9, 6 + i * 1.5, i * 0.8)}
              stroke={i % 2 ? alt : light}
              opacity={0.9 - i * 0.14}
            />
          ))}
        </g>
      );
    case "grid":
      return (
        <g>
          <g stroke={light} strokeWidth={0.3} opacity={0.35}>
            {Array.from({ length: 11 }, (_, i) => (
              <line key={`v${i}`} x1={60 + i * 10} y1={0} x2={60 + i * 10} y2={H} />
            ))}
            {Array.from({ length: 9 }, (_, i) => (
              <line key={`h${i}`} x1={60} y1={i * 10 + 5} x2={W} y2={i * 10 + 5} />
            ))}
          </g>
          {[
            [90, 25],
            [110, 45],
            [130, 15],
            [100, 65],
            [140, 55],
          ].map(([x, y], i) => (
            <rect
              key={i}
              x={x}
              y={y}
              width={10}
              height={10}
              fill={i % 2 ? alt : mid}
              opacity={0.75}
            />
          ))}
        </g>
      );
    case "beams":
      return (
        <g>
          {[0, 1, 2, 3].map((i) => (
            <polygon
              key={i}
              points={`${70 + i * 22},${H} ${88 + i * 22},${H} ${150 + i * 6},0 ${138 + i * 6},0`}
              fill={i % 2 ? alt : light}
              opacity={0.18 + i * 0.12}
            />
          ))}
        </g>
      );
    case "rings":
      return (
        <g fill="none">
          {[6, 14, 22, 30, 38].map((r, i) => (
            <circle
              key={r}
              cx={112}
              cy={45}
              r={r}
              stroke={i % 2 ? alt : light}
              strokeWidth={1.4 - i * 0.2}
              opacity={1 - i * 0.16}
            />
          ))}
          <circle cx={112} cy={45} r={3} fill={light} />
        </g>
      );
  }
}

export function PosterArt({
  art,
  className,
  children,
}: {
  art: PosterArtSpec;
  className?: string;
  /** Optional overlay content (e.g. title text) rendered above the art. */
  children?: ReactNode;
}) {
  const { hue } = art;
  const background: CSSProperties = {
    backgroundImage: [
      `radial-gradient(120% 120% at 85% 20%, hsl(${hue} 70% 32% / 0.95), transparent 60%)`,
      `radial-gradient(90% 90% at 0% 100%, hsl(${(hue + 200) % 360} 60% 18% / 0.9), transparent 70%)`,
      `linear-gradient(135deg, hsl(${hue} 40% 10%), hsl(${(hue + 30) % 360} 35% 6%))`,
    ].join(", "),
  };

  return (
    <div
      className={cn("overflow-hidden bg-surface", className)}
      style={background}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full"
        aria-hidden="true"
        focusable="false"
      >
        <Motif {...art} />
      </svg>
      {children}
    </div>
  );
}
