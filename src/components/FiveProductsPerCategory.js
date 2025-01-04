"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import LoadingSpinner from "./LoadingSpinner";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";

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
                    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
                        {products.filter(product => product.category === category.name)
                            .slice(0, 5)
                            .map((product, index) => (
                                <Link href={`/product/${product._id}`} key={index}>
                                    <div className="flex-col md:flex-row justify-between flex gap-4 mx-4 py-12 hover:cursor-pointer">
                                        <div className="flex bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 flex-col md:flex-row relative group">
                                            <div className="relative w-full md:w-[300px] h-[300px] flex-shrink-0 overflow-hidden">
                                                <img src={
                                                    // product.images[0] ||
                                                    "/123.jpg"} alt="shopping image"
                                                    className="absolute inset-0 w-full h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none transform group-hover:scale-105 transition-transform duration-300" />
                                                {product.quantity == 0 && <span className="absolute top-10 right-2 bg-blue-600 text-white text-sm font-bold px-2 py-1 rounded-md shadow-lg z-10">نفذت الكمية</span>}
                                                {product.discountPercentage > 0 && <span className="absolute top-2 right-2 bg-red-600 text-white text-sm font-bold px-2 py-1 rounded-md shadow-lg z-10">
                                                    خصم {product.discountPercentage.toFixed(1)}%
                                                </span>}
                                            </div>
                                            <div className="flex flex-col justify-between p-6">
                                                <div className="space-y-2">
                                                    <h1 className="flex-auto text-xl font-semibold text-gray-800">{product.title}</h1>
                                                    <p className="text-sm text-gray-600 line-clamp-2">
                                                        {product.description}
                                                    </p>
                                                    {product.discountPercentage > 0 ? (
                                                        <div className="flex justify-between items-center text-sm font-medium">
                                                            <span className="text-gray-500">قبل الخصم: <span className="text-red-500 line-through">{product.price.toFixed(2)}</span></span>
                                                            <span className="text-gray-500">بعد الخصم: <span className="text-green-600 font-bold">{product.priceAfterDiscount.toFixed(2)}</span></span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-between items-center text-sm font-medium">
                                                            <span className="text-gray-500">السعر: <span className="text-green-600 font-bold">{product.price.toFixed(2)}</span></span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-end items-center text-sm">
                                                        <span className="text-gray-500">
                                                            الكمية المتوفرة: <span className={`font-bold ${product.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                                {product.quantity > 0 ? product.quantity : 'نفذت الكمية'}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        className="flex-1 bg-amazon-orange hover:bg-amazon-orange-dark text-white rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 text-sm"
                                                        disabled={product.quantity === 0}
                                                    >
                                                        <ShoppingCart className="h-4 w-4" />
                                                        اضف الى السلة
                                                    </button>
                                                    <button className="p-3 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-gray-100 hover:border-red-500">
                                                        <Heart className="h-5 w-5 stroke-2" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                    </div>
                </div>
            ))}

        </div>
    );
}

export default FiveProductsPerCategory;