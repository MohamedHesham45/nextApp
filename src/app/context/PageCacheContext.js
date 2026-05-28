"use client";
import { createContext, useContext, useEffect, useRef } from "react";

// Module-level store: plain object that lives for the entire browser session.
// Mutations are synchronous so the cache is immediately visible when a page remounts.
const cacheStore = {};

const PageCacheContext = createContext(cacheStore);

export function PageCacheProvider({ children }) {
  return (
    <PageCacheContext.Provider value={cacheStore}>
      {children}
    </PageCacheContext.Provider>
  );
}

/**
 * usePageCache(key) — returns { cache, saveCache, clearCache } for the given page key.
 * Cache persists in memory across navigations within the same tab session.
 * Convention: use stable keys like 'gallery', 'v2-gallery', 'category-<id>', etc.
 */
export function usePageCache(key) {
  const store = useContext(PageCacheContext);
  return {
    cache: store[key] || null,
    saveCache: (state) => { store[key] = { ...(store[key] || {}), ...state }; },
    clearCache: () => { delete store[key]; },
  };
}

/**
 * useProductCacheSync — update or remove a product across all cached product lists.
 * Call after a successful PUT/DELETE API call to avoid re-fetching all products.
 */
export function useProductCacheSync() {
  const store = useContext(PageCacheContext);

  const updateProductInCache = (updatedProduct) => {
    for (const key of Object.keys(store)) {
      const entry = store[key];
      if (entry?.products && Array.isArray(entry.products)) {
        store[key] = {
          ...entry,
          products: entry.products.map((p) =>
            p._id === updatedProduct._id ? { ...p, ...updatedProduct } : p
          ),
        };
      }
    }
    // Clear product detail caches so they show fresh data on next visit
    delete store[`product-${updatedProduct._id}`];
    delete store[`v2-product-${updatedProduct._id}`];
  };

  const removeProductFromCache = (productId) => {
    for (const key of Object.keys(store)) {
      const entry = store[key];
      if (entry?.products && Array.isArray(entry.products)) {
        store[key] = {
          ...entry,
          products: entry.products.filter((p) => p._id !== productId),
        };
      }
    }
    delete store[`product-${productId}`];
    delete store[`v2-product-${productId}`];
  };

  return { updateProductInCache, removeProductFromCache };
}

/**
 * useScrollCache(key) — drop-in scroll position save/restore for any page.
 * Tracks scroll while the page is mounted, saves on unmount, restores on next mount.
 * For pages that also use usePageCache with the same key, scroll merges seamlessly.
 */
export function useScrollCache(key) {
  const { cache, saveCache } = usePageCache(key);
  const scrollYRef = useRef(0);

  // Track scroll position continuously
  useEffect(() => {
    const onScroll = () => { scrollYRef.current = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Save scroll on unmount
  useEffect(() => {
    return () => { saveCache({ scrollY: scrollYRef.current }); };
  }, []);

  // Restore scroll on mount
  useEffect(() => {
    if (!cache?.scrollY) return;
    const t = setTimeout(() => {
      window.scrollTo({ top: cache.scrollY, behavior: "instant" });
    }, 80);
    return () => clearTimeout(t);
  }, []);
}
