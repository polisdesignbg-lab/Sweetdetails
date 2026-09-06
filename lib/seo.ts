import type { Product, SiteSettings } from "@/lib/defaults";

export const SITE_URL = "https://sweetdetails.ink";
export const SITE_NAME = "Sweet Details";
export const SITE_LOCALE = "bg_BG";

export const SEO_KEYWORDS = [
  "персонализирани бисквити",
  "персонализирани сладки",
  "бисквитки с фондан",
  "маслени бисквити",
  "бисквитки за рожден ден",
  "бисквитки за кръщене",
  "бисквитки за сватба",
  "бисквитки за празник",
  "сладки за празник",
  "персонализирани сладки за празник",
  "бисквитки за гости",
  "фирмени бисквитки",
  "бисквитки с печат",
  "фонданов печат бисквитки",
  "подаръчни бисквитки",
  "ръчно изработени бисквитки",
  "бисквитки България",
  "поръчка бисквитки онлайн",
  "сладки за рожден ден",
  "сладки за кръщене",
  "сладки за сватба",
  "бисквитки за завършване",
  "корпоративни сладки",
  "Sweet Details",
];

export const SEO_TITLE =
  "Персонализирани бисквити и сладки за всеки празник | Sweet Details";

export const SEO_DESCRIPTION =
  "Поръчай персонализирани маслени бисквити с фонданов печат за рожден ден, кръщене, сватба, фирмени събития и всеки празник. Ръчна изработка, уникален дизайн и доставка в България.";

export const SEO_FAQ = [
  {
    question: "Какви персонализирани бисквити предлагате?",
    answer:
      "Sweet Details предлага маслени бисквити с фонданов печат за рожден ден, кръщене, сватба, завършване, фирмени събития и други поводи. Всяка бисквитка може да бъде с индивидуален текст, цветове и дизайн.",
  },
  {
    question: "Може ли да поръчам персонализирани сладки за празник онлайн?",
    answer:
      "Да. Отидете в каталога с бисквитки, изберете продукт и форма, попълнете детайлите за персонализация, прикачете примерен дизайн и завършете поръчката онлайн. Минималната поръчка е 10 броя.",
  },
  {
    question: "Колко време предварително трябва да поръчам?",
    answer:
      "Поръчките се приемат минимум 2 седмици предварително, за да можем да изработим бисквитките с внимание към всеки детайл.",
  },
  {
    question: "Предлагате ли доставка?",
    answer:
      "Да. Безплатна доставка при поръчки над 41 €. Бисквитките се опаковат нежно и могат да бъдат готови за подарък.",
  },
  {
    question: "За какви празници са подходящи вашите бисквитки?",
    answer:
      "Бисквитките ни са идеални за рожден ден, кръщене, сватба, baby shower, завършване, фирмени събития, коледни и всякакви лични празници.",
  },
];

export const SITEMAP_PATHS = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
];

export function buildStructuredData(settings: SiteSettings, products: Product[]) {
  const sameAs = [settings.instagram, settings.facebook, settings.tiktok].filter(Boolean);
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/sweet-details-logo.png`,
    image: `${SITE_URL}/hero-banner.png`,
    description: SEO_DESCRIPTION,
    email: settings.email,
    ...(settings.phone ? { telephone: settings.phone } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SEO_DESCRIPTION,
    inLanguage: "bg",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  const bakery = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "@id": `${SITE_URL}/#bakery`,
    name: SITE_NAME,
    url: SITE_URL,
    image: [`${SITE_URL}/hero-banner.png`, `${SITE_URL}/sweet-details-logo.png`],
    logo: `${SITE_URL}/sweet-details-logo.png`,
    description: SEO_DESCRIPTION,
    email: settings.email,
    ...(settings.phone ? { telephone: settings.phone } : {}),
    priceRange: "$$",
    currenciesAccepted: "EUR",
    paymentAccepted: "Credit Card",
    servesCuisine: "Bulgarian",
    areaServed: { "@type": "Country", name: "Bulgaria" },
    ...(sameAs.length ? { sameAs } : {}),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Персонализирани бисквити и сладки",
      itemListElement: products.map((product, index) => ({
        "@type": "Offer",
        position: index + 1,
        itemOffered: {
          "@type": "Product",
          name: product.title,
          description: product.description,
          image: product.images.map(img => (img.startsWith("http") ? img : `${SITE_URL}${img}`)),
          category: product.category,
          brand: { "@type": "Brand", name: SITE_NAME },
          offers: {
            "@type": "Offer",
            priceCurrency: "EUR",
            price: product.price,
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/products`,
          },
        },
      })),
    },
  };

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Най-любими персонализирани бисквити",
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.title,
      url: `${SITE_URL}/products`,
    })),
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: SEO_FAQ.map(item => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Начало", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Персонализирани бисквити", item: `${SITE_URL}/products` },
    ],
  };

  return [organization, website, bakery, itemList, faqPage, breadcrumb];
}

export function jsonLdScript(data: unknown[]) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
