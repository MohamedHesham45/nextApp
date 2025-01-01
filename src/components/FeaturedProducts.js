"use client";

import React, {
  useState,
  useEffect,
} from "react";
import Image from "next/image";
import Link from "next/link";

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
    <div>
      {/* <h2 className="text-2xl font-bold mb-4">
        Featured Products
      </h2> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            href={`/category/${product.category}`}
            key={product._id}
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
              <div className="relative h-48">
                <img
                  src={"https://93.127.202.37:3001"+product.images[0]}
                  alt={product.title}
                  layout="fill"
                  objectFit="cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <h3 className="text-white text-xl font-bold text-center px-4">
                    شاهد جميع ال{" "}
                    {product.category}
                  </h3>
                </div>
              </div>
              {/* <div className="p-4">
                <h4 className="text-lg font-semibold mb-2">
                  {product.title}
                </h4>
                <div className="flex flex-col">
                  <span className="text-gray-500 line-through text-sm">
                    Original Price: $
                    {product.price.toFixed(2)}
                  </span>
                  <span className="text-red-500 font-bold">
                    Discount:{" "}
                    {product.discountPercentage}%
                  </span>
                  <span className="text-green-600 font-bold text-lg">
                    Now: $
                    {calculateDiscountedPrice(
                      product
                    ).toFixed(2)}
                  </span>
                </div>
              </div> */}
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Link
          href="/gallery"
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          عرض جميع المنتجات
        </Link>
      </div>
    </div>
  );
}
