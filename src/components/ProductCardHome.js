"use client";

import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { useCartFavorite } from "@/app/context/cartFavoriteContext";
import { sanitizeHTML } from "./ProductCard";

const ProductCardHome = ({ product }) => {
    const { cart, setCart, favorite, setFavorite } = useCartFavorite();

    const handleAddToFavorite = (e, product) => {
        e.preventDefault();
        const existingItemIndex = favorite.findIndex(item => item._id === product._id);

        let updatedFavorite;
        if (existingItemIndex !== -1) {
            updatedFavorite = favorite.filter(item => item._id !== product._id);
        } else {
            updatedFavorite = [...favorite, product];
        }

        setFavorite(updatedFavorite);
        localStorage.setItem('favorite', JSON.stringify(updatedFavorite));
    };

    const handleAddToCart = (e, product) => {
        e.preventDefault();
        const itemToAdd = {
            ...product,
            quantityCart: 1,
            selectedImages: product.images,
        };

        const existingItemIndex = cart.findIndex(
            (item) =>
                item._id === product._id &&
                JSON.stringify(item.selectedImages) ===
                JSON.stringify(itemToAdd.selectedImages)
        );

        let updatedCart;
        if (existingItemIndex !== -1) {
            updatedCart = [...cart];
            if (!updatedCart[existingItemIndex].quantityCart) {
                updatedCart[existingItemIndex].quantityCart = 1;
            }
            updatedCart[existingItemIndex].quantityCart += 1;
        } else {
            updatedCart = [...cart, itemToAdd];
        }

        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    return (
        <Link href={`/product/${product._id}`}>
            <div className="flex-col md:flex-row justify-between flex gap-4 mx-4 py-12 hover:cursor-pointer">
                <div className="flex bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 flex-col md:flex-row relative group">
                    <div className="relative w-full md:w-[300px] h-[300px] flex-shrink-0 overflow-hidden">
                        <img src={"/123.jpg"} alt="shopping image"
                            className="absolute inset-0 w-full h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none transform group-hover:scale-105 transition-transform duration-300" />
                        {product.quantity == 0 && <span className="absolute top-10 right-2 bg-blue-600 text-white text-sm font-bold px-2 py-1 rounded-md shadow-lg z-10">نفذت الكمية</span>}
                        {product.discountPercentage > 0 && <span className="absolute top-2 right-2 bg-red-600 text-white text-sm font-bold px-2 py-1 rounded-md shadow-lg z-10">
                            خصم {product.discountPercentage.toFixed(1)}%
                        </span>}
                    </div>
                    <div className="flex flex-col justify-between p-6">
                        <div className="space-y-2">
                            <h1 className="flex-auto text-xl font-semibold text-gray-800">{product.title}</h1>
                            <div className="text-sm text-gray-600 line-clamp-2" dangerouslySetInnerHTML={{ __html: sanitizeHTML(product.description) }} />
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
                                onClick={(e) => handleAddToCart(e, product)}
                                className="flex-1 bg-amazon-orange hover:bg-amazon-orange-dark text-white rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 text-sm"
                                disabled={product.quantity === 0}
                            >
                                <ShoppingCart className="h-4 w-4" />
                                اضف الى السلة
                            </button>
                            <button
                                onClick={(e) => handleAddToFavorite(e, product)}
                                className={`p-3 bg-white hover:bg-red-50 ${favorite.some(item => item._id === product._id) ? 'text-red-500 border-red-500' : 'text-gray-400 border-gray-100'} rounded-full shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 hover:border-red-500`}
                            >
                                <Heart className={`h-5 w-5 stroke-2 ${favorite.some(item => item._id === product._id) ? 'fill-red-500' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCardHome; 