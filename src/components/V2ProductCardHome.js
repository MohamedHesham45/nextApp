"use client";

import { Heart, ShoppingCart, Share2, ShoppingBag, Send, Copy, Check } from "lucide-react";
import { useCartFavorite } from "@/app/context/cartFavoriteContext";
import { useState, useEffect } from "react";
import Link from "next/link";
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
import Head from "next/head";

const V2ProductCardHome = ({ product }) => {
    const { cart, setCart, favorite, setFavorite } = useCartFavorite();
    const [cartQuantity, setCartQuantity] = useState(0);
    const [showShareModal, setShowShareModal] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const existingItem = cart.find((item) => item._id === product._id);
        if (existingItem) {
            setCartQuantity(existingItem.quantityCart || 0);
        } else {
            setCartQuantity(0);
        }
    }, [cart, product._id]);

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

    // Share Modal (simple version)
    const shareUrl = `https://sitaramall.com/product/${product._id}`;
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

    // Slider settings (mobile friendly)
    const sliderSettings = {
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        // dots: product.images && product.images.length > 1,
        autoplay: product.images && product.images.length > 1,
        autoplaySpeed: 4000,
        adaptiveHeight: true,
        swipe: true
    };

    const shareTitle = `${product.title} - سيتار مول`;
    const shareDescription = product.description.replace(/<[^>]*>/g, "").substring(0, 150) + "...";
    const shareImage =
        product && product.images[0]
            ? product.images[0].startsWith("/")
                ? `https://sitaramall.com${product.images[0]}`
                : `https://sitaramall.com/${product.images[0]}`
            : "";
    const sharePrice =
        product.discountPercentage > 0
            ? `السعر: ${Math.round(product.priceAfterDiscount)} جنيه (بدلاً من ${Math.round(product.price)} جنيه)`
            : `السعر: ${Math.round(product.price)} جنيه`;

    return (
        <>
            <Head>
                <meta property="og:title" content={shareTitle} />
                <meta property="og:description" content={shareDescription} />
                <meta property="og:image" content={shareImage} />
                <meta property="icon" content={shareImage} />
                <meta property="og:url" content={shareUrl} />
                <meta property="og:type" content="product" />
                <meta property="og:site_name" content="سيتار مول" />
                <meta property="product:price:amount" content={product.priceAfterDiscount || product.price} />
                <meta property="product:price:currency" content="EGP" />
                <meta property="product:availability" content={product.quantity > 0 ? "in stock" : "out of stock"} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={shareTitle} />
                <meta name="twitter:description" content={shareDescription} />
                <meta name="twitter:image" content={shareImage} />
            </Head>
            <Link href={`/product/${product._id}`}>
                <div className="relative aspect-[3/4] bg-white overflow-hidden shadow-sm flex items-center justify-center group">
                    {/* Image carousel if more than one image */}
                    <div className="w-full h-full ">
                        {product.images && product.images.length > 1 ? (
                            <Slider {...sliderSettings} className="h-full ">
                                {product.images.map((img, idx) => (
                                    <img
                                        src={
                                            img.startsWith("/")
                                                ? `${img}`
                                                : `/${img}`
                                        }
                                        alt={product.title}
                                        loading="lazy"
                                        className="aspect-[3/4] object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                    />
                                ))}
                            </Slider>
                        ) : (
                            <img
                                src={
                                    product.images && product.images[0]
                                        ? product.images[0].startsWith("/")
                                            ? `${product.images[0]}`
                                            : `/${product.images[0]}`
                                        : "/placeholder.png"
                                }
                                alt={product.title}
                                loading="lazy"
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            />
                        )}
                    </div>


                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-row gap-1 sm:gap-5 z-10">
                        {/* Favorite */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                handleAddToFavorite(e, product);
                            }}
                            className={`relative w-7 h-7 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95
    ${favorite.some((item) => item._id === product._id)
                                    ? "bg-gradient-to-tr from-pink-500 to-red-500 text-white shadow-lg shadow-pink-400/40"
                                    : "bg-white/90 text-gray-700 shadow-md hover:bg-gradient-to-tr hover:from-pink-400 hover:to-red-400 hover:text-white"
                                }`}
                        >
                            <Heart className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                            {favorite.some((item) => item._id === product._id) && (
                                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
                                    ♥
                                </span>
                            )}
                        </button>

                        {/* Cart */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                handleAddToCart(e, product);
                            }}
                            className={`w-7 h-7 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95
    ${cartQuantity > 0
                                    ? "bg-gradient-to-tr from-amazon-orange to-amazon-orange-dark text-white shadow-lg shadow-orange-400/40"
                                    : "bg-white/90 text-gray-700 shadow-md hover:bg-gradient-to-tr hover:from-amazon-orange hover:to-amazon-orange-dark hover:text-white"
                                }`}
                            disabled={product.quantity === 0}
                        >
                            <ShoppingBag className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                        </button>

                        {/* Share */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                setShowShareModal(true);
                            }}
                            className="w-7 h-7 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white/90 text-blue-600 shadow-md transition-all duration-300 transform hover:scale-110 active:scale-95 hover:bg-gradient-to-tr hover:from-blue-400 hover:to-indigo-500 hover:text-white"
                        >
                            <Send className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                        </button>
                    </div>



                    {/* Out of stock overlay */}
                    {product.quantity === 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-20">
                            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
                                نفذت الكمية
                            </span>
                        </div>
                    )}
                    {/* Discount badge */}
                    {product.discountPercentage > 0 && (
                        <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg z-10">
                            خصم {Math.round(product.discountPercentage)}%
                        </span>
                    )}
                </div>
            </Link>
            {/* Share Modal */}
            {showShareModal && (
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
                                        product.images && product.images[0]
                                            ? product.images[0].startsWith("/")
                                                ? `${product.images[0]}`
                                                : `/${product.images[0]}`
                                            : "/placeholder.png"
                                    }
                                    alt={product.title}
                                    loading="lazy"
                                    className="w-16 h-16 object-cover rounded"
                                />
                                <div className="flex-1">
                                    <h4 className="font-medium text-sm line-clamp-1">
                                        {product.title}
                                    </h4>
                                    <p className="text-xs text-gray-600 line-clamp-2">
                                        {product.description.replace(/<[^>]*>/g, "").substring(0, 150) + "..."}
                                    </p>
                                    <p className="text-sm font-semibold text-green-600 mt-1">
                                        {product.discountPercentage > 0
                                            ? `السعر: ${Math.round(product.priceAfterDiscount)} جنيه (بدلاً من ${Math.round(product.price)} جنيه)`
                                            : `السعر: ${Math.round(product.price)} جنيه`}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Share Buttons */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <FacebookShareButton
                                url={shareUrl}
                                quote={`${product.title}\n\n${product.description.replace(/<[^>]*>/g, "").substring(0, 150)}\n\nالسعر: ${Math.round(product.priceAfterDiscount || product.price)} جنيه\n\n🛒 اضغط على الرابط للمشاهدة والطلب الآن!`}
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
                                title={`🛍️ ${product.title}\n\n📝 ${product.description.replace(/<[^>]*>/g, "").substring(0, 150)}\n\n💰 السعر: ${Math.round(product.priceAfterDiscount || product.price)} جنيه\n\n✨ ${product?.quantity > 10 ? 'متوفر الآن' : 'كمية محدودة - اطلب الآن'}\n\n👆 اضغط على الرابط لعرض المنتج وإتمام الطلب:`}
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
                                title={`${product.title} - ${product.description.replace(/<[^>]*>/g, "").substring(0, 150)} - السعر: ${Math.round(product.priceAfterDiscount || product.price)} جنيه - اضغط للمشاهدة والطلب`}
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
                                title={`${product.title}\n\n${product.description.replace(/<[^>]*>/g, "").substring(0, 150)}\n\nالسعر: ${Math.round(product.priceAfterDiscount || product.price)} جنيه\n\n🔥 ${product?.quantity > 10 ? 'متوفر الآن - اطلب من الرابط' : 'كمية محدودة - اطلب الآن من الرابط'}`}
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
        </>
    );
};

export default V2ProductCardHome;