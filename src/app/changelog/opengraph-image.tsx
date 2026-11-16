import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

/**
 * Dynamic Open Graph image for the changelog page (1200x630).
 * Same brand style as the other per-page images: indigo background,
 * white diamond mark, page title and what the page lists.
 */
export const alt = `${SITE_NAME} — Changelog: real releases only`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              width: 76,
              height: 76,
              background: "white",
              transform: "rotate(45deg)",
              borderRadius: 10,
              flexShrink: 0,
            }}
          />
          <div style={{ fontSize: 66, fontWeight: 800, letterSpacing: -2 }}>
            Changelog
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 36, fontSize: 38, color: "#e0e7ff" }}>
          Real releases only, dated as shipped
        </div>
        <div style={{ display: "flex", marginTop: 20, fontSize: 24, color: "#c7d2fe" }}>
          Every version from v1 to the latest feature batch.
        </div>
        <div style={{ display: "flex", marginTop: 44, fontSize: 24, color: "#a5b4fc" }}>
          SaaS Starter Kit · Next.js 16 · Auth.js · Prisma
        </div>
      </div>
    ),
    { ...size },
  );
}
