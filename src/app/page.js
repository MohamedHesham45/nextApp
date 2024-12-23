"use client";

import React, {
  useState,
  useEffect,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronUp } from "lucide-react";
import FeaturedProducts from "@/components/FeaturedProducts";
import MapLocation from "@/components/MapLocation";

export default function LandingPage() {
  const [showScrollTop, setShowScrollTop] =
    useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener(
      "scroll",
      handleScroll
    );
    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main>
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/123.jpg"
              alt="Hero Background"
              layout="fill"
              objectFit="cover"
              quality={100}
            />
            <div className="absolute inset-0 bg-black opacity-50"></div>
          </div>
          <div className="container mx-auto px-6 relative z-10 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-8 animate-fade-in-down">
              ستارة مول
            </h1>
            <p className="text-xl md:text-2xl text-white mb-12 animate-fade-in-up">
              أقمشة و أكثر
            </p>
            <Link
              href="/gallery"
              className="bg-blue-500 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-blue-600 transition duration-300 animate-bounce"
            >
              تسوق الآن{" "}
            </Link>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
              المنتجات المميزة
            </h2>
            <FeaturedProducts />
          </div>
        </section>

        <section className="py-20 bg-gray-100">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
              لماذا تختارنا؟
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center transform hover:scale-105 transition duration-300">
                <div className="text-4xl mb-4">
                  🏆
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  منتجات ذات جودة عالية
                </h3>
                <p className="text-gray-600">
                  نحن نقدم فقط أفضل المنتجات ذات
                  الجودة لعملائنا.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center transform hover:scale-105 transition duration-300">
                <div className="text-4xl mb-4">
                  🚚
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  الشحن السريع
                </h3>
                <p className="text-gray-600">
                  احصل على توصيل طلباتك بسرعة مع
                  خدمة الشحن الفعالة لدينا.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center transform hover:scale-105 transition duration-300">
                <div className="text-4xl mb-4">
                  🎧
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  دعم على مدار الساعة طوال أيام
                  الأسبوع
                </h3>
                <p className="text-gray-600">
                  فريق دعم العملاء لدينا موجود
                  دائمًا لمساعدتك.
                </p>
              </div>
            </div>
          </div>
        </section>

        <MapLocation />
      </main>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg z-50 hover:bg-blue-600 transition duration-300  animate-bounce"
          aria-label="Scroll to top"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </div>
  );
}
