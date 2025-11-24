"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronUp } from "lucide-react";
import FeaturedProducts from "@/components/FeaturedProducts";
import MapLocation from "@/components/MapLocation";
import FiveProductsPerCategory from "@/components/FiveProductsPerCategory";

export default function LandingPage() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activePanel, setActivePanel] = useState(0);
  const [panels, setPanels] = useState([]);
  const [mainImage, setMainImage] = useState("/1736196830699.jpg");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  useEffect(() => {
    fetchCustomFields();
  }, []);
  const fetchCustomFields = async () => {
    const response = await fetch("/v2/api/customize?name=رقم الواتس");
    if (!response.ok) throw new Error("Failed to fetch custom fields");
    const data = await response.json();
    setWhatsappNumber(data[0].value);
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
    const fetchPanels = async () => {
      const res = await fetch("/api/panels");
      const data = await res.json();
      if (data.length > 0) {
        setPanels(data);
      }
    };
    const fetchMainImage = async () => {
      const res = await fetch("/api/customize?name=صوره الوجهه");
      const data = await res.json();
      if (data.length > 0) {
        setMainImage(data[0].value);
      }
    };
    fetchPanels();
    fetchMainImage();
  }, []);
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.pageYOffset > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // Common panel styles
  const getPanelStyles = (index, isMobile = false) => ({
    baseClasses: `flex-1 relative cursor-pointer group transition-all duration-300 ${
      activePanel === index
        ? "bg-amazon-dark"
        : "bg-amazon hover:bg-amazon-dark"
    }`,
    imageClasses: "absolute inset-0 w-full h-full object-cover",
    overlayClasses: `absolute inset-0 ${
      isMobile
        ? "opacity-30 group-hover:opacity-50"
        : "opacity-20 group-hover:opacity-40"
    } transition-opacity duration-300`,
    titleClasses: `font-bold transition-colors duration-300 ${
      activePanel === index
        ? "text-amazon-yellow"
        : "text-white group-hover:text-amazon-yellow"
    }`,
    indicatorClasses: isMobile
      ? "absolute bottom-0 left-0 right-0 h-1.5 bg-amazon-yellow"
      : "absolute left-0 top-0 bottom-0 w-1 bg-amazon-yellow",
  });

  const renderPanel = (panel, index, isMobile = false) => {
    const styles = getPanelStyles(index, isMobile);

    return (
      <div
        key={index}
        className={styles.baseClasses}
        onClick={() => isMobile && setActivePanel(index)}
        onMouseEnter={() => !isMobile && setActivePanel(index)}
      >
        <div className={styles.overlayClasses}>
          <img
            src={panel.image?.startsWith("/") ? panel.image : `/${panel.image}`}
            alt={panel.title}
            className={styles.imageClasses}
          />
        </div>
        <div
          className={`relative h-full p-6 flex flex-col justify-center ${
            isMobile ? "items-center text-center" : "direction-rtl"
          }`}
        >
          <h3
            className={`${styles.titleClasses} ${
              isMobile ? "text-xl mb-2" : "text-xl mb-2"
            }`}
          >
            {panel.title}
          </h3>
          <p
            className={`text-sm ${
              isMobile
                ? "text-white/90 max-w-[150px] line-clamp-2"
                : "text-white/80"
            }`}
          >
            {panel.subtitle}
          </p>
        </div>
        {activePanel === index && <div className={styles.indicatorClasses} />}
      </div>
    );
  };

  return (
    <div className="bg-gray-100">
      <main>
        <section className="relative h-screen bg-amazon overflow-hidden">
          <div className="absolute inset-0 flex flex-col md:flex-row">
            {panels.length > 0 && (
              <div className="md:hidden flex h-48 bg-amazon">
                <div className="flex w-full">
                  {panels.map((panel, index) =>
                    renderPanel(panel, index, true)
                  )}
                </div>
              </div>
            )}
            <div className="flex-1 md:w-3/4 relative">
              <div className="absolute inset-0">
                <img
                  src={
                    panels[activePanel]?.image?.startsWith("/")
                      ? panels[activePanel]?.image
                      : `/${panels[activePanel]?.image}` ||
                        mainImage?.startsWith("/")
                      ? mainImage
                      : `/${mainImage}`
                  }
                  alt={panels[activePanel]?.title || "ستارة مول"}
                  className="w-full h-full object-cover transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-amazon/90 via-amazon/50 to-transparent"></div>
              </div>

              <div className="relative h-full flex items-center">
                <div className="container mx-auto px-6 md:px-16 direction-rtl">
                  <div className="max-w-2xl">
                    <h1 className="text-4xl md:text-7xl font-bold text-white mb-4 md:mb-6">
                      ستارة مول
                    </h1>
                    <p className="text-xl md:text-2xl text-amazon-yellow mb-6 md:mb-8">
                      اكتشف عالماً من الأناقة والجودة
                    </p>
                    <div className="flex gap-3 md:gap-4">
                      <Link
                        href="/v2/gallery"
                        className="bg-amazon-orange hover:bg-amazon-orange-dark text-white px-6 md:px-8 py-2 md:py-3 rounded-lg transition-all duration-300 text-base md:text-lg font-semibold hover:shadow-lg"
                      >
                        تسوق الآن
                      </Link>
                      <Link
                        href="/v2/contact"
                        className="bg-transparent border-2 border-amazon-yellow text-amazon-yellow hover:bg-amazon-yellow hover:text-amazon px-6 md:px-8 py-2 md:py-3 rounded-lg transition-all duration-300 text-base md:text-lg font-semibold hover:shadow-lg"
                      >
                        تواصل معنا
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {panels.length > 0 && (
              <div className="hidden md:flex md:w-1/4 flex-col">
                {panels.map((panel, index) => renderPanel(panel, index))}
              </div>
            )}
          </div>
        </section>

        <section className="bg-amazon-light-gray py-10">
          <div className="container mx-auto px-6">
            {/* <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
              المنتجات المميزة
            </h2> */}
            <FeaturedProducts />
          </div>
        </section>

        <section className="bg-white py-10">
          <div className="container mx-auto px-6">
            {/* <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
              المنتجات المميزة
            </h2> */}
            <FiveProductsPerCategory />
          </div>
        </section>

        <section className="py-20 bg-amazon-light-gray direction-rtl">
          <div className="container mx-auto px-6 py-12 hover:cursor-pointer">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
              لماذا تختارنا؟
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Link href="/v2/gallery">
                <div className="bg-white p-6 rounded-lg shadow-md text-center transform hover:scale-105 transition duration-300 h-full">
                  <div className="text-4xl mb-4">🏆</div>
                  <h3 className="text-xl font-semibold mb-2">
                    منتجات ذات جودة عالية
                  </h3>
                  <p className="text-gray-600">
                    نحن نقدم فقط أفضل المنتجات ذات الجودة لعملائنا.
                  </p>
                </div>
              </Link>
              <Link href="/v2/delivery-types">
                <div className="bg-white p-6 rounded-lg shadow-md text-center transform hover:scale-105 transition duration-300 hover:cursor-pointer">
                  <div className="text-4xl mb-4">🚚</div>
                  <h3 className="text-xl font-semibold mb-2">أسعار الشحن</h3>
                  <p className="text-gray-600">اعرف سعر الشحن لمحافظتك</p>
                </div>
              </Link>
              <div
                className="bg-white p-6 rounded-lg shadow-md text-center transform hover:scale-105 hover:cursor-pointer transition duration-300"
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
          className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg z-40 hover:bg-blue-600 transition duration-300  animate-bounce"
          aria-label="Scroll to top"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </div>
  );
}

// "use client";

// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import { ChevronUp } from "lucide-react";
// import FeaturedProducts from "@/components/FeaturedProducts";
// import MapLocation from "@/components/MapLocation";
// import FiveProductsPerCategory from "@/components/FiveProductsPerCategory";
// import V2FiveProductsPerCategory from "@/components/V2FiveProductsPerCategory";

// export default function LandingPage() {
//   const [showScrollTop, setShowScrollTop] = useState(false);
//   const [mainImage, setMainImage] = useState("/123.jpg");
//   const [whatsappNumber, setWhatsappNumber] = useState("");

//   useEffect(() => {
//     fetchCustomFields();
//     fetchMainImage();
//   }, []);

//   const fetchCustomFields = async () => {
//     const response = await fetch("/api/customize?name=رقم الواتس");
//     if (!response.ok) throw new Error("Failed to fetch custom fields");
//     const data = await response.json();
//     setWhatsappNumber(data[0].value);
//   };

//   const fetchMainImage = async () => {
//     const res = await fetch("/api/customize?name=صوره الوجهه");
//     const data = await res.json();
//     if (data.length > 0) {
//       setMainImage(data[0].value);
//     }
//   };

//   const message = "Hello! I have a question about your products.";

//   const handleClick = () => {
//     const encodedMessage = encodeURIComponent(message);
//     window.open(
//       `https://wa.me/${whatsappNumber || "201223821206"}?text=${encodedMessage}`,
//       "_blank"
//     );
//   };

//   useEffect(() => {
//     const handleScroll = () => setShowScrollTop(window.pageYOffset > 300);
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

//   return (
//     <div className="bg-gray-100">
//       <main>
//         {/* Banner Section */}
//         <section className="relative min-h-[40vh] flex flex-col items-center justify-center bg-white overflow-hidden md:p-6  text-center">
//           <div className="relative w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden shadow-lg border-4 border-amazon-yellow mb-6">
//             <img
//               src={mainImage?.startsWith("/") ? "https://www.sitaramall.com/" + mainImage : "https://www.sitaramall.com" +`/${mainImage}`}
//               alt="ستارة مول"
//               className="w-full h-full object-cover"
//             />
//           </div>
//           <h1 className="text-3xl md:text-5xl font-bold text-amazon mb-4">
//             ستارة مول
//           </h1>
//           <p className="text-base md:text-xl text-amazon-orange mb-6">
//             اكتشف عالماً من الأناقة والجودة
//           </p>
//           <div className="flex flex-row gap-4 justify-center">
//             <Link
//               href="/gallery"
//               className="bg-amazon-orange hover:bg-amazon-orange-dark text-white px-6 py-2 rounded-lg transition-all duration-300 text-base md:text-lg font-semibold hover:shadow-md"
//             >
//               تسوق الآن
//             </Link>
//             <Link
//               href="/contact"
//               className="bg-transparent border-2 border-amazon-yellow text-amazon hover:bg-amazon-yellow hover:text-amazon-dark px-6 py-2 rounded-lg transition-all duration-300 text-base md:text-lg font-semibold hover:shadow-md"
//             >
//               تواصل معنا
//             </Link>
//           </div>
//         </section>

//         {/* Five Products per Category */}
//         <section className="bg-white">
//           <div className="container mx-auto">
//             <V2FiveProductsPerCategory />
//           </div>
//         </section>

//         {/* Featured Products */}
//         {/* <section className="bg-amazon-light-gray py-10">
//           <div className="container mx-auto px-6">
//             <FeaturedProducts />
//           </div>
//         </section> */}

//         {/* Why Us Section */}
//         <section className="bg-white direction-rtl">
//           <div className="container mx-auto px-6 py-12 hover:cursor-pointer">
//             <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
//               لماذا تختارنا؟
//             </h2>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//               <Link href="/gallery">
//                 <div className="bg-amazon-light-gray p-6 rounded-lg shadow-md text-center transform hover:scale-105 transition duration-300 h-full">
//                   <div className="text-4xl mb-4">🏆</div>
//                   <h3 className="text-xl font-semibold mb-2">
//                     منتجات ذات جودة عالية
//                   </h3>
//                   <p className="text-gray-600">
//                     نحن نقدم فقط أفضل المنتجات ذات الجودة لعملائنا.
//                   </p>
//                 </div>
//               </Link>
//               <Link href="/delivery-types">
//                 <div className="bg-amazon-light-gray p-6 rounded-lg shadow-md text-center transform hover:scale-105 transition duration-300 hover:cursor-pointer">
//                   <div className="text-4xl mb-4">🚚</div>
//                   <h3 className="text-xl font-semibold mb-2">أسعار الشحن</h3>
//                   <p className="text-gray-600">اعرف سعر الشحن لمحافظتك</p>
//                 </div>
//               </Link>
//               <div
//                 className="bg-amazon-light-gray p-6 rounded-lg shadow-md text-center transform hover:scale-105 hover:cursor-pointer transition duration-300"
//                 onClick={handleClick}
//               >
//                 <div className="text-4xl mb-4">🎧</div>
//                 <h3 className="text-xl font-semibold mb-2">
//                   دعم على مدار الساعة طوال أيام الأسبوع
//                 </h3>
//                 <p className="text-gray-600">
//                   فريق دعم العملاء لدينا موجود دائمًا لمساعدتك.
//                 </p>
//               </div>
//             </div>
//           </div>
//           <MapLocation />
//         </section>
//       </main>

//       {showScrollTop && (
//         <button
//           onClick={scrollToTop}
//           className="fixed bottom-36 right-5 bg-amazon-blue text-white p-2 rounded-full shadow-lg z-40 hover:bg-blue-600 transition duration-300 animate-bounce"
//           aria-label="Scroll to top"
//         >
//           <ChevronUp size={24} />
//         </button>
//       )}
//     </div>
//   );
// }
