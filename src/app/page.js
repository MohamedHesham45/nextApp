"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronUp, Grid, List } from "lucide-react";
import MapLocation from "@/components/MapLocation";
import V2FiveProductsPerCategory from "@/components/V2FiveProductsPerCategory";
import { useAuth } from "@/app/context/AuthContext";
import { usePageCache } from "@/app/context/PageCacheContext";

export default function LandingPage() {
  const { cache: homeCache, saveCache: saveHomeCache } = usePageCache('home-ui');

  const [mounted, setMounted] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mainImage, setMainImage] = useState("/1736196830699.jpg");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [viewMode, setViewMode] = useState(() => homeCache?.viewMode || "grid"); // grid | list
  const scrollYRef = useRef(0);
  const viewModeRef = useRef(viewMode);
  const [defaultViewId, setDefaultViewId] = useState(null);
  const [pendingMode, setPendingMode] = useState(null); // mode waiting for admin decision
  const [showViewModal, setShowViewModal] = useState(false);
  const auth = useAuth();
  const isLoggedIn = auth?.isLoggedIn || false;
  const role = auth?.role || null;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchCustomFields();
    fetchMainImage();
    fetchDefaultView();
  }, [mounted]);

  const fetchCustomFields = async () => {
    try {
      const response = await fetch("/api/customize?name=رقم الواتس");
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
      const res = await fetch("/api/customize?name=صوره الوجهه");
      const data = await res.json();
      const value = data.length > 0 ? data[0].value : "/123.jpg";
      setMainImage(value);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDefaultView = async () => {
    try {
      const res = await fetch("/api/customize?name=وضع العرض");
      const data = await res.json();
      if (data.length > 0) {
        setDefaultViewId(data[0]._id);
        if (!homeCache?.viewMode) {
          setViewMode(data[0].value || "grid");
          viewModeRef.current = data[0].value || "grid";
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveDefaultView = async (mode) => {
    try {
      if (defaultViewId) {
        await fetch(`/api/customize/${defaultViewId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: mode }),
        });
      } else {
        const res = await fetch("/api/customize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "وضع العرض", value: mode }),
        });
        const data = await res.json();
        if (data.customize?._id) setDefaultViewId(data.customize._id);
      }
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
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
      scrollYRef.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mounted]);

  // Save scroll + viewMode on unmount
  useEffect(() => {
    return () => { saveHomeCache({ viewMode: viewModeRef.current, scrollY: scrollYRef.current }); };
  }, []);

  // Restore scroll position on mount
  useEffect(() => {
    if (!homeCache?.scrollY) return;
    const t = setTimeout(() => {
      window.scrollTo({ top: homeCache.scrollY, behavior: "instant" });
    }, 80);
    return () => clearTimeout(t);
  }, []);

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
            <button
              onClick={() => {
                const newMode = viewMode === "grid" ? "list" : "grid";
                if (isLoggedIn && role !== "user") {
                  setPendingMode(newMode);
                  setShowViewModal(true);
                } else {
                  setViewMode(newMode);
                  viewModeRef.current = newMode;
                  saveHomeCache({ viewMode: newMode });
                }
              }}
              className="p-2 rounded-md bg-amazon-light-gray text-amazon hover:bg-amazon-yellow flex-shrink-0 transition"
              title={isLoggedIn && role !== "user" ? "تغيير العرض (يُحفظ كافتراضي)" : "تغيير العرض"}
            >
              {viewMode === "grid" ? <List size={18} /> : <Grid size={18} />}
            </button>
            <Link
              href="/gallery"
              className="bg-amazon-orange hover:bg-amazon-orange-dark text-white px-6 py-2 rounded-lg transition-all duration-300 text-base md:text-lg font-semibold hover:shadow-md"
            >
              تسوق الآن
            </Link>
            <Link
              href="/contact"
              className="bg-transparent border-2 border-amazon-yellow text-amazon hover:bg-amazon-yellow hover:text-amazon-dark px-6 py-2 rounded-lg transition-all duration-300 text-base md:text-lg font-semibold hover:shadow-md"
            >
              تواصل معنا
            </Link>
          </div>
        </section>

        {/* Five Products per Category */}
        <section className="bg-white">
          <div className="container mx-auto">
            <V2FiveProductsPerCategory viewMode={viewMode} />
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

      {/* Admin view-mode modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-80 text-center" dir="rtl">
            <h2 className="text-lg font-bold text-amazon mb-2">تغيير طريقة العرض</h2>
            <p className="text-gray-600 text-sm mb-6">
              هل تريد تطبيق هذا التغيير على جميع الزوار أم فقط لك؟
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setViewMode(pendingMode);
                  viewModeRef.current = pendingMode;
                  saveDefaultView(pendingMode);
                  saveHomeCache({ viewMode: pendingMode });
                  setShowViewModal(false);
                  setPendingMode(null);
                }}
                className="bg-amazon-orange hover:bg-amazon-orange-dark text-white py-2 px-4 rounded-lg font-semibold transition"
              >
                تغيير للجميع (الزوار والأدمن)
              </button>
              <button
                onClick={() => {
                  setViewMode(pendingMode);
                  viewModeRef.current = pendingMode;
                  saveHomeCache({ viewMode: pendingMode });
                  setShowViewModal(false);
                  setPendingMode(null);
                }}
                className="bg-amazon-light-gray hover:bg-amazon-yellow text-amazon py-2 px-4 rounded-lg font-semibold transition"
              >
                تغيير فقط لي
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setPendingMode(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-sm transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
