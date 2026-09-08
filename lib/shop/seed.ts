import type { ShopCategory, ShopProduct, ShopShape } from "./types";
import { slugify } from "./types";

export const DEFAULT_SHAPES: ShopShape[] = [
  { id: "shape-circle", label: "Кръг", image: "/shapes/circle.svg", addonPrice: 0, active: true, position: 0 },
  { id: "shape-heart", label: "Сърце", image: "/shapes/heart.svg", addonPrice: 0, active: true, position: 1 },
  { id: "shape-onesie", label: "Боди", image: "/shapes/onesie.svg", addonPrice: 0, active: true, position: 2 },
  { id: "shape-bow", label: "Панделка", image: "/shapes/flower.svg", addonPrice: 0, active: true, position: 3 },
  { id: "shape-star", label: "Звезда", image: "/shapes/star.svg", addonPrice: 0, active: true, position: 4 },
];

export const DEFAULT_CATEGORIES: ShopCategory[] = [
  { id: "cat-baptism", slug: "krashtene", name: "Кръщене", description: "Нежни дизайни за свято кръщене.", image: "/shapes/cross.svg", active: true, position: 0 },
  { id: "cat-birthday", slug: "rozhden-den", name: "Рожден ден", description: "Персонализирани бисквитки за рожден ден.", image: "/shapes/heart.svg", active: true, position: 1 },
  { id: "cat-first-birthday", slug: "parvi-rozhden-den", name: "Първи рожден ден", description: "Специални дизайни за първи рожден ден.", image: "/shapes/number.svg", active: true, position: 2 },
  { id: "cat-baby", slug: "bebe-pogacha", name: "Бебе / Погача", description: "Бисквитки за бебе и семейни празници.", image: "/shapes/onesie.svg", active: true, position: 3 },
  { id: "cat-wedding", slug: "svatba", name: "Сватба", description: "Елегантни бисквитки за сватбени тържества.", image: "/shapes/oval.svg", active: true, position: 4 },
  { id: "cat-school", slug: "detska-gradina-uchilishte", name: "Детска градина / Училище", description: "За първи учебен ден и празници в детската градина.", image: "/shapes/star.svg", active: true, position: 5 },
  { id: "cat-holidays", slug: "praznitsi", name: "Празници", description: "Коледни, великденски и сезонни дизайни.", image: "/shapes/flower.svg", active: true, position: 6 },
  { id: "cat-corporate", slug: "firmeni-biskvitki", name: "Фирмени бисквитки", description: "Брандирани бисквитки за събития и подаръци.", image: "/shapes/circle.svg", active: true, position: 7 },
];

const PACKAGING_INFO = "Всяка бисквитка пристига опакована в целофан и с панделка.";

const allShapeIds = DEFAULT_SHAPES.map(s => s.id);
const colors = ["Розово", "Бебешко синьо", "Бежово", "Зелено", "Лилаво", "Жълто", "Друго"];

function demoProduct(p: Partial<ShopProduct> & Pick<ShopProduct, "id" | "title" | "categoryId" | "shortDescription">): ShopProduct {
  const slug = p.slug ?? slugify(p.title);
  return {
    slug,
    description: p.shortDescription,
    images: p.images ?? ["/products-showcase.png"],
    pricePerUnit: 2,
    priceTiers: [],
    minQuantity: 10,
    quantityStep: 1,
    shapeIds: allShapeIds,
    themeColors: colors,
    sizeInfo: "Приблизително 6–7 см, в зависимост от формата.",
    packagingInfo: PACKAGING_INFO,
    productInfo: "Маслени бисквитки с фонданов печат. Минимален срок за поръчка: 7 работни дни.",
    featured: false,
    active: true,
    inStock: true,
    isCustomDesign: false,
    seoTitle: p.title,
    seoDescription: p.shortDescription,
    position: 0,
    ...p,
  };
}

export const DEFAULT_SHOP_PRODUCTS: ShopProduct[] = [
  demoProduct({
    id: "prod-sveto-krashtene-zeleni",
    slug: "sveto-krashtene-zeleni-lista",
    title: "Свето Кръщение – зелени листа",
    categoryId: "cat-baptism",
    shortDescription: "Нежен дизайн със зелени листа и златни акценти за кръщене.",
    featured: true,
    position: 0,
  }),
  demoProduct({
    id: "prod-sveto-krashtene-rozovo",
    slug: "sveto-krashtene-rozovo-zlatno",
    title: "Свето Кръщение – розово и златно",
    categoryId: "cat-baptism",
    shortDescription: "Класически розово-златен дизайн за свято кръщене.",
    featured: true,
    position: 1,
  }),
  demoProduct({
    id: "prod-parvi-rd-meche",
    slug: "parvi-rozhden-den-meche",
    title: "Първи рожден ден – мече",
    categoryId: "cat-first-birthday",
    shortDescription: "Сладко мече и персонализиран надпис за първи рожден ден.",
    featured: true,
    position: 2,
  }),
  demoProduct({
    id: "prod-rozhden-den",
    slug: "rozhden-den-personaliziran",
    title: "Рожден ден – персонализиран дизайн",
    categoryId: "cat-birthday",
    shortDescription: "Тематичен дизайн с име, години и любими елементи.",
    position: 3,
  }),
  demoProduct({
    id: "prod-dobre-doshlo-bebe",
    slug: "dobre-doshlo-bebe",
    title: "Добре дошло бебе",
    categoryId: "cat-baby",
    shortDescription: "Нежен дизайн за бебешка погача или подарък за новородено.",
    position: 4,
  }),
  demoProduct({
    id: "prod-svatbeni",
    slug: "svatbeni-biskvitki",
    title: "Сватбени бисквитки",
    categoryId: "cat-wedding",
    shortDescription: "Елегантни бисквитки с монограма или дата на сватбата.",
    featured: true,
    position: 5,
  }),
];

export { PACKAGING_INFO as SHOP_PACKAGING_INFO };

export const SHOP_SETTINGS_KEY = "shop_settings";

export type ShopSettings = { minLeadDays: number; catalogVersion?: number };

export const defaultShopSettings: ShopSettings = { minLeadDays: 14, catalogVersion: 5 };
