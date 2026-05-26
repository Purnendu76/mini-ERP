import { create } from "zustand";
import { useAuditStore } from "./auditStore";
import { axiosClient } from "@/api/axiosClient";
import type { Product } from "@/types/product.types";

type ProductInput = Omit<Product, "id" | "createdAt">;

type ProductStore = {
  products: Product[];
  isFetched: boolean;
  isLoading: boolean;
  error: string | null;

  fetchProducts: (force?: boolean) => Promise<void>;
  addProduct: (product: ProductInput) => Promise<boolean>;
  updateProduct: (id: string, product: ProductInput) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  getProductById: (id: string) => Product | undefined;
};

let activeFetchPromise: Promise<void> | null = null;

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  isFetched: false,
  isLoading: false,
  error: null,

  fetchProducts: async (force = false) => {
    // Deduplicate concurrent requests
    if (activeFetchPromise) return activeFetchPromise;
    if (get().isFetched && !force) return;

    activeFetchPromise = (async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await axiosClient.get("/products");
        if (response.status === 200) {
          set({
            products: response.data,
            isFetched: true,
            isLoading: false,
          });
        }
      } catch (err) {
        set({
          isLoading: false,
          error: err instanceof Error ? err.message : "Failed to fetch products",
        });
      } finally {
        activeFetchPromise = null;
      }
    })();

    return activeFetchPromise;
  },

  addProduct: async (product) => {
    try {
      const response = await axiosClient.post("/products", product);
      if (response.status === 201) {
        const newProduct = response.data;
        set((state) => ({ products: [newProduct, ...state.products] }));

        // Trigger live audit log insertion
        useAuditStore.getState().addLog({
          action: "CREATE",
          entity: "PRODUCT",
          userName: "System Admin",
          userEmail: "admin@example.com",
          ipAddress: "127.0.0.1",
          details: `Added Product: ${product.name}`,
        });

        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  updateProduct: async (id, updatedProduct) => {
    try {
      const response = await axiosClient.put(`/products/${id}`, updatedProduct);
      if (response.status === 200) {
        const updated = response.data;
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? updated : p)),
        }));

        useAuditStore.getState().addLog({
          action: "UPDATE",
          entity: "PRODUCT",
          userName: "System Admin",
          userEmail: "admin@example.com",
          ipAddress: "127.0.0.1",
          details: `Updated Product: ${updatedProduct.name}`,
        });

        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  deleteProduct: async (id) => {
    try {
      const targetProduct = get().products.find((p) => p.id === id);
      const response = await axiosClient.delete(`/products/${id}`);
      if (response.status === 200) {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));

        if (targetProduct) {
          useAuditStore.getState().addLog({
            action: "DELETE",
            entity: "PRODUCT",
            userName: "System Admin",
            userEmail: "admin@example.com",
            ipAddress: "127.0.0.1",
            details: `Deleted Product: ${targetProduct.name}`,
          });
        }

        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  getProductById: (id) => {
    return get().products.find((product) => product.id === id);
  },
}));