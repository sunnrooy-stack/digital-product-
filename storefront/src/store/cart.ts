import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  coverImage: string;
  sellerName: string;
  fileUrls?: string[];
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  totalAmount: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const exists = get().items.find((i) => i.id === item.id);
        if (!exists) {
          set((state) => ({ items: [...state.items, item] }));
        }
      },

      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
      },

      clearCart: () => set({ items: [] }),

      isInCart: (id) => !!get().items.find((i) => i.id === id),

      totalAmount: () => get().items.reduce((sum, item) => sum + item.price, 0),

      itemCount: () => get().items.length,
    }),
    {
      name: 'premium-cart-storage',
    }
  )
);
