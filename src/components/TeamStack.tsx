'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Lanyard, { type LanyardControl } from './Lanyard';

type Person = { slug: string; name: string; image?: string };

type Group = { title: string; blurb: string; people: Person[] };
type Card = Person & { g: number; s: number; m: number };

const MOVE = 1000; // ms for the row to slide to a new post
const EASE = 'cubic-bezier(0.45, 0, 0.2, 1)';
const RATIO = 0.711; // card width over height
const GAP = 22;
const MAX_LIVE = 12; // real 3D cards alive at once; browsers allow about sixteen WebGL scenes per page
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

type Dims = { W: number; H: number };

// Where every card goes when `selected` is the post in front. The selected post sits in the middle
// at full size and on top. Everyone else fans out behind it to both sides, nearest in the
// hierarchy first, each one further back and a little smaller. Overlap is fine.
function layout(cards: Card[], selected: number, { W, H }: Dims) {
  const wide = W >= 1024;
  const cardW = wide ? clamp(W * 0.165, 190, 380) : clamp(W * 0.36, 130, 260);
  const cardH = cardW / RATIO;
  const centerX = wide ? W * 0.62 : W * 0.5;
  const top = H * (wide ? 0.3 : 0.24);
  const focus = cards.map((c, k) => (c.g === selected ? k : -1)).filter(k => k >= 0);
  const lo = focus[0];
  const hi = focus[focus.length - 1];
  const x = new Array<number>(cards.length).fill(0);
  const dist = new Array<number>(cards.length).fill(0);
  const scale = new Array<number>(cards.length).fill(1);
  const span = (hi - lo) * (cardW + GAP);
  focus.forEach((k, i) => {
    x[k] = centerX - span / 2 + i * (cardW + GAP);
  });
  const others = cards
    .map((_, k) => k)
    .filter(k => cards[k].g !== selected)
    .sort((a, b) => Math.abs(cards[a].g - selected) - Math.abs(cards[b].g - selected) || a - b);
  const overlap = cardW * 0.6;
  const reach = [0];
  for (let d = 1; d <= others.length; d++) reach[d] = reach[d - 1] + Math.max(0.55, 1 - 0.11 * d);
  others.forEach((k, i) => {
    const side = i % 2 === 0 ? 1 : -1;
    const d = Math.floor(i / 2) + 1;
    dist[k] = d;
    scale[k] = Math.max(0.55, 1 - 0.11 * d);
    x[k] = (side === 1 ? x[hi] : x[lo]) + side * overlap * reach[d];
  });
  return { cardW, cardH, top, x, dist, scale, focus };
}

export default function TeamStack({
  eyebrow,
  groups,
  theme,
}: {
  eyebrow: string;
  groups: Group[];
  theme: { teamBackground: string[]; heroAccent: string };
}) {
  const cards = useMemo<Card[]>(
    () => groups.flatMap((group, g) => group.people.map((person, s) => ({ ...person, g, s, m: group.people.length }))),
    [groups],
  );
  const LAST = groups.length - 1;
  const sectionRef = useRef<HTMLElement>(null);
  const lockRef = useRef(false);
  const timers = useRef<number[]>([]);
  // shared mutable objects: the lanyards read them every frame, so they are created once and mutated in place
  const [controls] = useState<LanyardControl[]>(() => cards.map(() => ({ lift: 0, paused: true })));
  const [dims, setDims] = useState<Dims>({ W: 1920, H: 1000 });
  const [selected, setSelected] = useState(0); // post in front
  const [active, setActive] = useState(-1); // post whose text is showing
  const [entered, setEntered] = useState(false); // cards have dropped in
  const [mounted, setMounted] = useState<Set<number>>(new Set());
  const [ready, setReady] = useState<Set<number>>(new Set()); // cards that are fully loaded and hanging
  const readyRef = useRef(new Set<number>());
  const selRef = useRef(0);
  const dimsRef = useRef(dims);
  useEffect(() => {
    dimsRef.current = dims;
  });
  const pumpRef = useRef<() => void>(() => {});

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  useEffect(() => {
    const measure = () => setDims({ W: window.innerWidth, H: window.innerHeight });
    measure();
    window.addEventListener('resize', measure);

    // Every card is a real 3D lanyard. They are loaded strictly one at a time, nearest to the front
    // first: the next one only starts once the last is completely ready, and a card stays out of
    // sight above the screen until then, so nothing is ever seen half loaded.
    const have = new Set<number>();
    const leaving = new Set<number>();
    let pumpTimer = 0;
    const pump = () => {
      pumpTimer = 0;
      const loading = [...have].some(k => !readyRef.current.has(k) && !leaving.has(k));
      if (lockRef.current || loading) {
        pumpTimer = window.setTimeout(pump, 300);
        return;
      }
      const L = layout(cards, selRef.current, dimsRef.current);
      const want = cards
        .map((_, k) => k)
        .sort((a, b) => L.dist[a] - L.dist[b] || a - b)
        .slice(0, MAX_LIVE);
      // Cards that fall out of range are lifted back out of sight, then removed.
      [...have].forEach(k => {
        if (want.includes(k) || leaving.has(k)) return;
        leaving.add(k);
        readyRef.current.delete(k);
        setReady(new Set(readyRef.current));
        later(() => {
          have.delete(k);
          leaving.delete(k);
          setMounted(new Set(have));
          pumpRef.current();
        }, MOVE + 200);
      });
      const next = want.find(k => !have.has(k));
      if (next !== undefined && have.size < MAX_LIVE) {
        have.add(next);
        setMounted(new Set(have));
      }
      if (next !== undefined) pumpTimer = window.setTimeout(pump, 400);
    };
    pumpRef.current = () => {
      window.clearTimeout(pumpTimer);
      pumpTimer = window.setTimeout(pump, 300);
    };
    pumpTimer = window.setTimeout(pump, 200); // start right away, so the load is spread across the visit

    // The cards drop in once, when the section has fully arrived on screen.
    const section = sectionRef.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setEntered(true);
        setActive(0);
        lockRef.current = true;
        later(() => {
          lockRef.current = false;
        }, MOVE + 500);
      },
      { threshold: 0.95 }
    );
    if (section) io.observe(section);
    const pending = timers.current;
    return () => {
      window.clearTimeout(pumpTimer);
      window.removeEventListener('resize', measure);
      io.disconnect();
      pending.forEach(t => window.clearTimeout(t));
    };
  }, [cards]);

  const cardReady = (k: number) => {
    readyRef.current.add(k);
    setReady(new Set(readyRef.current));
    pumpRef.current();
  };

  // Only the front post swings; the rest hold still so the page stays smooth.
  useEffect(() => {
    selRef.current = selected;
    cards.forEach((c, k) => {
      controls[k].paused = c.g !== selected;
    });
  }, [selected, controls, cards]);

  // One move at a time: clicks are ignored until the row has settled.
  const select = (g: number) => {
    if (!entered || lockRef.current || g === selected || g < 0 || g > LAST) return;
    lockRef.current = true;
    setSelected(g);
    later(() => setActive(g), MOVE * 0.4);
    later(() => {
      lockRef.current = false;
      pumpRef.current();
    }, MOVE + 100);
  };

  const L = layout(cards, selected, dims);
  const { H } = dims;
  const f = clamp(L.top / H, 0.12, 0.42);
  const strapLength = clamp((f - 0.12) / 0.3, 0, 1);
  const size = clamp(L.cardH / H, 0.15, 0.9);
  const liveW = L.cardH * 1.1;
  const strapPx = 0.128 * H * size; // width of the band as the 3D scene draws it
  const current = groups[Math.max(0, active)];

  return (
    <section
      id="team"
      ref={sectionRef}
      className="relative isolate h-screen overflow-hidden text-ieee-cyan-25"
      style={{ background: `linear-gradient(to bottom, ${theme.teamBackground[0]} 0, ${theme.teamBackground[1]} 30%, ${theme.teamBackground[2]} 100%)` }}
    >
      <div
        className="absolute inset-0"
        style={{
          WebkitMaskImage: 'linear-gradient(to right, transparent 0, transparent 16%, #000 30%, #000 90%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 22%)',
          WebkitMaskComposite: 'source-in',
          maskImage: 'linear-gradient(to right, transparent 0, transparent 16%, #000 30%, #000 90%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 22%)',
          maskComposite: 'intersect',
        }}
      >
        {cards.map((c, k) => {
          const d = L.dist[k];
          const isFront = d === 0;
          const here = mounted.has(k);
          const shown = entered && ready.has(k);
          const drop = shown ? 0 : -H * 1.2;
          const delay = shown ? Math.min(d, 6) * 70 : 0;
          return (
            <div
              key={c.slug}
              className="absolute left-0 top-0"
              style={{
                width: liveW,
                height: H,
                pointerEvents: isFront ? 'auto' : 'none',
                transformOrigin: `50% ${L.top}px`,
                transform: `translate(${L.x[k] - liveW / 2}px, ${d * 16 + drop}px) scale(${L.scale[k]})`,
                opacity: 1,
                filter: d > 0 ? `blur(${Math.min(d, 4) * 0.9}px) brightness(${1 - Math.min(d, 4) * 0.08})` : 'none',
                zIndex: isFront ? 200 : 100 - d,
                transition: `transform ${MOVE}ms ${EASE} ${delay}ms, filter ${MOVE}ms ${EASE} ${delay}ms, z-index 0s linear ${delay + MOVE / 2}ms`,
              }}
            >
              {/* the band carries on up past the top of the layer, so shrunken cards still hang from the top of the screen */}
              {here && (
                <div
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{
                    bottom: '100%',
                    width: strapPx,
                    height: '120vh',
                    backgroundImage: 'url(/team/strap-v.svg)',
                    backgroundSize: '100% auto',
                    backgroundRepeat: 'repeat-y',
                  }}
                />
              )}
              {here && (
                <Lanyard
                  className="h-full"
                  frontImage={c.image || `/api/badge?${new URLSearchParams({ slug: c.slug, role: groups[c.g].title, name: c.name })}`}
                  backImage="/team/back.svg"
                  strapImage="/team/strap.svg"
                  cardColor={theme.teamBackground[0]}
                  finish="holographic"
                  size={size}
                  strapLength={strapLength}
                  strapWidth={0.8}
                  metal="silver"
                  breeze={0.35}
                  intro={false}
                  interactive={isFront}
                  control={controls[k]}
                  onReady={() => cardReady(k)}
                />
              )}
              {/* hit area over the card, so clicking any card brings its post to the front */}
              <div
                onClick={() => select(c.g)}
                className="absolute"
                style={{
                  left: (liveW - L.cardW) / 2,
                  top: L.top,
                  width: L.cardW,
                  height: L.cardH,
                  cursor: isFront ? 'default' : 'pointer',
                  pointerEvents: isFront ? 'none' : 'auto',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* soft blur where the straps meet the section above */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[300] h-[22vh]"
        style={{
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          WebkitMaskImage: 'linear-gradient(to bottom, #000, transparent)',
          maskImage: 'linear-gradient(to bottom, #000, transparent)',
        }}
      />

      <div
        className="pointer-events-none absolute bottom-5 left-5 z-[2000] max-w-[18rem] transition-opacity duration-700 md:bottom-10 md:left-10 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2"
        style={{ opacity: active >= 0 ? 1 : 0 }}
      >
        <p className="text-sm uppercase tracking-widest">{eyebrow}</p>
        <div key={current.title} className="team-text">
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{current.title}</h2>
          <p className="mt-3 text-sm font-semibold text-white">{current.people.map(p => p.name).join(', ')}</p>
          <p className="mt-3 text-base leading-7">{current.blurb}</p>
        </div>

        <div className="pointer-events-auto mt-5 flex flex-wrap gap-2 lg:hidden">
          {groups.map((g, i) => (
            <button
              key={g.title}
              type="button"
              aria-label={g.title}
              onClick={() => select(i)}
              className="h-8 w-8 border font-mono text-xs transition-colors"
              style={{
                borderColor: i === selected ? '#ffffff' : '#6dcff6',
                color: i === selected ? '#002855' : '#b9e5fa',
                background: i === selected ? '#ffffff' : 'transparent',
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <ol className="mt-8 hidden border-l border-ieee-cyan-50 pl-5 text-sm lg:block">
          {groups.map((g, i) => (
            <li key={g.title} className="relative">
              <span
                className="absolute -left-[25px] top-3 h-2 w-2 transition-colors duration-500"
                style={{ background: i === selected ? '#ffffff' : '#6dcff6' }}
              />
              <button
                type="button"
                onClick={() => select(i)}
                aria-current={i === selected}
                className="pointer-events-auto cursor-pointer py-1 text-left transition-all duration-500 hover:text-white hover:opacity-100"
                style={{ color: i === selected ? '#ffffff' : undefined, opacity: i === selected ? 1 : 0.5 }}
              >
                <span className="mr-3 font-mono text-xs">{String(i + 1).padStart(2, '0')}</span>
                {g.title}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
