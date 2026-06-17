/**
 * Guest cart store — persists a cart in localStorage for unauthenticated
 * shoppers. The contents are POSTed inline to /api/orders/checkout/guest/.
 *
 * Logged-in users get a server-persisted cart via the orders API; the two
 * stores are independent and never sync (intentional — a user who just
 * logged in keeps their server cart).
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ProductDetail, ProductListItem } from '@/types/product';

export interface GuestCartLine {
  product: string; // product UUID
  quantity: number;
  include_installation: boolean;
  // Snapshot of display data so the cart page renders without a network
  // round-trip. Re-priced server-side at checkout.
  snapshot: {
    name: string;
    slug: string;
    price: string;
    discounted_price: string;
    image: string | null;
    installation_fee: string;
  };
}

interface GuestCartState {
  lines: GuestCartLine[];
  totalItems: () => number;
  subtotal: () => number;
  installationTotal: () => number;
  add: (product: ProductListItem | ProductDetail, qty?: number, withInstall?: boolean) => void;
  setQty: (productId: string, qty: number) => void;
  setInstall: (productId: string, withInstall: boolean) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

function snapshotFromProduct(p: ProductListItem | ProductDetail): GuestCartLine['snapshot'] {
  return {
    name: p.name,
    slug: p.slug,
    price: p.price,
    discounted_price: p.discounted_price,
    image: p.primary_image ?? null,
    installation_fee:
      'installation_fee' in p && p.installation_fee ? p.installation_fee : '0',
  };
}

export const useGuestCartStore = create<GuestCartState>()(
  persist(
    (set, get) => ({
      lines: [],
      totalItems: () => get().lines.reduce((s, l) => s + l.quantity, 0),
      subtotal: () =>
        get().lines.reduce(
          (s, l) => s + Number(l.snapshot.discounted_price) * l.quantity,
          0,
        ),
      installationTotal: () =>
        get().lines.reduce(
          (s, l) =>
            s +
            (l.include_installation
              ? Number(l.snapshot.installation_fee) * l.quantity
              : 0),
          0,
        ),
      add: (product, qty = 1, withInstall = false) => {
        const existing = get().lines.find((l) => l.product === product.id);
        if (existing) {
          set({
            lines: get().lines.map((l) =>
              l.product === product.id
                ? {
                    ...l,
                    quantity: l.quantity + qty,
                    include_installation: withInstall || l.include_installation,
                  }
                : l,
            ),
          });
        } else {
          set({
            lines: [
              ...get().lines,
              {
                product: product.id,
                quantity: qty,
                include_installation: withInstall,
                snapshot: snapshotFromProduct(product),
              },
            ],
          });
        }
      },
      setQty: (productId, qty) => {
        if (qty <= 0) {
          get().remove(productId);
          return;
        }
        set({
          lines: get().lines.map((l) =>
            l.product === productId ? { ...l, quantity: qty } : l,
          ),
        });
      },
      setInstall: (productId, withInstall) => {
        set({
          lines: get().lines.map((l) =>
            l.product === productId ? { ...l, include_installation: withInstall } : l,
          ),
        });
      },
      remove: (productId) =>
        set({ lines: get().lines.filter((l) => l.product !== productId) }),
      clear: () => set({ lines: [] }),
    }),
    { name: 'solar.guest_cart.v1' },
  ),
);
