import { defaultProducts, defaultSettings } from "@/lib/defaults";
import { buildStructuredData, jsonLdScript } from "@/lib/seo";
import Storefront from "./storefront";

export const dynamic = "force-static";

export default function Home() {
  const content = { settings: defaultSettings, products: defaultProducts };
  const schema = buildStructuredData(content.settings, content.products);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(schema) }}
      />
      <Storefront initial={content} />
    </>
  );
}
