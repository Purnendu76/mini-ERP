import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuditStore } from "./auditStore";

import type { Product } from "@/types/product.types";

type ProductInput = Omit<Product, "id" | "createdAt">;

type ProductStore = {
  products: Product[];

  addProduct: (product: ProductInput) => void;
  updateProduct: (id: string, product: ProductInput) => void;
  deleteProduct: (id: string) => void;
};

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      products: [],

      addProduct: (product) =>
        set((state) => {
          const newProduct = {
            id: crypto.randomUUID(),
            ...product,
            createdAt: new Date().toISOString().slice(0, 10),
          };

          useAuditStore.getState().addLog({
            action: "CREATE",
            entity: "PRODUCT",
            user: { name: "System Admin", email: "admin@invoice-system.local" },
            ipAddress: "127.0.0.1",
            details: `Added Product: ${product.name}`
          });

          return { products: [newProduct, ...state.products] };
        }),

      updateProduct: (id, updatedProduct) =>
        set((state) => {
          const product = state.products.find(p => p.id === id);
          if (product) {
            useAuditStore.getState().addLog({
              action: "UPDATE",
              entity: "PRODUCT",
              user: { name: "System Admin", email: "admin@invoice-system.local" },
              ipAddress: "127.0.0.1",
              details: `Updated Product: ${product.name}`
            });
          }
          return {
            products: state.products.map((product) =>
              product.id === id
                ? {
                    ...product,
                    ...updatedProduct,
                  }
                : product
            ),
          };
        }),

      deleteProduct: (id) =>
        set((state) => {
          const product = state.products.find(p => p.id === id);
          if (product) {
            useAuditStore.getState().addLog({
              action: "DELETE",
              entity: "PRODUCT",
              user: { name: "System Admin", email: "admin@invoice-system.local" },
              ipAddress: "127.0.0.1",
              details: `Deleted Product: ${product.name}`
            });
          }
          return {
            products: state.products.filter((product) => product.id !== id),
          };
        }),
    }),
    {
      name: "erp_products",
    }
  )
);