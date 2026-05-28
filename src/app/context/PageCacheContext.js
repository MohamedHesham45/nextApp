"use client";
import { createContext, useContext } from "react";

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
    saveCache: (state) => { store[key] = state; },
    clearCache: () => { delete store[key]; },
  };
}
