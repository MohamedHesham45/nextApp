"use client";

import { useCallback, useEffect, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import ProductCardHome from "./ProductCardHome";

const FiveProductsPerCategory = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCategoriesWithProducts = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch("/api/products/home");
            if (!response.ok) {
                throw new Error("Failed to fetch categories");
            }
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            setError(error.message);
            console.error("Error fetching categories:", error);
        } finally {
            setIsLoading(false);
        }
        console.log(categories);
    }, []);

    useEffect(() => {
        fetchCategoriesWithProducts();
    }, [fetchCategoriesWithProducts]);

    if (isLoading) {
        return <LoadingSpinner />
    }

    return (
        <div className="container mx-auto px-4 py-8 direction-rtl">
            {categories.map((category, index) => (
                <div key={index}>
                    <div className="flex items-end justify-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 ml-2">{category.category}</h2>
                        <hr className="w-full h-0.5 bg-gray-100 rounded-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
                        {category.products.map((product, index) => (
                            <ProductCardHome key={index} product={product} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default FiveProductsPerCategory;