# Demo plan — how to show this kit to buyers

Goal: a buyer should be able to see, in under 2 minutes, that this is a
real working app, not screenshots of a mockup.

## Live demo (do this before listing)

1. Deploy to Vercel from this repo (free tier is fine for a demo).
   Set env vars in Vercel: `NEXT_PUBLIC_APP_URL` to the demo URL,
   `DATABASE_URL` to a Supabase Postgres string, a random
   `AUTH_SECRET`, and the real `POLAR_*` vars from polar-setup.md
   (Polar is live since 2026-11-16: Starter $29 / Pro $49 one-time).
   Do NOT leave `POLAR_*` unset — the demo is now the real shop, so
   a buyer must be able to complete a purchase. After deploy, update
   the Polar webhook URL to `https://<demo-domain>/api/webhooks/polar`.
2. Record a 60–90 second screen video:
   - 0:00 landing page, scroll through features
   - 0:20 sign up with a new account, then log in
   - 0:35 dashboard: stats, revenue chart, customer table (seeded sample data)
   - 0:55 pricing page, click Buy Pro — show the real Polar checkout
     opening (do not complete a test payment on camera unless it is
     a real purchase you intend to refund)
   - 1:10 docs page
3. Take 4 screenshots at 1280×720: landing, dashboard, pricing, docs.

## Listing checklist

- [ ] Live demo URL is up; signup + login work and the dashboard shows the seeded sample data
- [ ] Demo video + 4 screenshots on the listing
- [ ] `LICENSE.md` added (choose a license — e.g. a single-buyer
      commercial license; do not sell it as open source unless you mean it)
- [ ] README's "still missing" items are either done or disclosed
      in the listing (Polar account, production Postgres, license)
- [ ] Price chosen ($39–$99 one-time is the usual range for a kit like
      this; do not promise buyers a specific income)
- [ ] Support email address published, with a stated response time

## Where to list it

- Own site + **Polar** checkout (primary — best Bangladesh payout route)
- **Creative Market** (shop approval needed) as a secondary channel
- Do NOT plan on ThemeForest — Envato is not creating new author
  accounts as of Oct 2026. Do NOT rely on Gumroad alone (conflicting
  Bangladesh payout status) or Lemon Squeezy without a fallback.
