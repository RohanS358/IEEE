export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  /** Path under /public, e.g. /blogs/post-1.svg */
  cover: string;
  tag: string;
  author: string;
  date: string;
  readMinutes: number;
  /**
   * Article body. Blank line = new paragraph; a line starting with "## " is a heading.
   * NOTE: all posts below are placeholder text — replace with real articles.
   */
  body: string;
};

/** Add a post here (newest first) and drop its cover in /public/blogs. The first post is shown large. */
export const blogs: BlogPost[] = [
  {
    slug: "what-we-learned-from-hackathon-2025",
    title: "What we learned from running a 24-hour hackathon",
    excerpt:
      "Forty teams, one night and a lot of cold pizza. The planning decisions that worked, the ones that did not, and what we will change next year.",
    cover: "/blogs/post-1.svg",
    tag: "Events",
    author: "IEEE KhCE Media Team",
    date: "20 September 2025",
    readMinutes: 6,
    body: `Running a hackathon on campus taught us more about organising than any meeting did. This is a short account of what went well and what we would do differently.

## Start with the problems, not the prizes

Teams care most about having a problem worth solving. We spent the first month collecting problem statements from faculty, alumni and local organisations, and only then looked for sponsors.

## The checkpoint rule

A midnight checkpoint, where every team showed one working thing, kept projects honest. Teams that skipped it were the ones scrambling at dawn.

## What we will change

More power strips, a quieter room for sleeping, and mentors who rotate on a schedule instead of drifting in and out.

Replace this text with the real article.`,
  },
  {
    slug: "getting-started-with-embedded-systems",
    title: "Getting started with embedded systems on a student budget",
    excerpt: "A practical shopping list and first three projects for anyone curious about microcontrollers.",
    cover: "/blogs/post-3.svg",
    tag: "Tutorial",
    author: "Technical Team",
    date: "2 August 2025",
    readMinutes: 8,
    body: `You do not need an expensive lab to start with embedded systems. A microcontroller board, a breadboard and a handful of sensors are enough.

## The starter kit

A development board, jumper wires, a breadboard, a few LEDs and resistors, and one temperature sensor.

## Three first projects

Blink an LED, read a sensor over serial, and finally show the reading on a small display.

Replace this text with the real article.`,
  },
  {
    slug: "how-to-read-your-first-research-paper",
    title: "How to read your first research paper without panicking",
    excerpt: "Our Research and Development team shares the three-pass method they use with new members.",
    cover: "/blogs/post-2.svg",
    tag: "Research",
    author: "Research and Development",
    date: "14 June 2025",
    readMinutes: 5,
    body: `Research papers are written for experts, which makes them intimidating. A structured way of reading helps a lot.

## Pass one: the skim

Read the title, abstract, headings and conclusion. Decide whether the paper is worth more time.

## Pass two: the argument

Read the introduction and figures carefully, ignoring the proofs, and write the main claim in one sentence.

## Pass three: the details

Only now read the methods and try to reproduce the key result.

Replace this text with the real article.`,
  },
  {
    slug: "from-campus-to-first-job",
    title: "From campus to first job: advice from our alumni",
    excerpt: "Five alumni, five different paths into industry, and the habits they all share.",
    cover: "/blogs/post-4.svg",
    tag: "Careers",
    author: "External Relations",
    date: "3 May 2025",
    readMinutes: 7,
    body: `We asked five alumni who now work across software, hardware and research how they got started.

## Build in public

Every one of them had something to show: a repository, a project write-up or a talk.

## Say yes to small opportunities

Early roles often came from small favours and side projects rather than formal applications.

Replace this text with the real article.`,
  },
];

export const getPost = (slug: string) => blogs.find((p) => p.slug === slug);
