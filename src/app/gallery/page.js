"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCartFavorite } from "../context/cartFavoriteContext";
import ProductCardHome from "@/components/ProductCardHome";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Gallery() {
  const [products, setProducts] = useState([]);
  const { cart, setCart } = useCartFavorite();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { email, userId } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products", {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          "X-Force-Refresh": "true",
          cache: 'no-store'
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...new Set(products.map(product => product.category))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
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
                <span className="text-amazon-yellow">معرض</span>{" "}
                <span className="text-white">المنتجات</span>
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
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-amazon-yellow/90 backdrop-blur-md p-4 rounded-full shadow-lg hover:bg-amazon-yellow transition-all duration-300 group"
                >
                  <Filter className="w-5 h-5 text-amazon group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`fixed inset-y-0 right-0 w-64 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${showFilters ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 border-b border-amazon-light-gray pb-4">
            <button onClick={() => setShowFilters(false)}>
              <X className="w-6 h-6 text-amazon hover:text-amazon-orange transition-colors" />
            </button>
            <h3 className="text-lg font-semibold text-amazon">التصفية</h3>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-amazon-dark-gray mb-2">الفئات</h4>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`block w-full text-right px-3 py-2 rounded-lg transition-all duration-200 ${selectedCategory === category
                      ? 'bg-amazon-yellow/10 text-amazon-orange font-medium'
                      : 'hover:bg-amazon-light-gray'
                      }`}
                  >
                    {category === 'all' ? 'جميع الفئات' : category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 w-full">
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProducts.map((product) => (
            <ProductCardHome key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

