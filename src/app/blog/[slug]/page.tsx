import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { MDXRemote } from "next-mdx-remote/rsc";
import { BLOG_POSTS, getPost } from "@/lib/blog";
import { mdxComponents } from "@/lib/mdx-components";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${SITE_URL}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
    },
  };
}

async function readPostBody(slug: string): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    "src",
    "content",
    "blog",
    `${slug}.mdx`,
  );
  return readFile(filePath, "utf8");
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const body = await readPostBody(slug);

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <img src="/icon.svg" alt="" className="h-5 w-5" />
            SaaS Starter
          </a>
          <a href="/blog" className="text-sm text-slate-600 hover:text-slate-900">
            ← All posts
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm text-slate-500">{post.date}</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
          {post.title}
        </h1>
        <article className="mt-6">
          <MDXRemote source={body} components={mdxComponents} />
        </article>
        <p className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-500">
          <a href="/blog" className="font-medium text-brand-600 hover:underline">
            ← Back to the blog
          </a>
          {" · "}
          <a href="/pricing" className="font-medium text-brand-600 hover:underline">
            Get the kit →
          </a>
        </p>
      </main>
    </div>
  );
}
