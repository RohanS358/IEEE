'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import CircularGallery from './CircularGallery';
import FlexCarousel from './FlexCarousel';
import EventModal from './EventModal';
import ImageTrail from './ImageTrail';
import Reveal from './Reveal';
import type { EventItem } from '@/data/events';

export default function EventsSection({
  heading,
  intro,
  items: events,
  labelColor,
}: {
  heading: string;
  intro: string;
  items: EventItem[];
  labelColor: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const gl = useSyncExternalStore(
    () => () => {},
    () => !!document.createElement('canvas').getContext('webgl2'),
    () => true,
  );
  const small = useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia('(max-width: 767px)');
      mq.addEventListener('change', notify);
      return () => mq.removeEventListener('change', notify);
    },
    () => window.matchMedia('(max-width: 767px)').matches,
    () => false,
  );
  const event = open === null ? null : events[open];

  useEffect(() => {
    if (open === null) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      else if (e.key === 'ArrowRight') setOpen((i) => (i === null ? i : (i + 1) % events.length));
      else if (e.key === 'ArrowLeft') setOpen((i) => (i === null ? i : (i - 1 + events.length) % events.length));
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, events.length]);

  return (
    <section id="events" className="relative flex min-h-screen flex-col px-5 pt-28 pb-10 text-ieee-cyan-25 md:px-10">
      {/* the heading sits just above the cards: cards fill the middle of this box, so anchor to their top edge */}
      <div className="relative z-10 mt-auto -mx-5 h-[85vh] min-h-[640px] md:-mx-10">
        <div
          className="pointer-events-none absolute left-5 max-w-2xl md:left-10"
          style={{ bottom: small ? 'calc(74% + 1rem)' : 'calc(75% + 1.25rem)' }}
        >
          <Reveal>
            <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">{heading}</h2>
          </Reveal>
          <Reveal as="p" delay={150} className="mt-4 text-base leading-7">
            {intro}
          </Reveal>
        </div>

        {!gl ? (
          <ul className="grid gap-4 px-5 pt-[30%] md:px-10 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e, i) => (
              <li key={e.src}>
                <button type="button" onClick={() => setOpen(i)} className="group block w-full text-left">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={e.src} alt={e.alt ?? e.title} className="aspect-[4/3] w-full object-cover" />
                  <span className="mt-2 block font-semibold text-white group-hover:text-ieee-cyan">{e.title}</span>
                  <span className="block text-sm">{e.subtitle}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : small ? (
          <CircularGallery
            items={events.map((e) => ({
              image: e.src,
              text: e.title,
              alt: e.alt,
              description: `${e.date} · ${e.venue}. ${e.description.replace(/\s*\n+\s*/g, ' ')}`,
            }))}
            font='bold 30px var(--font-active, var(--font-jakarta)), sans-serif'
            itemSize={0.8}
            textColor={labelColor}
            bend={2}
          />
        ) : (
          <div className="absolute inset-0">
            <FlexCarousel
              items={events}
              preset="vortex"
              fit="landscape"
              cardHeight={0.5}
              gap={20}
              className="flex-carousel--fade"
              focusOnClick={false}
              onSelect={(i) => setOpen(i)}
            />
          </div>
        )}
      </div>

      {open === null && !small && (
        <div className="pointer-events-none absolute inset-0 z-20">
          <ImageTrail
            items={events.map((e) => e.src)}
            size={170}
            aspectRatio={1.25}
            radius={10}
            threshold={90}
            lifetime={0.35}
            appearScale={0.6}
            zoom={1.3}
            drift={0.5}
            rotation={8}
            sizeVariance={0.3}
          />
        </div>
      )}

      {event && open !== null && (
        <EventModal
          event={event}
          index={open}
          total={events.length}
          prevTitle={events[(open - 1 + events.length) % events.length].title ?? ''}
          nextTitle={events[(open + 1) % events.length].title ?? ''}
          onClose={() => setOpen(null)}
          onStep={(d) => setOpen((i) => (i === null ? i : (i + d + events.length) % events.length))}
        />
      )}
    </section>
  );
}
