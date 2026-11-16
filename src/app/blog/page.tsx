import type { Metadata } from "next";
import { Card } from "@/components/ui";
import { BLOG_POSTS } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes on building and launching with the SaaS Starter Kit — how it is built and the launch checklist. (Billing setup is a paid-kit topic.)",
};

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <img src="/icon.svg" alt="" className="h-5 w-5" />
            SaaS Starter
          </a>
          <a href="/" className="text-sm text-slate-600 hover:text-slate-900">
            ← Back home
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold text-slate-900">Blog</h1>
        <p className="mt-3 text-lg text-slate-600">
          Notes on building and launching with this kit.
        </p>
        <div className="mt-10 space-y-4">
          {BLOG_POSTS.map((post) => (
            <Card key={post.slug} className="p-6">
              <p className="text-sm text-slate-500">{post.date}</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                <a
                  href={`/blog/${post.slug}`}
                  className="hover:text-brand-600 hover:underline"
                >
                  {post.title}
                </a>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {post.excerpt}
              </p>
              <a
                href={`/blog/${post.slug}`}
                className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline"
              >
                Read →
              </a>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
