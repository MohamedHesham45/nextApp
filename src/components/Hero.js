// components/Hero.js
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative bg-gray-100 py-20">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-6">
        <div className="flex flex-col items-start md:w-1/2">
          <h1 className="text-5xl font-bold text-gray-800 leading-tight mb-4">
            Welcome to Sitara Mall
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Discover our exclusive collection of
            bedspreads and curtains.
          </p>
          <a
            href="#shop"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition duration-300"
          >
            Shop Now
          </a>
        </div>
        <div className="md:w-1/2 mt-10 md:mt-0">
          <Image
            src="/1.jpg"
            alt="Bedspreads and Curtains"
            width={600}
            height={400}
            className="rounded-lg shadow-lg"
          />
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-transparent opacity-50 pointer-events-none"></div>
    </section>
  );
}
