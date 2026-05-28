"use client";

import ProductCardHome from "@/components/ProductCardHome";
import { useEffect, useState, useRef } from "react";
import { Search, Share2, Copy, Check } from "lucide-react";
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
import { usePageCache } from "@/app/context/PageCacheContext";

export default function CategoryDetails() {
  const { id } = useParams();
  const { cache, saveCache } = usePageCache(`v2-category-${id}`);

  const [displayCategory, setDisplayCategory] = useState(() => cache?.displayCategory || "");
  const [products, setProducts] = useState(() => cache?.products || []);
  const [category, setCategory] = useState(() => cache?.category || null);
  const [searchTerm, setSearchTerm] = useState(() => cache?.searchTerm || "");
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(!cache);
  const [error, setError] = useState(null);

  const stateRef = useRef({});
  const scrollYRef = useRef(0);
  const fetchMountedRef = useRef(!cache);

  useEffect(() => {
    stateRef.current = { products, category, displayCategory, searchTerm };
  });

  useEffect(() => {
    const onScroll = () => { scrollYRef.current = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    return () => { saveCache({ ...stateRef.current, scrollY: scrollYRef.current }); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!cache?.scrollY) return;
    const timeout = setTimeout(() => {
      window.scrollTo({ top: cache.scrollY, behavior: "instant" });
    }, 80);
    return () => clearTimeout(timeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!fetchMountedRef.current) { fetchMountedRef.current = true; return; }

    const fetchCategoryData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/v2/api/category/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch category data");
        }
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
        setProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching category data:", error);
        setError("حدث خطأ أثناء تحميل البيانات");
        toast.error("حدث خطأ أثناء تحميل البيانات");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCategoryData();
    }
  }, [id]);

  useEffect(() => {
    if (cache) return; // skip scroll-to-top when restoring from cache
    window.scrollTo(0, 0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amazon-orange"></div>
      </div>
    );
  }

  // If error or no category found, show error state
  if (error || !category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold text-gray-800">الفئة غير موجودة</h1>
          <p className="text-gray-600 mt-2">
            عذراً، هذه الفئة غير متوفرة حالياً.
          </p>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Share functionality
  const shareUrl = `https://sitaramall.com/category/${id}`;
  const shareTitle = `${displayCategory} - سيتار مول`;
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

  // Share Modal Component
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

        {/* Category Preview */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <h4 className="font-medium text-lg mb-2">{displayCategory}</h4>
            <p className="text-sm text-gray-600">{shareDescription}</p>
            <p className="text-sm font-semibold text-green-600 mt-2">
              {products.length} منتج متوفر
            </p>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <FacebookShareButton
            url={shareUrl}
            quote={`${shareTitle}\n\n${shareDescription}\n\n🛒 اضغط على الرابط للمشاهدة والطلب الآن!`}
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
            title={whatsappText}
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
            title={`${shareTitle} - ${shareDescription}`}
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
            title={`${shareTitle}\n\n${shareDescription}\n\n✨ ${products.length} منتج متوفر`}
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
  );

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
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="px-6 py-4 bg-amazon-orange hover:bg-amazon-orange-dark text-white rounded-full transition-all duration-200 hover:shadow-xl flex items-center gap-2"
                  >
                    <Share2 className="h-5 w-5" />
                    <span>مشاركة</span>
                  </button>
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
                  key={product._id}
                  className="transform hover:scale-[1.01] transition-transform"
                >
                  <ProductCardHome product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && <ShareModal />}
    </div>
  );
}
