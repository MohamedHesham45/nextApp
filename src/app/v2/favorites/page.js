"use client";

import { useCartFavorite } from "@/app/context/cartFavoriteContext";
import ProductCardHome from "@/components/ProductCardHome";
import { Heart } from "lucide-react";
import { useEffect } from "react";

const FavoritesPage = () => {
    const { favorite } = useCartFavorite();

    useEffect(() => {
        // Scroll to top on page load
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 direction-rtl">
            {/* Header Section */}
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center space-x-4 direction-rtl">
                        <Heart className="h-8 w-8 text-red-500 fill-red-500" />
                        <h1 className="text-3xl font-bold text-gray-800">المفضلة</h1>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-8">
                {favorite.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center ">
                        <Heart className="h-16 w-16 text-gray-300 mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-600 mb-2">قائمة المفضلة فارغة</h2>
                        <p className="text-gray-500">لم تقم بإضافة أي منتجات إلى المفضلة بعد</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
                        {favorite.map((product, index) => (
                            <div key={index} className="transform hover:scale-[1.01] transition-transform">
                                <ProductCardHome product={product} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoritesPage; 