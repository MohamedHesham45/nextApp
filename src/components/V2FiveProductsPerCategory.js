"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import LoadingSpinner from "./LoadingSpinner";
import V2ProductCardHome from "./V2ProductCardHome";
import { useCartFavorite } from "@/app/context/cartFavoriteContext";
import ProductCard from "@/components/v2ProductCardSimpleGallery";

const V2FiveProductsPerCategory = ({ viewMode }) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [products, setProducts] = useState([]);
  const { cart, setCart, favorite, setFavorite } = useCartFavorite();
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareProduct, setShareProduct] = useState(null);
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
  const observer = useRef();

  const lastProductRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const query = new URLSearchParams({
          page: page.toString(),
          limit: "12",
          categoryId: selectedCategory !== "all" ? selectedCategory : "",
        });
        const res = await fetch(`/api/products?${query.toString()}`, {
          cache: "no-store",
        });
        console.log("Fetching products with query:", query.toString());
        console.log("Response status:", res);
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
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [page, selectedCategory]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
  }, [selectedCategory]);

  // useEffect(() => {
  //   const fetchCategoriesWithProducts = async () => {
  //     try {
  //       setIsLoading(true);
  //       setError(null);
  //       const response = await fetch(`/api/products/home?t=${Date.now()}`, {
  //         headers: {
  //           "Cache-Control": "no-cache, no-store, must-revalidate",
  //           Pragma: "no-cache",
  //           Expires: "0",
  //         },
  //       });
  //       if (!response.ok) {
  //         throw new Error("Failed to fetch categories");
  //       }
  //       const data = await response.json();
  //       setCategories(data);
  //       // Set first category as selected by default
  //       if (data.length > 0) setSelectedCategory(data[0].category);
  //     } catch (error) {
  //       setError(error.message);
  //       console.error("Error fetching categories:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchCategoriesWithProducts();
  // }, []);

  // if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  // Find products for selected category

  // Get categoryId from the first product in the filtered list
  const categoryId = selectedCategory;

  return (
    <div className="w-full pt-4">
      <div className="flex items-center justify-between mb-6 gap-4 px-2">
        <div className="flex-1 direction-rtl">
          <div className="flex flex-wrap gap-2 pb-2">
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => setSelectedCategory(category._id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-300 ${
                  selectedCategory === category._id
                    ? "bg-amazon-orange text-white shadow"
                    : "bg-amazon-light-gray text-amazon hover:bg-amazon-yellow"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products */}
      {viewMode === "grid" ? (
        <>
          <div className="grid grid-cols-3 gap-[1px] direction-rtl">
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
          {/* View All Button */}
          {/* {categoryId && (
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
          )} */}
        </>
      ) : (
        <>
          <div className="flex flex-col gap-4 direction-rtl">
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
          {/* View All Button */}
          {/* {categoryId && (
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
          )} */}
        </>
      )}
      {isLoading && (
        <div className="flex justify-center py-6">
          <LoadingSpinner />
        </div>
      )}
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
                  <span className="text-sm">{copied ? "تم النسخ" : "نسخ"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default V2FiveProductsPerCategory;
