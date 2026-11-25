import { Suspense } from "react";
import type { Metadata } from "next";
import { isAdmin, passwordConfigured } from "@/lib/auth";
import { defaultContent } from "@/lib/content";
import { readContent } from "@/lib/store";
import Editor from "./Editor";
import Login from "./Login";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

async function Gate() {
  if (!(await isAdmin())) return <Login configured={passwordConfigured()} />;
  return <Editor initial={await readContent()} defaults={defaultContent} />;
}

export default function AdminPage() {
  return (
    // fixed colors and font on purpose: editing the site theme must never restyle the admin itself
    <div
      className="min-h-screen text-[#b9e5fa]"
      style={{ background: "linear-gradient(to bottom, #002855, #00122b 45%, #000a1a)", fontFamily: "var(--font-jakarta), sans-serif" }}
    >
      <Suspense fallback={<p className="p-8 text-[#6dcff6]">Loading…</p>}>
        <Gate />
      </Suspense>
    </div>
  );
}
