export type PriceTier = { min: number; max?: number; pricePerUnit: number };

export type ShopCategory = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  active: boolean;
  position: number;
  seoTitle?: string;
  seoDescription?: string;
};

export type ShopShape = {
  id: string;
  label: string;
  image: string;
  addonPrice: number;
  active: boolean;
  position: number;
};

export type ShopProduct = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  images: string[];
  pricePerUnit: number;
  priceTiers: PriceTier[];
  minQuantity: number;
  quantityStep: number;
  shapeIds: string[];
  themeColors: string[];
  sizeInfo: string;
  packagingInfo: string;
  productInfo: string;
  featured: boolean;
  active: boolean;
  inStock: boolean;
  isCustomDesign: boolean;
  seoTitle: string;
  seoDescription: string;
  position: number;
};

export type OrderCustomization = {
  occasion?: string;
  inscription?: string;
  childName?: string;
  designDate?: string;
  themeColor?: string;
  customColor?: string;
  neededByDate?: string;
  notes?: string;
  referenceImageUrl?: string;
};

export type OrderContact = {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  deliveryNotes?: string;
};

export type OrderStatus =
  | "new"
  | "pending_confirmation"
  | "confirmed"
  | "in_production"
  | "ready"
  | "shipped"
  | "completed"
  | "cancelled";

export type ShopOrder = {
  id: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  categorySlug?: string;
  shapeId?: string;
  shapeLabel?: string;
  shapeAddon?: number;
  quantity: number;
  unitPrice: number;
  total: number;
  customization: OrderCustomization;
  contact: OrderContact;
  status: OrderStatus;
  createdAt: string;
};

export type ShopCatalog = {
  categories: ShopCategory[];
  shapes: ShopShape[];
  products: ShopProduct[];
  settings: { minLeadDays: number };
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Нова",
  pending_confirmation: "За потвърждение",
  confirmed: "Потвърдена",
  in_production: "В изработка",
  ready: "Готова",
  shipped: "Изпратена",
  completed: "Завършена",
  cancelled: "Отказана",
};

export const DEFAULT_THEME_COLORS = [
  "Розово",
  "Бебешко синьо",
  "Бежово",
  "Зелено",
  "Лилаво",
  "Жълто",
  "Друго",
];

export function slugify(text: string) {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ж: "zh", з: "z", и: "i", й: "y",
    к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
    ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sht", ъ: "a", ь: "", ю: "yu", я: "ya",
  };
  return text
    .toLowerCase()
    .split("")
    .map(c => map[c] ?? c)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "item";
}
