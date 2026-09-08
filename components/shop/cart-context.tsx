"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartItem } from "@/lib/shop/types";

const STORAGE_KEY = "sweetdetails_cart_v1";

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (item: Omit<CartItem, "key">) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    return {
      items,
      count,
      total,
      addItem: (item) => {
        const key = [
          item.productId,
          item.shapeId || "",
          item.customization.inscription || "",
          item.customization.childName || "",
          item.customization.designDate || "",
          item.customization.themeColor || "",
          item.customization.customColor || "",
          item.customization.neededByDate || "",
          item.customization.occasion || "",
        ].join("|");
        setItems(prev => {
          const existing = prev.find(p => p.key === key);
          if (existing) {
            return prev.map(p =>
              p.key === key
                ? { ...p, quantity: p.quantity + item.quantity, customization: { ...p.customization, ...item.customization } }
                : p,
            );
          }
          return [...prev, { ...item, key }];
        });
      },
      removeItem: (key) => setItems(prev => prev.filter(i => i.key !== key)),
      updateQuantity: (key, quantity) =>
        setItems(prev =>
          prev.map(i => {
            if (i.key !== key) return i;
            const q = Math.max(i.minQuantity, quantity);
            return { ...i, quantity: q };
          }),
        ),
      clear: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    return {
      items: [] as CartItem[],
      count: 0,
      total: 0,
      addItem: () => {},
      removeItem: () => {},
      updateQuantity: () => {},
      clear: () => {},
    };
  }
  return ctx;
}
