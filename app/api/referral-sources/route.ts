import { NextResponse } from "next/server";

type GhlContact = {
  id?: string;
  tags?: string[];
};

type GhlSearchResponse = {
  contacts?: GhlContact[];
  total?: number;
};

const API_URL = "https://services.leadconnectorhq.com/contacts/search";
const PAGE_SIZE = 100;
const MAX_PAGES = 100;

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function makeLabel(tag: string, prefix: string): string {
  return tag
    .slice(prefix.length)
    .trim()
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function fetchContactsPage(
  token: string,
  locationId: string,
  page: number
): Promise<GhlSearchResponse> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Version: "v3",
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      locationId,
      page,
      pageLimit: PAGE_SIZE,
      sort: [{ field: "dateAdded", direction: "desc" }]
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    const raw = await response.text();
    const detail = raw.replace(/\s+/g, " ").slice(0, 400);
    throw new Error(`HighLevel API error ${response.status}${detail ? `: ${detail}` : ""}`);
  }

  return (await response.json()) as GhlSearchResponse;
}

export async function GET() {
  try {
    const token = process.env.GHL_PRIVATE_TOKEN?.trim();
    const locationId = process.env.GHL_LOCATION_ID?.trim();
    const configuredPrefix = process.env.GHL_SOURCE_PREFIX?.trim() || "source-";
    const comparisonPrefix = configuredPrefix.toLowerCase();

    if (!token || !locationId) {
      return NextResponse.json(
        { error: "The Vercel environment variables GHL_PRIVATE_TOKEN and GHL_LOCATION_ID are required." },
        { status: 500 }
      );
    }

    const counts = new Map<string, number>();
    const matchedContacts = new Set<string>();
    let totalContacts = 0;

    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const result = await fetchContactsPage(token, locationId, page);
      const contacts = Array.isArray(result.contacts) ? result.contacts : [];
      totalContacts += contacts.length;

      for (const contact of contacts) {
        const uniqueSourceTags = new Set(
          (contact.tags ?? [])
            .filter((tag): tag is string => typeof tag === "string")
            .map((tag) => tag.trim())
            .filter((tag) => tag.toLowerCase().startsWith(comparisonPrefix))
            .map((tag) => tag.toLowerCase())
        );

        if (uniqueSourceTags.size > 0 && contact.id) {
          matchedContacts.add(contact.id);
        }

        for (const tag of uniqueSourceTags) {
          counts.set(tag, (counts.get(tag) ?? 0) + 1);
        }
      }

      if (contacts.length < PAGE_SIZE) break;
    }

    const sources = Array.from(counts.entries())
      .map(([tag, count]) => ({
        tag,
        label: makeLabel(tag, comparisonPrefix),
        count
      }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

    return NextResponse.json(
      {
        sources,
        totalContacts,
        matchedContacts: matchedContacts.size,
        generatedAt: new Date().toISOString(),
        prefix: configuredPrefix
      },
      {
        headers: {
          "Cache-Control": "private, no-store, max-age=0"
        }
      }
    );
  } catch (caught) {
    console.error("Referral source widget error", caught);
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "Unexpected server error." },
      { status: 500 }
    );
  }
}
