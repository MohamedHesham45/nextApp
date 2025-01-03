import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { AuthProvider } from "./context/AuthContext";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import 'swiper/swiper-bundle.css';
// import "leaflet/dist/leaflet.css";

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

// export const metadata = {
//   title: "Create Next App",
//   description: "Generated by create next app",
// };

export const metadata = {
  title:
    "Sitara Mall | Quality Products at Unbeatable Prices",
  description:
    "Discover amazing products at Sitara Mall. We offer quality home decor, textiles, and more with fast shipping and 24/7 customer support.",
  keywords:
    "Sitara Mall, home decor, textiles, quality products, Port Said, Egypt",
  author: "Sitara Mall",
  openGraph: {
    title:
      "Sitara Mall | Quality Home Decor and Textiles",
    description:
      "Shop for premium home decor and textiles at Sitara Mall. Enjoy fast shipping and excellent customer service.",
    type: "website",
    url: "https://www.sitaramall.com", // Replace with your actual website URL
    // image:
    //   "https://www.sitaramall.com/og-image.jpg", // Replace with an actual image URL
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Sitara Mall | Quality Home Decor and Textiles",
    description:
      "Discover amazing products at unbeatable prices at Sitara Mall.",
    // image:
    //   "https://www.sitaramall.com/twitter-image.jpg", // Replace with an actual image URL
  },
};

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
        <html lang="en">
          <body
          // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
              <Navbar />
              <main className="pt-12">
                {" "}
                {/* Add padding-top to account for fixed navbar */}
                {children}
                <WhatsAppButton
                  phoneNumber="201223821206" // Replace with your actual WhatsApp number
                  message="Hello! I have a question about your products." // Customize this message
                />
              </main>
              <Footer />
          </body>
        </html>
    </AuthProvider>
  );
}
