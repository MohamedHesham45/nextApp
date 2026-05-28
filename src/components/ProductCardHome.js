"use client";

import Link from "next/link";
import Head from "next/head";
import { stripHtml } from "@/lib/stripHtml";
import { Heart, ShoppingCart, Share2, Copy, Check } from "lucide-react";
import { useCartFavorite } from "@/app/context/cartFavoriteContext";
import { sanitizeHTML } from "./ProductCard";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Slider from "react-slick";
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

const ProductCardHome = ({ product }) => {
  const { cart, setCart, favorite, setFavorite } = useCartFavorite();
  const [cartQuantity, setCartQuantity] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAddToFavorite = async (e, product) => {
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

  const handleAddToCart = async (e, product) => {
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
    setCartQuantity(1);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleQuantityChange = (e, change) => {
    e.preventDefault();
    e.stopPropagation();
    const existingItemIndex = cart.findIndex(
      (item) =>
        item._id === product._id &&
        JSON.stringify(item.selectedImages) === JSON.stringify(product.images)
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
    }
    toast.success("تم إضافة المنتج إلى السلة");
  };

  useEffect(() => {
    const existingItem = cart.find((item) => item._id === product._id);
    if (existingItem) {
      setCartQuantity(existingItem.quantityCart || 0);
    } else {
      setCartQuantity(0);
    }
  }, [cart, product._id]);

  const settings = {
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    dots: true,
    arrows: false,
    adaptiveHeight: true,
  };

  const ViewContentEvent = async () => {
    // Your existing ViewContent logic here
  };

  // Enhanced sharing data
  const shareUrl = `https://sitaramall.com/product/${product._id}`;
  const shareTitle = `${product.title} - سيتار مول`;
  const shareDescription =
    stripHtml(product.description).substring(0, 150) + "...";
  const shareImage =
    product && product.images[0]
      ? product.images[0].startsWith("/")
        ? `https://sitaramall.com${product.images[0]}`
        : `https://sitaramall.com/${product.images[0]}`
      : "";

  const sharePrice =
    product.discountPercentage > 0
      ? `السعر: ${Math.round(
          product.priceAfterDiscount
        )} جنيه (بدلاً من ${Math.round(product.price)} جنيه)`
      : `السعر: ${Math.round(product.price)} جنيه`;

  // Custom share text for WhatsApp with call-to-action and image
  const whatsappText = `🛍️ ${shareTitle}\n\n📝 ${shareDescription}\n\n💰 ${sharePrice}\n\n✨ ${
    product?.quantity > 10 ? "متوفر الآن" : "كمية محدودة - اطلب الآن"
  }\n\n👆 اضغط على الرابط لعرض المنتج وإتمام الطلب:`;

  // Copy link function
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
              src={shareImage}
              alt={product.title}
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1">
              <h4 className="font-medium text-sm line-clamp-1">
                {product.title}
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

  return (
    <>
      {/* Meta tags for rich sharing - This should be in your product page head */}
      <Head>
        <meta property="og:title" content={shareTitle} />
        <meta property="og:description" content={shareDescription} />
        <meta property="og:image" content={shareImage} />
        <meta property="icon" content={shareImage} />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:type" content="product" />
        <meta property="og:site_name" content="سيتار مول" />
        <meta
          property="product:price:amount"
          content={product.priceAfterDiscount || product.price}
        />
        <meta property="product:price:currency" content="EGP" />
        <meta
          property="product:availability"
          content={product.quantity > 0 ? "in stock" : "out of stock"}
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={shareTitle} />
        <meta name="twitter:description" content={shareDescription} />
        <meta name="twitter:image" content={shareImage} />
      </Head>
      <Link href={`/v2/product/${product._id}`} onClick={ViewContentEvent}>
        <div className="flex-col md:flex-row justify-between flex gap-4 mx-4 py-12">
          <div className="flex bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 flex-col md:flex-row relative group flex-1">
            <div className="relative w-full md:w-[300px] h-auto sm:h-[300px] flex-shrink-0 overflow-hidden md:flex-1">
              <div className="h-full">
                <Slider {...settings}>
                  {product.images.map((image, index) => (
                    <div key={index} className=" sm:h-[300px]">
                      <img
                        src={image.startsWith("/") ? image : `/${image}`}
                        alt={`Product Image ${index + 1}`}
                        className="w-full max-h-full transform group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </Slider>
              </div>
              {product.quantity == 0 && (
                <>
                  <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                  <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-md shadow-lg z-10">
                    نفذت الكمية
                  </span>
                </>
              )}
              {product.discountPercentage > 0 && (
                <span className="absolute top-2 right-2 bg-red-600 text-white text-sm font-bold px-2 py-1 rounded-md shadow-lg z-10">
                  خصم {Math.round(product.discountPercentage)}%
                </span>
              )}
            </div>
            <div className="flex flex-col justify-between p-6 flex-1">
              <div className="space-y-2">
                <h1 className="flex-auto text-xl font-semibold text-gray-800">
                  {product.title}
                </h1>
                <div
                  className="text-sm text-gray-600 line-clamp-2"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHTML(product.description),
                  }}
                />
                {product.discountPercentage > 0 ? (
                  <div className="flex flex-col text-sm md:text-base font-medium text-right space-y-1">
                    <span className="text-gray-500">
                      قبل الخصم:{" "}
                      <span className="text-red-500 line-through">
                        {Math.round(product.price)} جنيه
                      </span>
                    </span>
                    <span className="text-gray-500">
                      بعد الخصم:{" "}
                      <span className="text-green-600 font-bold">
                        {Math.round(product.priceAfterDiscount)} جنيه
                      </span>
                    </span>
                    <span className="text-xs font-bold text-red-600">
                      خصم {Math.round(product.discountPercentage)}%
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col text-sm md:text-base font-medium text-right">
                    <span className="text-gray-500">
                      السعر:{" "}
                      <span className="text-green-600 font-bold">
                        {Math.round(product.price)} جنيه
                      </span>
                    </span>
                  </div>
                )}

                <div className="flex justify-start items-center text-sm pt-4">
                  <span className="text-gray-500">
                    {product.quantity > 0 ? (
                      <span className={`text-lg  `}>
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
                      <span className="text-red-500  font-bold">
                        غير متاح الان
                      </span>
                    )}
                  </span>
                </div>
              </div>
              <div className="flex justify-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (cartQuantity > 0) {
                      handleQuantityChange(e, 1);
                    } else {
                      handleAddToCart(e, product);
                    }
                  }}
                  className={`flex-1 bg-amazon-orange hover:bg-amazon-orange-dark  rounded-full transition-all duration-300  flex items-center justify-center gap-2 text-sm ${
                    product.quantity === 0 || cartQuantity >= product.quantity
                      ? "opacity-50 cursor-not-allowed bg-gray-300  text-amazon-dark hover:bg-gray-300 "
                      : "text-white hover:scale-105 hover:shadow-lg"
                  }`}
                  disabled={
                    product.quantity === 0 || cartQuantity >= product.quantity
                  }
                >
                  {!cartQuantity >= product.quantity ? (
                    <ShoppingCart className="h-4 w-4" />
                  ) : (
                    ""
                  )}
                  {product.quantity === 0
                    ? "نفذت الكمية"
                    : cartQuantity >= product.quantity
                    ? "انتهت الكمية المتاحة"
                    : "اضف الى العربة"}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToFavorite(e, product);
                  }}
                  className={`p-3 bg-white hover:bg-red-50 ${
                    favorite.some((item) => item._id === product._id)
                      ? "text-red-500 border-red-500"
                      : "text-gray-400 border-gray-100"
                  } rounded-full shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 hover:border-red-500`}
                >
                  <Heart
                    className={`h-5 w-5 stroke-2 ${
                      favorite.some((item) => item._id === product._id)
                        ? "fill-red-500"
                        : ""
                    }`}
                  />
                </button>

                {/* Enhanced Share Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowShareModal(true);
                  }}
                  className="p-3 bg-white hover:bg-blue-50 text-gray-400 hover:text-blue-500 border-2 border-gray-100 hover:border-blue-500 rounded-full shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <Share2 className="h-5 w-5 stroke-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Share Modal */}
      {showShareModal && <ShareModal />}
    </>
  );
};

export default ProductCardHome;
