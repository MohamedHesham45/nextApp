import React from "react";
import { Heart, ShoppingBag, Send } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ProductCard({
  product,
  idx,
  products,
  lastProductRef,
  favorite,
  setFavorite,
  cart,
  setCart,
  setShareProduct,
  setShowShareModal,
}) {
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
    <Link href="/product/[id]" as={`/product/${product._id}`}>
      <div
        ref={products.length === idx + 1 ? lastProductRef : undefined}
        className="bg-white rounded-2xl shadow group hover:shadow-lg transition overflow-hidden cursor-pointer border border-amazon-light-gray"
      >
        <div className="flex items-center">
          {/* صورة المنتج */}
          <div className="w-44 h-52 flex-shrink-0 overflow-hidden bg-amazon-light-gray flex items-center justify-center">
            <img
              src={
                product.images && product.images[0]
                  ? product.images[0].startsWith("/")
                    ? product.images[0]
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
              <h3 className="text-base font-bold text-amazon line-clamp-2 mb-1">
                {product.title}
              </h3>

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
                {product.description
                  ?.replace(/<[^>]*>/g, "")
                  .substring(0, 60) || ""}
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
              ${
                isFavorite
                  ? "bg-gradient-to-tr from-pink-500 to-red-500 text-white shadow-lg shadow-pink-400/40"
                  : "bg-white/90 text-gray-700 shadow-md hover:bg-gradient-to-tr hover:from-pink-400 hover:to-red-400 hover:text-white"
              }`}
              >
                <Heart className="w-5 h-5" />
              </button>

              {/* Cart */}
              <button
                onClick={handleAddToCart}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110
              ${
                cartQuantity > 0
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
    </Link>
  );
}
