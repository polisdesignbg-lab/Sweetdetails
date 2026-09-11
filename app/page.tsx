import { defaultSettings } from "@/lib/defaults";
import { buildStructuredData, jsonLdScript } from "@/lib/seo";
import Storefront from "./storefront";

export const revalidate = 60;

export default function Home() {
  const content = { settings: defaultSettings };
  const schema = buildStructuredData(content.settings, []);
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
