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
  {
    slug: "adding-a-new-page",
    title: "Adding a new page to the kit",
    date: "2026-11-16",
    excerpt:
      "One file, metadata, the shared UI kit, and the sitemap — the whole process, with the mistakes to avoid.",
  },
  {
    slug: "deploying-to-vercel",
    title: "Deploying the kit to Vercel",
    date: "2026-11-16",
    excerpt:
      "The build command, CI=true, the session pooler, and the webhook URLs — the three settings that bite if you skip them.",
  },
  {
    slug: "customizing-the-landing-page",
    title: "Customizing the landing page",
    date: "2026-11-16",
    excerpt:
      "The hero copy in page.tsx, the brand colours in tailwind.config.ts, the stats cards, and the shared UI primitives — how to make the landing page yours.",
  },
  {
    slug: "adding-a-new-dashboard-page",
    title: "Adding a new dashboard page",
    date: "2026-11-16",
    excerpt:
      "Create the route, add the nav link, fetch with Prisma — and why a page under /dashboard is signed-in-only with no extra auth code.",
  },
];

export function getPost(slug: string): BlogPostMeta | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
