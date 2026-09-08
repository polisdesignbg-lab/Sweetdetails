export type Choice = { label: string; price?: number };
export type ProductShape = { id: string; label: string; image: string };
export type ProductOption = {
  id: string;
  label: string;
  type: "select" | "text" | "textarea" | "checkbox";
  required?: boolean;
  choices?: Choice[];
  dependsOn?: string;
  addonPrice?: number;
};
export type Product = {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  minQuantity: number;
  images: string[];
  shapes: ProductShape[];
  badge?: string;
  options: ProductOption[];
};
export type SiteSettings = { brand: string; headline: string; intro: string; announcement: string; about: string; leadDays: string; primaryColor: string; instagram: string; facebook: string; tiktok: string; email: string; phone: string; categories: string[] };

export const defaultSettings: SiteSettings = {
  brand: "Sweet Details",
  headline: "Малките детайли правят големите моменти!",
  intro: "Персонализирани бисквитки с фондан за всеки повод ❤️",
  announcement: "Поръчки се приемат 2–3 седмици предварително",
  about: "В Sweet Details всяка бисквитка се приготвя с внимание, украсява се индивидуално с фонданов печат и може да бъде опакована като готов подарък за гостите ви — идеална за рожден ден, кръщене, сватба и всеки специален празник.",
  leadDays: "минимум 2 седмици предварително",
  primaryColor: "#e92e72",
  instagram: "", facebook: "", tiktok: "", email: "sweetdetails.bg@gmail.com", phone: "",
  categories: ["Кръщене", "Рожден ден", "Сватба", "Завършване", "Фирмени", "Други"],
};

const commonOptions: ProductOption[] = [
  { id: "occasion", label: "Повод", type: "select", required: true, choices: [{ label: "Кръщене" }, { label: "Рожден ден" }, { label: "Сватба" }, { label: "Завършване" }, { label: "Фирмен повод" }, { label: "Друг" }] },
  { id: "ribbon", label: "Индивидуална опаковка с панделка", type: "checkbox" },
  { id: "ribbonColor", label: "Цвят на панделката", type: "select", dependsOn: "ribbon", choices: [{ label: "Пудра" }, { label: "Небесно синьо" }, { label: "Шампанско" }, { label: "Бяло" }] },
  { id: "giftBox", label: "Добави кутия (+3 €)", type: "checkbox", addonPrice: 3 },
  { id: "printText", label: "Текст върху бисквитките", type: "text" },
  { id: "brief", label: "Опиши желаната визия", type: "textarea" },
];

export const PACKAGING_NOTE = "Ако не е избрана панделка, бисквитките ще бъдат опаковани в целофанче.";

const baptismShapes: ProductShape[] = [
  { id: "baptism-circle", label: "Кръг", image: "/shapes/circle.svg" },
  { id: "baptism-heart", label: "Сърце", image: "/shapes/heart.svg" },
  { id: "baptism-cross", label: "Кръст", image: "/shapes/cross.svg" },
  { id: "baptism-onesie", label: "Боди", image: "/shapes/onesie.svg" },
];

const birthdayShapes: ProductShape[] = [
  { id: "birthday-circle", label: "Кръг", image: "/shapes/circle.svg" },
  { id: "birthday-heart", label: "Сърце", image: "/shapes/heart.svg" },
  { id: "birthday-star", label: "Звезда", image: "/shapes/star.svg" },
  { id: "birthday-number", label: "Цифра", image: "/shapes/number.svg" },
];

const weddingShapes: ProductShape[] = [
  { id: "wedding-circle", label: "Кръг", image: "/shapes/circle.svg" },
  { id: "wedding-heart", label: "Сърце", image: "/shapes/heart.svg" },
  { id: "wedding-oval", label: "Овал", image: "/shapes/oval.svg" },
  { id: "wedding-flower", label: "Цвете", image: "/shapes/flower.svg" },
];

export const defaultProducts: Product[] = [
  { id: "baptism", title: "Бисквитки за кръщене", category: "Кръщене", description: "Нежни маслени бисквитки с персонализиран фонданов печат за кръщене.", price: 1.95, minQuantity: 10, images: ["/products-showcase.png"], shapes: baptismShapes, options: commonOptions },
  { id: "birthday", title: "Бисквитки за рожден ден", category: "Рожден ден", description: "Персонализирани бисквитки с тематичен дизайн за рожден ден.", price: 1.95, minQuantity: 10, images: ["/products-showcase.png"], badge: "Най-любими", shapes: birthdayShapes, options: commonOptions },
  { id: "wedding", title: "Бисквитки за сватба", category: "Сватба", description: "Елегантни бисквитки с фонданов печат за сватбени тържества.", price: 2.25, minQuantity: 10, images: ["/products-showcase.png"], shapes: weddingShapes, options: commonOptions },
];

export const defaultShapesByProductId: Record<string, ProductShape[]> = {
  baptism: baptismShapes,
  birthday: birthdayShapes,
  wedding: weddingShapes,
};
