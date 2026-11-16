import { ImageResponse } from "next/og";
import { BLOG_POSTS, getPost } from "@/lib/blog";
import { SITE_NAME } from "@/lib/site";

/**
 * Per-post Open Graph image (1200x630), served at
 * /blog/<slug>/opengraph-image and wired into each post's
 * metadata automatically. No external images or fonts —
 * the diamond is a rotated square, so it renders anywhere.
 */
export const alt = "SaaS Starter blog post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  const title = post?.title ?? "SaaS Starter Blog";
  const excerpt = post?.excerpt ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#4338ca",
          color: "white",
          padding: 80,
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 44,
              height: 44,
              background: "white",
              transform: "rotate(45deg)",
              borderRadius: 6,
              flexShrink: 0,
            }}
          />
          <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: "#e0e7ff" }}>
            {SITE_NAME} — Blog
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 58,
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: -1,
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 26, color: "#c7d2fe", lineHeight: 1.4 }}>
          {excerpt}
        </div>
      </div>
    ),
    { ...size },
  );
}
