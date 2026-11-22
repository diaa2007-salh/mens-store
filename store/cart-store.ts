"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  variantId: string;
  productName: string;
  slug: string;
  image: string;
  size: string;
  color: string;
  unitPrice: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => boolean;
  setQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const state = get();
        const current = state.items.find((line) => line.variantId === item.variantId);
        if (!current && state.items.length >= 20) return false;
        if (current) {
          set({
            items: state.items.map((line) =>
              line.variantId === item.variantId
                ? { ...line, quantity: Math.min(10, line.quantity + 1) }
                : line,
            ),
          });
        } else {
          set({ items: [...state.items, { ...item, quantity: 1 }] });
        }
        return true;
      },
      setQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((line) =>
            line.variantId === variantId
              ? { ...line, quantity: Math.max(1, Math.min(10, quantity)) }
              : line,
          ),
        })),
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((line) => line.variantId !== variantId),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "mens-store-cart",
      version: 1,
      skipHydration: true,
    },
  ),
);
