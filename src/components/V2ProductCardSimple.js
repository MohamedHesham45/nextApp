"use client";

import Link from "next/link";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const V2ProductCardSimple = ({ product, viewMode = "grid" }) => {
  if (viewMode === "list") {
    return (
      <Link href={`/product/${product._id}`}>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl shadow hover:shadow-md transition">
          <div className="w-32 h-36 flex-shrink-0 overflow-hidden rounded-lg">
            <img
              src={
                product.images && product.images.length > 0
                  ? product.images[0].startsWith("/")
                    ? `${product.images[0]}`
                    : `/${product.images[0]}`
                  : "/placeholder.png"
              }
              alt={product.title}
              className="object-cover w-full h-full"
            />
          </div>

          {/* تفاصيل المنتج */}
          <div className="flex flex-col justify-center flex-1 text-right">
            <h3 className="text-sm font-medium text-gray-800 line-clamp-2">
              {product.title}
            </h3>

            <div className="mt-2 flex flex-col items-end gap-1">
              <div className="text-sm font-medium">
                <span className="text-gray-500">
                  قبل الخصم:{" "}
                  <span className="text-red-500 line-through">
                    {Math.round(product.price)}
                  </span>
                </span>
                <br />
                <span className="text-gray-500">
                  بعد الخصم:{" "}
                  <span className="text-green-600 font-bold">
                    {Math.round(product.priceAfterDiscount)}
                  </span>
                </span>
              </div>

              {product.discountPercentage > 0 && (
                <span className="text-xs font-bold text-red-600">
                  خصم {Math.round(product.discountPercentage)}%
                </span>
              )}
            </div>

            {product.quantity === 0 && (
              <span className="mt-2 text-xs text-blue-600 font-bold">
                نفذت الكمية
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }
  // === Grid Mode ===
  const sliderSettings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: product.images && product.images.length > 1,
    autoplaySpeed: 4000,
    adaptiveHeight: true,
    swipe: true,
  };

  return (
    <Link href={`/product/${product._id}`}>
      <div className="relative aspect-[3/4] bg-white overflow-hidden shadow-sm flex items-center justify-center group cursor-pointer">
        {/* صورة المنتج مع سلايدر إذا كان هناك أكثر من صورة */}
        <div className="w-full h-full">
          {product.images && product.images.length > 1 ? (
            <Slider {...sliderSettings}>
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img.startsWith("/") ? `${img}` : `/${img}`}
                  alt={product.title}
                  className="aspect-[3/4] object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              ))}
            </Slider>
          ) : product.images && product.images.length > 0 ? (
            <img
              src={
                product.images[0].startsWith("/")
                  ? `${product.images[0]}`
                  : `/${product.images[0]}`
              }
              alt={product.title}
              className=" aspect-[3/4] object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <img
              src="/placeholder.png"
              alt={product.title}
              className="object-cover w-full h-full"
            />
          )}
        </div>

        {/* لو خلص المخزون */}
        {product.quantity === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-20">
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
              نفذت الكمية
            </span>
          </div>
        )}

        {/* الخصم */}
        {product.discountPercentage > 0 && (
          <span className="absolute top-2 left-2  text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg z-10">
            خصم {Math.round(product.discountPercentage)}%
          </span>
        )}
      </div>
    </Link>
  );
};

export default V2ProductCardSimple;
