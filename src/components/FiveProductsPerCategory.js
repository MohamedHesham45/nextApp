"use client";

import { useCallback, useEffect, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Link from "next/link";

const FiveProductsPerCategory = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoriesWithProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/api/products/home");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        console.log(data);
        setCategories(data);
      } catch (error) {
        setError(error.message);
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchCategoriesWithProducts();
  }, []);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8 direction-rtl">
      {categories.map((category, index) => (
        <div key={index}>
          <div className="flex items-end justify-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 ml-2">
              {category.category}
            </h2>
            <hr className="w-full h-0.5 bg-gray-100 rounded-full" />
          </div>
          <div>
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
              {category.products.map((product, index) => (
                  <SwiperSlide key={index}>
                  <div className="bg-white shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl">
                    <Link href={`/category/${product.categoryId}`}>
                    <div className="relative h-64">
                        <img
                          src={
                            product.images?.[0]?.startsWith("/")
                              ? product.images?.[0]
                              : `/${product.images?.[0]}` || "/123.jpg"
                          }
                          alt={product.title}
                          className="w-full max-h-full transition-transform duration-500 group-hover:scale-110"
                        />
                    </div>
                      </Link>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FiveProductsPerCategory;
