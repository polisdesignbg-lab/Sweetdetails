import { getShopCatalog } from "@/lib/shop/data";

export async function GET() {
  const catalog = await getShopCatalog();
  return Response.json(catalog, {
    headers: {
      "cache-control": "public, max-age=30, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
