"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronUp } from "lucide-react";
import MapLocation from "@/components/MapLocation";
import V2FiveProductsPerCategory from "@/components/V2FiveProductsPerCategory";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mainImage, setMainImage] = useState("/123.jpg");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchCustomFields();
    fetchMainImage();
  }, [mounted]);

  const fetchCustomFields = async () => {
    try {
      const response = await fetch("/v2/api/customize?name=رقم الواتس");
      if (!response.ok) throw new Error("Failed to fetch custom fields");
      const data = await response.json();
      const value = data[0]?.value || "";
      setWhatsappNumber(value);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMainImage = async () => {
    try {
      const res = await fetch("/v2/api/customize?name=صوره الوجهه");
      const data = await res.json();
      const value = data.length > 0 ? data[0].value : "/123.jpg";
      setMainImage(value);
    } catch (err) {
      console.error(err);
    }
  };

  const message = "Hello! I have a question about your products.";

  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message);
    window.open(
      `https://wa.me/${
        whatsappNumber || "201223821206"
      }?text=${encodedMessage}`,
      "_blank"
    );
  };

  useEffect(() => {
    if (!mounted) return;
    const handleScroll = () => setShowScrollTop(window.pageYOffset > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mounted]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  if (!mounted) return null;

  return (
    <div className="bg-gray-100">
      <main>
        {/* Banner Section */}
        <section className="relative min-h-[40vh] flex flex-col items-center justify-center bg-white overflow-hidden md:p-6 text-center">
          <div className="relative w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden shadow-lg border-4 border-amazon-yellow mb-6">
            <img
              src={mainImage?.startsWith("/") ? mainImage : `/${mainImage}`}
              alt="ستارة مول"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-amazon mb-4">
            ستارة مول
          </h1>
          <p className="text-base md:text-xl text-amazon-orange mb-6">
            اكتشف عالماً من الأناقة والجودة
          </p>
          <div className="flex flex-row gap-4 justify-center">
            <Link
              href="/v2/gallery"
              className="bg-amazon-orange hover:bg-amazon-orange-dark text-white px-6 py-2 rounded-lg transition-all duration-300 text-base md:text-lg font-semibold hover:shadow-md"
            >
              تسوق الآن
            </Link>
            <Link
              href="/v2/contact"
              className="bg-transparent border-2 border-amazon-yellow text-amazon hover:bg-amazon-yellow hover:text-amazon-dark px-6 py-2 rounded-lg transition-all duration-300 text-base md:text-lg font-semibold hover:shadow-md"
            >
              تواصل معنا
            </Link>
          </div>
        </section>

        {/* Five Products per Category */}
        <section className="bg-white">
          <div className="container mx-auto">
            <V2FiveProductsPerCategory />
          </div>
        </section>

        {/* Why Us Section */}
        <section className="bg-white direction-rtl">
          <div className="container mx-auto px-6 py-12 hover:cursor-pointer">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
              لماذا تختارنا؟
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Link href="/gallery">
                <div className="bg-amazon-light-gray p-6 rounded-lg shadow-md text-center transform hover:scale-105 transition duration-300 h-full">
                  <div className="text-4xl mb-4">🏆</div>
                  <h3 className="text-xl font-semibold mb-2">
                    منتجات ذات جودة عالية
                  </h3>
                  <p className="text-gray-600">
                    نحن نقدم فقط أفضل المنتجات ذات الجودة لعملائنا.
                  </p>
                </div>
              </Link>
              <Link href="/delivery-types">
                <div className="bg-amazon-light-gray p-6 rounded-lg shadow-md text-center transform hover:scale-105 transition duration-300 hover:cursor-pointer">
                  <div className="text-4xl mb-4">🚚</div>
                  <h3 className="text-xl font-semibold mb-2">أسعار الشحن</h3>
                  <p className="text-gray-600">اعرف سعر الشحن لمحافظتك</p>
                </div>
              </Link>
              <div
                className="bg-amazon-light-gray p-6 rounded-lg shadow-md text-center transform hover:scale-105 hover:cursor-pointer transition duration-300"
                onClick={handleClick}
              >
                <div className="text-4xl mb-4">🎧</div>
                <h3 className="text-xl font-semibold mb-2">
                  دعم على مدار الساعة طوال أيام الأسبوع
                </h3>
                <p className="text-gray-600">
                  فريق دعم العملاء لدينا موجود دائمًا لمساعدتك.
                </p>
              </div>
            </div>
          </div>
          <MapLocation />
        </section>
      </main>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-36 right-5 bg-amazon-blue text-white p-2 rounded-full shadow-lg z-40 hover:bg-blue-600 transition duration-300 animate-bounce"
          aria-label="Scroll to top"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </div>
  );
}
