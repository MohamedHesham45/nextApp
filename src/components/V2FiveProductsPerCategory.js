"use client";

import { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { Grid, List } from "lucide-react";
import V2ProductCardSimple from "./V2ProductCardSimple";
import Link from "next/link";

const V2FiveProductsPerCategory = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid | list

  useEffect(() => {
    const fetchCategoriesWithProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/v2/api/products/home?t=${Date.now()}`, {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data);
        // Set first category as selected by default
        if (data.length > 0) setSelectedCategory(data[0].category);
      } catch (error) {
        setError(error.message);
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoriesWithProducts();
  }, []);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  // Find products for selected category
  const filteredProducts = selectedCategory
    ? categories.find((c) => c.category === selectedCategory)?.products || []
    : [];

  // Get categoryId from the first product in the filtered list
  const categoryId =
    filteredProducts.length > 0
      ? filteredProducts[0].categoryId ||
        filteredProducts[0].categoryID ||
        filteredProducts[0].category
      : selectedCategory;

  return (
    <div className="w-full pt-4">
      <div className="flex items-center justify-between mb-6 gap-4 px-2">
        <button
          onClick={() =>
            setViewMode((prev) => (prev === "grid" ? "list" : "grid"))
          }
          className="p-2 rounded-md bg-amazon-light-gray text-amazon hover:bg-amazon-yellow flex-shrink-0 transition"
        >
          {viewMode === "grid" ? <List size={18} /> : <Grid size={18} />}
        </button>

        <span className="text-gray-300">|</span>
        <div className="overflow-x-auto flex-1 direction-rtl">
          <div className="flex space-x-2 w-max pb-2">
            {categories.map((c, i) => (
              <button
                key={i}
                onClick={() => setSelectedCategory(c.category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-300 ${
                  selectedCategory === c.category
                    ? "bg-amazon-orange text-white shadow"
                    : "bg-amazon-light-gray text-amazon hover:bg-amazon-yellow"
                }`}
              >
                {c.category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products */}
      {viewMode === "grid" ? (
        <>
          <div className="grid grid-cols-3 gap-[1px]">
            {filteredProducts.map((product) => (
              <V2ProductCardSimple
                key={product._id}
                product={product}
                viewMode="grid"
              />
            ))}
          </div>
          {/* View All Button */}
          {categoryId && (
            <div className="flex justify-center mt-8">
              <Link
                href={`/v2/category/${encodeURIComponent(categoryId)}`}
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full 
                 bg-amazon-orange text-white font-semibold text-base 
                 shadow-md transition-all duration-300 
                 hover:bg-amazon-orange-dark hover:shadow-lg hover:scale-105"
              >
                <span>
                  عرض كل منتجات ال
                  {categories.find((c) => c.category === selectedCategory)
                    ?.category || "المنتجات"}
                </span>
                <svg
                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            {filteredProducts.map((product) => (
              <V2ProductCardSimple
                key={product._id}
                product={product}
                viewMode="list"
              />
            ))}
          </div>
          {/* View All Button */}
          {categoryId && (
            <div className="flex justify-center mt-8">
              <Link
                href={`/v2/category/${encodeURIComponent(categoryId)}`}
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full 
                 bg-amazon-orange text-white font-semibold text-base 
                 shadow-md transition-all duration-300 
                 hover:bg-amazon-orange-dark hover:shadow-lg hover:scale-105"
              >
                <span>
                  عرض كل منتجات ال&nbsp;
                  {categories.find((c) => c.category === selectedCategory)
                    ?.category || "المنتجات"}
                </span>
                <svg
                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default V2FiveProductsPerCategory;
