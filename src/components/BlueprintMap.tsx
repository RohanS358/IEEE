'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

type Poly = [number, number[]];
type MapData = {
  roads: Poly[];
  buildings: Poly[];
  campus: Poly[];
  water: number[][];
};

export interface BlueprintMapProps {
  /** Heading of the callout that points at the college. */
  title: string;
  subtitle?: string;
  stats: { label: string; value: string }[];
  className?: string;
}

// The map is centred on the college (the origin), and fades to nothing at RADIUS metres.
const CENTER = { x: 0, y: 0 };
const RADIUS = 1900;
const ROAD_TONE = [1, 0.85, 0.6, 0.4, 0.3];

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const fade = (x: number, y: number) => 1 - smooth(RADIUS * 0.2, RADIUS, Math.hypot(x - CENTER.x, y - CENTER.y));

class Lines {
  pos: number[] = [];
  col: number[] = [];
  push(x1: number, h1: number, y1: number, x2: number, h2: number, y2: number, c: THREE.Color, k: number) {
    this.pos.push(x1, h1, -y1, x2, h2, -y2);
    this.col.push(c.r * k, c.g * k, c.b * k, c.r * k, c.g * k, c.b * k);
  }
  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    return new THREE.LineSegments(g, new THREE.LineBasicMaterial({ vertexColors: true }));
  }
}

const BlueprintMap = ({ title, subtitle, stats, className = '' }: BlueprintMapProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGLineElement>(null);
  const dotRef = useRef<SVGRectElement>(null);
  const [data, setData] = useState<MapData | null>(null);

  useEffect(() => {
    let off = false;
    fetch('/data/bhaktapur.json')
      .then(r => r.json())
      .then(d => {
        if (!off) setData(d);
      })
      .catch(() => {});
    return () => {
      off = true;
    };
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !data) return undefined;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return undefined;
    }
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;display:block';
    host.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 50, 9000);
    const target = new THREE.Vector3(CENTER.x, 0, -CENTER.y);
    camera.position.set(target.x, 1900, target.z + 1900);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(target);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.minPolarAngle = 0.55;
    controls.maxPolarAngle = 1.3;
    controls.autoRotate = !reduce;
    controls.autoRotateSpeed = 0.25;
    controls.update();
    renderer.domElement.style.touchAction = 'pan-y';

    const cWater = new THREE.Color('#00b5e2');
    const cRoad = new THREE.Color('#6dcff6');
    const cBuilding = new THREE.Color('#477ca7');
    const cGrid = new THREE.Color('#00629b');
    const cWhite = new THREE.Color('#ffffff');

    // Ground: a blueprint grid clipped to the circle, plus range rings and ticks.
    const grid = new Lines();
    const step = 100;
    const sub = 25;
    for (let i = -20; i <= 20; i++) {
      for (const axis of [0, 1]) {
        for (let s = -RADIUS; s < RADIUS; s += sub) {
          const a = axis ? [CENTER.x + s, CENTER.y + i * step] : [CENTER.x + i * step, CENTER.y + s];
          const b = axis ? [a[0] + sub, a[1]] : [a[0], a[1] + sub];
          const k = Math.min(fade(a[0], a[1]), fade(b[0], b[1])) * 0.4;
          if (k > 0.02) grid.push(a[0], 0, a[1], b[0], 0, b[1], cGrid, k);
        }
      }
    }
    for (const radius of [500, 1000, 1500]) {
      for (let a = 0; a < 360; a += 2) {
        const r1 = (a * Math.PI) / 180;
        const r2 = ((a + 2) * Math.PI) / 180;
        grid.push(
          CENTER.x + Math.cos(r1) * radius,
          0,
          CENTER.y + Math.sin(r1) * radius,
          CENTER.x + Math.cos(r2) * radius,
          0,
          CENTER.y + Math.sin(r2) * radius,
          cRoad,
          0.3 * fade(CENTER.x + Math.cos(r1) * radius, CENTER.y + Math.sin(r1) * radius)
        );
      }
    }
    scene.add(grid.build());

    const water = new Lines();
    data.water.forEach(w => {
      for (let i = 0; i + 3 < w.length; i += 2) {
        const k = Math.min(fade(w[i], w[i + 1]), fade(w[i + 2], w[i + 3]));
        if (k > 0.02) water.push(w[i], 0, w[i + 1], w[i + 2], 0, w[i + 3], cWater, k * 0.9);
      }
    });
    scene.add(water.build());

    const roads = new Lines();
    data.roads.forEach(([cls, p]) => {
      for (let i = 0; i + 3 < p.length; i += 2) {
        const k = Math.min(fade(p[i], p[i + 1]), fade(p[i + 2], p[i + 3])) * ROAD_TONE[cls];
        if (k > 0.02) roads.push(p[i], 0, p[i + 1], p[i + 2], 0, p[i + 3], cRoad, k);
      }
    });
    scene.add(roads.build());

    // Buildings: roof outline plus corner posts, so each one reads as a wireframe block.
    const blocks = new Lines();
    data.buildings.forEach(([h, p]) => {
      const n = p.length / 2;
      let cx = 0;
      let cy = 0;
      for (let i = 0; i < p.length; i += 2) {
        cx += p[i];
        cy += p[i + 1];
      }
      const k = fade(cx / n, cy / n);
      if (k < 0.03) return;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        blocks.push(p[i * 2], h, p[i * 2 + 1], p[j * 2], h, p[j * 2 + 1], cBuilding, k * 0.9);
        if (n <= 10) blocks.push(p[i * 2], 0, p[i * 2 + 1], p[i * 2], h, p[i * 2 + 1], cBuilding, k * 0.5);
      }
    });
    scene.add(blocks.build());

    // The college campus: lit white blocks, with a beacon and a pulsing ring.
    const disposables: { dispose: () => void }[] = [];
    data.campus.forEach(([h, p]) => {
      const shape = new THREE.Shape();
      for (let i = 0; i < p.length; i += 2) {
        if (i === 0) shape.moveTo(p[i], p[i + 1]);
        else shape.lineTo(p[i], p[i + 1]);
      }
      const geo = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false });
      geo.rotateX(-Math.PI / 2);
      const fill = new THREE.Mesh(
        geo,
        new THREE.MeshBasicMaterial({ color: cWhite, transparent: true, opacity: 0.16, depthWrite: false })
      );
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: cWhite }));
      scene.add(fill, edges);
      disposables.push(geo, fill.material, edges.geometry, edges.material);
    });
    const ANCHOR_H = 190;
    const beacon = new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, ANCHOR_H, 0)]),
      new THREE.LineBasicMaterial({ color: cWhite })
    );
    scene.add(beacon);
    const ringPoints: THREE.Vector3[] = [];
    for (let a = 0; a <= 64; a++) {
      const r = (a / 64) * Math.PI * 2;
      ringPoints.push(new THREE.Vector3(Math.cos(r) * 40, 0.5, Math.sin(r) * 40));
    }
    const ring = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(ringPoints),
      new THREE.LineBasicMaterial({ color: cWhite, transparent: true })
    );
    scene.add(ring);
    disposables.push(beacon.geometry, beacon.material, ring.geometry, ring.material);
    scene.traverse(o => {
      const m = o as THREE.LineSegments;
      if (m.isLineSegments && m.geometry && m.material) disposables.push(m.geometry, m.material as THREE.Material);
    });

    const resize = () => {
      const w = Math.max(1, host.clientWidth);
      const h = Math.max(1, host.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // On wide screens the text takes the right 30%, so slide the view to keep the college
      // in the middle of the remaining 70%, and fade the map out around that point.
      const shift = w >= 1024 ? 0.15 : 0;
      camera.setViewOffset(w, h, w * shift, 0, w, h);
      const mask = `radial-gradient(ellipse 62% 78% at ${50 - shift * 100}% 52%, #000 50%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 22%, #000 78%, transparent 100%)`;
      renderer.domElement.style.setProperty('-webkit-mask-image', mask);
      renderer.domElement.style.setProperty('-webkit-mask-composite', 'source-in');
      renderer.domElement.style.setProperty('mask-image', mask);
      renderer.domElement.style.setProperty('mask-composite', 'intersect');
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(host);

    const fadeIn = () => {
      const top = host.getBoundingClientRect().top;
      const p = Math.min(1, Math.max(0, (window.innerHeight - top) / (window.innerHeight * 0.75)));
      host.style.opacity = String(p * p * (3 - 2 * p));
    };
    fadeIn();
    window.addEventListener('scroll', fadeIn, { passive: true });
    window.addEventListener('resize', fadeIn);

    const anchor = new THREE.Vector3(0, ANCHOR_H, 0);
    const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      controls.update();
      const phase = ((now - t0) / 1800) % 1;
      ring.scale.setScalar(1 + phase * 2.6);
      (ring.material as THREE.LineBasicMaterial).opacity = 1 - phase;
      renderer.render(scene, camera);

      // Callout: the card stays put; its leader line follows the college around the screen.
      const card = cardRef.current;
      const line = lineRef.current;
      const dot = dotRef.current;
      if (!card || !line || !dot) return;
      const p = anchor.clone().project(camera);
      const ax = ((p.x + 1) / 2) * host.clientWidth;
      const ay = ((1 - p.y) / 2) * host.clientHeight;
      const cl = card.offsetLeft;
      const ct = card.offsetTop;
      const cr = cl + card.offsetWidth;
      const cb = ct + card.offsetHeight;
      const sx = clamp(ax, cl, cr);
      const sy = clamp(ay, ct, cb);
      const inside = ax >= cl && ax <= cr && ay >= ct && ay <= cb;
      line.setAttribute('x1', String(sx));
      line.setAttribute('y1', String(sy));
      line.setAttribute('x2', String(ax));
      line.setAttribute('y2', String(ay));
      line.style.opacity = inside ? '0' : '1';
      dot.setAttribute('x', String(ax - 3));
      dot.setAttribute('y', String(ay - 3));
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', fadeIn);
      window.removeEventListener('resize', fadeIn);
      ro.disconnect();
      io.disconnect();
      controls.dispose();
      disposables.forEach(d => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [data]);

  return (
    <div ref={hostRef} className={`overflow-hidden ${className}`} role="img" aria-label="Rotating blueprint map of Bhaktapur city">
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <line ref={lineRef} stroke="#ffffff" strokeWidth="1" />
        <rect ref={dotRef} width="6" height="6" fill="#ffffff" />
      </svg>

      <div
        ref={cardRef}
        className="absolute left-5 top-28 w-64 border md:left-10 border-white bg-ieee-dark-blue/70 p-4 text-ieee-cyan-25 backdrop-blur-sm"
      >
        <p className="text-sm font-semibold text-white">{title}</p>
        {subtitle && <p className="mt-0.5 text-xs">{subtitle}</p>}
        <dl className="mt-3 grid grid-cols-2 gap-3">
          {stats.map(s => (
            <div key={s.label}>
              <dt className="text-[11px] uppercase tracking-wider">{s.label}</dt>
              <dd className="text-xl font-semibold text-white">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <p className="absolute bottom-5 left-5 bg-ieee-dark-blue/70 md:left-10 px-2 py-1 font-mono text-[10px] leading-4 text-ieee-cyan-50">
        BHAKTAPUR, 27.671 N 85.440 E
        <br />
        Map data © OpenStreetMap contributors
      </p>
    </div>
  );
};

export default BlueprintMap;
