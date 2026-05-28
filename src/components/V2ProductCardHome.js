"use client";

import { Heart, ShoppingBag, Send, Copy, Check } from "lucide-react";
import { stripHtml } from "@/lib/stripHtml";
import { useCartFavorite } from "@/app/context/cartFavoriteContext";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { trackFbq } from "@/lib/fbq";
import { useProductCacheSync } from "@/app/context/PageCacheContext";
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
import { useAuth } from "@/app/context/AuthContext";
import ProductForm from "./ProductForm";

const V2ProductCardHome = ({ product, setProducts }) => {
  const { cart, setCart, favorite, setFavorite } = useCartFavorite();
  const { updateProductInCache, removeProductFromCache } = useProductCacheSync();
  const [showMenu, setShowMenu] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errorSubmit, setErrorSubmit] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [copied, setCopied] = useState(false);
  const auth = useAuth();
  const isLoggedIn = auth?.isLoggedIn || false;
  const role = auth?.role || null;

  const handleAddToFavorite = async (e, product) => {
    const existingItemIndex = favorite.findIndex(
      (item) => item._id === product._id,
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
  const handleDelete = async (product) => {
    try {
      setLoadingDelete(true);
      const res = await fetch(`/api/products/${product._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete product");

      await fetch("/remove-images", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filenames: product.images }),
      });
      if (product.video) {
        await fetch("/remove-videos", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filenames: [product.video] }),
        });
      }
      setProducts((prev) => prev.filter((item) => item._id !== product._id));
      removeProductFromCache(product._id);
      toast.success("تم حذف المنتج بنجاح");
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء حذف المنتج اعد المحاولة");
    } finally {
      setLoadingDelete(false);
    }
  };
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/category");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data.categories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories. Please try again later.");
    }
  }, []);
  useEffect(() => {
    if (isLoggedIn && role === "admin") {
      fetchCategories();
    }
  }, [isLoggedIn, role]);
  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };
  const handleSubmit = async (productData) => {
    try {
      setLoadingSubmit(true);
      const imagesProduct = productData.getAll("images");
      const finalData = {};
      const imagess = [];
      const images = new FormData();
      const checkImages = [];

      const videoFile = productData.get("video");
      console.log("video file", videoFile);
      const videoForm = new FormData();
      let newVideoPath = null;
      if (videoFile && typeof videoFile !== "string") {
        videoForm.append("video", videoFile);

        const res = await fetch("/upload-video", {
          method: "POST",
          body: videoForm,
        });

        if (!res.ok) throw new Error("فشل رفع الفيديو");

        const data = await res.json();
        newVideoPath = data.file;

        finalData.video = newVideoPath;
      } else {
        finalData.video = videoFile;
      }

      productData.forEach((value, key) => {
        if (key != "images") {
          finalData[key] = value;
        } else {
          if (typeof value === "string") {
            imagess.push(value);
          }
        }
      });
      if (finalData.hidden !== undefined) {
        finalData.hidden =
          finalData.hidden === "true" || finalData.hidden === true;
      }
      if (imagesProduct.length > 0) {
        imagesProduct.forEach((image) => {
          if (typeof image !== "string") {
            images.append("images", image);
          }
        });
        if (images.getAll("images").length > 0) {
          const res = await fetch("/upload-images", {
            method: "POST",
            body: images,
          });
          if (!res.ok) throw new Error("حدث خطأ أثناء رفع الصور حاول مرة أخرى");
          const data = await res.json();
          const checkImages = [];
          data.files.forEach((file) => {
            checkImages.push(file);

            imagess.push(file);
          });
        }
        finalData.images = imagess;
      }
      const method = editingProduct ? "PUT" : "POST";
      const url = editingProduct
        ? `/api/products/${editingProduct._id}`
        : "/api/products";

      const res = await fetch(url, {
        method,

        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        if (checkImages.length > 0) {
          await fetch("/remove-images", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ filenames: checkImages }),
          });
          if (newVideoPath) {
            await fetch("/remove-videos", {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ filenames: [newVideoPath] }),
            });
          }
        }
        throw new Error(errorData.message || "حدث خطأ أثناء إضافة المنتج");
      }
      const data = await res.json();
      if (editingProduct) {
        setProducts((prev) =>
          prev.map((p) => (p._id === editingProduct._id ? data.product : p))
        );
        updateProductInCache(data.product);
        toast.success("تم تحديث المنتج بنجاح");
      } else {
        setProducts((prev) => [...prev, data.product]);
        toast.success("تم إضافة المنتج بنجاح");
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message || "حدث خطأ أثناء إضافة المنتج");
      setErrorSubmit(err.message);
      throw new Error(err.message);
    } finally {
      setLoadingSubmit(false);
    }
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
          JSON.stringify(itemToAdd.selectedImages),
    );

    let updatedCart;
    if (existingItemIndex !== -1) {
      updatedCart = [...cart];
      if (
        updatedCart[existingItemIndex].quantityCart + 1 >
        updatedCart[existingItemIndex].quantity
      ) {
        toast.error("الكمية المطلوبة غير متوفرة في المخزون");
        return;
      }
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
    trackFbq("AddToCart", {
      content_ids: [product._id],
      content_name: product.title,
      value: parseInt(product.price || 0),
      currency: "EGP",
    });
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
    swipe: true,
  };

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
          product.priceAfterDiscount,
        )} جنيه (بدلاً من ${Math.round(product.price)} جنيه)`
      : `السعر: ${Math.round(product.price)} جنيه`;

  if (product.hidden && role !== "admin") return null;

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
      <Link href={`/product/${product._id}`}>
        <div className="relative aspect-[3/4] bg-white overflow-hidden shadow-sm flex items-center justify-center group">
          {/* Three dots menu */}
          {isLoggedIn && role === "admin" && (
            <div className="absolute bottom-2 right-2 z-20">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMenu((prev) => !prev);
                }}
                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 transition z-20"
              >
                <span className="text-white text-xl leading-none">⋮</span>
              </button>

              {showMenu && (
                <div
                  className="absolute bottom-10 right-0 mt-2 w-24 sm:w-32 bg-white rounded-md shadow-lg overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleEdit(product);
                      setShowMenu(false);
                    }}
                    className="w-full text-right px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    تعديل
                  </button>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setIsDeleteModalOpen(true);
                      setShowMenu(false);
                    }}
                    className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    حذف
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Image carousel if more than one image */}
          <div className="w-full h-full ">
            {product.images && product.images.length > 1 ? (
              <Slider {...sliderSettings} className="h-full ">
                {product.images.map((img, idx) => (
                  <img
                    src={img.startsWith("/") ? `${img}` : `/${img}`}
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
          {/* Video indicator badge */}
          {product.video && (
            <div className="absolute top-2 left-2 z-10 bg-black/60 rounded-full p-1.5 pointer-events-none">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}

          {/* Out of stock overlay */}
          {product.quantity <= 0 && (
            <div className="absolute inset-0 bg-black/65 flex items-center justify-center z-10">
              <span className="text-white text-2xl font-bold drop-shadow-lg text-center">
                نفذت الكمية
              </span>
            </div>
          )}
          {product.hidden && role === "admin" && (
            <div className="absolute inset-0 bg-black/65 flex items-center justify-center z-10">
              <span className="text-white text-2xl font-bold drop-shadow-lg text-center">
                مخفي
              </span>
            </div>
          )}
          {/* Discount badge */}
          {product.discountPercentage > 0 && (
            <span className="absolute bottom-2 left-2  text-red-700 text-sm md:text-lg font-bold px-2 py-1  z-10">
              خصم {Math.round(product.discountPercentage)}%
            </span>
          )}
        </div>
      </Link>
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white p-4 rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <ProductForm
              onSubmit={handleSubmit}
              initialData={editingProduct}
              onCancel={() => setIsModalOpen(false)}
              categories={categories}
              loadingSubmit={loadingSubmit}
              errorSubmit={errorSubmit}
            />
          </div>
        </div>
      )}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full sm:w-1/3">
            <h3 className="text-xl font-semibold mb-4">
              هل تريد حذف المنتج:{product.title}؟
            </h3>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={() => handleDelete(product)}
                disabled={loadingDelete}
              >
                {loadingDelete ? "جاري الحذف..." : "تأكيد"}
              </button>
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded mr-2"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

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
                    {product.description
                      .replace(/<[^>]*>/g, "")
                      .substring(0, 150) + "..."}
                  </p>
                  <p className="text-sm font-semibold text-green-600 mt-1">
                    {product.discountPercentage > 0
                      ? `السعر: ${Math.round(
                          product.priceAfterDiscount,
                        )} جنيه (بدلاً من ${Math.round(product.price)} جنيه)`
                      : `السعر: ${Math.round(product.price)} جنيه`}
                  </p>
                </div>
              </div>
            </div>
            {/* Share Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <FacebookShareButton
                url={shareUrl}
                quote={`${product.title}\n\n${product.description
                  .replace(/<[^>]*>/g, "")
                  .substring(0, 150)}\n\nالسعر: ${Math.round(
                  product.priceAfterDiscount || product.price,
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
                title={`🛍️ ${product.title}\n\n📝 ${product.description
                  .replace(/<[^>]*>/g, "")
                  .substring(0, 150)}\n\n💰 السعر: ${Math.round(
                  product.priceAfterDiscount || product.price,
                )} جنيه\n\n✨ ${
                  product?.quantity > 10
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
                title={`${product.title} - ${product.description
                  .replace(/<[^>]*>/g, "")
                  .substring(0, 150)} - السعر: ${Math.round(
                  product.priceAfterDiscount || product.price,
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
                title={`${product.title}\n\n${product.description
                  .replace(/<[^>]*>/g, "")
                  .substring(0, 150)}\n\nالسعر: ${Math.round(
                  product.priceAfterDiscount || product.price,
                )} جنيه\n\n🔥 ${
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
      )}
    </>
  );
};

export default V2ProductCardHome;
