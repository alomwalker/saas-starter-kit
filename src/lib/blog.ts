/**
 * The blog's post list — the single source of truth for titles, dates
 * and excerpts. The .mdx bodies live in src/content/blog/<slug>.mdx
 * and are rendered by src/app/blog/[slug]/page.tsx.
 */
export type BlogPostMeta = {
  slug: string;
  title: string;
  date: string; // ISO date, shown as written
  excerpt: string;
};

export const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: "how-the-kit-is-built",
    title: "How this kit is built",
    date: "2026-11-16",
    excerpt:
      "Next.js 16, Auth.js, Prisma and Postgres — what each piece does, why it was chosen, and where to find it in the code.",
  },
  {
    slug: "polar-vs-stripe-setup",
    title: "Polar vs Stripe: setting up billing for your buyers",
    date: "2026-11-16",
    excerpt:
      "The kit ships with both. Which one to pick, what each one needs from you, and how the webhooks activate plans.",
  },
  {
    slug: "launch-checklist",
    title: "Launch checklist: from clone to first sale",
    date: "2026-11-16",
    excerpt:
      "The order of operations that takes this kit from a fresh clone to a live product page that can take real money.",
  },
];

export function getPost(slug: string): BlogPostMeta | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
