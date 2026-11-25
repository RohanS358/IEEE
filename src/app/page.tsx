import EventsSection from "@/components/EventsSection";
import BlogSection from "@/components/BlogSection";
import MilkyWay from "@/components/MilkyWay";
import ContactFooter from "@/components/ContactFooter";
import AboutSection from "@/components/AboutSection";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import TeamStack from "@/components/TeamStack";
import { getContent } from "@/lib/store";

export default async function Home() {
  const { theme, hero, about, team, events, blogs, contact, nav } = await getContent();
  return (
    <main className="relative flex-1 min-h-screen">
      <Navbar nav={nav} theme={theme} />
      <HeroSection hero={hero} theme={theme} />

      <AboutSection about={about} />

      <TeamStack key={team.groups.map((g) => g.people.length).join()} eyebrow={team.eyebrow} groups={team.groups} theme={theme} />

      {/* one continuous night sky behind events, blogs and contact so the sections blend */}
      <div className="relative">
        <MilkyWay bandId="contact" />
        <EventsSection heading={events.heading} intro={events.intro} items={events.items} labelColor={theme.eventsLabelColor} />
        <BlogSection heading={blogs.heading} intro={blogs.intro} items={blogs.items} />
        <ContactFooter contact={contact} logo={nav.logo} />
      </div>
    </main>
  );
}
