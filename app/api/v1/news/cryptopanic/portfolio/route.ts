import { NextRequest } from "next/server";

const UPSTREAM = "https://cryptopanic.com/api/v1/portfolio/";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = process.env.CRYPTOPANIC_TOKEN;
  if (!token) {
    return new Response(JSON.stringify({ error: "Server misconfigured: CRYPTOPANIC_TOKEN not set." }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*" }
    });
  }

  const url = new URL(UPSTREAM);
  url.searchParams.set("auth_token", token);

  const res = await fetch(url.toString(), { headers: { "user-agent": "atlas-vercel-gateway/1.0" } });
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") || "application/json; charset=utf-8",
      "access-control-allow-origin": "*"
    }
  });
}
