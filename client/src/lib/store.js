import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const safeStorage = createJSONStorage(() => {
  if (typeof window === 'undefined') {
    return {
      getItem:    () => null,
      setItem:    () => {},
      removeItem: () => {},
    };
  }
  return localStorage;
});

// ─── Auth Store ───────────────────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:  null,
      token: null,

      setAuth: (user, token) => {
        const prevUser = get().user;
        // Clear cart when a different user logs in
        if (prevUser && prevUser.id !== user.id) {
          useCartStore.getState().clearCart();
        }
        set({ user, token });
        // Also save token to localStorage for API interceptor
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
      },

      logout: () => {
        useCartStore.getState().clearCart();
        set({ user: null, token: null });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      },
    }),
    {
      name:    'auth-storage',
      storage: safeStorage,
      // Called after store is hydrated from localStorage
      onRehydrateStorage: () => (state) => {
        // Sync token to localStorage so API interceptor can find it
        if (state?.token && typeof window !== 'undefined') {
          localStorage.setItem('token', state.token);
        }
      },
    }
  )
);

// ─── Cart Store ───────────────────────────────────────────────────────────────
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        const items    = get().items;
        const existing = items.find((i) => i.productId === product.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === product.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                productId: product.id,
                name:      product.name,
                price:     product.price,
                imageUrl:  product.imageUrl,
                quantity,
              },
            ],
          });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name:    'cart-storage',
      storage: safeStorage,
    }
  )
);
