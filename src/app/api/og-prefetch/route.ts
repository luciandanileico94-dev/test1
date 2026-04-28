import { NextResponse, type NextRequest } from "next/server";
import ogs from "open-graph-scraper";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "invalid protocol" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  try {
    const { result } = await ogs({ url, fetchOptions: { headers: { "user-agent": "Mozilla/5.0 WishListBot" } } });
    return NextResponse.json({
      title: result.ogTitle ?? result.twitterTitle ?? null,
      description: result.ogDescription ?? result.twitterDescription ?? null,
      image: result.ogImage?.[0]?.url ?? result.twitterImage?.[0]?.url ?? null,
      siteName: result.ogSiteName ?? null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "fetch failed" },
      { status: 500 },
    );
  }
}
