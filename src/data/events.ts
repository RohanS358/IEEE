import type { FlexCarouselItem } from "@/components/FlexCarousel";

export type EventItem = FlexCarouselItem & {
  date: string;
  venue: string;
  /** Any length. Separate paragraphs with a blank line; the card scrolls if it runs long. */
  description: string;
};

/**
 * Add an event here (newest first) and drop its image in /public/events.
 * `title` and `subtitle` show under the carousel; the rest fills the detail card.
 * NOTE: the descriptions below are placeholder text — replace them with the real write-ups.
 */
export const events: EventItem[] = [
  {
    src: "/events/event-1.svg",
    title: "Hackathon 2025",
    subtitle: "24 hours of building",
    date: "12 – 13 September 2025",
    venue: "Khwopa College of Engineering, Libali",
    description: `Teams from across the region gathered on campus for twenty-four hours of non-stop building. Each team picked a problem from a shortlist covering smart campus tools, assistive technology and low-cost sensing, then raced to turn the idea into a working prototype.

Mentors from industry and senior members walked the floor all night, reviewing designs, unblocking code and pushing teams to cut scope and ship. A midnight checkpoint kept everyone honest, and a short morning pitch round put every prototype in front of the judges.

Winners were chosen on impact, technical depth and the quality of the live demo. The top teams received prizes and an invitation to present at the next IEEE Nepal Section meet.

Replace this text with the real event write-up: schedule, participating teams, winners, sponsors and photographs.`,
  },
  {
    src: "/events/event-2.svg",
    title: "Embedded Systems Workshop",
    subtitle: "Hands-on microcontrollers",
    date: "20 July 2025",
    venue: "Electronics Lab, Block B",
    description: `A full-day, hands-on workshop for members who had never touched a microcontroller. The morning covered the basics: reading datasheets, wiring a breadboard, and flashing a first blinking LED.

After lunch, participants paired up to connect temperature, light and distance sensors, log the readings over serial, and show them on a small display. By the end of the session every pair had a small working device they could take home.

Replace this text with the real event write-up: instructors, kit list, topics covered and what participants built.`,
  },
  {
    src: "/events/event-3.svg",
    title: "Tech Talk Series",
    subtitle: "Industry meets campus",
    date: "5 June 2025",
    venue: "Seminar Hall",
    description: `Engineers from Kathmandu-based companies spoke about what working life looks like after graduation. Talks covered cloud infrastructure, contributing to open source, and how to prepare for a first engineering role.

Each talk was followed by an open question round, and the evening ended with a networking session where students could ask speakers about internships and projects.

Replace this text with the real event write-up: speakers, talk titles, attendance and key takeaways.`,
  },
  {
    src: "/events/event-4.svg",
    title: "Women in Engineering Day",
    subtitle: "Celebrating our community",
    date: "8 March 2025",
    venue: "Main Auditorium",
    description: `Our Women in Engineering affinity group hosted a day of panels, project showcases and mentoring circles. Alumni and professionals shared how they navigated their careers, and student teams presented projects they had built over the year.

Small mentoring circles at the end paired students with engineers working in their field of interest.

Replace this text with the real event write-up: panelists, showcased projects and highlights.`,
  },
  {
    src: "/events/event-5.svg",
    title: "Robotics Day",
    subtitle: "Line followers and drones",
    date: "17 January 2025",
    venue: "Open Ground",
    description: `Student teams raced line-following robots on a custom track and demonstrated their first autonomous drones. Teams were scored on speed, reliability and the clarity of their design explanations.

Replace this text with the real event write-up: teams, results and photographs.`,
  },
  {
    src: "/events/event-6.svg",
    title: "Member Orientation",
    subtitle: "Welcome to the branch",
    date: "10 November 2024",
    venue: "Seminar Hall",
    description: `New members met the executive committee, toured the labs and signed up for technical chapters. A short session explained what IEEE membership offers: resources, conferences and a global network.

Replace this text with the real event write-up: agenda, attendance and what new members signed up for.`,
  },
];
