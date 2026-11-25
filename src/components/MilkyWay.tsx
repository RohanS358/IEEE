'use client';

import { useEffect, useRef } from 'react';

// Seeded so the sky is the same on every visit and every resize.
const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// bandH: height of the region (at the bottom of the canvas) that holds the Milky Way band; stars cover everything.
function paint(canvas: HTMLCanvasElement, w: number, h: number, bandH: number) {
  // cap the pixel count: this canvas can be several screens tall
  const dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(9e6 / (w * h)));
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const rand = rng(1957);
  const normal = () => Math.sqrt(-2 * Math.log(rand() || 1e-9)) * Math.cos(2 * Math.PI * rand());

  // sky: continues where the team section ends (#000a1a) and sinks into near-black
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#000a1a');
  sky.addColorStop(0.3, '#00050f');
  sky.addColorStop(1, '#000106');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // the galactic band: a tilted strip from lower-left to upper-right
  const angle = -Math.atan2(bandH * 0.55, w) - 0.1;
  const cx = w * 0.55;
  const cy = h - bandH * 0.5;
  const half = Math.hypot(w, bandH) * 0.62;
  const width = Math.max(90, Math.min(w, bandH) * 0.2);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const at = (u: number, v: number) => [cx + u * cos - v * sin, cy + u * sin + v * cos];
  // the band swells towards the middle, like the galactic bulge
  const swell = (u: number) => 0.55 + 0.75 * Math.exp(-((u / half) * (u / half)) * 3.2);

  ctx.globalCompositeOperation = 'lighter';
  // soft glow
  for (let i = 0; i < 70; i++) {
    const u = (rand() * 2 - 1) * half;
    const v = normal() * width * 0.45 * swell(u);
    const [x, y] = at(u, v);
    const r = width * (0.7 + rand() * 1.1) * swell(u);
    const warm = Math.abs(u) < half * 0.3 && rand() < 0.5;
    const c = warm ? '255,226,190' : rand() < 0.5 ? '140,185,255' : '170,150,255';
    const a = (warm ? 0.05 : 0.035) * swell(u);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${c},${a})`);
    g.addColorStop(1, `rgba(${c},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // stars packed into the band, thinning towards its edges
  const bandStars = Math.round(Math.min(5200, (w * bandH) / 190));
  for (let i = 0; i < bandStars; i++) {
    const u = (rand() * 2 - 1) * half;
    const v = normal() * width * 0.38 * swell(u);
    const [x, y] = at(u, v);
    if (x < 0 || x > w || y < 0 || y > h) continue;
    const tint = rand();
    ctx.fillStyle =
      tint < 0.6 ? `rgba(255,255,255,${0.15 + rand() * 0.6})` : tint < 0.85 ? `rgba(190,215,255,${0.2 + rand() * 0.5})` : `rgba(255,225,190,${0.2 + rand() * 0.5})`;
    const s = rand() < 0.04 ? 1.3 : 0.4 + rand() * 0.6;
    ctx.fillRect(x, y, s, s);
  }

  // scattered field stars: rich around the band, very sparse in the area above it
  const topH = Math.max(0, h - bandH);
  const field = Math.round((w * bandH) / 2600 + (w * topH) / 22000);
  for (let i = 0; i < field; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const calm = y < topH - 80; // above the band region
    const bright = !calm && rand() < 0.06;
    ctx.fillStyle = `rgba(255,255,255,${bright ? 0.9 : calm ? 0.15 + rand() * 0.3 : 0.25 + rand() * 0.45})`;
    const s = bright ? 1.4 + rand() * 0.8 : 0.5 + rand() * 0.5;
    ctx.beginPath();
    ctx.arc(x, y, s / 2 + 0.3, 0, Math.PI * 2);
    ctx.fill();
    if (bright) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, 7);
      g.addColorStop(0, 'rgba(180,215,255,0.25)');
      g.addColorStop(1, 'rgba(180,215,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - 7, y - 7, 14, 14);
    }
  }

  // dark dust lanes cutting along the band
  ctx.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 26; i++) {
    const u = (rand() * 2 - 1) * half * 0.9;
    const v = (rand() - 0.5) * width * 0.35 * swell(u);
    const [x, y] = at(u, v);
    const rx = width * (0.5 + rand() * 0.9);
    const ry = width * (0.07 + rand() * 0.14);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + (rand() - 0.5) * 0.25);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, 'rgba(0,3,10,0.38)');
    g.addColorStop(1, 'rgba(0,3,10,0)');
    ctx.scale(1, ry / rx);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/** A painted night sky. Fills its (positioned) parent; the Milky Way band sits in the area of the element `bandId`, at the bottom. */
export default function MilkyWay({ bandId, className = '' }: { bandId?: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return undefined;
    const draw = () => {
      const w = Math.max(1, parent.clientWidth);
      const h = Math.max(1, parent.clientHeight);
      const band = bandId ? document.getElementById(bandId)?.offsetHeight : undefined;
      paint(canvas, w, h, Math.min(h, band || h));
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [bandId]);

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
