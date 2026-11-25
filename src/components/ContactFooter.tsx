import ContactForm from "./ContactForm";
import Reveal from "./Reveal";
import Year from "./Year";
import type { SiteContent } from "@/lib/content";

const footLink = "transition-colors hover:text-white hover:underline";

export default function ContactFooter({ contact: site, logo }: { contact: SiteContent["contact"]; logo: string }) {
  return (
    <section id="contact" className="relative flex min-h-screen flex-col overflow-hidden text-ieee-cyan-25">
      <div className="relative z-10 flex flex-1 flex-col items-center px-5 pt-32 pb-20 text-center md:px-10">
        <Reveal>
          <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">{site.heading}</h2>
        </Reveal>
        <Reveal as="p" delay={150} className="mt-5 max-w-xl text-base leading-7 sm:text-lg">
          {site.intro}
        </Reveal>

        <Reveal delay={250} className="mt-12 w-full max-w-4xl text-left">
          <ContactForm email={site.email} />
        </Reveal>
      </div>

      <footer className="relative z-10 rounded-t-[2.5rem] bg-ieee-dark-blue px-5 py-12 text-ieee-cyan-25 md:px-10">
        <div className="grid gap-10 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:pr-6">
            <span
              role="img"
              aria-label={`${site.name}, ${site.college}`}
              className="block h-8 w-[255px] max-w-full bg-white"
              style={{
                WebkitMaskImage: `url(${logo})`,
                maskImage: `url(${logo})`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
              }}
            />
            <p className="mt-4 leading-6">{site.tagline}</p>
          </div>
          <nav aria-label="Explore">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ieee-cyan">Explore</h3>
            <ul className="mt-3 space-y-2">
              {site.explore.map((l) => (
                <li key={l.href}><a href={l.href} className={footLink}>{l.label}</a></li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Resources">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ieee-cyan">Resources</h3>
            <ul className="mt-3 space-y-2">
              {site.resources.map((l) => (
                <li key={l.href}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className={footLink}>{l.label} ↗</a>
                </li>
              ))}
              <li><a href="/admin" className={footLink}>{site.adminLinkLabel}</a></li>
            </ul>
          </nav>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ieee-cyan">Find us</h3>
            <p className="mt-3 leading-6">
              {site.college}
              {site.address.map((line) => (
                <span key={line} className="block">{line}</span>
              ))}
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-ieee-cyan-50/20 pt-6 text-xs text-ieee-cyan-50">
          <p>© <Year /> {site.name}, {site.college}. All rights reserved.</p>
          <p>{site.legal}</p>
        </div>
      </footer>
    </section>
  );
}
