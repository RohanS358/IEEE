import DeepenOnScroll from "./DeepenOnScroll";
import DrawSVG from "./DrawSVG";
import GradientASCII from "./GradientASCII";
import TechText from "./TechText";
import type { SiteContent } from "@/lib/content";

export default function HeroSection({ hero, theme }: { hero: SiteContent["hero"]; theme: SiteContent["theme"] }) {
  const slogan = hero.slogan;
  return (
    <>
  <DeepenOnScroll>
    <GradientASCII colors={theme.heroGradient} />
  </DeepenOnScroll>

  <section className="flex min-h-screen items-end justify-between gap-10 px-5 pt-24 pb-5 md:px-10 md:pb-10">
    <div className="max-w-2xl shrink-0">
      <h1 aria-label={slogan.join(" ")} className="-ml-[5%] w-[calc(100%+5%)] text-ieee-cyan-25">
        {slogan.map((line) => (
          <div key={line} className="h-24 sm:h-28">
            <TechText
              text={line}
              align="left"
              fontSize={96}
              fontWeight={700}
              accentColor={theme.heroAccent}
              sweep={false}
            />
          </div>
        ))}
      </h1>

      <div className="mt-6 space-y-5 text-base leading-7 text-ieee-cyan-25 sm:text-lg">
        {hero.paragraphs.map((t, i) => (
          <p key={i}>{t}</p>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
        <a
          href={hero.primaryButton.href}
          className="rounded-full bg-white px-6 py-3 text-ieee-dark-blue transition-colors hover:bg-ieee-cyan-25"
        >
          {hero.primaryButton.label}
        </a>
        <a
          href={hero.secondaryButton.href}
          className="rounded-full border border-ieee-cyan-50 px-6 py-3 text-ieee-cyan-25 transition-colors hover:bg-ieee-cyan-25/15"
        >
          {hero.secondaryButton.label}
        </a>
      </div>
    </div>

    <div className="hidden min-w-0 max-w-[900px] flex-1 text-ieee-cyan-25 xl:block">
      <DrawSVG src={hero.art} pace={2.5} className="[&>svg]:h-auto [&>svg]:w-full" />
    </div>
  </section>
    </>
  );
}
