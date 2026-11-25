import Link from "next/link";
import Reveal from "./Reveal";
import type { BlogPost } from "@/data/blogs";

function Meta({ post }: { post: BlogPost }) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ieee-cyan-50">
      <span className="font-semibold uppercase tracking-wider text-ieee-cyan">{post.tag}</span>
      <span>{post.date}</span>
      <span>{post.readMinutes} min read</span>
    </p>
  );
}

export default function BlogSection({ heading, intro, items }: { heading: string; intro: string; items: BlogPost[] }) {
  const [featured, ...rest] = items;

  return (
    <section
      id="blogs"
      className="relative px-5 pt-28 pb-24 text-ieee-cyan-25 md:px-10"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <Reveal>
            <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">{heading}</h2>
          </Reveal>
          <Reveal as="p" delay={150} className="mt-5 text-base leading-7">
            {intro}
          </Reveal>
        </div>
      </div>

      {featured && (
        <Reveal delay={100} className="mt-12">
          <Link
            href={`/blogs/${featured.slug}`}
            className="group grid gap-6 border border-ieee-cyan-50/25 p-4 transition-colors hover:border-ieee-cyan md:grid-cols-5 md:p-6"
          >
            <div className="overflow-hidden md:col-span-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featured.cover}
                alt=""
                className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col justify-center md:col-span-2">
              <Meta post={featured} />
              <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
                {featured.title}
              </h3>
              <p className="mt-4 leading-7">{featured.excerpt}</p>
              <p className="mt-5 text-sm text-ieee-cyan-50">By {featured.author}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white">
                Read article
                <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </div>
          </Link>
        </Reveal>
      )}

      <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((post, i) => (
          <Reveal as="li" key={post.slug} delay={i * 150}>
            <Link
              href={`/blogs/${post.slug}`}
              className="group flex h-full flex-col border border-ieee-cyan-50/25 p-4 transition-colors hover:border-ieee-cyan"
            >
              <div className="overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.cover}
                  alt=""
                  className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="mt-4">
                <Meta post={post} />
                <h3 className="mt-2 text-xl font-semibold leading-snug text-white">{post.title}</h3>
                <p className="mt-3 text-sm leading-6">{post.excerpt}</p>
                <p className="mt-4 text-sm text-ieee-cyan-50">By {post.author}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
