"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { login } from "./actions";

const field =
  "mt-2 w-full rounded-2xl border border-[#6dcff6]/30 bg-[#001a3a]/70 px-5 py-3.5 text-base text-white placeholder:text-[#6dcff6]/50 outline-none transition-colors hover:border-[#6dcff6]/60 focus:border-[#00b5e2] focus:ring-2 focus:ring-[#00b5e2]/30";

export default function Login({ configured }: { configured: boolean }) {
  const [error, action, pending] = useActionState(login, "");
  const [show, setShow] = useState(false);
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <form action={action} className="w-full max-w-md rounded-3xl border border-[#6dcff6]/20 bg-[#001a3a]/60 p-8 shadow-2xl shadow-black/30 backdrop-blur-md sm:p-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-banner-white.png" alt="IEEE Student Branch" className="h-7 w-auto" />
        <h1 className="mt-8 text-3xl font-semibold tracking-tight text-white">Admin sign in</h1>
        <p className="mt-2 text-sm leading-6">Edit every word, color and image on the website.</p>

        {!configured && (
          <p className="mt-6 rounded-2xl border border-[#ffa300]/50 bg-[#ffa300]/10 px-4 py-3 text-sm leading-6 text-[#ffc72c]">
            ADMIN_PASSWORD is not set on this server, so nobody can sign in. Add it in your Vercel environment variables and redeploy.
          </p>
        )}

        <label className="mt-8 block text-xs font-semibold uppercase tracking-wider text-[#00b5e2]">
          Username
          <input name="username" autoComplete="username" autoFocus required className={field + " normal-case tracking-normal"} />
        </label>
        <label className="mt-5 block text-xs font-semibold uppercase tracking-wider text-[#00b5e2]">
          Password
          <span className="relative block">
            <input
              name="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              required
              className={field + " pr-20 normal-case tracking-normal"}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-4 top-1/2 mt-1 -translate-y-1/2 text-xs font-semibold normal-case tracking-normal text-[#6dcff6] hover:text-white"
            >
              {show ? "Hide" : "Show"}
            </button>
          </span>
        </label>

        {error && <p role="alert" className="mt-4 text-sm text-[#ff8a9b]">{error}</p>}
        <button
          disabled={pending}
          className="mt-8 w-full rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#002855] transition-colors hover:bg-[#b9e5fa] disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
        <Link href="/" className="mt-5 block text-center text-sm text-[#6dcff6] transition-colors hover:text-white">← Back to the website</Link>
      </form>
    </main>
  );
}
