import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

/**
 * Dynamic Open Graph image for the landing page (1200x630).
 * Next.js serves it at /opengraph-image and wires it into the
 * page metadata automatically. No external images or fonts —
 * the diamond is a rotated square, so it renders anywhere.
 */
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
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
            SaaS Starter Kit
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 36, fontSize: 38, color: "#e0e7ff" }}>
          {SITE_TAGLINE}
        </div>
        <div style={{ display: "flex", marginTop: 20, fontSize: 24, color: "#c7d2fe" }}>
          {SITE_DESCRIPTION}
        </div>
        <div style={{ display: "flex", marginTop: 44, fontSize: 24, color: "#a5b4fc" }}>
          Next.js 16 · Auth.js · Prisma · Polar / Stripe
        </div>
      </div>
    ),
    { ...size },
  );
}
