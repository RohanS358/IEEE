"use client";
// Rendered inside the editor's iframe. Receives the unsaved draft via postMessage and renders the site's own
// components with it, so what you see is exactly what the live site will show once saved.
import { useEffect, useState, type ReactNode } from "react";
import AboutSection from "@/components/AboutSection";
import BlogSection from "@/components/BlogSection";
import ContactFooter from "@/components/ContactFooter";
import EventsSection from "@/components/EventsSection";
import HeroSection from "@/components/HeroSection";
import MilkyWay from "@/components/MilkyWay";
import Navbar from "@/components/Navbar";
import TeamStack from "@/components/TeamStack";
import type { SiteContent } from "@/lib/content";
import { themeCss } from "@/lib/theme";

type Draft = { content: SiteContent; section: string };

const Sky = ({ children }: { children: ReactNode }) => (
  <div className="relative">
    <MilkyWay bandId="contact" />
    {children}
  </div>
);

function Section({ content: c, section }: Draft) {
  const { theme, nav } = c;
  switch (section) {
    case "seo":
      return (
        <div className="space-y-4 p-6">
          <p className="text-xs uppercase tracking-wider text-ieee-cyan-50">Search result</p>
          <div className="max-w-xl rounded-xl bg-white p-5 font-sans text-[#202124]">
            <p className="text-sm text-[#4d5156]">yoursite.com</p>
            <p className="mt-1 text-xl text-[#1a0dab]">{c.seo.title}</p>
            <p className="mt-1 text-sm leading-6 text-[#4d5156]">{c.seo.description}</p>
          </div>
        </div>
      );
    case "theme":
      return (
        <>
          <HeroSection hero={c.hero} theme={theme} />
          <div className="relative grid grid-cols-3 gap-2 p-6 sm:grid-cols-6">
            {Object.entries(theme.colors).map(([k, v]) => (
              <div key={k} className="text-[10px] leading-4 text-white">
                <div className="h-10 rounded-lg border border-white/20" style={{ background: v }} />
                <p className="mt-1 truncate">{k.replace("ieee-", "")}</p>
              </div>
            ))}
          </div>
        </>
      );
    case "nav":
      return (
        <>
          <Navbar nav={nav} theme={theme} />
          <p className="px-10 pt-32 text-sm text-ieee-cyan-50">Page content continues here…</p>
        </>
      );
    case "hero":
      return <HeroSection hero={c.hero} theme={theme} />;
    case "about":
      return <AboutSection about={c.about} />;
    case "team":
      return <TeamStack key={c.team.groups.map((g) => g.people.length).join()} eyebrow={c.team.eyebrow} groups={c.team.groups} theme={theme} />;
    case "events":
      return <Sky><EventsSection heading={c.events.heading} intro={c.events.intro} items={c.events.items} labelColor={theme.eventsLabelColor} /></Sky>;
    case "blogs":
      return <Sky><BlogSection heading={c.blogs.heading} intro={c.blogs.intro} items={c.blogs.items} /></Sky>;
    case "contact":
      return <Sky><ContactFooter contact={c.contact} logo={nav.logo} /></Sky>;
    default:
      return null;
  }
}

export default function PreviewClient() {
  const [draft, setDraft] = useState<Draft | null>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin === location.origin && e.source === parent && e.data?.type === "preview") setDraft(e.data as Draft);
    };
    window.addEventListener("message", onMessage);
    parent.postMessage({ type: "ready" }, location.origin); // ask the editor for the current draft
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!draft) return <p className="p-6 text-sm text-ieee-cyan-50">Loading preview…</p>;
  return (
    // links must not navigate away inside the preview
    <main className="relative min-h-screen flex-1" onClickCapture={(e) => (e.target as HTMLElement).closest("a") && e.preventDefault()}>
      <style>{themeCss(draft.content.theme)}</style>
      <Section {...draft} />
    </main>
  );
}
