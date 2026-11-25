'use client';

import { useState, type FormEvent } from 'react';
import Grainient from './Grainient';

const subjects = ['Membership', 'Collaboration', 'Hosting an event', 'Something else'];
const MAX = 1000;
const label = 'block text-xs font-semibold uppercase tracking-wider text-ieee-cyan-25';
// solid, clearly visible fields on the blue card
const field =
  'mt-2 w-full rounded-2xl border border-ieee-cyan-50/30 bg-[#001a3a]/70 px-5 py-4 text-lg text-white backdrop-blur-md placeholder:text-ieee-cyan-50/50 outline-none transition-colors hover:border-ieee-cyan-50/60 focus:border-ieee-cyan focus:ring-2 focus:ring-ieee-cyan/30';

type Status = { kind: 'idle' | 'sending' | 'sent' | 'error'; text?: string };

export default function ContactForm({ email }: { email: string }) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [count, setCount] = useState(0);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const body = Object.fromEntries(new FormData(form));
    setStatus({ kind: 'sending' });
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        form.reset();
        setCount(0);
        setStatus({ kind: 'sent', text: 'Message sent. Thank you! We will reply to you by email.' });
      } else if (json.error === 'not-configured') {
        // mail delivery isn't set up on the server: hand the message to the visitor's own mail app
        const text = `${body.message}\n\n— ${body.name} (${body.email})`;
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(String(body.subject))}&body=${encodeURIComponent(text)}`;
        setStatus({ kind: 'sent', text: 'Your mail app should open with the message ready to send.' });
      } else {
        setStatus({ kind: 'error', text: json.error || 'Something went wrong. Please try again.' });
      }
    } catch {
      setStatus({ kind: 'error', text: 'Could not reach the server. Please check your connection and try again.' });
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative isolate overflow-hidden rounded-[2rem] border border-ieee-cyan-50/30 bg-gradient-to-br from-ieee-dark-blue to-ieee-blue shadow-2xl shadow-black/60"
    >
      {/* animated grainy gradient in the site's blues; the plain gradient above shows if WebGL is unavailable */}
      <Grainient
        className="absolute! inset-0 -z-10"
        colors={['#001a3a', '#002855', '#00629b', '#00b5e2']}
        angle={55}
        flow={0.8}
        silk={0.3}
        grainAmount={0.1}
        speed={0.8}
        contrast={1.05}
      />
      <div className="relative grid gap-7 p-6 sm:p-10 md:p-12">
      <div>
        <h3 className="text-3xl font-semibold text-white">Send us a message</h3>
        <p className="mt-2 text-ieee-cyan-25">It goes straight to the executive committee.</p>
      </div>

      <div className="grid gap-7 sm:grid-cols-2">
        <label>
          <span className={label}>Name</span>
          <input name="name" required maxLength={100} autoComplete="name" placeholder="Your name" className={field} />
        </label>
        <label>
          <span className={label}>Email</span>
          <input name="email" type="email" required maxLength={200} autoComplete="email" placeholder="you@example.com" className={field} />
        </label>
      </div>

      <fieldset>
        <legend className={label}>What is this about?</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {subjects.map((s, i) => (
            <label key={s} className="cursor-pointer">
              <input type="radio" name="subject" value={s} defaultChecked={i === 0} className="peer sr-only" />
              <span className="block rounded-full border border-ieee-cyan-50/40 bg-black/15 px-5 py-2.5 text-sm text-ieee-cyan-25 backdrop-blur-sm transition-colors hover:bg-ieee-cyan-25/15 peer-checked:border-white peer-checked:bg-white peer-checked:font-semibold peer-checked:text-ieee-dark-blue peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ieee-cyan">
                {s}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label>
        <span className="flex items-baseline justify-between">
          <span className={label}>Message</span>
          <span className="text-xs text-ieee-cyan-50/70" aria-hidden="true">{count}/{MAX}</span>
        </span>
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={MAX}
          rows={6}
          onChange={(e) => setCount(e.target.value.length)}
          placeholder="Tell us a little about what you have in mind…"
          className={`${field} resize-y`}
        />
      </label>

      {/* honeypot: hidden from people, tempting to bots */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <button
        type="submit"
        disabled={status.kind === 'sending'}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-ieee-dark-blue transition-colors hover:bg-ieee-cyan-25 disabled:opacity-60"
      >
        {status.kind === 'sending' ? 'Sending…' : 'Send message'}
        {status.kind !== 'sending' && <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>}
      </button>

      <p
        role="status"
        aria-live="polite"
        className={
          status.text
            ? `rounded-2xl border px-5 py-4 text-sm ${
                status.kind === 'error'
                  ? 'border-red-300/50 bg-red-400/10 text-red-200'
                  : 'border-ieee-bright-green/50 bg-ieee-bright-green/10 text-white'
              }`
            : 'sr-only'
        }
      >
        {status.text}
      </p>
      </div>
    </form>
  );
}
