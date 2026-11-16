import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

/** Sitemap: static pages plus every blog post. */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/pricing", "/docs", "/blog", "/changelog"].map(
    (route) => ({
      url: `${SITE_URL}${route}`,
      lastModified: new Date("2026-11-16"),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    }),
  );
  const posts = BLOG_POSTS.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  return [...staticPages, ...posts];
}
