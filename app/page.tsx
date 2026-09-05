import { getContent } from "@/lib/data";
import Storefront from "./storefront";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getContent();
  return <Storefront initial={content} />;
}
