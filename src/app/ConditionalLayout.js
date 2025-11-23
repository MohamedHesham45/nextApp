"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import V2Navbar from "@/components/V2Navbar";
import Footer from "@/components/Footer";

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const isV2 = pathname.startsWith("/v2");

  return (
    <>
      {isV2 ? <V2Navbar /> : <Navbar />}
      <main className="pt-0 md:pt-12 flex-1">{children}</main>
      <Footer />
    </>
  );
}
