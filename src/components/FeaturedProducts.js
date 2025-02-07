"use client";

import React, {
  useState,
  useEffect,
} from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(
    []
  );

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        const response = await fetch(
          "/api/products?featured=true"
        );
        if (!response.ok) {
          throw new Error(
            "Failed to fetch featured products"
          );
        }
        const data = await response.json();

        // Group products by category
        const groupedProducts = data.reduce(
          (acc, product) => {
            if (!acc[product.category]) {
              acc[product.category] = [];
            }
            acc[product.category].push(product);
            return acc;
          },
          {}
        );

        // Select one product from each category
        const featuredProducts = Object.values(
          groupedProducts
        ).map((products) => products[0]);

        setProducts(featuredProducts);
        setCategories(
          Object.keys(groupedProducts)
        );
      } catch (error) {
        console.error(
          "Error fetching featured products:",
          error
        );
      }
    }

    fetchFeaturedProducts();
  }, []);

  const calculateDiscountedPrice = (product) => {
    return (
      product.price *
      (1 - product.discountPercentage / 100)
    );
  };

  return (
    <div className="px-4">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800">
        <span className="text-amazon-orange">المنتجات</span> المميزة
      </h2>

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        breakpoints={{
          640: {
            slidesPerView: 2,
          },
          768: {
            slidesPerView: 3,
          },
          1024: {
            slidesPerView: 4,
          },
        }}
        className="featured-products-slider"
      >
        {products.map((product) => {
          return (
            <SwiperSlide key={product._id}>
              <Link
                href={`/category/${product.categoryId._id}`}
              className="block group"
            >
              <div className="bg-white shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl">
                <div className="relative h-64">
                  <img
                    src={product.images?.[0]?.startsWith('/') ? product.images?.[0] : `/${product.images?.[0]}`||"/123.jpg"}
                    alt={product.title}
                    className="w-full max-h-full  transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex items-center justify-center transition-all duration-300">
                    <div className="text-center transform transition-all duration-300 group-hover:scale-105">
                      <h3 className="text-white text-xl font-bold text-center px-4 group-hover:text-amazon-yellow">
                        شاهد جميع {" "}{product.category.startsWith('ال') ? product.category : `ال${product.category}`}
                      </h3>
                      <span className="inline-block mt-4 px-6 py-2 bg-amazon-yellow text-white text-sm font-bold rounded-full opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                        اكتشف المزيد
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        )})}
      </Swiper>
      <div className="mt-10 text-center">
        <Link
          href="/gallery"
          className="inline-block bg-gradient-to-r bg-amazon-orange hover:bg-amazon-orange-dark text-white px-8 py-4 rounded-full text-lg font-semibold transition-all hover:scale-105 hover:shadow-lg hover:-translate-y-1"
        >
          عرض جميع المنتجات
        </Link>
      </div>
    </div>
  );
}
