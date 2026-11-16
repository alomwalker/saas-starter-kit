import { RELEASES } from "@/lib/changelog";
import { SITE_URL } from "@/lib/site";

/** RSS 2.0 feed of the changelog — same releases as /changelog, newest first. */

const CHANNEL_TITLE = "SaaS Starter Kit — Changelog";
const CHANNEL_LINK = `${SITE_URL}/changelog`;
const CHANNEL_DESCRIPTION =
  "What changed in the SaaS Starter Kit, release by release — v1, v2, Phase 1 and Phase 2.";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Release date (YYYY-MM-DD) as an RFC 822 pubDate, at midnight UTC. */
function toPubDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toUTCString();
}

export function GET(): Response {
  const items = RELEASES.map((release) => {
    const title = `${release.version} — ${release.title}`;
    const description = release.items.join(" ");
    return [
      "    <item>",
      `      <title>${escapeXml(title)}</title>`,
      `      <link>${escapeXml(CHANNEL_LINK)}</link>`,
      `      <pubDate>${toPubDate(release.date)}</pubDate>`,
      `      <description>${escapeXml(description)}</description>`,
      `      <guid>${escapeXml(`${CHANNEL_LINK}#${release.version}`)}</guid>`,
      "    </item>",
    ].join("\n");
  }).join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "  <channel>",
    `    <title>${escapeXml(CHANNEL_TITLE)}</title>`,
    `    <link>${escapeXml(CHANNEL_LINK)}</link>`,
    `    <description>${escapeXml(CHANNEL_DESCRIPTION)}</description>`,
    items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
