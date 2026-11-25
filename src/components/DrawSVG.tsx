'use client';

import { useEffect, useRef, useState } from 'react';

const SHAPES = 'path,line,polyline,polygon,circle,ellipse,rect';
const NS = 'http://www.w3.org/2000/svg';
const PLACED = /^(circle|ellipse|rect)$/i;
const CURVED = /[ACQSTacqst]/;

export interface DrawSVGProps {
  /** URL of an SVG made of outlines (e.g. "/structures/tower.svg"). Fills are ignored. */
  src: string;
  /** How fast the pen draws a straight line, in SVG units per second. Lower is slower. */
  speed?: number;
  /** Seconds to wait before the pen starts. */
  delay?: number;
  /** Time-lapse factor for the whole session. 1 is real time, 3 is three times faster. */
  pace?: number;
  strokeWidth?: number;
  /** Colour of the drawn lines. Defaults to the surrounding text colour. */
  color?: string;
  /** Colour of the pen's selection box, anchor points and label. */
  accentColor?: string;
  className?: string;
}

type Step = {
  el: SVGGeometryElement;
  place: boolean;
  len: number;
  map: (p: { x: number; y: number }) => { x: number; y: number };
  a: { x: number; y: number };
  b: { x: number; y: number };
  bb: { x1: number; y1: number; x2: number; y2: number };
  travelAt: number;
  drawAt: number;
  drawDur: number;
  end: number;
  anchorA: SVGRectElement | null;
  anchorB: SVGRectElement | null;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const outBack = (t: number) => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const noise = (...values: number[]) => {
  let h = 2166136261;
  for (const value of values) {
    h = Math.imul(h ^ (value | 0), 16777619);
    h ^= h >>> 13;
    h = Math.imul(h, 0x5bd1e995);
    h ^= h >>> 15;
  }
  return (h >>> 0) / 4294967296;
};

const SPECKS = 48;
const FADE = 1.2;
const SIZES = [2, 3, 5, 8, 11];

const DrawSVG = ({
  src,
  speed = 320,
  delay = 0.6,
  pace = 1,
  strokeWidth = 1.5,
  color = 'currentColor',
  accentColor = '#ffffff',
  className = ''
}: DrawSVGProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [markup, setMarkup] = useState('');

  useEffect(() => {
    let off = false;
    fetch(src)
      .then(r => r.text())
      .then(t => {
        if (!off) setMarkup(t);
      })
      .catch(() => {});
    return () => {
      off = true;
    };
  }, [src]);

  useEffect(() => {
    const svg = hostRef.current?.querySelector('svg');
    if (!svg || !markup) return undefined;

    const shapes = Array.from(svg.querySelectorAll<SVGGeometryElement>(SHAPES));
    shapes.forEach(s => {
      s.style.fill = 'none';
      s.style.stroke = color;
      s.setAttribute('stroke-width', String(strokeWidth));
      s.setAttribute('stroke-linecap', 'round');
      s.setAttribute('stroke-linejoin', 'round');
    });

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;

    const vb = svg.viewBox.baseVal;
    const unit = vb.width / Math.max(1, svg.clientWidth);
    const overlay = document.createElementNS(NS, 'g');
    overlay.setAttribute('fill', accentColor);
    overlay.setAttribute('stroke', accentColor);
    svg.appendChild(overlay);

    const anchor = () => {
      const r = document.createElementNS(NS, 'rect');
      const size = 5 * unit;
      r.setAttribute('width', String(size));
      r.setAttribute('height', String(size));
      r.setAttribute('stroke', 'none');
      r.style.opacity = '0';
      overlay.appendChild(r);
      return r;
    };

    // Plan the session the way a person works: move to where the next stroke starts, drop an
    // anchor, drag the stroke out (slow in, slow out, slower on curves), pause, then go again.
    // Circles and rectangles are placed: they grow from their centre instead of being traced.
    let cursor = { x: vb.x + vb.width / 2, y: vb.y };
    let t = delay;
    const rootCTM = svg.getScreenCTM();
    const steps: Step[] = shapes.map(el => {
      const place = PLACED.test(el.tagName);
      const len = place ? 0 : el.getTotalLength();
      // Shapes may sit inside transformed groups; map their points into the svg's own space
      // so the pen and anchors line up with what is drawn.
      const elCTM = el.getScreenCTM();
      const matrix = rootCTM && elCTM ? rootCTM.inverse().multiply(elCTM) : new DOMMatrix();
      const map = (p: { x: number; y: number }) => {
        const q = new DOMPoint(p.x, p.y).matrixTransform(matrix);
        return { x: q.x, y: q.y };
      };
      const box = el.getBBox();
      const a = map(place ? { x: box.x + box.width / 2, y: box.y + box.height / 2 } : el.getPointAtLength(0));
      const b = place ? a : map(el.getPointAtLength(len));
      const curved = !place && CURVED.test(el.getAttribute('d') || '');
      const travel = Math.min(0.55, Math.max(0.15, Math.hypot(a.x - cursor.x, a.y - cursor.y) / 600));
      const corners = [
        map({ x: box.x, y: box.y }),
        map({ x: box.x + box.width, y: box.y }),
        map({ x: box.x, y: box.y + box.height }),
        map({ x: box.x + box.width, y: box.y + box.height })
      ];
      const bb = {
        x1: Math.min(...corners.map(c => c.x)),
        y1: Math.min(...corners.map(c => c.y)),
        x2: Math.max(...corners.map(c => c.x)),
        y2: Math.max(...corners.map(c => c.y))
      };
      const fast = parseFloat(el.getAttribute('data-speed') || '1') || 1;
      const drawDur = place ? 0.8 : Math.max(0.3, len / (speed * fast * (curved ? 0.55 : 1)));
      const step: Step = {
        el,
        place,
        len,
        map,
        a: { x: a.x, y: a.y },
        b: { x: b.x, y: b.y },
        bb,
        travelAt: t,
        drawAt: t + travel,
        drawDur,
        end: t + travel + drawDur + 0.14,
        anchorA: place ? null : anchor(),
        anchorB: place ? null : anchor()
      };
      t = step.end;
      cursor = step.b;
      if (place) {
        el.style.transformBox = 'fill-box';
        el.style.transformOrigin = 'center';
      } else {
        el.style.strokeDasharray = `${len} ${len}`;
      }
      return step;
    });
    const total = t;
    svg.dataset.drawSeconds = (total / pace).toFixed(1);

    const pen = document.createElementNS(NS, 'g');
    pen.style.opacity = '0';
    const box = 14 * unit;
    const handle = 4 * unit;
    const frame = document.createElementNS(NS, 'rect');
    frame.setAttribute('x', String(-box / 2));
    frame.setAttribute('y', String(-box / 2));
    frame.setAttribute('width', String(box));
    frame.setAttribute('height', String(box));
    frame.setAttribute('fill', 'none');
    frame.setAttribute('stroke-width', '1');
    frame.setAttribute('vector-effect', 'non-scaling-stroke');
    pen.appendChild(frame);
    for (const [cx, cy] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1]
    ]) {
      const h = document.createElementNS(NS, 'rect');
      h.setAttribute('x', String((cx * box) / 2 - handle / 2));
      h.setAttribute('y', String((cy * box) / 2 - handle / 2));
      h.setAttribute('width', String(handle));
      h.setAttribute('height', String(handle));
      h.setAttribute('stroke', 'none');
      pen.appendChild(h);
    }
    const label = document.createElementNS(NS, 'text');
    label.setAttribute('x', String(box / 2 + 4 * unit));
    label.setAttribute('y', String(-box / 2 - 2 * unit));
    label.setAttribute('stroke', 'none');
    label.setAttribute('font-size', String(10 * unit));
    label.setAttribute('font-family', 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace');
    pen.appendChild(label);
    overlay.appendChild(pen);

    const place = (r: SVGRectElement, p: { x: number; y: number }, opacity: number) => {
      const size = 5 * unit;
      r.setAttribute('x', String(p.x - size / 2));
      r.setAttribute('y', String(p.y - size / 2));
      r.style.opacity = String(opacity);
    };

    // Particle field: while a line is being drawn, and for a moment after, small squares blink
    // and respawn around the part of it that exists, like the selection box effect on the text.
    // One shared pool is handed to whichever lines are active.
    const prevOverflow = svg.style.overflow;
    svg.style.overflow = 'visible';
    const field = document.createElementNS(NS, 'g');
    overlay.insertBefore(field, overlay.firstChild);
    const specks = Array.from({ length: SPECKS }, () => {
      const r = document.createElementNS(NS, 'rect');
      r.style.opacity = '0';
      r.setAttribute('stroke-width', '1');
      r.setAttribute('vector-effect', 'non-scaling-stroke');
      field.appendChild(r);
      return r;
    });
    const updateField = (real: number, time: number) => {
      const active: { s: Step; i: number; a: number; drawn: number }[] = [];
      steps.forEach((s, i) => {
        if (time < s.drawAt || time > s.end + FADE) return;
        const drawn = inOut(clamp01((time - s.drawAt) / s.drawDur));
        active.push({ s, i, a: time < s.end ? 1 : clamp01(1 - (time - s.end) / FADE), drawn });
      });
      const live = active.slice(-4);
      specks.forEach((r, k) => {
        if (!live.length) {
          r.style.opacity = '0';
          return;
        }
        const { s, i, a, drawn } = live[k % live.length];
        const period = 0.5 + noise(k, 11) * 1.2;
        const t = real / period + noise(k, 17);
        const cycle = Math.floor(t);
        const life = t - cycle;
        if (life > 0.7) {
          r.style.opacity = '0';
          return;
        }
        let x: number;
        let y: number;
        const angle = noise(k, i, cycle, 6) * Math.PI * 2;
        const pick = noise(k, cycle, 2);
        const size = SIZES[pick < 0.46 ? 0 : pick < 0.7 ? 1 : pick < 0.84 ? 2 : pick < 0.94 ? 3 : 4] * unit;
        const large = size >= 8 * unit;
        const out = ((large ? 8 : 4) + Math.floor(noise(k, cycle, 1) * 5) * 3) * unit;
        if (s.place) {
          const rad = Math.max(s.bb.x2 - s.bb.x1, s.bb.y2 - s.bb.y1) / 2 + out;
          x = s.a.x + Math.cos(angle) * rad;
          y = s.a.y + Math.sin(angle) * rad;
        } else {
          const p = s.map(s.el.getPointAtLength(noise(k, i, cycle, 5) * drawn * s.len));
          x = p.x + Math.cos(angle) * out;
          y = p.y + Math.sin(angle) * out;
        }
        const tone = noise(k, cycle, 3);
        const blink = life < 0.06 || (life > 0.32 && life < 0.36) ? 0.35 : 1;
        const outline = tone < 0.26 || (large && tone < 0.78);
        r.setAttribute('x', String(x - size / 2));
        r.setAttribute('y', String(y - size / 2));
        r.setAttribute('width', String(size));
        r.setAttribute('height', String(size));
        r.setAttribute('fill', outline ? 'none' : accentColor);
        r.setAttribute('stroke', outline ? accentColor : 'none');
        r.style.opacity = String(a * (large ? 0.3 + 0.4 * tone : 0.3 + 0.6 * tone) * blink);
      });
    };

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const time = ((now - start) / 1000) * pace;
      let tip: { x: number; y: number } | null = null;
      let drawing = false;
      let from = { x: vb.x + vb.width / 2, y: vb.y };

      steps.forEach(s => {
        const u = clamp01((time - s.drawAt) / s.drawDur);
        if (s.place) {
          const k = outBack(u);
          s.el.style.transform = `scale(${Math.max(0, k)})`;
          s.el.style.opacity = String(Math.min(1, u * 5));
        } else {
          s.el.style.strokeDashoffset = `${s.len * (1 - inOut(u))}`;
        }
        if (s.anchorA) place(s.anchorA, s.a, time >= s.drawAt ? clamp01(1 - (time - s.end) / 1.2) : 0);
        if (s.anchorB) place(s.anchorB, s.b, u >= 1 ? clamp01(1 - (time - s.end) / 1.2) : 0);

        if (time >= s.travelAt && time < s.end) {
          if (time < s.drawAt) {
            const k = inOut((time - s.travelAt) / (s.drawAt - s.travelAt));
            tip = { x: mix(from.x, s.a.x, k), y: mix(from.y, s.a.y, k) };
          } else if (s.place) {
            tip = s.a;
            drawing = u < 1;
          } else {
            tip = s.map(s.el.getPointAtLength(s.len * inOut(u)));
            drawing = u < 1;
          }
        }
        from = s.b;
      });

      if (tip) {
        const p = tip as { x: number; y: number };
        pen.setAttribute('transform', `translate(${p.x} ${p.y})`);
        label.textContent = `${Math.round(p.x)}, ${Math.round(p.y)}`;
        pen.style.opacity = drawing ? '1' : '0.5';
      } else {
        pen.style.opacity = '0';
      }
      updateField((now - start) / 1000, time);
      // Once the last stroke and its particles have faded there is nothing left to animate.
      if (time < total + FADE + 0.5) raf = requestAnimationFrame(tick);
    };

    // Hold everything undrawn until the first frame.
    steps.forEach(s => {
      if (s.place) {
        s.el.style.transform = 'scale(0)';
        s.el.style.opacity = '0';
      } else {
        s.el.style.strokeDashoffset = `${s.len}`;
      }
    });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      svg.style.overflow = prevOverflow;
      overlay.remove();
    };
  }, [markup, speed, delay, pace, strokeWidth, color, accentColor]);

  return (
    <div
      ref={hostRef}
      className={className}
      role="img"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
};

export default DrawSVG;
