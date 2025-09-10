import { NextRequest } from "next/server";

const UPSTREAM = "https://cryptopanic.com/api/v1/posts/";

// Allowed enums
const FILTERS = new Set(["rising","hot","bullish","bearish","important","saved","lol"]);
const KINDS = new Set(["news","media"]);
const REGIONS = new Set(["en","de","nl","es","fr","it","pt","ru","tr","ar","cn","jp","ko"]);

function boolParam(v: string | null) {
  if (v === null) return null;
  if (v === "1" || v.toLowerCase() === "true") return "1";
  if (v === "0" || v.toLowerCase() === "false") return "0";
  return null;
}

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = process.env.CRYPTOPANIC_TOKEN;
  if (!token) {
    return new Response(JSON.stringify({ error: "Server misconfigured: CRYPTOPANIC_TOKEN not set." }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*" }
    });
  }

  const urlIn = new URL(req.url);
  const sp = urlIn.searchParams;

  const url = new URL(UPSTREAM);
  url.searchParams.set("auth_token", token);

  // passthrough with validation
  const kind = sp.get("kind");
  if (kind && KINDS.has(kind)) url.searchParams.set("kind", kind);

  const filter = sp.get("filter");
  if (filter && FILTERS.has(filter)) url.searchParams.set("filter", filter);

  const currencies = sp.get("currencies");
  if (currencies) url.searchParams.set("currencies", currencies);

  const regions = sp.get("regions");
  if (regions) {
    const all = regions.split(",").map(s => s.trim()).filter(Boolean);
    const ok = all.every(code => REGIONS.has(code));
    if (ok) url.searchParams.set("regions", all.join(","));
  }

  const page = sp.get("page");
  if (page) url.searchParams.set("page", page);

  const pub = boolParam(sp.get("public"));
  if (pub) url.searchParams.set("public", pub);

  const following = boolParam(sp.get("following"));
  if (following) url.searchParams.set("following", following);

  const metadata = boolParam(sp.get("metadata"));
  if (metadata) url.searchParams.set("metadata", metadata);

  const approved = boolParam(sp.get("approved"));
  if (approved) url.searchParams.set("approved", approved);

  const panicScore = boolParam(sp.get("panic_score"));
  if (panicScore) url.searchParams.set("panic_score", panicScore);

  const format = sp.get("format"); // optional rss
  if (format === "rss") url.searchParams.set("format", "rss");

  // fetch
  const res = await fetch(url.toString(), { headers: { "user-agent": "atlas-vercel-gateway/1.0" } });
  const headers = {
    "access-control-allow-origin": "*"
  };

  if (format === "rss") {
    const text = await res.text();
    return new Response(text, { status: res.status, headers: { ...headers, "content-type": "application/rss+xml; charset=utf-8" } });
  } else {
    const body = await res.text();
    const ct = res.headers.get("content-type") || "application/json; charset=utf-8";
    return new Response(body, { status: res.status, headers: { ...headers, "content-type": ct } });
  }
}
