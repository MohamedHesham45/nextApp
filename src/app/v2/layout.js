import localFont from "next/font/local";
import "./globals.css";
import V2Navbar from "@/components/V2Navbar";
// import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { AuthProvider } from "@/app/context/AuthContext";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/swiper-bundle.css";
import "react-quill/dist/quill.snow.css";
import { CartFavoriteProvider } from "./context/cartFavoriteContext";
import { Toaster } from "react-hot-toast";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


export const metadata = {
  icons: {
    icon: {
      url: "/favicon.ico",
      type: "image/x-icon",
    },
    shortcut: {
      url: "/favicon.ico",
      type: "image/x-icon",
    },
    apple: {
      url: "/favicon.ico",
      type: "image/x-icon",
    },
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "/favicon.ico",
    },
  },
  title: "ستارة مول | وسائد ديكورية وستائر عصرية بأسعار مميزة",
  description:
    "متجر الكتروني مختص في بيع الوسائد الديكورية والستاير العصرية. من أحلى التصاميم وأحدثها وباستخدام أفضل الخامات. كوني متألقه في منزلك ومتميزة عن غيرك",
  keywords:
    "ستارة مول, وسائد ديكورية, ستائر عصرية, ديكورات منزلية, بورسعيد, مصر, مفروشات, اكسسوارات منزلية",
  author: "Sitara Mall",
  openGraph: {
    title: "ستارة مول | وسائد ديكورية وستائر عصرية",
    description:
      "متجر الكتروني مختص في بيع الوسائد الديكورية والستاير العصرية. تصاميم عصرية وخامات ممتازة. متوفر خدمة التوصيل لجميع أنحاء مصر",
    type: "website",
    url: "https://www.sitaramall.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "ستارة مول | وسائد ديكورية وستائر عصرية",
    description:
      "متجر الكتروني مختص في بيع الوسائد الديكورية والستاير العصرية في بورسعيد، مصر. تصاميم عصرية وخامات ممتازة",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar">
      <head>
        {/* Meta Pixel Code */}
        <script
          async
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '3835132599966818');
              fbq('track', 'PageView');
            `,
          }}
        />

        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=3835132599966818&ev=PageView&noscript=1"
          />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <CartFavoriteProvider>
            <Toaster position="top-right" />
            <V2Navbar />
            <main className="pt-0 md:pt-12 flex-1">
              {children}
              <WhatsAppButton
                phoneNumber="201223821206"
                message="Hello! I have a question about your products."
              />
            </main>
            <Footer />
          </CartFavoriteProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
