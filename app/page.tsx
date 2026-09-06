import { defaultProducts, defaultSettings } from "@/lib/defaults";
import Storefront from "./storefront";

export const dynamic = "force-static";

export default function Home() {
  const content = { settings: defaultSettings, products: defaultProducts };
  const schema={"@context":"https://schema.org","@type":"Bakery",name:"Sweet Details",url:"https://sweetdetails.ink",image:"https://sweetdetails.ink/hero-cookies.png",description:"Персонализирани маслени бисквити с фонданов печат за всеки повод.",email:content.settings.email,priceRange:"лв.",sameAs:[content.settings.instagram,content.settings.facebook,content.settings.tiktok].filter(Boolean)};
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,"\\u003c")}}/><Storefront initial={content}/></>;
}
