import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getContent } from "@/lib/store";

export async function generateStaticParams() {
  return (await getContent()).blogs.items.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug;
  const post = (await getContent()).blogs.items.find((p) => p.slug === slug);
  return post ? { title: `${post.title} | IEEE KhCE`, description: post.excerpt } : {};
}

export default function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
  // posts added in the admin after the build are rendered on request, so params are read under Suspense
  return (
    <Suspense>
      <Post params={params} />
    </Suspense>
  );
}

async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { blogs: { items: blogs }, theme, nav } = await getContent();
  const slug = (await params).slug;
  const post = blogs.find((p) => p.slug === slug);
  if (!post) notFound();

  const blocks = post.body.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  const i = blogs.findIndex((p) => p.slug === post.slug);
  const next = blogs[(i + 1) % blogs.length];

  return (
    <main className="min-h-screen px-5 pt-8 pb-24 text-ieee-cyan-25 md:px-10" style={{ background: `linear-gradient(to bottom, ${theme.blogPageBackground[0]}, ${theme.blogPageBackground[1]})` }}>
      <header className="flex items-center justify-between">
        <Link href="/" aria-label="IEEE Student Branch, Khwopa College of Engineering">
          <Image src={nav.logo} alt={nav.logoAlt} width={255} height={32} className="h-8 w-auto" />
        </Link>
        <Link href="/#blogs" className="text-sm font-semibold text-ieee-cyan-50 transition-colors hover:text-white">
          ← All blogs
        </Link>
      </header>

      <article className="mx-auto mt-14 max-w-2xl">
        <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-ieee-cyan-50">
          <span className="font-semibold uppercase tracking-wider text-ieee-cyan">{post.tag}</span>
          <span>{post.date}</span>
          <span>{post.readMinutes} min read</span>
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">{post.title}</h1>
        <p className="mt-4 text-sm text-ieee-cyan-50">By {post.author}</p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={post.cover} alt="" className="mt-8 aspect-[16/10] w-full object-cover" />

        <div className="mt-10 space-y-6 text-lg leading-8">
          {blocks.map((b, k) =>
            b.startsWith("## ") ? (
              <h2 key={k} className="pt-4 text-2xl font-semibold text-white">{b.slice(3)}</h2>
            ) : (
              <p key={k}>{b}</p>
            ),
          )}
        </div>

        <Link
          href={`/blogs/${next.slug}`}
          className="mt-16 block border border-ieee-cyan-50/25 p-5 transition-colors hover:border-ieee-cyan"
        >
          <span className="text-xs uppercase tracking-wider text-ieee-cyan-50">Next article</span>
          <span className="mt-1 block text-xl font-semibold text-white">{next.title} →</span>
        </Link>
      </article>
    </main>
  );
}
