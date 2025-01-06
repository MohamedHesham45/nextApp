"use client";

import ProductCardHome from "@/components/ProductCardHome";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

export default function CategoryPage() {
  const { category } = useParams();
  const decodedCategory = decodeURIComponent(category);
  const displayCategory = decodedCategory.startsWith('ال') ? decodedCategory : `ال${decodedCategory}`;
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchCategoryProducts() {
      try {
        const response = await fetch(`/api/products?category=${category}`);
        if (!response.ok) {
          throw new Error("Failed to fetch category products");
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching category products:", error);
      }
    }

    fetchCategoryProducts();
  }, [category]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch;
  });

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 direction-rtl">
      <div className="min-h-screen bg-amazon-light-gray direction-rtl">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-amazon">
            <div className="absolute inset-0 bg-gradient-to-r from-amazon-orange/10 via-amazon-yellow/20 to-amazon-blue/20"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amazon/30 to-amazon/90"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amazon-yellow via-amazon-orange to-amazon-blue"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amazon-orange/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-amazon-yellow/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                  <span className="text-amazon-yellow">كل منتجات</span>{" "}
                  <span className="text-white">{displayCategory}</span>
                </h1>
                <p className="text-amazon-light-gray/80 text-lg max-w-2xl mx-auto mb-8">
                  اكتشف مجموعتنا الواسعة من المنتجات المميزة بأفضل الأسعار
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
                   <div className="flex-1 relative w-full">
                  <input
                    type="text"
                    placeholder="ابحث عن المنتجات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-6 py-4 rounded-full text-right pr-12 shadow-lg bg-white/10 backdrop-blur-md border border-white/10 text-white placeholder-gray-300 focus:ring-2 focus:ring-amazon-yellow focus:border-amazon-yellow outline-none"
                  />
                  <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amazon-yellow w-5 h-5" />
                </div> 
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 py-8">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-700 mb-3">
                لا توجد منتجات في هذه الفئة
              </h2>
              <p className="text-gray-500 max-w-md">
                لم يتم العثور على منتجات في هذه الفئة حالياً
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredProducts.map((product, index) => (
                <div
                  key={index}
                  className="transform hover:scale-[1.01] transition-transform"
                >
                  <ProductCardHome product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
