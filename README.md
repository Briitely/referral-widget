# Briitely GHL Referral Source Widget

A secure Next.js/Vercel dashboard widget that reads HighLevel contacts, counts tags beginning with a configured prefix such as `source-`, and displays a horizontal bar graph.

## Required HighLevel scope

- `contacts.readonly`

## Vercel environment variables

- `GHL_PRIVATE_TOKEN` — the sub-account Private Integration Token
- `GHL_LOCATION_ID` — the HighLevel sub-account/location ID
- `GHL_SOURCE_PREFIX` — normally `source-`

Add them under **Vercel → Project → Settings → Environment Variables**, then redeploy.

## GitHub structure

The following files must be in the Vercel Root Directory:

- `package.json`
- `next.config.ts`
- `app/page.tsx`
- `app/layout.tsx`
- `app/api/referral-sources/route.ts`

If the repository contains an outer folder named `briitely-ghl-referral-widget`, set that folder as Vercel's Root Directory. If these files are at the repository root, leave Root Directory blank.

## Test URLs

- `/` — the chart
- `/api/health` — confirms the app is running and whether environment variables exist
- `/api/referral-sources` — returns the chart data or a readable API error

## Embed in HighLevel

After the production URL works in a normal browser, add it to a HighLevel dashboard Embed element.

Never place the Private Integration Token in browser-side JavaScript or commit it to GitHub.
