import Image from "next/image";
import StaggeredMenu from "./StaggeredMenu";

import type { SiteContent } from "@/lib/content";

// Stacked backdrop-blur layers, each masked to a shorter band at the top: blur is strongest at the top edge and fades out going down.
const blurLayers = [
  { blur: 1, mask: "linear-gradient(to bottom, #000 0%, #000 100%)" },
  { blur: 3, mask: "linear-gradient(to bottom, #000 0%, #000 60%, transparent 100%)" },
  { blur: 8, mask: "linear-gradient(to bottom, #000 0%, #000 35%, transparent 75%)" },
  { blur: 16, mask: "linear-gradient(to bottom, #000 0%, #000 10%, transparent 50%)" },
];

export default function Navbar({ nav, theme }: { nav: SiteContent["nav"]; theme: SiteContent["theme"] }) {
  const links = nav.links;
  const menuItems = [
    ...links.map(({ label, href }) => ({ label, ariaLabel: `Go to ${label}`, link: href })),
    { label: nav.adminLabel, ariaLabel: nav.adminLabel, link: nav.adminHref },
    { label: nav.joinLabel, ariaLabel: nav.joinLabel, link: nav.joinHref },
  ];
  return (
    <>
    <header className="fixed inset-x-0 top-0 z-30 h-24 md:z-50">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {blurLayers.map(({ blur, mask }) => (
          <div
            key={blur}
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-ieee-dark-blue/70 to-transparent" />
      </div>

      <nav className="relative hidden h-20 grid-cols-[1fr_auto_1fr] items-center px-5 md:grid md:px-10">
        <a href="#" className="justify-self-start" aria-label={nav.logoAlt}>
          <Image
            src={nav.logo}
            alt={nav.logoAlt}
            width={1894}
            height={238}
            priority
            className="h-8 w-auto"
          />
        </a>

        <ul className="hidden items-center gap-8 text-sm font-medium text-ieee-cyan-25 md:flex">
          {links.map(({ label, href }) => (
            <li key={href}>
              <a href={href} className="transition-colors hover:text-ieee-cyan">
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="col-start-3 flex items-center gap-3 justify-self-end">
          <a
            href={nav.adminHref}
            className="hidden rounded-full border border-ieee-cyan-50 px-5 py-2 text-sm font-semibold text-ieee-cyan-25 transition-colors hover:bg-ieee-cyan-25/15 sm:block"
          >
            {nav.adminLabel}
          </a>
          <a
            href={nav.joinHref}
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-ieee-dark-blue transition-colors hover:bg-ieee-cyan-25"
          >
            {nav.joinLabel}
          </a>
        </div>
      </nav>
    </header>

    <div className="md:hidden">
      <StaggeredMenu
        isFixed
        position="right"
        items={menuItems}
        displaySocials={false}
        logoUrl={nav.logo}
        menuButtonColor={theme.menuButton}
        openMenuButtonColor={theme.menuButtonOpen}
        colors={theme.menuColors}
        accentColor={theme.menuAccent}
      />
    </div>
    </>
  );
}
