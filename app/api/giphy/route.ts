import { NextRequest, NextResponse } from "next/server";

import { currentProfile } from "@/lib/current-profile";

const GIPHY_BASE = "https://api.giphy.com/v1/gifs";
const LIMIT = 24;

type GiphyImage = {
  url: string;
  width: string;
  height: string;
};

type GiphyResult = {
  id: string;
  title?: string;
  images: Record<string, GiphyImage | undefined>;
};

/**
 * Proxy for the GIPHY API.
 *
 * The key stays server-side — GIPHY keys are not restrictable by referrer, so
 * it must never be shipped as NEXT_PUBLIC_*.
 *
 * With no `q`, returns GIPHY's trending GIFs.
 */
export async function GET(req: NextRequest) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.GIPHY_API_KEY;
    if (!apiKey) {
      // Not an error the user can fix from the UI — the picker renders a
      // "not configured" message instead of failing.
      return NextResponse.json({ configured: false, results: [] });
    }

    const q = req.nextUrl.searchParams.get("q")?.trim();
    const offset = req.nextUrl.searchParams.get("offset");

    const params = new URLSearchParams({
      api_key: apiKey,
      limit: String(LIMIT),
      rating: "pg-13",
    });
    if (q) params.set("q", q);
    if (offset) params.set("offset", offset);

    const endpoint = q ? "search" : "trending";
    const res = await fetch(`${GIPHY_BASE}/${endpoint}?${params.toString()}`, {
      // Trending/search results are fine to reuse briefly across users.
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      const detail = await res.text();
      console.log("[GIPHY_GET]", res.status, detail);
      return NextResponse.json(
        { error: "GIPHY request failed" },
        { status: 502 },
      );
    }

    const data = await res.json();

    const results = (data.data ?? [])
      .map((result: GiphyResult) => {
        const full = result.images?.original;
        const preview = result.images?.fixed_width ?? full;
        if (!full?.url || !preview?.url) return null;
        return {
          id: result.id,
          url: full.url,
          preview: preview.url,
          description: result.title || "GIF",
          // GIPHY returns dimensions as strings.
          width: Number(preview.width) || 200,
          height: Number(preview.height) || 200,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ configured: true, results });
  } catch (error) {
    console.log("[GIPHY_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
