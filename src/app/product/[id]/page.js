"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Heart, ShoppingCart } from "lucide-react";
import { sanitizeHTML } from "@/components/ProductCard";
import { useCartFavorite } from "@/app/context/cartFavoriteContext";
import { toast } from "react-hot-toast";
import ShoppingCartPage from "@/components/ShoppingCart";
import useMetaConversion from "@/components/SendMetaConversion";

export default function ProductPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProductDetails />
    </Suspense>
  );
}

export function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isCartVisible, setIsCartVisible] = useState(false);
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
      var userAgent = navigator.userAgent;

      fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(async (data) => {
          var ipAddress = data.ip;
          fbq('track', 'AddToWishlist', {
            product_name: product.title,
            product_category: product.category,
            product_ids: [product._id],
            product_image: "https://sitaramall.com/" + product.images[0],
            product_images: product.images.map(image => "https://sitaramall.com/" + image),
            product_price: product.price,
            product_price_after_discount: product.priceAfterDiscount || product.price,
            product_quantity: product.quantity,
            product_images: product.images,
            value: product.priceAfterDiscount || product.price,
            currency: 'EGP',
            ip_address: ipAddress,
            user_agent: userAgent
          });
          await sendMetaConversion('AddToWishlist', {
            product_name: product.title,
            product_category: product.category,
            product_ids: [product._id],
            product_image: "https://sitaramall.com/" + product.images[0],
            product_images: product.images.map(image => "https://sitaramall.com/" + image),
            product_price: product.price,
            product_price_after_discount: product.priceAfterDiscount || product.price,
            value: product.priceAfterDiscount || product.price,
          }, ipAddress, userAgent);
        })
        .catch(error => console.error('Error fetching IP address:', error));
      toast.success("تم إضافة المنتج إلى المفضلة");
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

    var userAgent = navigator.userAgent;

    fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(async (data) => {
        var ipAddress = data.ip;
        fbq('track', 'AddToCart', {
          product_name: product.title,
          product_category: product.category,
          product_ids: [product._id],
          product_image: "https://sitaramall.com/" + product.images[0],
          product_images: product.images.map(image => "https://sitaramall.com/" + image),
          product_price: product.price,
          product_price_after_discount: product.priceAfterDiscount || product.price,
          product_quantity: product.quantity,
          product_images: product.images,
          value: product.priceAfterDiscount || product.price,
          currency: 'EGP',
          ip_address: ipAddress,
          user_agent: userAgent
        });
        await sendMetaConversion('AddToCart', {
          product_name: product.title,
          product_category: product.category,
          product_ids: [product._id],
          product_image: "https://sitaramall.com/" + product.images[0],
          product_images: product.images.map(image => "https://sitaramall.com/" + image),
          product_price: product.price,
          product_price_after_discount: product.priceAfterDiscount || product.price,
          value: product.priceAfterDiscount || product.price,
        }, ipAddress, userAgent);
      })
      .catch(error => console.error('Error fetching IP address:', error));

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    toast.success("تم إضافة المنتج إلى السلة");
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
      fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(async (data) => {

          var ipAddress = data.ip;
          var userAgent = navigator.userAgent;

          fbq('track', 'InitiateCheckout', {
            product_name: product.title,
            product_category: product.category,
            product_ids: [product._id],
            product_image: "https://sitaramall.com/" + product.images[0],
            product_images: product.images.map(image => "https://sitaramall.com/" + image),
            product_price: product.price,
            product_price_after_discount: product.priceAfterDiscount || product.price,
            product_quantity: product.quantity,
            product_images: product.images,
            value: product.priceAfterDiscount || product.price,
            currency: 'EGP',
            ip_address: ipAddress,
            user_agent: userAgent
          });
          await sendMetaConversion('InitiateCheckout', {
            product_name: product.title,
            product_category: product.category,
            product_ids: [product._id],
            product_image: "https://sitaramall.com/" + product.images[0],
            product_images: product.images.map(image => "https://sitaramall.com/" + image),
            product_price: product.price,
            product_price_after_discount: product.priceAfterDiscount || product.price,
            value: product.priceAfterDiscount || product.price,
          }, ipAddress, userAgent);
        })
        .catch(error => console.error('Error fetching IP address:', error));
      setIsCartVisible(true);
    } else {
      setIsCartVisible(true);
      // fetch('https://api.ipify.org?format=json')
      // .then(response => response.json())
      // .then(data => {

      //   var ipAddress = data.ip;
      //   var userAgent = navigator.userAgent;

      //   fbq('track', 'InitiateCheckout', {
      //     product_name: product.title,
      //     product_category: product.category,
      //     product_ids: [product._id],
      //     product_image: "https://sitaramall.com/" + product.images[0],
      //     product_price: product.price,
      //     product_price_after_discount: product.priceAfterDiscount || product.price,
      //     product_quantity: product.quantity,
      //     product_images: product.images,
      //     value: product.priceAfterDiscount || product.price,
      //     currency: 'EGP',
      //     ip_address: ipAddress,
      //     user_agent: userAgent
      //   });
      // })
      // .catch(error => console.error('Error fetching IP address:', error));
    }

  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }
        const data = await response.json();
        setProduct(data);
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

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return <div className="text-center text-red-500">Error: {error}</div>;
  if (!product) return <div className="text-center">Product not found</div>;

  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : ["/123.jpg"];

  return (
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
                  className="w-full h-[250px] sm:h-[350px] md:h-[500px] rounded-2xl shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
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
                <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onMouseEnter={() => setSelectedImageIndex(index)}
                      className={`relative flex-shrink-0 w-16 h-16 sm:w-24 sm:h-24 rounded-lg overflow-hidden ${selectedImageIndex === index
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
                          متبقي <span className="font-bold">{product.quantity}</span> - اطلب الان
                        </span>
                      ) : (
                        <span className="text-red-500">
                          تبقي <span className="font-bold">{product.quantity}</span> فقط - اطلب الان
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-red-500 text-lg font-bold">غير متاح الان</span>
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
                        className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white text-gray-700 rounded-full transition-all duration-200 shadow-sm text-lg sm:text-xl font-semibold ${cartQuantity >= product.quantity
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
                        className={`bg-amazon-orange hover:bg-amazon-orange-dark text-white rounded-full transition-all duration-200 hover:shadow-xl flex items-center justify-center text-base sm:text-lg font-semibold ${product.quantity === 0
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:scale-105"
                          } px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 w-full `}
                        disabled={product.quantity === 0}
                      >
                        <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                        اضف الى العربة
                      </button>
                    </div>
                  )}
                  <button
                    onClick={(e) => handleAddToFavorite(e, product)}
                    className={`p-4 sm:p-5 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 border-gray-100 hover:border-red-500 ${favorite.some((item) => item._id === product._id)
                      ? "text-red-500 border-red-500"
                      : "text-gray-400 border-gray-100"
                      }`}
                  >
                    <Heart
                      className={`h-6 w-6 sm:h-7 sm:w-7 stroke-2 ${favorite.some((item) => item._id === product._id)
                        ? "fill-red-500"
                        : ""
                        }`}
                    />
                  </button>
                </div>
              </div>

              <button
                className={`w-full bg-green-600 hover:bg-green-700 text-white py-3 sm:py-4 rounded-full transition-all duration-300 hover:shadow-xl text-base sm:text-lg font-semibold ${product.quantity === 0
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
            </div>
          </div>
        </div>
      </div>
      <ShoppingCartPage
        isVisible={isCartVisible}
        setIsVisible={setIsCartVisible}
      />
    </div>
  );
}
