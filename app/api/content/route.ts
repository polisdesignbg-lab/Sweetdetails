import { NextResponse } from "next/server";
import { getContent } from "@/lib/data";

export async function GET() {
  const content = await getContent();
  return NextResponse.json(content, {
    headers: {
      "cache-control":
        "public, max-age=60, s-maxage=300, stale-while-revalidate=3600, stale-if-error=86400",
    },
  });
}
