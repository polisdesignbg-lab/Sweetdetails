export type Choice = { label: string; price?: number };
export type ProductOption = { id: string; label: string; type: "select" | "text" | "textarea" | "checkbox"; required?: boolean; choices?: Choice[]; dependsOn?: string };
export type Product = { id: string; title: string; category: string; description: string; price: number; minQuantity: number; images: string[]; badge?: string; options: ProductOption[] };
export type SiteSettings = { brand: string; headline: string; intro: string; announcement: string; about: string; leadDays: string; primaryColor: string; instagram: string; facebook: string; tiktok: string; email: string; phone: string; categories: string[] };

export const defaultSettings: SiteSettings = {
  brand: "Sweet Details",
  headline: "Малък сладък жест. Голям личен отпечатък.",
  intro: "Ръчно приготвени маслени бисквити с фонданов печат, създадени специално за твоя повод.",
  announcement: "Поръчки се приемат минимум 2 седмици предварително",
  about: "Всяка бисквитка се приготвя с внимание, украсява се индивидуално и може да бъде опакована като готов подарък за гостите ви.",
  leadDays: "минимум 2 седмици предварително",
  primaryColor: "#e97d9e",
  instagram: "", facebook: "", tiktok: "", email: "sweetdetails.bg@gmail.com", phone: "",
  categories: ["Рожден ден", "Кръщене", "Сватба", "Фирмени", "Други"],
};

const commonOptions: ProductOption[] = [
  { id: "occasion", label: "Повод", type: "select", required: true, choices: [{label:"Рожден ден"},{label:"Кръщене"},{label:"Сватба"},{label:"Фирмен повод"},{label:"Друг"}] },
  { id: "ribbon", label: "Индивидуална опаковка с панделка", type: "checkbox" },
  { id: "ribbonColor", label: "Цвят на панделката", type: "select", dependsOn: "ribbon", choices: [{label:"Пудра"},{label:"Небесно синьо"},{label:"Шампанско"},{label:"Бяло"}] },
  { id: "printText", label: "Текст върху бисквитките", type: "text" },
  { id: "brief", label: "Опиши желаната визия", type: "textarea" },
];

export const defaultProducts: Product[] = [
  { id:"classic", title:"Класически кръгли бисквитки", category:"Други", description:"Нежни маслени бисквитки с персонализиран кръгъл фонданов печат.", price:3.8, minQuantity:10, images:["/hero-cookies.png"], badge:"Най-поръчвани", options:commonOptions },
  { id:"gift", title:"Подаръчен комплект", category:"Рожден ден", description:"Подбрана кутия с различни дизайни, готова за специален подарък.", price:32, minQuantity:10, images:["/hero-cookies.png"], options:commonOptions },
  { id:"event", title:"Бисквитки за гости", category:"Сватба", description:"Персонален спомен за всеки гост, с индивидуална опаковка.", price:4.4, minQuantity:10, images:["/hero-cookies.png"], options:commonOptions },
];
