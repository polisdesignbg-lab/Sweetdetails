import { getShopCatalog } from "@/lib/shop/data";

export async function GET() {
  const catalog = await getShopCatalog();
  return Response.json(catalog, {
    headers: {
      "cache-control":
        "public, max-age=60, s-maxage=300, stale-while-revalidate=3600, stale-if-error=86400",
    },
  });
}
