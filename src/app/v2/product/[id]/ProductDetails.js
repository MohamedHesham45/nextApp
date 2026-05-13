"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Heart, ShoppingCart, Share2, Copy, Check } from "lucide-react";
import { sanitizeHTML } from "@/components/ProductCard";
import { useCartFavorite } from "@/app/context/cartFavoriteContext";
import { toast } from "react-hot-toast";
import { trackFbq } from "@/lib/fbq";
import ShoppingCartPage from "@/components/ShoppingCart";
import useMetaConversion from "@/components/SendMetaConversion";
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

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const { cart, setCart, favorite, setFavorite } = useCartFavorite();
  const [cartQuantity, setCartQuantity] = useState(0);
  const sendMetaConversion = useMetaConversion();

  const handleQuantityChange = (e, change) => {
    e.preventDefault();
    const existingItemIndex = cart.findIndex(
      (item) => item._id === product._id
    );

    if (existingItemIndex !== -1) {
      const updatedCart = [...cart];
      const newQuantity = updatedCart[existingItemIndex].quantityCart + change;

      if (newQuantity <= 0) {
        updatedCart.splice(existingItemIndex, 1);
        setCartQuantity(0);
      } else if (newQuantity <= product.quantity) {
        updatedCart[existingItemIndex].quantityCart = newQuantity;
        setCartQuantity(newQuantity);
      }

      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      toast.success("تم تعديل الكمية");
    }
  };

  useEffect(() => {
    const existingItem = cart.find((item) => item._id === product?._id);
    if (existingItem) {
      setCartQuantity(existingItem.quantityCart || 0);
    } else {
      setCartQuantity(0);
    }
  }, [cart, product?._id]);

  const handleAddToFavorite = (e, product) => {
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
      trackFbq("AddToWishlist", {
        content_ids: [product._id],
        content_name: product.title,
        value: parseInt(product.price || 0),
        currency: "EGP",
      });
    }

    setFavorite(updatedFavorite);
    localStorage.setItem("favorite", JSON.stringify(updatedFavorite));
  };

  const handleAddToCart = (e, product) => {
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
    } else {
      updatedCart = [...cart, itemToAdd];
    }

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    toast.success("تم إضافة المنتج إلى السلة");
    trackFbq("AddToCart", {
      content_ids: [product._id],
      content_name: product.title,
      value: parseInt(product.price || 0),
      currency: "EGP",
    });
  };

  const handleBuyNow = (e, product) => {
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
    if (existingItemIndex === -1) {
      updatedCart = [...cart, itemToAdd];
      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      toast.success("تم إضافة المنتج إلى السلة");
      setIsCartVisible(true);
    } else {
      setIsCartVisible(true);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/v2/api/products/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }
        const data = await response.json();
        setProduct(data);
        console.log(data);
        trackFbq("ViewContent", {
          content_ids: [data._id],
          content_name: data.title,
          content_type: "product",
          value: parseInt(data.price || 0),
          currency: "EGP",
        });
      } catch (err) {
        setError(err.message);
        console.error("Error fetching product:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Enhanced sharing functionality with better image handling
  const shareUrl = product
    ? `https://sitaramall.com/product/${product._id}`
    : "";
  const shareTitle = product ? `${product.title} - سيتار مول` : "";
  const shareDescription = product
    ? product.description.replace(/<[^>]*>/g, "").substring(0, 150) + "..."
    : "";

  const getAbsoluteImageUrl = (imageUrl) => {
    if (!imageUrl) return "https://sitaramall.com/favicon.icon";

    const cleanPath = imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl;

    return `https://sitaramall.com/${cleanPath}`;
  };

  const shareImage =
    product && product.images && product.images[0]
      ? getAbsoluteImageUrl(product.images[0])
      : `https://sitaramall.com/favicon.icon`;

  const sharePrice = product
    ? product.discountPercentage > 0
      ? `السعر: ${Math.round(
          product.priceAfterDiscount
        )} جنيه (بدلاً من ${Math.round(product.price)} جنيه)`
      : `السعر: ${Math.round(product.price)} جنيه`
    : "";

  const whatsappText = `🛍️ ${shareTitle}\n\n📝 ${shareDescription}\n\n💰 ${sharePrice}\n\n✨ ${
    product?.quantity > 10 ? "متوفر الآن" : "كمية محدودة - اطلب الآن"
  }\n\n👆 اضغط على الرابط لعرض المنتج وإتمام الطلب:`;

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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 "
      dir="rtl"
    >
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
              src={shareImage}
              alt={product?.title}
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1">
              <h4 className="font-medium text-sm line-clamp-1">
                {product?.title}
              </h4>
              <p className="text-xs text-gray-600 line-clamp-2">
                {shareDescription}
              </p>
              <p className="text-sm font-semibold text-green-600 mt-1">
                {sharePrice}
              </p>
            </div>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <FacebookShareButton
            url={shareUrl}
            quote={`${shareTitle}\n\n${shareDescription}\n\n${sharePrice}\n\n🛒 اضغط على الرابط للمشاهدة والطلب الآن!`}
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
            title={`${shareTitle} - ${shareDescription} - ${sharePrice} - اضغط للمشاهدة والطلب`}
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
            title={`${shareTitle}\n\n${shareDescription}\n\n${sharePrice}\n\n🔥 ${
              product?.quantity > 10
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
  );

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return <div className="text-center text-red-500">Error: {error}</div>;
  if (!product) return <div className="text-center">Product not found</div>;

  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : ["/123.jpg"];

  return (
    <>
      {/* Enhanced Meta tags for rich social sharing */}

      <div className="bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-16 py-8 md:py-16 direction-rtl min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
              <div className="space-y-4 md:space-y-6">
                <div className="relative group">
                  <img
                    src={
                      images[selectedImageIndex]?.startsWith("/")
                        ? images[selectedImageIndex]
                        : `/${images[selectedImageIndex]}`
                    }
                    alt={`${product.title} - صورة ${selectedImageIndex + 1}`}
                    className="w-full rounded-2xl shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  {product.quantity === 0 && (
                    <span className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-amazon-blue text-white text-xs sm:text-sm font-bold px-2 sm:px-4 py-1 sm:py-2 rounded-lg shadow-lg">
                      نفذت الكمية
                    </span>
                  )}
                  {product.discountPercentage > 0 && (
                    <span className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-red-600 text-white text-xs sm:text-sm font-bold px-2 sm:px-4 py-1 sm:py-2 rounded-lg shadow-lg">
                      خصم {Math.round(product.discountPercentage)}%
                    </span>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 hide-scrollbar">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onMouseEnter={() => setSelectedImageIndex(index)}
                        className={`relative flex-shrink-0 w-16 h-16 sm:w-24 sm:h-24 rounded-lg overflow-hidden ${
                          selectedImageIndex === index
                            ? "ring-4 ring-amazon-blue"
                            : "ring-2 ring-gray-200 hover:ring-blue-300"
                        } transition-all duration-200`}
                      >
                        <img
                          src={image?.startsWith("/") ? image : `/${image}`}
                          alt={`${product.title} - صورة مصغرة ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {product.video && (
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1">
                      <svg className="w-4 h-4 text-amazon-orange" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      فيديو المنتج
                    </p>
                    <video
                      controls
                      playsInline
                      className="w-full rounded-xl shadow-lg"
                      src={
                        product.video.startsWith("/")
                          ? product.video
                          : `/${product.video}`
                      }
                    >
                      متصفحك لا يدعم تشغيل الفيديو
                    </video>
                  </div>
                )}
              </div>

              <div className="space-y-4 md:space-y-6 bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg">
                <div className="space-y-6">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
                    {product.title}
                  </h1>
                  {product.referenceCode && (
                    <p className="text-gray-500 text-sm sm:text-base">
                      رقم المرجع: {product.referenceCode}
                    </p>
                  )}
                  <div
                    className="text-gray-600 text-sm sm:text-lg leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHTML(product.description),
                    }}
                  />
                </div>

                {product.discountPercentage > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    <p className="text-gray-500 text-sm sm:text-lg">
                      قبل الخصم:{" "}
                      <span className="text-red-500 line-through">
                        {Math.round(product.price)} جنيه
                      </span>
                    </p>
                    <p className="text-gray-500 text-sm sm:text-lg">
                      بعد الخصم:{" "}
                      <span className="text-green-600 font-bold text-2xl sm:text-3xl">
                        {Math.round(product.priceAfterDiscount)} جنيه
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm sm:text-lg">
                    السعر:{" "}
                    <span className="text-green-600 font-bold text-2xl sm:text-3xl">
                      {Math.round(product.price)} جنيه
                    </span>
                  </p>
                )}

                <p className="text-gray-500 text-sm sm:text-lg">
                  <span className="text-gray-500">
                    {product.quantity > 0 ? (
                      <span className={`text-xl  `}>
                        {product.quantity > 10 ? (
                          <span className="text-green-500">
                            متبقي{" "}
                            <span className="font-bold">
                              {product.quantity}
                            </span>{" "}
                            - اطلب الان
                          </span>
                        ) : (
                          <span className="text-red-500">
                            تبقي{" "}
                            <span className="font-bold">
                              {product.quantity}
                            </span>{" "}
                            فقط - اطلب الان
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-red-500 text-lg font-bold">
                        غير متاح الان
                      </span>
                    )}
                  </span>
                </p>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4 sm:gap-6">
                    {cartQuantity > 0 ? (
                      <div className="flex-1 flex items-center justify-center gap-2 sm:gap-4 bg-gray-100 p-2 rounded-full">
                        <button
                          onClick={(e) => handleQuantityChange(e, -1)}
                          className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white text-gray-700 hover:bg-amazon-orange hover:text-white rounded-full transition-all duration-200 shadow-sm text-lg sm:text-xl font-semibold"
                        >
                          -
                        </button>
                        <span className="w-12 sm:w-16 text-center font-medium text-lg sm:text-xl">
                          {cartQuantity}
                        </span>
                        <button
                          onClick={(e) => handleQuantityChange(e, 1)}
                          className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white text-gray-700 rounded-full transition-all duration-200 shadow-sm text-lg sm:text-xl font-semibold ${
                            cartQuantity >= product.quantity
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-amazon-orange hover:text-white"
                          }`}
                          disabled={cartQuantity >= product.quantity}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center gap-2 sm:gap-4 rounded-full">
                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          className={`bg-amazon-orange hover:bg-amazon-orange-dark text-white rounded-full transition-all duration-200 hover:shadow-xl flex items-center justify-center text-base sm:text-lg font-semibold ${
                            Number(product.quantity) === 0
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:scale-105"
                          } px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 w-full `}
                          disabled={Number(product.quantity) === 0}
                        >
                          <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                          اضف الى العربة
                        </button>
                      </div>
                    )}
                    <button
                      onClick={(e) => handleAddToFavorite(e, product)}
                      className={`p-4 sm:p-5 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 border-gray-100 hover:border-red-500 ${
                        favorite.some((item) => item._id === product._id)
                          ? "text-red-500 border-red-500"
                          : "text-gray-400 border-gray-100"
                      }`}
                    >
                      <Heart
                        className={`h-6 w-6 sm:h-7 sm:w-7 stroke-2 ${
                          favorite.some((item) => item._id === product._id)
                            ? "fill-red-500"
                            : ""
                        }`}
                      />
                    </button>

                    {/* Share Button */}
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="p-4 sm:p-5 bg-white hover:bg-blue-50 text-gray-400 hover:text-blue-500 rounded-full shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 border-gray-100 hover:border-blue-500"
                    >
                      <Share2 className="h-6 w-6 sm:h-7 sm:w-7 stroke-2" />
                    </button>
                  </div>
                </div>

                {Number(product.quantity) > 0 && (
                  <button
                    className={`w-full bg-green-600 hover:bg-green-700 text-white py-3 sm:py-4 rounded-full transition-all duration-300 hover:shadow-xl text-base sm:text-lg font-semibold ${
                      product.quantity === 0
                        ? "opacity-50 cursor-not-allowed "
                        : "hover:scale-105"
                    }`}
                    disabled={product.quantity === 0}
                    onClick={(e) => {
                      handleBuyNow(e, product);
                    }}
                  >
                    اطلب الآن
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <ShoppingCartPage
          isVisible={isCartVisible}
          setIsVisible={setIsCartVisible}
        />

        {/* Share Modal */}
        {showShareModal && <ShareModal />}
      </div>
    </>
  );
}
