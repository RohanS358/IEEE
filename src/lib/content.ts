// Everything the admin can edit lives in one SiteContent document. The defaults below are the site's original
// content; whatever the admin saves is merged over them, so a missing key never breaks a page.
import { events } from "@/data/events";
import { blogs } from "@/data/blogs";
import { site } from "@/data/site";

export const FONTS = {
  jakarta: "Plus Jakarta Sans",
  inter: "Inter",
  grotesk: "Space Grotesk",
  dmsans: "DM Sans",
  manrope: "Manrope",
} as const;

export const defaultContent = {
  seo: {
    title: "IEEE Student Branch | Khwopa College of Engineering",
    description:
      "IEEE Student Branch at Khwopa College of Engineering, Bhaktapur: workshops, hackathons and projects bridging academia, research and industry.",
  },
  theme: {
    font: "jakarta" as keyof typeof FONTS,
    background: "#002855",
    foreground: "#b9e5fa",
    heroGradient: ["#00629b", "#b9e5fa", "#6dcff6", "#00b5e2"],
    heroAccent: "#ffffff",
    menuColors: ["#00629b", "#00b5e2"],
    menuAccent: "#00629b",
    menuButton: "#ffffff",
    menuButtonOpen: "#002855",
    teamBackground: ["#002855", "#00122b", "#000a1a"],
    blogPageBackground: ["#000208", "#00122b"],
    eventsLabelColor: "#b9e5fa",
    // brand palette tokens: used by every `ieee-*` Tailwind color on the site
    colors: {
      "ieee-blue": "#00629b",
      "ieee-blue-75": "#477ca7",
      "ieee-blue-50": "#809dbd",
      "ieee-blue-25": "#bac6d9",
      "ieee-cyan": "#00b5e2",
      "ieee-cyan-75": "#00bdf2",
      "ieee-cyan-50": "#6dcff6",
      "ieee-cyan-25": "#b9e5fa",
      "ieee-teal": "#009ca6",
      "ieee-dark-teal": "#007377",
      "ieee-dark-green": "#006341",
      "ieee-green": "#00843d",
      "ieee-olive-green": "#658d1b",
      "ieee-bright-green": "#78be20",
      "ieee-yellow": "#ffd100",
      "ieee-dark-yellow": "#ffc72c",
      "ieee-orange": "#ffa300",
      "ieee-dark-orange": "#e87722",
      "ieee-red": "#ba0c2f",
      "ieee-dark-red": "#861f41",
      "ieee-purple": "#981d97",
      "ieee-dark-purple": "#772583",
      "ieee-dark-blue": "#002855",
      "ieee-gray": "#75787b",
    } as Record<string, string>,
  },
  nav: {
    logo: "/logo-banner-white.png",
    logoAlt: "IEEE Student Branch, Khwopa College of Engineering",
    links: [
      { label: "About Us", href: "#about" },
      { label: "Our Team", href: "#team" },
      { label: "Events", href: "#events" },
      { label: "Blogs", href: "#blogs" },
      { label: "Gallery", href: "#gallery" },
      { label: "Contact", href: "#contact" },
    ],
    adminLabel: "Sign In",
    adminHref: "/admin",
    joinLabel: "Join Us",
    joinHref: "#join",
  },
  hero: {
    slogan: ["Innovate.", "Collaborate.", "Elevate."],
    paragraphs: [
      "We are a community of students at Khwopa College of Engineering, bridging academia, research and industry through practical engineering and innovation.",
      "Our mission is to take learning beyond the classroom. Through workshops, projects and practical exploration of emerging technology, we help students collaborate, share knowledge and graduate ready for industry.",
    ],
    primaryButton: { label: "Apply for Membership", href: "#join" },
    secondaryButton: { label: "View Events", href: "#events" },
    art: "/structures/satellite.svg",
  },
  about: {
    heading: "About Us",
    paragraphs: [
      "The IEEE Student Branch at Khwopa College of Engineering was established on 14 March 2012 by a group of twelve students in Libali, Bhaktapur. It is part of the IEEE Nepal Section under Region 10, and gives students a place to learn, build and share beyond the syllabus.",
      "What began as a small reading circle now runs workshops, hackathons, technical talks and community projects every year, with members from every engineering department.",
    ],
    stats: [
      { value: "2012", label: "Established" },
      { value: "186", label: "Active members" },
      { value: "64", label: "Events held" },
      { value: "3", label: "Technical chapters" },
    ],
    timeline: [
      { year: "2012", text: "Founded with twelve members and a first workshop series." },
      { year: "2016", text: "First intercollege hackathon hosted at the campus." },
      { year: "2019", text: "Women in Engineering affinity group launched." },
      { year: "2024", text: "Passed one hundred and fifty active members." },
    ],
    map: {
      title: "Khwopa College of Engineering",
      subtitle: "IEEE Student Branch, Libali, Bhaktapur",
      stats: [
        { label: "Students", value: "1,240" },
        { label: "Events", value: "64" },
        { label: "Members", value: "186" },
        { label: "Founded", value: "2012" },
      ],
    },
  },
  team: {
    eyebrow: "Our Team",
    // `slug` picks the badge image /team/<slug>.svg (or any path you type into `image`, e.g. an uploaded photo)
    groups: [
      { title: "Campus Chair", blurb: "Leads the branch, sets its direction and represents it to the college and to the IEEE Nepal Section.", people: [{ slug: "chair-supriya", name: "Supriya Poudel" }] },
      { title: "Vice Chair", blurb: "Supports the chair and leads the research, media and activity teams.", people: [{ slug: "vice-chair-suyash", name: "Suyash" }] },
      { title: "Secretary", blurb: "Keeps the records, plans the meetings and keeps every team informed.", people: [{ slug: "secretary-rexsh", name: "Rexsh" }] },
      { title: "Treasurer", blurb: "Looks after the budget, sponsorships and expenses of the branch.", people: [{ slug: "treasurer-sunayan", name: "Sunayan" }] },
      {
        title: "Web Master and Technical",
        blurb: "Builds and runs the branch website, with a technical team that turns ideas into working tools.",
        people: [
          { slug: "technical-bigyan", name: "Bigyan" },
          { slug: "webmaster-rohan", name: "Rohan" },
          { slug: "technical-shailaj", name: "Shailaj" },
        ],
      },
      {
        title: "Research and Development",
        blurb: "Explores new technology and guides members through projects and papers.",
        people: [
          { slug: "rnd-anuj", name: "Anuj" },
          { slug: "rnd-sushant", name: "Sushant" },
          { slug: "rnd-sushma", name: "Sushma" },
        ],
      },
      { title: "Media", blurb: "Captures and shares the story of every event, workshop and project.", people: [{ slug: "media", name: "Full Name" }] },
      { title: "Activity", blurb: "Plans and hosts the events, from workshops and talks to hackathons and meetups.", people: [{ slug: "activity", name: "Full Name" }] },
      { title: "External Relations", blurb: "Builds partnerships with other branches, companies and communities.", people: [{ slug: "external-binod", name: "Binod" }] },
      { title: "Graphics", blurb: "Designs the posters, banners and visuals that give the branch its look.", people: [{ slug: "graphics-ritu", name: "Ritu" }] },
    ].map((g) => ({ ...g, people: g.people.map((p) => ({ image: "", ...p })) })) as {
      title: string;
      blurb: string;
      people: { slug: string; name: string; image: string }[];
    }[],
  },
  events: {
    heading: "Events",
    intro:
      "Workshops, hackathons and talks the branch has hosted at Khwopa College of Engineering. Drag, scroll or use the arrow keys to browse, and click an event to read about it.",
    items: events,
  },
  blogs: {
    heading: "Blogs",
    intro:
      "Stories, tutorials and lessons from the branch: what we built, what we learned and what we would do differently.",
    items: blogs,
  },
  contact: {
    heading: "Contact Us",
    intro:
      "Questions about membership, a collaboration idea or an event you would like us to host? Send us a message and someone from the executive committee will get back to you.",
    tagline: "Innovate. Collaborate. Elevate. A community of students bridging academia, research and industry.",
    name: site.name,
    college: site.college,
    address: site.address,
    email: site.email,
    phone: site.phone,
    socials: site.socials,
    resources: site.resources,
    explore: site.explore,
    adminLinkLabel: "Admin sign in",
    legal: "IEEE is a registered trademark of the Institute of Electrical and Electronics Engineers, Inc.",
  },
};

export type SiteContent = typeof defaultContent;

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

/** Saved values win; objects are merged key by key so new default keys still appear. Arrays are replaced whole. */
export function merge<T>(base: T, saved: unknown): T {
  if (!isObj(base) || !isObj(saved)) return (saved === undefined || saved === null || typeof saved !== typeof base ? base : saved) as T;
  const out: Record<string, unknown> = { ...base };
  for (const k of Object.keys(saved)) out[k] = k in base ? merge((base as Record<string, unknown>)[k], saved[k]) : saved[k];
  return out as T;
}
