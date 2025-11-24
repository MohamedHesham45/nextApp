"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Filter,
  X,
  Copy,
  Check,
  Heart,
  ShoppingBag,
  Send,
} from "lucide-react";
import { useCartFavorite } from "@/app/context/cartFavoriteContext";
import { toast } from "react-hot-toast";
import { useState as useLocalState } from "react";
import V2ProductCardHome from "@/components/V2ProductCardHome";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  FacebookShareButton,
  WhatsappShareButton,
  TwitterShareButton,
  TelegramShareButton,
  FacebookIcon,
  WhatsappIcon,
  TwitterIcon,
  TelegramIcon,
} from "react-share";
import Link from "next/link";
import ProductCard from "@/components/v2ProductCardSimpleGallery";

export default function Gallery() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/category");
        if (!res.ok) throw new Error("فشل تحميل الفئات");
        const data = await res.json();
        setCategories([
          { _id: "all", name: "جميع الفئات" },
          ...data.categories,
        ]);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const observer = useRef();

  const lastProductRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const query = new URLSearchParams({
          page: page.toString(),
          limit: "12",
          search: debouncedSearch,
          categoryId: selectedCategory !== "all" ? selectedCategory : "",
        });
        const res = await fetch(`/api/products?${query.toString()}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("فشل تحميل المنتجات");
        const data = await res.json();

        if (page === 1) {
          setProducts(data.products);
        } else {
          setProducts((prev) => [...prev, ...data.products]);
        }

        setHasMore(data.hasMore);
      } catch (err) {
        console.error(err);
        setError("فشل تحميل المنتجات. حاول مرة أخرى لاحقاً.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [page, debouncedSearch, selectedCategory]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
  }, [debouncedSearch, selectedCategory]);

  const { cart, setCart, favorite, setFavorite } = useCartFavorite();
  const [showShareModal, setShowShareModal] = useLocalState(false);
  const [shareProduct, setShareProduct] = useLocalState(null);
  const [copied, setCopied] = useLocalState(false);

  // Copy share modal logic from V2ProductCardHome
  const shareUrl = shareProduct
    ? `https://sitaramall.com/product/${shareProduct._id}`
    : "";
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("تم نسخ الرابط");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("فشل في نسخ الرابط");
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amazon-light-gray direction-rtl">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-amazon">
          <div className="absolute inset-0 bg-gradient-to-r from-amazon-orange/10 via-amazon-yellow/20 to-amazon-blue/20"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amazon/40 to-amazon/90"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amazon-yellow via-amazon-orange to-amazon-blue"></div>
        </div>

        <div className="relative py-8 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-3xl md:text-5xl font-bold text-white">
              <span className="text-amazon-yellow">معرض</span>{" "}
              <span className="text-white">المنتجات</span>
            </h1>
            <p className="text-amazon-light-gray/80 text-base md:text-lg">
              اكتشف مجموعتنا الواسعة من المنتجات المميزة بأفضل الأسعار
            </p>

            <div className="flex items-center gap-3 max-w-3xl mx-auto mt-6">
              {/* Search */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="ابحث عن المنتجات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-12 py-3 rounded-full text-right text-white placeholder-gray-300 bg-white/10 backdrop-blur-md border border-white/10 shadow-lg focus:ring-2 focus:ring-amazon-yellow focus:border-amazon-yellow outline-none"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amazon-yellow w-5 h-5" />
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amazon-yellow hover:text-amazon-orange transition"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>

              {/* Toggle View */}
              <button
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "list" : "grid")
                }
                className="bg-amazon-yellow text-amazon p-3 rounded-full shadow hover:bg-amazon-orange transition-all flex items-center justify-center w-12 h-12"
                title={viewMode === "grid" ? "عرض قائمة" : "عرض شبكة"}
              >
                {viewMode === "grid" ? (
                  // أيقونة قائمة
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect x="4" y="6" width="16" height="2" rx="1" />
                    <rect x="4" y="11" width="16" height="2" rx="1" />
                    <rect x="4" y="16" width="16" height="2" rx="1" />
                  </svg>
                ) : (
                  // أيقونة شبكة
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect x="4" y="4" width="7" height="7" rx="1" />
                    <rect x="13" y="4" width="7" height="7" rx="1" />
                    <rect x="4" y="13" width="7" height="7" rx="1" />
                    <rect x="13" y="13" width="7" height="7" rx="1" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* زر تبديل العرض خارج الـ search bar */}

      {/* Filters Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 w-64 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
          showFilters ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 border-b border-amazon-light-gray pb-4">
            <button onClick={() => setShowFilters(false)}>
              <X className="w-6 h-6 text-amazon hover:text-amazon-orange transition-colors" />
            </button>
            <h3 className="text-lg font-semibold text-amazon">التصفية</h3>
          </div>
          <div className="space-y-2">
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => setSelectedCategory(category._id)}
                className={`block w-full text-right px-3 py-2 rounded-md transition-all duration-200 ${
                  selectedCategory === category._id
                    ? "bg-amazon-yellow/20 text-amazon font-medium"
                    : "hover:bg-gray-100"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="container mx-auto py-2">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-3 gap-[1px]">
            {products.map((product, idx) => {
              if (products.length === idx + 1) {
                return (
                  <div ref={lastProductRef} key={product._id}>
                    <V2ProductCardHome product={product} />
                  </div>
                );
              } else {
                return (
                  <V2ProductCardHome key={product._id} product={product} />
                );
              }
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {products.map((product, idx) => (
              <ProductCard
                product={product}
                idx={idx}
                products={products}
                lastProductRef={lastProductRef}
                favorite={favorite}
                setFavorite={setFavorite}
                cart={cart}
                setCart={setCart}
                setShareProduct={setShareProduct}
                setShowShareModal={setShowShareModal}
              />
            ))}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-6">
            <LoadingSpinner />
          </div>
        )}

        {/* Share Modal (copied from V2ProductCardHome) */}
        {showShareModal && shareProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">مشاركة المنتج</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>
              {/* Product Preview */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex gap-3">
                  <img
                    src={
                      shareProduct.images && shareProduct.images[0]
                        ? shareProduct.images[0].startsWith("/")
                          ? `${shareProduct.images[0]}`
                          : `/${shareProduct.images[0]}`
                        : "/placeholder.png"
                    }
                    alt={shareProduct.title}
                    loading="lazy"
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm line-clamp-1">
                      {shareProduct.title}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {shareProduct.description
                        .replace(/<[^>]*>/g, "")
                        .substring(0, 150) + "..."}
                    </p>
                    <p className="text-sm font-semibold text-green-600 mt-1">
                      {shareProduct.discountPercentage > 0
                        ? `السعر: ${Math.round(
                            shareProduct.priceAfterDiscount
                          )} جنيه (بدلاً من ${Math.round(
                            shareProduct.price
                          )} جنيه)`
                        : `السعر: ${Math.round(shareProduct.price)} جنيه`}
                    </p>
                  </div>
                </div>
              </div>
              {/* Share Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <FacebookShareButton
                  url={shareUrl}
                  quote={`${shareProduct.title}\n\n${shareProduct.description
                    .replace(/<[^>]*>/g, "")
                    .substring(0, 150)}\n\nالسعر: ${Math.round(
                    shareProduct.priceAfterDiscount || shareProduct.price
                  )} جنيه\n\n🛒 اضغط على الرابط للمشاهدة والطلب الآن!`}
                  hashtag="#سيتار_مول #عروض #تسوق_اونلاين"
                  className="w-full"
                >
                  <div className="flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <FacebookIcon size={24} round />
                    <span className="text-sm">فيسبوك</span>
                  </div>
                </FacebookShareButton>
                <WhatsappShareButton
                  url={shareUrl}
                  title={`🛍️ ${
                    shareProduct.title
                  }\n\n📝 ${shareProduct.description
                    .replace(/<[^>]*>/g, "")
                    .substring(0, 150)}\n\n💰 السعر: ${Math.round(
                    shareProduct.priceAfterDiscount || shareProduct.price
                  )} جنيه\n\n✨ ${
                    shareProduct?.quantity > 10
                      ? "متوفر الآن"
                      : "كمية محدودة - اطلب الآن"
                  }\n\n👆 اضغط على الرابط لعرض المنتج وإتمام الطلب:`}
                  separator=" "
                  className="w-full"
                >
                  <div className="flex items-center justify-center gap-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <WhatsappIcon size={24} round />
                    <span className="text-sm">واتساب</span>
                  </div>
                </WhatsappShareButton>
                <TwitterShareButton
                  url={shareUrl}
                  title={`${shareProduct.title} - ${shareProduct.description
                    .replace(/<[^>]*>/g, "")
                    .substring(0, 150)} - السعر: ${Math.round(
                    shareProduct.priceAfterDiscount || shareProduct.price
                  )} جنيه - اضغط للمشاهدة والطلب`}
                  hashtags={["سيتار_مول", "تسوق_اونلاين", "عروض"]}
                  className="w-full"
                >
                  <div className="flex items-center justify-center gap-2 p-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors">
                    <TwitterIcon size={24} round />
                    <span className="text-sm">تويتر</span>
                  </div>
                </TwitterShareButton>
                <TelegramShareButton
                  url={shareUrl}
                  title={`${shareProduct.title}\n\n${shareProduct.description
                    .replace(/<[^>]*>/g, "")
                    .substring(0, 150)}\n\nالسعر: ${Math.round(
                    shareProduct.priceAfterDiscount || shareProduct.price
                  )} جنيه\n\n🔥 ${
                    shareProduct?.quantity > 10
                      ? "متوفر الآن - اطلب من الرابط"
                      : "كمية محدودة - اطلب الآن من الرابط"
                  }`}
                  className="w-full"
                >
                  <div className="flex items-center justify-center gap-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    <TelegramIcon size={24} round />
                    <span className="text-sm">تليجرام</span>
                  </div>
                </TelegramShareButton>
              </div>
              {/* Copy Link */}
              <div className="border-t pt-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 p-2 border rounded-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-1"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    <span className="text-sm">
                      {copied ? "تم النسخ" : "نسخ"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
