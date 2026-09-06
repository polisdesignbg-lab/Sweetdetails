export type Choice = { label: string; price?: number };
export type ProductOption = { id: string; label: string; type: "select" | "text" | "textarea" | "checkbox"; required?: boolean; choices?: Choice[]; dependsOn?: string };
export type CookieShape = { id: string; name: string; image: string };
export type Product = {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  minQuantity: number;
  images: string[];
  badge?: string;
  options: ProductOption[];
  shapes: CookieShape[];
};
export type SiteSettings = { brand: string; headline: string; intro: string; announcement: string; about: string; leadDays: string; primaryColor: string; instagram: string; facebook: string; tiktok: string; email: string; phone: string; categories: string[] };

export const defaultSettings: SiteSettings = {
  brand: "Sweet Details",
  headline: "Малките детайли правят големите моменти!",
  intro: "Персонализирани бисквитки с фондан за всеки повод ❤️",
  announcement: "Бисквитки, които създават усмивки!",
  about: "В Sweet Details всяка бисквитка се приготвя с внимание, украсява се индивидуално с фонданов печат и може да бъде опакована като готов подарък за гостите ви — идеална за рожден ден, кръщене, сватба и всеки специален празник.",
  leadDays: "минимум 2 седмици предварително",
  primaryColor: "#e92e72",
  instagram: "", facebook: "", tiktok: "", email: "sweetdetails.bg@gmail.com", phone: "",
  categories: ["Кръщене", "Рожден ден", "Сватба", "Завършване", "Фирмени", "Други"],
};

const commonOptions: ProductOption[] = [
  { id: "ribbon", label: "Индивидуална опаковка с панделка", type: "checkbox" },
  { id: "ribbonColor", label: "Цвят на панделката", type: "select", dependsOn: "ribbon", choices: [{label:"Пудра"},{label:"Небесно синьо"},{label:"Шампанско"},{label:"Бяло"}] },
  { id: "printText", label: "Текст върху бисквитките", type: "text" },
  { id: "brief", label: "Опиши желаната визия", type: "textarea" },
];

const shape = (id: string, name: string): CookieShape => ({
  id,
  name,
  image: "/products-showcase.png",
});

export function normalizeProduct(product: Product): Product {
  return {
    ...product,
    images: Array.isArray(product.images) ? product.images : [],
    options: Array.isArray(product.options) ? product.options : [],
    shapes: Array.isArray(product.shapes) ? product.shapes : [],
  };
}

export const defaultProducts: Product[] = [
  {
    id: "baptism",
    title: "Бисквитки за кръщене",
    category: "Кръщене",
    description: "Нежни маслени бисквитки с персонализиран фонданов печат за кръщене.",
    price: 1.95,
    minQuantity: 10,
    images: ["/products-showcase.png"],
    options: commonOptions,
    shapes: [shape("baptism-round", "Кръг"), shape("baptism-cross", "Кръст"), shape("baptism-heart", "Сърце")],
  },
  {
    id: "birthday",
    title: "Бисквитки за рожден ден",
    category: "Рожден ден",
    description: "Персонализирани бисквитки с тематичен дизайн за рожден ден.",
    price: 1.95,
    minQuantity: 10,
    images: ["/products-showcase.png"],
    badge: "Най-любими",
    options: commonOptions,
    shapes: [shape("birthday-round", "Кръг"), shape("birthday-heart", "Сърце"), shape("birthday-star", "Звезда"), shape("birthday-number", "Цифра")],
  },
  {
    id: "wedding",
    title: "Бисквитки за сватба",
    category: "Сватба",
    description: "Елегантни бисквитки с фонданов печат за сватбени тържества.",
    price: 2.25,
    minQuantity: 10,
    images: ["/products-showcase.png"],
    options: commonOptions,
    shapes: [shape("wedding-heart", "Сърце"), shape("wedding-round", "Кръг"), shape("wedding-oval", "Елипса")],
  },
  {
    id: "graduation",
    title: "Бисквитки за завършване",
    category: "Завършване",
    description: "Празнични бисквитки с фонданов печат за абитуриенти и дипломанти.",
    price: 1.95,
    minQuantity: 10,
    images: ["/products-showcase.png"],
    options: commonOptions,
    shapes: [shape("grad-round", "Кръг"), shape("grad-star", "Звезда"), shape("grad-cap", "Капа")],
  },
];
