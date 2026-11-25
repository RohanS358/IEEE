import BlueprintMap from "./BlueprintMap";
import Reveal from "./Reveal";
import type { SiteContent } from "@/lib/content";

export default function AboutSection({ about }: { about: SiteContent["about"] }) {
  return (
  <section id="about" className="relative min-h-screen overflow-hidden text-ieee-cyan-25">
    <BlueprintMap
      title={about.map.title}
      subtitle={about.map.subtitle}
      stats={about.map.stats}
      className="absolute inset-0"
    />

    <div className="relative z-10 flex min-h-screen px-5 pt-28 pb-10 md:px-10">
      <div className="ml-auto flex w-full flex-col justify-center lg:w-[30%]">
        <Reveal delay={0}>
          <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">{about.heading}</h2>
        </Reveal>
        {about.paragraphs.map((t, i) => (
          <Reveal as="p" key={i} delay={150 + i * 150} className={`${i ? "mt-4" : "mt-5"} text-base leading-7`}>
            {t}
          </Reveal>
        ))}

        <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5">
          {about.stats.map(({ value, label }, i) => (
            <Reveal key={label + i} delay={500 + i * 200}>
              <dd className="text-3xl font-semibold text-white">{value}</dd>
              <dt className="mt-1 text-sm">{label}</dt>
            </Reveal>
          ))}
        </dl>

        <ol className="mt-8 space-y-3 border-l border-ieee-cyan-50 pl-6 text-sm leading-6">
          {about.timeline.map(({ year, text }, i) => (
            <Reveal as="li" key={year + i} delay={1300 + i * 200} className="relative">
              <span className="absolute -left-[29px] top-2 h-2 w-2 bg-white" />
              <span className="font-semibold text-white">{year}</span>
              <span className="ml-3">{text}</span>
            </Reveal>
          ))}
        </ol>
      </div>
    </div>
  </section>
  );
}
