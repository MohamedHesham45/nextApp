"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Heart, ShoppingCart } from "lucide-react";
import { sanitizeHTML } from "@/components/ProductCard";
import { useCartFavorite } from "@/app/context/cartFavoriteContext";
import { toast } from "react-hot-toast";

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

  const { cart, setCart, favorite, setFavorite } = useCartFavorite();
  const [cartQuantity, setCartQuantity] = useState(0);

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
      <div className="container mx-auto px-6 md:px-16 lg:px-32 py-16 direction-rtl min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-6">
              <div className="relative group">
                <img
                  src={images[selectedImageIndex]?.startsWith('/') ? images[selectedImageIndex] : `/${images[selectedImageIndex]}`}
                  alt={`${product.title} - صورة ${selectedImageIndex + 1}`}
                  className="w-full h-[600px] rounded-2xl shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
                />
                {product.quantity === 0 && (
                  <span className="absolute top-6 right-6 bg-amazon-blue text-white text-sm font-bold px-4 py-2 rounded-lg shadow-lg">
                    نفذت الكمية
                  </span>
                )}
                {product.discountPercentage > 0 && (
                  <span className="absolute top-6 left-6 bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-lg">
                    خصم {Math.round(product.discountPercentage)}%
                  </span>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onMouseEnter={() => setSelectedImageIndex(index)}
                      className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden ${
                        selectedImageIndex === index
                          ? "ring-4 ring-amazon-blue"
                          : "ring-2 ring-gray-200 hover:ring-blue-300"
                      } transition-all duration-200`}
                    >
                      <img
                        src={image?.startsWith('/') ? image : `/${image}`}
                        alt={`${product.title} - صورة مصغرة ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-10">
              <div className="space-y-6">
                <h1 className="text-4xl font-bold text-gray-800 leading-tight">
                  {product.title}
                </h1>
                {product.referenceCode && (
                  <p className="text-gray-500">
                    رقم المرجع: {product.referenceCode}
                  </p>
                )}
                {/* <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p> */}
                <div
                  className="text-gray-600 text-lg leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHTML(product.description),
                  }}
                />
              </div>

              <div className="space-y-6 bg-white p-8 rounded-2xl shadow-lg">
                {product.discountPercentage > 0 ? (
                  <div className="space-y-3">
                    <p className="text-gray-500 text-lg">
                      قبل الخصم:{" "}
                      <span className="text-red-500 line-through">
                        {Math.round(product.price)} جنيه
                      </span>
                    </p>
                    <p className="text-gray-500 text-lg">
                      بعد الخصم:{" "}
                      <span className="text-green-600 font-bold text-3xl">
                        {Math.round(product.priceAfterDiscount)} جنيه
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-lg">
                    السعر:{" "}
                    <span className="text-green-600 font-bold text-3xl">
                      {Math.round(product.price)} جنيه
                    </span>
                  </p>
                )}

                <p className="text-gray-500 text-lg">
                  الكمية المتوفرة:{" "}
                  <span
                    className={`font-bold ${
                      product.quantity > 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {product.quantity > 0 ? product.quantity : "نفذت الكمية"}
                  </span>
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-6">
                  {cartQuantity > 0 ? (
                    <div className="flex-1 flex items-center justify-center gap-4 bg-gray-100 p-2 rounded-full">
                      <button
                        onClick={(e) => handleQuantityChange(e, -1)}
                        className="w-12 h-12 flex items-center justify-center bg-white text-gray-700 hover:bg-amazon-orange hover:text-white rounded-full transition-all duration-200 shadow-sm text-xl font-semibold"
                      >
                        -
                      </button>
                      <span className="w-16 text-center font-medium text-xl">
                        {cartQuantity}
                      </span>
                      <button
                        onClick={(e) => handleQuantityChange(e, 1)}
                        className={`w-12 h-12 flex items-center justify-center bg-white text-gray-700 rounded-full transition-all duration-200 shadow-sm text-xl font-semibold ${
                          cartQuantity >= product.quantity
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-amazon-orange hover:text-white"
                        }`}
                        disabled={cartQuantity >= product.quantity}
                      >
                        +
                      </button>
                    </div>
                  ) : product.quantity > 0 ? (
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="flex-1 bg-amazon-orange hover:bg-amazon-orange-dark text-white rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3 text-lg font-semibold"
                      disabled={product.quantity === 0}
                    >
                      <ShoppingCart className="h-6 w-6" />
                      اضف الى السلة
                    </button>
                  ) : (
                    ""
                  )}
                  <button
                    onClick={(e) => handleAddToFavorite(e, product)}
                    className={`p-5 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 border-gray-100 hover:border-red-500 ${
                      favorite.some((item) => item._id === product._id)
                        ? "text-red-500 border-red-500"
                        : "text-gray-400 border-gray-100"
                    }`}
                  >
                    <Heart
                      className={`h-7 w-7 stroke-2 ${
                        favorite.some((item) => item._id === product._id)
                          ? "fill-red-500"
                          : ""
                      }`}
                    />
                  </button>
                </div>

                {/* <button
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl text-lg font-semibold"
                                disabled={product.quantity === 0}
                            >
                                اطلب الآن
                            </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
