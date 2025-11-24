"use client";

import V2ProductCardHome from "@/components/V2ProductCardHome";
import { useEffect, useState } from "react";
import { Search, Share2, Copy, Check, Heart, ShoppingBag, Send } from "lucide-react";
import { useParams } from "next/navigation";
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
import { toast } from "react-hot-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useCartFavorite } from "@/app/context/cartFavoriteContext";

export default function CategoryDetails() {
  const { id } = useParams();
  const [displayCategory, setDisplayCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { cart, setCart, favorite, setFavorite } = useCartFavorite();
  const [shareProduct, setShareProduct] = useState(null);

  // pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // view mode state
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

  // debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // fetch data
  const fetchCategoryData = async (reset = false) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/category/${id}?search=${debouncedSearch}&limit=12&page=${reset ? 1 : page
        }`
      );
      if (!response.ok) throw new Error("Failed to fetch category data");
      const data = await response.json();

      if (!data || !data.category) {
        setError("Category not found");
        return;
      }

      setCategory(data.category);
      setDisplayCategory(
        data.category.name.startsWith("ال")
          ? data.category.name
          : `ال${data.category.name}`
      );

      setProducts((prev) =>
        reset ? data.products : [...prev, ...data.products]
      );
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Error fetching category data:", error);
      setError("حدث خطأ أثناء تحميل البيانات");
      toast.error("حدث خطأ أثناء تحميل البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  // refetch on id/search change
  useEffect(() => {
    if (id) {
      setPage(1);
      fetchCategoryData(true);
    }
  }, [id, debouncedSearch]);

  // infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300 &&
        hasMore &&
        !isLoading
      ) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, isLoading]);

  useEffect(() => {
    if (page > 1) fetchCategoryData();
  }, [page]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading && products.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amazon-orange"></div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-800">الفئة غير موجودة</h1>
        <p className="text-gray-600 mt-2">عذراً، هذه الفئة غير متوفرة حالياً.</p>
      </div>
    );
  }

  const shareUrl = `https://sitaramall.com/category/${id}`;
  const shareTitle = `${displayCategory} - ستارة مول`;
  const shareDescription = `تسوق ${displayCategory} - اكتشف مجموعتنا الواسعة من المنتجات المميزة بأفضل الأسعار`;
  const whatsappText = `🛍️ ${shareTitle}\n\n📝 ${shareDescription}\n\n✨ ${products.length} منتج متوفر\n\n👆 اضغط على الرابط لعرض المنتجات وإتمام الطلب:`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("تم نسخ الرابط");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("فشل في نسخ الرابط");
    }
  };

  const ShareModal = () => (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      dir="rtl"
    >
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">مشاركة الفئة</h3>
          <button
            onClick={() => setShowShareModal(false)}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-lg mb-2">{displayCategory}</h4>
          <p className="text-sm text-gray-600">{shareDescription}</p>
          <p className="text-sm font-semibold text-green-600 mt-2">
            {products.length} منتج متوفر
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <FacebookShareButton url={shareUrl}>
            <div className="flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <FacebookIcon size={24} round />
              <span className="text-sm">فيسبوك</span>
            </div>
          </FacebookShareButton>
          <WhatsappShareButton url={shareUrl} title={whatsappText}>
            <div className="flex items-center justify-center gap-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <WhatsappIcon size={24} round />
              <span className="text-sm">واتساب</span>
            </div>
          </WhatsappShareButton>
          <TwitterShareButton url={shareUrl} title={shareTitle}>
            <div className="flex items-center justify-center gap-2 p-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500">
              <TwitterIcon size={24} round />
              <span className="text-sm">تويتر</span>
            </div>
          </TwitterShareButton>
          <TelegramShareButton url={shareUrl} title={shareTitle}>
            <div className="flex items-center justify-center gap-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              <TelegramIcon size={24} round />
              <span className="text-sm">تليجرام</span>
            </div>
          </TelegramShareButton>
        </div>
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
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-1"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span className="text-sm">{copied ? "تم النسخ" : "نسخ"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-amazon-light-gray direction-rtl">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-amazon">
          <div className="absolute inset-0 bg-gradient-to-r from-amazon-orange/10 via-amazon-yellow/20 to-amazon-blue/20"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amazon/40 to-amazon/90"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amazon-yellow via-amazon-orange to-amazon-blue"></div>
        </div>

        <div className="relative py-8 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-3xl md:text-5xl font-bold text-white">
              <span className="text-amazon-yellow">كل منتجات</span>{" "}
              <span className="text-white">{displayCategory}</span>
            </h1>
            <p className="text-amazon-light-gray/80 text-base md:text-lg">
              اكتشف مجموعتنا الواسعة من المنتجات المميزة بأفضل الأسعار
            </p>
            {/* زر تبديل العرض */}
            <div className="flex items-center justify-center gap-3 max-w-3xl mx-auto mt-6">
              {/* Toggle View */}
              

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
              </div>

              {/* Share */}
              <button
                onClick={() => setShowShareModal(true)}
                className="px-6 py-3 bg-amazon-orange hover:bg-amazon-orange-dark text-white rounded-full flex items-center gap-2 shadow-lg transition flex-shrink-0"
              >
                <Share2 className="h-5 w-5" />
                <span>مشاركة</span>
              </button>

              <button
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                className="bg-amazon-yellow text-amazon p-3 rounded-full shadow hover:bg-amazon-orange transition-all flex items-center justify-center w-12 h-12 flex-shrink-0"
                title={viewMode === "grid" ? "عرض قائمة" : "عرض شبكة"}
              >
                {viewMode === "grid" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="4" y="6" width="16" height="2" rx="1" />
                    <rect x="4" y="11" width="16" height="2" rx="1" />
                    <rect x="4" y="16" width="16" height="2" rx="1" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
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

      {/* Products */}
      <div className="container mx-auto px-1 py-2">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">
              لا توجد منتجات في هذه الفئة
            </h2>
            <p className="text-gray-500">لم يتم العثور على منتجات حالياً</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-3 gap-[1px]">
            {products.map((product) => (
              <V2ProductCardHome key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {products.map((product) => {
              const cartQuantity =
                cart.find((item) => item._id === product._id)?.quantityCart || 0;
              const isFavorite = favorite.some((item) => item._id === product._id);

              const handleAddToFavorite = (e) => {
                e.preventDefault();
                const existingItemIndex = favorite.findIndex(
                  (item) => item._id === product._id
                );
                let updatedFavorite;
                if (existingItemIndex !== -1) {
                  updatedFavorite = favorite.filter((item) => item._id !== product._id);
                  toast.success("تم إزالة المنتج من المفضلة");
                } else {
                  updatedFavorite = [...favorite, product];
                  toast.success("تم إضافة المنتج إلى المفضلة");
                }
                setFavorite(updatedFavorite);
                localStorage.setItem("favorite", JSON.stringify(updatedFavorite));
              };

              const handleAddToCart = (e) => {
                e.preventDefault();
                const itemToAdd = {
                  ...product,
                  quantityCart: 1,
                  selectedImages: product.images,
                };
                const existingItemIndex = cart.findIndex(
                  (item) =>
                    item._id === product._id &&
                    JSON.stringify(item.selectedImages) ===
                    JSON.stringify(itemToAdd.selectedImages)
                );
                let updatedCart;
                if (existingItemIndex !== -1) {
                  updatedCart = [...cart];
                  if (!updatedCart[existingItemIndex].quantityCart) {
                    updatedCart[existingItemIndex].quantityCart = 1;
                  }
                  updatedCart[existingItemIndex].quantityCart += 1;
                  toast.success("تم إضافة المنتج إلى السلة");
                } else {
                  updatedCart = [...cart, itemToAdd];
                  toast.success("تم إضافة المنتج إلى السلة");
                }
                setCart(updatedCart);
                localStorage.setItem("cart", JSON.stringify(updatedCart));
              };

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl shadow group hover:shadow-lg transition overflow-hidden cursor-pointer border border-amazon-light-gray"
                >
                  <div className="flex items-center">
                    {/* صورة المنتج */}
                    <div className="w-44 h-52 flex-shrink-0 overflow-hidden bg-amazon-light-gray flex items-center justify-center">
                      <img
                        src={
                          product.images && product.images[0]
                            ? product.images[0].startsWith("/")
                              ? `{product.images[0]}`
                              : `/${product.images[0]}`
                            : "/placeholder.png"
                        }
                        alt={product.title}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    {/* تفاصيل المنتج */}
                    <div className="flex flex-col justify-between flex-1 p-4 text-right">
                      <div>
                        <h3 className="text-base font-bold text-amazon line-clamp-2 mb-1">{product.title}</h3>
                        <div className="flex flex-wrap gap-2 items-center mb-2">
                          {product.discountPercentage > 0 && (
                            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                              خصم {Math.round(product.discountPercentage)}%
                            </span>
                          )}
                          {product.quantity === 0 && (
                            <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
                              نفذت الكمية
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-xs line-clamp-2 mb-2">
                          {product.description?.replace(/<[^>]*>/g, "").substring(0, 60) || ""}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm text-gray-400">
                          قبل الخصم:{" "}
                          <span className="line-through text-red-500">
                            {Math.round(product.price)}
                          </span>
                        </span>
                        <span className="text-base font-bold text-green-600">
                          بعد الخصم: {Math.round(product.priceAfterDiscount)}
                        </span>
                      </div>
                      {/* Icons */}
                      <div className="flex items-center gap-2 mt-2 justify-end">
                        {/* Favorite */}
                        <button
                          onClick={handleAddToFavorite}
                          className={`relative w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110
                            ${isFavorite
                              ? "bg-gradient-to-tr from-pink-500 to-red-500 text-white shadow-lg shadow-pink-400/40"
                              : "bg-white/90 text-gray-700 shadow-md hover:bg-gradient-to-tr hover:from-pink-400 hover:to-red-400 hover:text-white"
                            }`}
                        >
                          <Heart className="w-5 h-5" />
                          {isFavorite && (
                            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
                              ♥
                            </span>
                          )}
                        </button>
                        {/* Cart */}
                        <button
                          onClick={handleAddToCart}
                          className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110
                            ${cartQuantity > 0
                              ? "bg-gradient-to-tr from-amazon-orange to-amazon-orange-dark text-white shadow-lg shadow-orange-400/40"
                              : "bg-white/90 text-gray-700 shadow-md hover:bg-gradient-to-tr hover:from-amazon-orange hover:to-amazon-orange-dark hover:text-white"
                            }`}
                          disabled={product.quantity === 0}
                        >
                          <ShoppingBag className="w-5 h-5" />
                        </button>
                        {/* Share */}
                        <button
                          onClick={() => {
                            setShareProduct(product);
                            setShowShareModal(true);
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 text-blue-600 shadow-md transition-all duration-300 hover:scale-110 hover:bg-gradient-to-tr hover:from-blue-400 hover:to-indigo-500 hover:text-white"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isLoading && products.length > 0 && (
          <div className="flex justify-center py-6">
            <LoadingSpinner />
          </div>
        )}
      </div>

      {/* Share Modal for product (list view) */}
      {showShareModal && shareProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">مشاركة المنتج</h3>
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setShareProduct(null);
                }}
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
                    {shareProduct.description.replace(/<[^>]*>/g, "").substring(0, 150) + "..."}
                  </p>
                  <p className="text-sm font-semibold text-green-600 mt-1">
                    {shareProduct.discountPercentage > 0
                      ? `السعر: ${Math.round(shareProduct.priceAfterDiscount)} جنيه (بدلاً من ${Math.round(shareProduct.price)} جنيه)`
                      : `السعر: ${Math.round(shareProduct.price)} جنيه`}
                  </p>
                </div>
              </div>
            </div>
            {/* Share Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <FacebookShareButton
                url={`https://sitaramall.com/product/${shareProduct._id}`}
                quote={`${shareProduct.title}\n\n${shareProduct.description.replace(/<[^>]*>/g, "").substring(0, 150)}\n\nالسعر: ${Math.round(shareProduct.priceAfterDiscount || shareProduct.price)} جنيه\n\n🛒 اضغط على الرابط للمشاهدة والطلب الآن!`}
                hashtag="#سيتار_مول #عروض #تسوق_اونلاين"
                className="w-full"
              >
                <div className="flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <FacebookIcon size={24} round />
                  <span className="text-sm">فيسبوك</span>
                </div>
              </FacebookShareButton>
              <WhatsappShareButton
                url={`https://sitaramall.com/product/${shareProduct._id}`}
                title={`🛍️ ${shareProduct.title}\n\n📝 ${shareProduct.description.replace(/<[^>]*>/g, "").substring(0, 150)}\n\n💰 السعر: ${Math.round(shareProduct.priceAfterDiscount || shareProduct.price)} جنيه\n\n✨ ${shareProduct?.quantity > 10 ? 'متوفر الآن' : 'كمية محدودة - اطلب الآن'}\n\n👆 اضغط على الرابط لعرض المنتج وإتمام الطلب:`}
                separator=" "
                className="w-full"
              >
                <div className="flex items-center justify-center gap-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <WhatsappIcon size={24} round />
                  <span className="text-sm">واتساب</span>
                </div>
              </WhatsappShareButton>
              <TwitterShareButton
                url={`https://sitaramall.com/product/${shareProduct._id}`}
                title={`${shareProduct.title} - ${shareProduct.description.replace(/<[^>]*>/g, "").substring(0, 150)} - السعر: ${Math.round(shareProduct.priceAfterDiscount || shareProduct.price)} جنيه - اضغط للمشاهدة والطلب`}
                hashtags={["سيتار_مول", "تسوق_اونلاين", "عروض"]}
                className="w-full"
              >
                <div className="flex items-center justify-center gap-2 p-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors">
                  <TwitterIcon size={24} round />
                  <span className="text-sm">تويتر</span>
                </div>
              </TwitterShareButton>
              <TelegramShareButton
                url={`https://sitaramall.com/product/${shareProduct._id}`}
                title={`${shareProduct.title}\n\n${shareProduct.description.replace(/<[^>]*>/g, "").substring(0, 150)}\n\nالسعر: ${Math.round(shareProduct.priceAfterDiscount || shareProduct.price)} جنيه\n\n🔥 ${shareProduct?.quantity > 10 ? 'متوفر الآن - اطلب من الرابط' : 'كمية محدودة - اطلب الآن من الرابط'}`}
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
                  value={`https://sitaramall.com/product/${shareProduct._id}`}
                  readOnly
                  className="flex-1 p-2 border rounded-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(`https://sitaramall.com/product/${shareProduct._id}`);
                      setCopied(true);
                      toast.success("تم نسخ الرابط");
                      setTimeout(() => setCopied(false), 2000);
                    } catch (err) {
                      toast.error("فشل في نسخ الرابط");
                    }
                  }}
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
      {/* ShareModal for category */}
      {showShareModal && !shareProduct && <ShareModal />}
    </div>
  );
}
