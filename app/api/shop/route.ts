import { getShopCatalog } from "@/lib/shop/data";

export async function GET() {
  const catalog = await getShopCatalog();
  return Response.json(catalog);
}
