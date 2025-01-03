"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import LoadingSpinner from "./LoadingSpinner";
import Link from "next/link";

const FiveProductsPerCategory = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch("/api/products");
            if (!response.ok) {
                throw new Error("Failed to fetch products");
            }
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            setError(error.message);
            console.error("Error fetching products:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch("/api/category");
            if (!response.ok) {
                throw new Error("Failed to fetch categories");
            }
            const data = await response.json();
            setCategories(data.categories);
        } catch (error) {
            setError(error.message);
            console.error("Error fetching categories:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);


    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [fetchProducts, fetchCategories]);

    if (isLoading) {
        return <LoadingSpinner />
    }

    return (

        <div className="container mx-auto px-4 py-8 direction-rtl">
            {categories.map((category, index) => (
                <div key={index}>
                    <div className="flex items-end justify-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 ml-2">{category.name}</h2>
                        <hr className="w-full h-0.5 bg-gray-100 rounded-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {products.filter(product => product.category === category.name)
                            .slice(0, 5)
                            .map((product, index) => (
                                <div class="flex-col md:flex-row justify-between flex gap-4 mx-4 py-12" key={index}>
                                    <div class=" flex bg-white  shadow-lg flex-col md:flex-row">
                                        <div class="relative w-full md:w-64 flex justify-center items-center">
                                            <img src={
                                                // product.images[0] ||
                                                "/123.jpg"} alt="shopping image"
                                                class="object-cover w-full  h-48 md:h-full rounded-t-lg md:rounded-l-lg md:rounded-t-none" />
                                            {product.quantity == 0 && <span className="absolute top-10 right-2 bg-blue-600 text-white text-sm font-bold px-2 py-1 rounded-md shadow-lg z-10">نفذت الكمية</span>}
                                            {product.discountPercentage > 0 && <span className="absolute top-2 right-2 bg-red-600 text-white text-sm font-bold px-2 py-1 rounded-md shadow-lg z-10">
                                                خصم {product.discountPercentage.toFixed(1)}%
                                            </span>}
                                        </div>
                                        <div class="flex-auto p-6">
                                            <div class="">
                                                <h1 class="flex-auto text-xl font-semibold">{product.title}</h1>
                                                <p className="block text-base font-light truncate-lines">
                                                    {product.description}
                                                </p>
                                                {product.discountPercentage > 0 ? (
                                                    <div className="mt-4 flex justify-between text-sm font-medium text-gray-700">
                                                        <span>قبل الخصم: <span className="text-red-600 line-through">{product.price.toFixed(2)}</span></span>
                                                        <span>بعد الخصم: <span className="text-green-600">{product.priceAfterDiscount.toFixed(2)}</span></span>
                                                    </div>
                                                ) : (
                                                    <div className="mt-4 flex justify-between text-sm font-medium text-gray-700">
                                                        <span>السعر: <span className="text-green-600">{product.price.toFixed(2)}</span></span>
                                                    </div>
                                                )}
                                            </div>
                                            <div class="flex my-2 text-sm font-medium items-center justify-center">
                                                <Link
                                                    href="/gallery"
                                                    className="w-64 text-center inline-block bg-amazon-orange hover:bg-amazon-orange-dark text-white px-2 py-2 rounded-full text-lg font-semibold transition-all hover:scale-105 hover:shadow-lg hover:-translate-y-1"
                                                >
                                                    عرض المنتج
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            ))}

        </div>
    );
}

export default FiveProductsPerCategory;