'use client';

import type { EventItem } from '@/data/events';

// Flat on purpose: solid fills, hairline rules, no blur, shadows or gradients.
const label = 'text-xs font-semibold uppercase tracking-widest text-ieee-cyan';

export default function EventModal({
  event,
  index,
  total,
  prevTitle,
  nextTitle,
  onClose,
  onStep,
}: {
  event: EventItem;
  index: number;
  total: number;
  prevTitle: string;
  nextTitle: string;
  onClose: () => void;
  onStep: (delta: number) => void;
}) {
  const paragraphs = event.description.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="events-fade fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-6" onClick={onClose}>
      <article
        role="dialog"
        aria-modal="true"
        aria-label={event.title}
        onClick={(e) => e.stopPropagation()}
        className="events-pop flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-ieee-dark-blue font-sans text-white md:flex-row"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.src}
          alt={event.alt ?? event.title}
          className="h-52 w-full shrink-0 object-cover md:h-auto md:w-[42%]"
        />

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-white/15 px-6 py-4 md:px-10">
            <p className={`${label} tabular-nums`}>
              Event {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="-mr-2 flex items-center gap-2 px-2 py-1 text-sm font-semibold text-white transition-colors hover:text-ieee-cyan"
            >
              Close
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8 md:px-10">
            <h3 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{event.title}</h3>
            {event.subtitle && <p className="mt-2 text-lg text-ieee-cyan-25">{event.subtitle}</p>}

            <dl className="mt-7 grid gap-5 border-y border-white/15 py-5 sm:grid-cols-2">
              <div>
                <dt className={label}>Date</dt>
                <dd className="mt-1.5 font-semibold">{event.date}</dd>
              </div>
              <div>
                <dt className={label}>Venue</dt>
                <dd className="mt-1.5 font-semibold">{event.venue}</dd>
              </div>
            </dl>

            <div className="mt-7 space-y-5 text-[17px] leading-8 text-white">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 border-t border-white/15">
            <button
              type="button"
              onClick={() => onStep(-1)}
              className="px-6 py-4 text-left transition-colors hover:bg-white/10 md:px-10"
            >
              <span className={label}>← Previous</span>
              <span className="mt-1 block truncate font-semibold">{prevTitle}</span>
            </button>
            <button
              type="button"
              onClick={() => onStep(1)}
              className="border-l border-white/15 px-6 py-4 text-right transition-colors hover:bg-white/10 md:px-10"
            >
              <span className={label}>Next →</span>
              <span className="mt-1 block truncate font-semibold">{nextTitle}</span>
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
