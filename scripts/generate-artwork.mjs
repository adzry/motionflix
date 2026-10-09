#!/usr/bin/env node
/**
 * Generates the original sample artwork in public/artwork/*.svg.
 *
 * Every scene is drawn from code (no third-party imagery). Output is
 * deterministic: re-running produces identical files.
 *
 *   node scripts/generate-artwork.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const W = 1600;
const H = 900;
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "artwork");

// ---------------------------------------------------------------- helpers --

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n) => Number(n.toFixed(1));

class Scene {
  constructor(seed) {
    this.r = rng(seed);
    this.defs = [];
    this.body = [];
    this.n = 0;
  }
  rand(min = 0, max = 1) {
    return min + this.r() * (max - min);
  }
  id(prefix) {
    return `${prefix}${this.n++}`;
  }
  stops(stops) {
    return stops
      .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`)
      .join("");
  }
  linear(stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) {
    const id = this.id("l");
    this.defs.push(
      `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${this.stops(stops)}</linearGradient>`,
    );
    return `url(#${id})`;
  }
  radial(stops, cx = 0.5, cy = 0.5, r = 0.5) {
    const id = this.id("r");
    this.defs.push(
      `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${this.stops(stops)}</radialGradient>`,
    );
    return `url(#${id})`;
  }
  blur(sd) {
    const id = this.id("b");
    this.defs.push(
      `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${sd}"/></filter>`,
    );
    return `url(#${id})`;
  }
  add(...els) {
    this.body.push(...els);
  }
  sky(stops) {
    this.add(`<rect width="${W}" height="${H}" fill="${this.linear(stops)}"/>`);
  }
  glow(cx, cy, r, color, opacity = 1) {
    this.add(
      `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${this.radial([
        [0, color, opacity],
        [0.35, color, opacity * 0.45],
        [1, color, 0],
      ])}"/>`,
    );
  }
  /** Jagged ridge (mountains / dunes) filled down to the bottom edge. */
  ridge({ y, amp, rough = 0.55, fill, steps = 7, smooth = false, extra = "" }) {
    let pts = [y + this.rand(-amp, amp) * 0.5, y + this.rand(-amp, amp) * 0.5];
    let a = amp;
    for (let s = 0; s < steps; s++) {
      const next = [];
      for (let i = 0; i < pts.length - 1; i++) {
        next.push(pts[i], (pts[i] + pts[i + 1]) / 2 + this.rand(-a, a));
      }
      next.push(pts[pts.length - 1]);
      pts = next;
      a *= rough;
    }
    const dx = W / (pts.length - 1);
    let d;
    if (smooth) {
      d = `M0 ${f(pts[0])}`;
      for (let i = 1; i < pts.length; i++) {
        const x0 = (i - 1) * dx;
        const x1 = i * dx;
        d += ` C${f(x0 + dx / 2)} ${f(pts[i - 1])} ${f(x1 - dx / 2)} ${f(pts[i])} ${f(x1)} ${f(pts[i])}`;
      }
    } else {
      d = pts.map((p, i) => `${i ? "L" : "M"}${f(i * dx)} ${f(p)}`).join(" ");
    }
    this.add(`<path d="${d} L${W} ${H} L0 ${H} Z" fill="${fill}" ${extra}/>`);
    return pts;
  }
  stars(count, maxY, color = "#fff", maxR = 1.8) {
    const out = [];
    for (let i = 0; i < count; i++) {
      const r = this.rand(0.3, 1) ** 3 * maxR + 0.3;
      out.push(
        `<circle cx="${f(this.rand(0, W))}" cy="${f(this.rand(0, maxY))}" r="${f(r)}" fill="${color}" opacity="${f(this.rand(0.3, 1))}"/>`,
      );
    }
    this.add(`<g>${out.join("")}</g>`);
  }
  particles(count, { x = [0, W], y = [0, H], r = [1, 4], colors, blur }) {
    const out = [];
    for (let i = 0; i < count; i++) {
      const c = colors[Math.floor(this.rand(0, colors.length))];
      out.push(
        `<circle cx="${f(this.rand(...x))}" cy="${f(this.rand(...y))}" r="${f(this.rand(...r))}" fill="${c}" opacity="${f(this.rand(0.35, 1))}"/>`,
      );
    }
    this.add(`<g${blur ? ` filter="${this.blur(blur)}"` : ""}>${out.join("")}</g>`);
  }
  fog(y, h, color, opacity = 0.6) {
    this.add(
      `<rect x="0" y="${f(y)}" width="${W}" height="${f(h)}" fill="${this.linear([
        [0, color, 0],
        [0.5, color, opacity],
        [1, color, 0],
      ])}"/>`,
    );
  }
  pine(x, base, h, fill) {
    const w = h * 0.36;
    let d = "";
    for (let i = 0; i < 4; i++) {
      const top = base - h + (h * i) / 5;
      const bw = w * (0.45 + i * 0.22);
      const by = top + h * 0.38;
      d += `M${f(x)} ${f(top)} L${f(x + bw)} ${f(by)} L${f(x - bw)} ${f(by)} Z `;
    }
    d += `M${f(x - h * 0.03)} ${f(base - h * 0.2)} h${f(h * 0.06)} V${f(base)} h${f(-h * 0.06)} Z`;
    return `<path d="${d}" fill="${fill}"/>`;
  }
  /** Cinematic finish: vignette + soft top/bottom shade. */
  finish(vignette = 0.75) {
    this.add(
      `<rect width="${W}" height="${H}" fill="${this.radial(
        [
          [0.55, "#000", 0],
          [1, "#000", vignette],
        ],
        0.5,
        0.5,
        0.75,
      )}"/>`,
    );
  }
  toString() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"><defs>${this.defs.join("")}</defs>${this.body.join("")}</svg>\n`;
  }
}

// ----------------------------------------------------------------- scenes --

const scenes = {
  "ph-signal-bloom"(s) {
    s.sky([[0, "#05030a"], [1, "#12061a"]]);
    s.glow(1060, 440, 520, "#7a1050", 0.55);
    const petals = [];
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * 360;
      const len = s.rand(170, 260);
      petals.push(
        `<ellipse cx="1060" cy="${f(440 - len / 2)}" rx="${f(len * 0.2)}" ry="${f(len / 2)}" transform="rotate(${f(a)} 1060 440)" fill="${i % 2 ? "#ff4fa0" : "#ff8a5c"}" opacity="0.32"/>`,
      );
    }
    s.add(`<g style="mix-blend-mode:screen">${petals.join("")}</g>`);
    s.glow(1060, 440, 120, "#ffd1e6", 1);
    const dots = [];
    for (let i = 0; i < 260; i++) {
      const a = s.rand(0, Math.PI * 2);
      const d = s.rand(60, 700) ** 1.02;
      dots.push(
        `<circle cx="${f(1060 + Math.cos(a) * d)}" cy="${f(440 + Math.sin(a) * d * 0.7)}" r="${f(s.rand(0.8, 3.6))}" fill="${["#ff9cc8", "#ffd27f", "#fff"][i % 3]}" opacity="${f(Math.max(0.15, 1 - d / 760))}"/>`,
      );
    }
    s.add(`<g>${dots.join("")}</g>`);
    s.finish(0.85);
  },

  "ph-tidal-type"(s) {
    s.sky([[0, "#1b2a4a"], [0.45, "#d2694a"], [0.6, "#f2b56b"]]);
    s.glow(1120, 470, 260, "#ffe2a8", 0.9);
    s.add(`<circle cx="1120" cy="470" r="70" fill="#fff3d6"/>`);
    const layers = [
      ["#2d3f6b", 520, 10],
      ["#22325a", 570, 16],
      ["#18264a", 630, 24],
      ["#101b38", 710, 34],
      ["#0a1228", 800, 44],
    ];
    layers.forEach(([c, y, amp], i) => {
      let d = `M0 ${y}`;
      for (let x = 0; x <= W; x += 40) {
        const yy = y + Math.sin(x / (90 + i * 30) + i * 1.7) * amp + Math.sin(x / 37 + i) * amp * 0.25;
        d += ` L${x} ${f(yy)}`;
      }
      s.add(`<path d="${d} L${W} ${H} L0 ${H} Z" fill="${c}"/>`);
      s.add(`<path d="${d}" fill="none" stroke="#ffd7a0" stroke-opacity="${f(0.45 - i * 0.07)}" stroke-width="2"/>`);
    });
    s.add(`<rect x="1080" y="520" width="80" height="260" fill="${s.linear([[0, "#ffe7b8", 0.7], [1, "#ffe7b8", 0]])}" filter="${s.blur(10)}"/>`);
    s.finish();
  },

  "ph-quiet-grid"(s) {
    s.sky([[0, "#c9b8d8"], [0.55, "#f3cdb8"], [0.58, "#e9c5b6"], [1, "#b6a3c4"]]);
    s.ridge({ y: 500, amp: 18, rough: 0.5, fill: "#a99abd", extra: 'opacity="0.7"' });
    s.add(`<rect y="515" width="${W}" height="${H - 515}" fill="${s.linear([[0, "#eed2c4"], [1, "#9d8db3"]])}"/>`);
    const lines = [];
    for (let i = -20; i <= 20; i++) {
      lines.push(`<line x1="800" y1="515" x2="${800 + i * 140}" y2="${H}" stroke="#fff" stroke-opacity="0.25"/>`);
    }
    for (let k = 1; k < 9; k++) {
      const y = 515 + (H - 515) * (k / 9) ** 1.8;
      lines.push(`<line x1="0" y1="${f(y)}" x2="${W}" y2="${f(y)}" stroke="#fff" stroke-opacity="0.22"/>`);
    }
    s.add(`<g>${lines.join("")}</g>`);
    // lone figure + reflection
    s.add(
      `<g fill="#2b2238"><circle cx="1010" cy="452" r="7"/><path d="M1003 461 h14 l3 34 h-6 l-1 22 h-6 l-1-22 h-6 z"/></g>` +
        `<g fill="#2b2238" opacity="0.25" transform="translate(0 1034) scale(1 -1)"><circle cx="1010" cy="452" r="7"/><path d="M1003 461 h14 l3 34 h-6 l-1 22 h-6 l-1-22 h-6 z"/></g>`,
    );
    s.glow(1010, 300, 360, "#fff2e2", 0.5);
    s.finish(0.45);
  },

  "ph-neon-transit"(s) {
    s.sky([[0, "#090616"], [0.6, "#2a0f3d"], [1, "#4a1640"]]);
    s.glow(800, 640, 700, "#ff2f7a", 0.25);
    const city = (base, minH, maxH, color, winA) => {
      let x = -20;
      const out = [];
      while (x < W) {
        const w = s.rand(50, 130);
        const h = s.rand(minH, maxH);
        out.push(`<rect x="${f(x)}" y="${f(base - h)}" width="${f(w)}" height="${f(h + 400)}" fill="${color}"/>`);
        for (let wy = base - h + 14; wy < base - 10; wy += 18) {
          for (let wx = x + 8; wx < x + w - 10; wx += 14) {
            if (s.r() < winA)
              out.push(`<rect x="${f(wx)}" y="${f(wy)}" width="6" height="9" fill="${s.r() < 0.8 ? "#ffcf7a" : "#7af0ff"}" opacity="${f(s.rand(0.4, 1))}"/>`);
          }
        }
        x += w + s.rand(4, 18);
      }
      s.add(`<g>${out.join("")}</g>`);
    };
    city(700, 200, 520, "#1a1030", 0.18);
    // neon signs
    const signs = [];
    for (let i = 0; i < 9; i++) {
      const c = ["#ff2f7a", "#2ff3ff", "#b44bff"][i % 3];
      const x = s.rand(40, 1500);
      const y = s.rand(260, 560);
      signs.push(`<rect x="${f(x)}" y="${f(y)}" width="${f(s.rand(14, 26))}" height="${f(s.rand(60, 130))}" rx="4" fill="${c}"/>`);
    }
    s.add(`<g filter="${s.blur(6)}">${signs.join("")}</g><g>${signs.join("")}</g>`);
    city(820, 120, 330, "#0c0818", 0.12);
    // elevated rail + train with light streak
    s.add(`<rect y="600" width="${W}" height="16" fill="#05030b"/>`);
    for (let x = 60; x < W; x += 220) s.add(`<rect x="${x}" y="616" width="14" height="300" fill="#05030b"/>`);
    s.add(`<rect x="300" y="540" width="1300" height="12" rx="6" fill="#2ff3ff" opacity="0.7" filter="${s.blur(8)}"/>`);
    s.add(`<rect x="620" y="534" width="760" height="64" rx="10" fill="#141026"/>`);
    for (let x = 640; x < 1360; x += 42) s.add(`<rect x="${x}" y="548" width="28" height="20" rx="3" fill="#bff9ff" opacity="0.85"/>`);
    s.add(`<rect x="0" y="570" width="620" height="6" fill="${s.linear([[0, "#ff2f7a", 0], [1, "#ff2f7a", 0.9]], 0, 0, 1, 0)}"/>`);
    // rain
    const rain = [];
    for (let i = 0; i < 220; i++) {
      const x = s.rand(0, W + 200);
      const y = s.rand(0, H);
      rain.push(`<line x1="${f(x)}" y1="${f(y)}" x2="${f(x - 12)}" y2="${f(y + 40)}" stroke="#9fb5ff" stroke-opacity="${f(s.rand(0.1, 0.35))}"/>`);
    }
    s.add(`<g>${rain.join("")}</g>`);
    s.finish();
  },

  "ph-solar-rings"(s) {
    s.sky([[0, "#0a0503"], [0.5, "#3a1406"], [0.72, "#c4511a"], [1, "#5a2008"]]);
    s.glow(1060, 330, 420, "#ff9b42", 0.8);
    s.add(`<circle cx="1060" cy="330" r="150" fill="none" stroke="#ffd59a" stroke-width="10" filter="${s.blur(10)}"/>`);
    for (let i = 1; i < 6; i++)
      s.add(`<circle cx="1060" cy="330" r="${150 + i * 34}" fill="none" stroke="#ffb46b" stroke-opacity="${f(0.35 - i * 0.05)}" stroke-width="2"/>`);
    s.add(`<circle cx="1060" cy="330" r="144" fill="#080302"/>`);
    s.ridge({ y: 640, amp: 60, rough: 0.45, steps: 5, smooth: true, fill: s.linear([[0, "#a8481a"], [1, "#3a1406"]]) });
    s.ridge({ y: 730, amp: 70, rough: 0.4, steps: 4, smooth: true, fill: s.linear([[0, "#7a3010"], [1, "#1c0904"]]) });
    s.ridge({ y: 830, amp: 50, rough: 0.4, steps: 4, smooth: true, fill: "#140602" });
    s.finish(0.8);
  },

  "ph-paper-orbit"(s) {
    s.sky([[0, "#13224a"], [1, "#0b1530"]]);
    const stars = [];
    for (let i = 0; i < 40; i++) {
      const x = s.rand(0, W);
      const y = s.rand(0, H);
      const r = s.rand(4, 10);
      stars.push(`<path d="M${f(x)} ${f(y - r)} L${f(x + r * 0.25)} ${f(y - r * 0.25)} L${f(x + r)} ${f(y)} L${f(x + r * 0.25)} ${f(y + r * 0.25)} L${f(x)} ${f(y + r)} L${f(x - r * 0.25)} ${f(y + r * 0.25)} L${f(x - r)} ${f(y)} L${f(x - r * 0.25)} ${f(y - r * 0.25)} Z" fill="#f6e7c1" opacity="0.8"/>`);
    }
    s.add(`<g>${stars.join("")}</g>`);
    const paper = (cx, cy, r, c1, c2) => {
      s.add(`<circle cx="${cx + 12}" cy="${cy + 16}" r="${r}" fill="#000" opacity="0.35" filter="${s.blur(10)}"/>`);
      s.add(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${s.linear([[0, c1], [1, c2]], 0, 0, 1, 1)}"/>`);
    };
    s.add(`<ellipse cx="1000" cy="450" rx="520" ry="170" fill="none" stroke="#f6e7c1" stroke-opacity="0.4" stroke-width="3" stroke-dasharray="14 12" transform="rotate(-12 1000 450)"/>`);
    s.add(`<ellipse cx="1000" cy="450" rx="330" ry="110" fill="none" stroke="#f6e7c1" stroke-opacity="0.35" stroke-width="3" stroke-dasharray="10 10" transform="rotate(-12 1000 450)"/>`);
    paper(1000, 450, 150, "#ffc857", "#f08a24");
    s.add(`<path d="M870 420 q130 -60 260 0" fill="none" stroke="#c9601a" stroke-width="16" opacity="0.5"/><path d="M880 500 q120 40 240 0" fill="none" stroke="#c9601a" stroke-width="12" opacity="0.4"/>`);
    paper(560, 590, 62, "#7bd1c4", "#2f8f87");
    paper(1430, 330, 44, "#f26b6b", "#a3304a");
    paper(1270, 610, 28, "#e8e0cf", "#a59c8a");
    s.finish(0.6);
  },

  "ph-glass-waves"(s) {
    s.sky([[0, "#05060c"], [0.62, "#10142a"], [0.63, "#1a1d33"], [1, "#05060c"]]);
    s.glow(1040, 380, 520, "#3b4bff", 0.25);
    // rainbow caustic on the floor
    const cols = ["#ff3b6b", "#ff9a2e", "#ffe53b", "#3bff9a", "#3bb5ff", "#9a5bff"];
    s.add(`<g filter="${s.blur(14)}" style="mix-blend-mode:screen">${cols
      .map((c, i) => `<ellipse cx="${1040 + 120 + i * 34}" cy="${700 + i * 6}" rx="${210 - i * 18}" ry="${34 - i * 3}" fill="none" stroke="${c}" stroke-width="12" opacity="0.8"/>`)
      .join("")}</g>`);
    s.add(`<ellipse cx="1040" cy="640" rx="200" ry="26" fill="#000" opacity="0.6" filter="${s.blur(12)}"/>`);
    // glass orb
    s.add(`<circle cx="1040" cy="430" r="210" fill="${s.radial([[0, "#ffffff", 0.05], [0.7, "#9fb6ff", 0.12], [0.95, "#d8e2ff", 0.55], [1, "#ffffff", 0.8]], 0.5, 0.5, 0.5)}"/>`);
    s.add(`<circle cx="1040" cy="430" r="210" fill="${s.linear([[0, "#ff4fa0", 0.25], [0.5, "#4f7bff", 0], [1, "#3bffc4", 0.25]], 0, 0, 1, 1)}"/>`);
    s.add(`<ellipse cx="960" cy="320" rx="80" ry="34" fill="#fff" opacity="0.65" transform="rotate(-35 960 320)" filter="${s.blur(8)}"/>`);
    s.add(`<circle cx="1150" cy="540" r="16" fill="#fff" opacity="0.8" filter="${s.blur(3)}"/>`);
    // light beam entering
    s.add(`<polygon points="0,250 840,410 840,440 0,300" fill="${s.linear([[0, "#ffffff", 0], [1, "#ffffff", 0.7]], 0, 0, 1, 0)}" filter="${s.blur(4)}"/>`);
    s.finish(0.8);
  },

  "ph-chart-lines"(s) {
    s.sky([[0, "#06141c"], [0.7, "#0d3b3f"], [1, "#1f6b5a"]]);
    s.glow(1200, 760, 600, "#58f0a7", 0.35);
    const grid = [];
    for (let y = 120; y < 820; y += 70) grid.push(`<line x1="80" y1="${y}" x2="1520" y2="${y}" stroke="#7af5c9" stroke-opacity="0.08"/>`);
    s.add(`<g>${grid.join("")}</g>`);
    const bars = [];
    const pts = [];
    for (let i = 0; i < 22; i++) {
      const x = 90 + i * 64;
      const h = 120 + i * 18 + s.rand(-60, 80);
      bars.push(`<rect x="${x}" y="${f(820 - h)}" width="44" height="${f(h)}" fill="${s.linear([[0, "#2fd39a", 0.75], [1, "#0b3b3a", 0.2]])}"/>`);
      pts.push([x + 22, 820 - h - 60 - s.rand(0, 40)]);
    }
    s.add(`<g>${bars.join("")}</g>`);
    const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${f(x)} ${f(y)}`).join(" ");
    s.add(`<path d="${d}" fill="none" stroke="#b8ffe2" stroke-width="10" opacity="0.5" filter="${s.blur(10)}"/>`);
    s.add(`<path d="${d}" fill="none" stroke="#e9fff6" stroke-width="4"/>`);
    pts.filter((_, i) => i % 4 === 1).forEach(([x, y]) => s.add(`<circle cx="${f(x)}" cy="${f(y)}" r="9" fill="#06141c" stroke="#e9fff6" stroke-width="4"/>`));
    s.add(`<line x1="80" y1="820" x2="1520" y2="820" stroke="#b8ffe2" stroke-opacity="0.5" stroke-width="2"/>`);
    s.finish();
  },

  "ph-ember-beams"(s) {
    s.sky([[0, "#0b0302"], [0.5, "#3a0c05"], [0.8, "#c2410f"], [1, "#ff7a1a"]]);
    s.glow(800, 880, 900, "#ff7a1a", 1);
    for (const [base, hMin, hMax, c, n] of [
      [760, 260, 420, "#2a0905", 22],
      [840, 320, 520, "#160403", 18],
      [920, 420, 640, "#070101", 12],
    ]) {
      const trees = [];
      for (let i = 0; i < n; i++) trees.push(s.pine(s.rand(-40, W + 40), base, s.rand(hMin, hMax), c));
      s.add(`<g>${trees.join("")}</g>`);
      s.add(`<rect y="${base - 4}" width="${W}" height="${H}" fill="${c}"/>`);
    }
    s.particles(90, { y: [200, 800], r: [2, 7], colors: ["#ff9a3c", "#ffcf6b", "#ff5a1f"], blur: 3 });
    s.particles(160, { y: [80, 860], r: [1, 3], colors: ["#ffd27a", "#ffab4a"] });
    s.finish(0.85);
  },

  "ph-violet-hours"(s) {
    s.sky([[0, "#0d0820"], [0.35, "#2b1650"], [0.5, "#9a4f9a"], [0.52, "#c77aa5"]]);
    s.stars(220, 330);
    s.add(`<circle cx="1180" cy="190" r="46" fill="#fbeaff"/>`);
    s.glow(1180, 190, 200, "#e9b8ff", 0.5);
    const p1 = s.ridge({ y: 330, amp: 120, rough: 0.5, fill: "#6b4596" });
    s.ridge({ y: 410, amp: 80, rough: 0.55, fill: "#3d2466" });
    // lake with reflection
    s.add(`<rect y="470" width="${W}" height="${H - 470}" fill="${s.linear([[0, "#5a3478"], [1, "#0d0820"]])}"/>`);
    const dx = W / (p1.length - 1);
    const refl = p1.map((p, i) => `${i ? "L" : "M"}${f(i * dx)} ${f(470 + (470 - p) * 0.8)}`).join(" ");
    s.add(`<path d="M0 470 ${refl.replace(/^M/, "L")} L${W} 470 Z" fill="#6b4596" opacity="0.45"/>`);
    const streak = [];
    for (let y = 490; y < 860; y += 14) streak.push(`<rect x="${f(1180 - s.rand(10, 60))}" y="${y}" width="${f(s.rand(30, 120))}" height="3" fill="#fbeaff" opacity="${f(0.7 - (y - 490) / 600)}"/>`);
    s.add(`<g>${streak.join("")}</g>`);
    s.fog(440, 80, "#c77aa5", 0.35);
    s.finish();
  },

  "ph-last-lighthouse"(s) {
    s.sky([[0, "#0b1018"], [0.6, "#233446"], [1, "#0a1119"]]);
    const clouds = [];
    for (let i = 0; i < 18; i++) clouds.push(`<ellipse cx="${f(s.rand(0, W))}" cy="${f(s.rand(40, 360))}" rx="${f(s.rand(150, 380))}" ry="${f(s.rand(40, 90))}" fill="#3b4c60" opacity="${f(s.rand(0.25, 0.6))}"/>`);
    s.add(`<g filter="${s.blur(26)}">${clouds.join("")}</g>`);
    // beam
    s.add(`<polygon points="1210,300 0,120 0,420" fill="${s.linear([[0, "#fff6c9", 0], [1, "#fff6c9", 0.55]], 0, 0, 1, 0)}" filter="${s.blur(14)}"/>`);
    // cliff + tower
    s.add(`<path d="M980 900 L1040 640 L1120 560 L1300 540 L1420 580 L1600 560 L1600 900 Z" fill="#06090e"/>`);
    s.add(`<path d="M1180 545 L1192 330 L1228 330 L1240 545 Z" fill="#e8e3d6"/>`);
    for (let y = 370; y < 545; y += 60) s.add(`<path d="M${f(1180 + (545 - y) * 0.03)} ${y} L${f(1240 - (545 - y) * 0.03)} ${y} L${f(1240 - (545 - y - 28) * 0.03)} ${y + 28} L${f(1180 + (545 - y - 28) * 0.03)} ${y + 28} Z" fill="#b2262b"/>`);
    s.add(`<rect x="1186" y="296" width="48" height="34" fill="#1a1d24"/><rect x="1192" y="302" width="36" height="22" fill="#fff6c9"/><path d="M1182 296 L1210 270 L1238 296 Z" fill="#1a1d24"/>`);
    s.glow(1210, 312, 120, "#fff6c9", 0.9);
    // sea
    for (let i = 0; i < 4; i++) {
      const y = 650 + i * 60;
      let d = `M0 ${y}`;
      for (let x = 0; x <= 1100; x += 25) d += ` L${x} ${f(y + Math.sin(x / 50 + i * 2) * (8 + i * 4) + s.rand(-4, 4))}`;
      s.add(`<path d="${d} L1100 ${H} L0 ${H} Z" fill="${["#1d2a38", "#16212d", "#101923", "#0a1018"][i]}"/>`);
      s.add(`<path d="${d}" fill="none" stroke="#c8d6e6" stroke-opacity="${0.3 - i * 0.05}" stroke-width="2"/>`);
    }
    const rain = [];
    for (let i = 0; i < 200; i++) {
      const x = s.rand(0, W + 200);
      const y = s.rand(0, H);
      rain.push(`<line x1="${f(x)}" y1="${f(y)}" x2="${f(x - 20)}" y2="${f(y + 50)}" stroke="#c8d6e6" stroke-opacity="${f(s.rand(0.08, 0.25))}"/>`);
    }
    s.add(`<g>${rain.join("")}</g>`);
    s.finish(0.8);
  },

  "ph-northern-drift"(s) {
    s.sky([[0, "#020812"], [0.6, "#0a2232"], [1, "#123344"]]);
    s.stars(260, 520);
    const ribbon = (y, amp, c1, c2, sd) => {
      let d = `M-100 ${y}`;
      for (let x = -100; x <= W + 100; x += 50) d += ` L${x} ${f(y + Math.sin(x / 210) * amp + Math.sin(x / 90) * amp * 0.3)}`;
      s.add(`<path d="${d}" fill="none" stroke="${s.linear([[0, c1, 0], [0.4, c1, 0.9], [1, c2, 0.4]], 0, 0, 1, 0)}" stroke-width="${f(amp * 1.4)}" filter="${s.blur(sd)}"/>`);
    };
    ribbon(220, 90, "#35ffb0", "#2fd0ff", 26);
    ribbon(300, 60, "#7bffcf", "#b46bff", 18);
    ribbon(180, 40, "#c8ffe9", "#35ffb0", 10);
    s.ridge({ y: 470, amp: 150, rough: 0.5, fill: s.linear([[0, "#dfefff"], [0.4, "#7d9ab3"], [1, "#22394f"]]) });
    s.ridge({ y: 600, amp: 80, rough: 0.55, fill: s.linear([[0, "#a9c3d9"], [1, "#1a2c3e"]]) });
    s.add(`<rect y="720" width="${W}" height="180" fill="#dbe9f5"/>`);
    s.add(`<rect y="720" width="${W}" height="180" fill="${s.linear([[0, "#5c7c99", 0.2], [1, "#0b1a28", 0.8]])}"/>`);
    const trees = [];
    for (let i = 0; i < 26; i++) trees.push(s.pine(s.rand(-20, W + 20), s.rand(730, 800), s.rand(90, 220), "#06121c"));
    s.add(`<g>${trees.join("")}</g>`);
    s.add(`<path d="M700 790 L700 750 L740 722 L780 750 L780 790 Z" fill="#0b1520"/><rect x="725" y="758" width="16" height="14" fill="#ffc46b"/>`);
    s.glow(733, 765, 70, "#ffb347", 0.6);
    s.finish(0.75);
  },

  "ph-transformers-think"(s) {
    s.sky([[0, "#030614"], [1, "#0a1438"]]);
    s.glow(900, 450, 700, "#1d3cff", 0.25);
    const layers = 6;
    const nodes = [];
    for (let l = 0; l < layers; l++) {
      const col = [];
      const count = [5, 8, 10, 10, 8, 5][l];
      for (let i = 0; i < count; i++) col.push([380 + l * 200, 450 + (i - (count - 1) / 2) * 70 + s.rand(-8, 8)]);
      nodes.push(col);
    }
    const lines = [];
    const hot = [];
    for (let l = 0; l < layers - 1; l++)
      for (const a of nodes[l])
        for (const b of nodes[l + 1]) {
          const strong = s.r() < 0.07;
          (strong ? hot : lines).push(`<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" stroke="${strong ? "#6ff6ff" : "#5a7cff"}" stroke-opacity="${strong ? 0.9 : 0.22}" stroke-width="${strong ? 2.5 : 1}"/>`);
        }
    s.add(`<g>${lines.join("")}</g><g filter="${s.blur(5)}">${hot.join("")}</g><g>${hot.join("")}</g>`);
    const dots = nodes.flat().map(([x, y]) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(s.rand(5, 10))}" fill="${s.r() < 0.3 ? "#bffcff" : "#7d93ff"}"/>`);
    s.add(`<g filter="${s.blur(8)}">${dots.join("")}</g><g>${dots.join("")}</g>`);
    s.stars(120, H, "#9fb2ff", 1.2);
    s.finish(0.8);
  },

  "ph-inside-diffusion"(s) {
    s.sky([[0, "#0c0a10"], [1, "#16121c"]]);
    const noise = [];
    for (let i = 0; i < 1400; i++) {
      const x = s.rand(0, 1000) ** 1.12;
      const y = s.rand(0, H);
      const fade = Math.max(0, 1 - x / 1000);
      noise.push(`<rect x="${f(x)}" y="${f(y)}" width="6" height="6" fill="${["#ff5aa5", "#5ad1ff", "#ffe25a", "#9a6bff", "#fff"][i % 5]}" opacity="${f(fade * s.rand(0.3, 0.9))}"/>`);
    }
    s.add(`<g>${noise.join("")}</g>`);
    s.glow(1080, 450, 420, "#ff7ac0", 0.35);
    s.add(`<circle cx="1080" cy="450" r="230" fill="${s.radial([[0, "#ffe0f0"], [0.4, "#ff6fb1"], [0.8, "#6a2bd9"], [1, "#2a1060"]], 0.35, 0.3, 0.8)}"/>`);
    s.add(`<ellipse cx="1080" cy="450" rx="360" ry="70" fill="none" stroke="#ffd7ec" stroke-opacity="0.6" stroke-width="5" transform="rotate(-16 1080 450)"/>`);
    const resolve = [];
    for (let i = 0; i < 220; i++) {
      const a = s.rand(0, Math.PI * 2);
      const d = s.rand(240, 420);
      resolve.push(`<rect x="${f(1080 + Math.cos(a) * d)}" y="${f(450 + Math.sin(a) * d)}" width="4" height="4" fill="#ffc6e3" opacity="${f(s.rand(0.2, 0.7))}"/>`);
    }
    s.add(`<g>${resolve.join("")}</g>`);
    s.finish(0.8);
  },

  "ph-orbital-mechanics"(s) {
    s.sky([[0, "#01030a"], [1, "#050b1c"]]);
    s.stars(300, H);
    s.add(`<ellipse cx="900" cy="560" rx="760" ry="200" fill="none" stroke="#7fb4ff" stroke-opacity="0.35" stroke-width="2" transform="rotate(-10 900 560)"/>`);
    s.add(`<ellipse cx="900" cy="560" rx="560" ry="140" fill="none" stroke="#7fb4ff" stroke-opacity="0.25" stroke-width="2" stroke-dasharray="6 10" transform="rotate(-10 900 560)"/>`);
    s.glow(420, 980, 640, "#3f8cff", 0.7);
    s.add(`<circle cx="420" cy="1020" r="520" fill="${s.radial([[0, "#3d7fd9"], [0.6, "#1a3f8a"], [1, "#0a1a3f"]], 0.65, 0.2, 0.9)}"/>`);
    s.add(`<circle cx="420" cy="1020" r="520" fill="${s.linear([[0, "#000", 0], [0.55, "#000", 0], [1, "#000", 0.85]], 0, 0, 1, 0.3)}"/>`);
    s.add(`<circle cx="1290" cy="230" r="62" fill="${s.radial([[0, "#e6e1d6"], [1, "#6d6a63"]], 0.35, 0.35, 0.8)}"/>`);
    s.add(`<g transform="translate(1100 470) rotate(-20)"><rect x="-10" y="-14" width="20" height="28" fill="#e8e8f0"/><rect x="-70" y="-8" width="56" height="16" fill="#3a6bd1"/><rect x="14" y="-8" width="56" height="16" fill="#3a6bd1"/></g>`);
    s.glow(1100, 470, 40, "#ffffff", 0.5);
    s.finish(0.7);
  },

  "ph-retro-horizon"(s) {
    s.sky([[0, "#12002b"], [0.5, "#4a0a5e"], [0.6, "#ff3d81"]]);
    s.stars(120, 330, "#ffd1f0");
    const sunFill = s.linear([[0, "#ffe14d"], [1, "#ff2a7a"]]);
    const cuts = [];
    for (let i = 0; i < 7; i++) cuts.push(`<rect x="560" y="${f(380 + i * 26)}" width="480" height="${f(4 + i * 2.2)}" fill="#4a0a5e"/>`);
    s.glow(800, 380, 380, "#ff4fa0", 0.7);
    s.add(`<circle cx="800" cy="380" r="210" fill="${sunFill}"/><g>${cuts.join("")}</g>`);
    s.ridge({ y: 500, amp: 70, rough: 0.5, fill: "#2a0640", extra: 'stroke="#ff4fd8" stroke-width="2" stroke-opacity="0.7"' });
    s.add(`<rect y="540" width="${W}" height="${H - 540}" fill="${s.linear([[0, "#1a0230"], [1, "#05000c"]])}"/>`);
    const g = [];
    for (let i = -24; i <= 24; i++) g.push(`<line x1="800" y1="540" x2="${800 + i * 110}" y2="${H}" stroke="#ff4fd8" stroke-width="2" stroke-opacity="0.7"/>`);
    for (let k = 1; k < 12; k++) {
      const y = 540 + (H - 540) * (k / 12) ** 2;
      g.push(`<line x1="0" y1="${f(y)}" x2="${W}" y2="${f(y)}" stroke="#ff4fd8" stroke-width="2" stroke-opacity="0.7"/>`);
    }
    s.add(`<g>${g.join("")}</g>`);
    s.fog(500, 80, "#ff4fa0", 0.45);
    s.finish(0.7);
  },

  "ph-liquid-chrome"(s) {
    s.sky([[0, "#07070b"], [1, "#121222"]]);
    const chrome = () =>
      s.linear(
        [
          [0, "#ffffff"],
          [0.25, "#8fa3c7"],
          [0.45, "#1d2236"],
          [0.6, "#c4b5ff"],
          [0.8, "#ff9bd2"],
          [1, "#2a2f4a"],
        ],
        0,
        0,
        1,
        1,
      );
    const blob = (cx, cy, r) => {
      const n = 8;
      const pts = [];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const rr = r * s.rand(0.75, 1.2);
        pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
      }
      let d = "";
      for (let i = 0; i < n; i++) {
        const p0 = pts[i];
        const p1 = pts[(i + 1) % n];
        const m = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
        d += i === 0 ? `M${f(m[0])} ${f(m[1])}` : ` Q${f(p0[0])} ${f(p0[1])} ${f(m[0])} ${f(m[1])}`;
      }
      const p0 = pts[0];
      const m0 = [(pts[n - 1][0] + p0[0]) / 2, (pts[n - 1][1] + p0[1]) / 2];
      d += ` Q${f(pts[n - 1][0])} ${f(pts[n - 1][1])} ${f(m0[0])} ${f(m0[1])} Q${f(p0[0])} ${f(p0[1])} ${f((p0[0] + pts[1][0]) / 2)} ${f((p0[1] + pts[1][1]) / 2)} Z`;
      s.add(`<path d="${d}" fill="#000" opacity="0.5" transform="translate(18 26)" filter="${s.blur(18)}"/>`);
      s.add(`<path d="${d}" fill="${chrome()}"/>`);
      s.add(`<ellipse cx="${f(cx - r * 0.3)}" cy="${f(cy - r * 0.4)}" rx="${f(r * 0.28)}" ry="${f(r * 0.12)}" fill="#fff" opacity="0.7" transform="rotate(-30 ${f(cx - r * 0.3)} ${f(cy - r * 0.4)})" filter="${s.blur(6)}"/>`);
    };
    s.glow(1050, 420, 500, "#6b4bff", 0.35);
    blob(1060, 420, 230);
    blob(760, 640, 120);
    blob(1380, 700, 90);
    blob(1340, 200, 70);
    s.finish(0.8);
  },

  "ph-low-poly-valley"(s) {
    s.sky([[0, "#2c4a7a"], [0.5, "#f29d6b"], [0.62, "#ffd29a"]]);
    s.glow(500, 470, 300, "#fff0c4", 0.9);
    const rows = 7;
    const cols = 18;
    const grid = [];
    for (let r = 0; r <= rows; r++) {
      const row = [];
      for (let c = 0; c <= cols; c++) {
        const x = (c / cols) * W + (c && c < cols ? s.rand(-30, 30) : 0);
        const peak = Math.sin((c / cols) * Math.PI * 2.2 + 0.6) * 0.5 + 0.5;
        const y = 380 + r * 75 - (rows - r) * peak * 30 + s.rand(-25, 25) + (r === 0 ? peak * -60 : 0);
        row.push([x, Math.min(y, H)]);
      }
      grid.push(row);
    }
    const tris = [];
    const shade = (t, light) => {
      const greens = [[48, 84, 70], [70, 112, 82], [104, 140, 92], [150, 168, 104]];
      const [r, g, b] = greens[Math.min(3, Math.floor(light * 4))];
      const k = 1 - t * 0.55;
      return `rgb(${Math.round(r * k)},${Math.round(g * k)},${Math.round(b * k)})`;
    };
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const a = grid[r][c], b = grid[r][c + 1], d = grid[r + 1][c], e = grid[r + 1][c + 1];
        const t = r / rows;
        tris.push(`<polygon points="${f(a[0])},${f(a[1])} ${f(b[0])},${f(b[1])} ${f(d[0])},${f(d[1])}" fill="${shade(t, s.rand(0.4, 1))}"/>`);
        tris.push(`<polygon points="${f(b[0])},${f(b[1])} ${f(e[0])},${f(e[1])} ${f(d[0])},${f(d[1])}" fill="${shade(t, s.rand(0, 0.6))}"/>`);
      }
    s.add(`<g stroke="#000" stroke-opacity="0.08">${tris.join("")}</g>`);
    s.add(`<path d="M640 900 C700 760 520 700 600 600 C660 530 760 520 800 470" fill="none" stroke="#9fe0ff" stroke-width="26" stroke-linecap="round" opacity="0.75"/>`);
    s.fog(420, 90, "#ffd9b0", 0.4);
    s.finish(0.6);
  },

  "ph-monolith"(s) {
    s.sky([[0, "#030407"], [0.65, "#16202c"], [1, "#2a2a30"]]);
    s.stars(280, 600);
    s.glow(560, 300, 380, "#c9d8ff", 0.35);
    s.add(`<circle cx="560" cy="300" r="190" fill="${s.radial([[0, "#f2f0e8"], [0.8, "#cfd1d6"], [1, "#9aa0ab"]], 0.4, 0.4, 0.8)}"/>`);
    s.add(`<g opacity="0.18" fill="#5c6270"><circle cx="500" cy="260" r="40"/><circle cx="610" cy="340" r="28"/><circle cx="590" cy="230" r="18"/></g>`);
    s.ridge({ y: 690, amp: 50, rough: 0.45, steps: 5, smooth: true, fill: s.linear([[0, "#3a3a42"], [1, "#0b0b0f"]]) });
    s.add(`<rect x="1080" y="360" width="90" height="390" fill="#020203"/><rect x="1080" y="360" width="4" height="390" fill="#9aa8c8" opacity="0.6"/>`);
    s.add(`<polygon points="1080,750 1170,750 1600,860 1600,900 1180,900" fill="#000" opacity="0.5"/>`);
    s.add(`<g fill="#020203"><circle cx="930" cy="712" r="5"/><rect x="926" y="717" width="8" height="26"/></g>`);
    s.ridge({ y: 820, amp: 30, rough: 0.4, steps: 4, smooth: true, fill: "#07070a" });
    s.finish(0.75);
  },

  "ph-paper-birds"(s) {
    s.sky([[0, "#6fb5c4"], [0.6, "#f6d6b8"], [1, "#f2b8a0"]]);
    s.glow(1250, 520, 380, "#fff4e0", 0.8);
    const cloud = (y, color, amp) => s.ridge({ y, amp, rough: 0.5, steps: 5, smooth: true, fill: color, extra: `filter="drop-shadow(0 -6px 8px rgba(0,0,0,0.12))"` });
    cloud(620, "#fbe9df", 40);
    cloud(700, "#f4d3c6", 50);
    cloud(790, "#e9b9aa", 40);
    const birds = [];
    for (let i = 0; i < 14; i++) {
      const x = 260 + i * 90 + s.rand(-30, 30);
      const y = 420 - i * 18 + s.rand(-60, 60);
      const sz = s.rand(1.2, 2.6) * (1 - i * 0.03);
      birds.push(
        `<g transform="translate(${f(x)} ${f(y)}) scale(${f(sz)}) rotate(${f(s.rand(-12, 12))})"><polygon points="0,0 -60,-38 -14,4" fill="#ffffff"/><polygon points="0,0 -14,4 -46,24" fill="#d9d0e6"/><polygon points="0,0 40,-6 -14,4" fill="#ece6f2"/><polygon points="0,0 22,-34 6,0" fill="#c9bfdc"/></g>`,
      );
    }
    s.add(`<g filter="drop-shadow(4px 8px 6px rgba(60,40,60,0.25))">${birds.join("")}</g>`);
    s.finish(0.35);
  },

  "ph-coral-drift"(s) {
    s.sky([[0, "#2bb3c8"], [0.4, "#0b5f80"], [1, "#03213a"]]);
    for (let i = 0; i < 7; i++) {
      const x = 200 + i * 220 + s.rand(-60, 60);
      s.add(`<polygon points="${f(x)},0 ${f(x + 90)},0 ${f(x - 200)},900 ${f(x - 360)},900" fill="#bff4ff" opacity="0.08" filter="${s.blur(14)}"/>`);
    }
    const fish = [];
    for (let i = 0; i < 40; i++) {
      const x = 900 + s.rand(-260, 380);
      const y = 300 + s.rand(-100, 160);
      fish.push(`<path d="M${f(x)} ${f(y)} q14 -8 28 0 l10 -7 v14 l-10 -7 q-14 8 -28 0 z" fill="#062a40" opacity="0.8"/>`);
    }
    s.add(`<g>${fish.join("")}</g>`);
    s.ridge({ y: 720, amp: 40, rough: 0.5, steps: 5, smooth: true, fill: "#0a2c3c" });
    const coral = [];
    const branch = (x, y, len, ang, depth, color) => {
      if (depth === 0) return;
      const x2 = x + Math.cos(ang) * len;
      const y2 = y + Math.sin(ang) * len;
      coral.push(`<line x1="${f(x)}" y1="${f(y)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${color}" stroke-width="${depth * 3.2}" stroke-linecap="round"/>`);
      branch(x2, y2, len * 0.74, ang - s.rand(0.25, 0.55), depth - 1, color);
      branch(x2, y2, len * 0.74, ang + s.rand(0.25, 0.55), depth - 1, color);
    };
    for (let i = 0; i < 9; i++) branch(s.rand(40, 1560), s.rand(780, 860), s.rand(60, 110), -Math.PI / 2 + s.rand(-0.2, 0.2), 6, ["#ff6f61", "#ffb347", "#ff8fb1", "#c86bff"][i % 4]);
    s.add(`<g>${coral.join("")}</g>`);
    s.particles(80, { y: [0, 700], r: [1.5, 5], colors: ["#d9fbff"] });
    s.add(`<rect y="820" width="${W}" height="80" fill="#04202e"/>`);
    s.finish(0.7);
  },

  "ph-pixel-garden"(s) {
    s.sky([[0, "#0e1022"], [1, "#1b1a38"]]);
    const px = 20;
    const cells = [];
    const flower = (cx, base, h, color) => {
      for (let y = base; y > base - h; y -= px) cells.push(`<rect x="${cx}" y="${y}" width="${px}" height="${px}" fill="#2fbf71"/>`);
      cells.push(`<rect x="${cx - px}" y="${base - h * 0.5}" width="${px}" height="${px}" fill="#46d98a"/>`);
      const top = base - h;
      for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1], [0, -2], [-2, 0], [2, 0]]) {
        cells.push(`<rect x="${cx + dx * px}" y="${top + dy * px}" width="${px}" height="${px}" fill="${color}" opacity="${Math.abs(dx) + Math.abs(dy) > 1 ? 0.75 : 1}"/>`);
      }
      cells.push(`<rect x="${cx}" y="${top}" width="${px}" height="${px}" fill="#fff3a8"/>`);
    };
    const colors = ["#ff5a8a", "#ffb84a", "#7a8bff", "#ff6bd6", "#5ae0ff"];
    for (let i = 0; i < 16; i++) {
      const cx = Math.round(s.rand(2, 78)) * px;
      flower(cx, 820, Math.round(s.rand(8, 26)) * px, colors[i % colors.length]);
    }
    s.add(`<g filter="${s.blur(12)}" opacity="0.6">${cells.join("")}</g><g>${cells.join("")}</g>`);
    s.add(`<rect y="840" width="${W}" height="60" fill="#14402a"/>`);
    for (let x = 0; x < W; x += px) s.add(`<rect x="${x}" y="${820 + (x / px) % 2 * px}" width="${px}" height="${px}" fill="#1f6b3f"/>`);
    s.stars(80, 400, "#cfd4ff", 2.4);
    s.finish(0.7);
  },
};

mkdirSync(OUT, { recursive: true });
let i = 1;
for (const [id, draw] of Object.entries(scenes)) {
  const scene = new Scene(i++ * 7919);
  draw(scene);
  const file = join(OUT, `${id.replace(/^ph-/, "")}.svg`);
  writeFileSync(file, scene.toString());
  console.log(`wrote ${file}`);
}
