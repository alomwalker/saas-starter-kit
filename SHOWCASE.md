# Showcase — products shipped with this kit

The public showcase lives at `/showcase` (see `src/app/showcase/page.tsx`).
It is the kit's leaderboard: buyers' shipped products, listed only after
review.

## Current listings

None yet. The kit launched in November 2026 and the first buyers are
still building. The page says so honestly — do not invent entries.

## How a product gets listed

1. The buyer emails alomwalker21@gmail.com with their product name, its
   URL, and — only if they want to share it — their monthly revenue.
2. The seller checks the product is real and live.
3. The seller adds an entry below and updates `src/app/showcase/page.tsx`
   to render the list. There is no submission form that writes to the
   database; listings are manual and reviewed.

## Entry format (when the first real product arrives)

```text
- Name: <product name>
  URL: <https://...>
  Maker: <maker name>
  MRR: <as reported by the maker, or "not shared">
  Listed: <YYYY-MM-DD>
```

Revenue is always shown exactly as the maker reports it — never
estimated, never invented.
