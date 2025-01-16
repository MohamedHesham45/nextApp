"use client";

import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { useCartFavorite } from "@/app/context/cartFavoriteContext";
import { sanitizeHTML } from "./ProductCard";
import { useState, useEffect } from "react";
import { toast } from 'react-hot-toast';
import Slider from "react-slick";
import { useAuth } from "@/app/context/AuthContext";
import useMetaConversion from "./SendMetaConversion";

// const getCookie = (name) => {
//     const value = `; ${document.cookie}`;
//     const parts = value.split(`; ${name}=`);
//     if (parts.length === 2) return parts.pop().split(';').shift();
//     return '';
// };

const ProductCardHome = ({ product }) => {
    const { cart, setCart, favorite, setFavorite } = useCartFavorite();
    const [cartQuantity, setCartQuantity] = useState(0);
    const sendMetaConversion = useMetaConversion();

    // const sendMetaConversion = async (eventName, eventData, userIp, userAgent) => {
    //     if (!profile) return;

    //     const fbc = getCookie('_fbc') || '';
    //     const fbp = getCookie('_fbp') || '';

    //     try {
    //         const response = await fetch('/api/meta-conversion', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 eventName,
    //                 userData: {
    //                     em: profile.email,
    //                     ph: profile.phone,
    //                     fn: profile.firstName,
    //                     ln: profile.lastName,
    //                     external_id: profile.id,
    //                     client_ip_address: userIp,
    //                     client_user_agent: userAgent,
    //                     fbc,
    //                     fbp,
    //                 },
    //                 customData: {
    //                     ...eventData,
    //                     currency: 'EGP',
    //                 },
    //                 eventSourceUrl: window.location.href,
    //             }),
    //         });

    //         console.log(response);

    //         if (!response.ok) {
    //             console.error('Meta Conversion API error:', await response.text());
    //         }
    //     } catch (error) {
    //         console.error('Error sending Meta Conversion:', error);
    //     }
    // };

    const handleAddToFavorite = async (e, product) => {
        e.preventDefault();
        const existingItemIndex = favorite.findIndex(item => item._id === product._id);

        let updatedFavorite;
        if (existingItemIndex !== -1) {
            updatedFavorite = favorite.filter(item => item._id !== product._id);
            toast.success('تم إزالة المنتج من المفضلة');
        } else {
            updatedFavorite = [...favorite, product];

            var userAgent = navigator.userAgent;

            fetch('https://api.ipify.org?format=json')
                .then(response => response.json())
                .then(async (data) => {
                    var ipAddress = data.ip;
                    fbq('track', 'AddToWishlist', {
                        product_name: product.title,
                        product_category: product.category,
                        product_ids: [product._id],
                        product_image: "https://sitaramall.com/" + product.images[0],
                        product_price: product.price,
                        product_price_after_discount: product.priceAfterDiscount || product.price,
                        product_quantity: product.quantity,
                        product_images: product.images.map(image => "https://sitaramall.com/" + image),
                        value: product.priceAfterDiscount || product.price,
                        currency: 'EGP',
                        ip_address: ipAddress,
                        user_agent: userAgent
                    });
                    await sendMetaConversion('AddToWishlist', {
                        product_name: product.title,
                        product_category: product.category,
                        product_ids: [product._id],
                        product_image: "https://sitaramall.com/" + product.images[0],
                        product_images: product.images.map(image => "https://sitaramall.com/" + image),
                        product_price: product.price,
                        product_price_after_discount: product.priceAfterDiscount || product.price,
                        value: product.priceAfterDiscount || product.price,
                    }, ipAddress, userAgent);
                })
                .catch(error => console.error('Error fetching IP address:', error));

            toast.success('تم إضافة المنتج إلى المفضلة');
        }

        setFavorite(updatedFavorite);
        localStorage.setItem('favorite', JSON.stringify(updatedFavorite));
    };

    const handleAddToCart = async (e, product) => {
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
            toast.success('تم إضافة المنتج إلى السلة');
        } else {
            updatedCart = [...cart, itemToAdd];

            var userAgent = navigator.userAgent;
            fetch('https://api.ipify.org?format=json')
                .then(response => response.json())
                .then(async (data) => {
                    var ipAddress = data.ip;
                    fbq('track', 'AddToCart', {
                        product_name: product.title,
                        product_category: product.category,
                        product_ids: [product._id],
                        product_image: "https://sitaramall.com/" + product.images[0],
                        product_price: product.price,
                        product_price_after_discount: product.priceAfterDiscount || product.price,
                        product_quantity: product.quantity,
                        product_images: product.images.map(image => "https://sitaramall.com/" + image),
                        value: product.priceAfterDiscount || product.price,
                        currency: 'EGP',
                        ip_address: ipAddress,
                        user_agent: userAgent
                    });

                    await sendMetaConversion('AddToCart', {
                        product_name: product.title,
                        product_category: product.category,
                        product_ids: [product._id],
                        product_image: "https://sitaramall.com/" + product.images[0],
                        product_images: product.images.map(image => "https://sitaramall.com/" + image),
                        product_price: product.price,
                        product_price_after_discount: product.priceAfterDiscount || product.price,
                        value: product.priceAfterDiscount || product.price,
                    }, ipAddress, userAgent);
                })
                .catch(error => console.error('Error fetching IP address:', error));
            toast.success('تم إضافة المنتج إلى السلة');
        }

        setCart(updatedCart);
        setCartQuantity(1);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const handleQuantityChange = (e, change) => {
        e.preventDefault();
        e.stopPropagation();
        const existingItemIndex = cart.findIndex(
            (item) =>
                item._id === product._id &&
                JSON.stringify(item.selectedImages) ===
                JSON.stringify(product.images)
        );

        if (existingItemIndex !== -1) {
            const updatedCart = [...cart];
            const newQuantity = updatedCart[existingItemIndex].quantityCart + change;

            if (newQuantity <= 0) {
                updatedCart.splice(existingItemIndex, 1);
                setCartQuantity(0);
            } else if (newQuantity <= product.quantity) {
                updatedCart[existingItemIndex].quantityCart = newQuantity;
                setCartQuantity(newQuantity);
            }

            setCart(updatedCart);
            localStorage.setItem('cart', JSON.stringify(updatedCart));
        }
        toast.success('تم إضافة المنتج إلى السلة');
    };

    useEffect(() => {
        const existingItem = cart.find(
            (item) =>
                item._id === product._id
        );
        if (existingItem) {
            setCartQuantity(existingItem.quantityCart || 0);
        } else {
            setCartQuantity(0);

        }
    }, [cart, product._id]);

    const settings = {
        infinite: true,       // Infinite loop
        speed: 700,           // Transition speed
        slidesToShow: 1,      // Number of slides to show
        slidesToScroll: 1,    // Number of slides to scroll
        autoplay: true,       // Enable autoplay
        autoplaySpeed: 5000,  // Time between slides in ms
    };

    const ViewContentEvent = async () => {
        var userAgent = navigator.userAgent;
        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(async (data) => {
                var ipAddress = data.ip;
                fbq('track', 'ViewContent', {
                    product_name: product.title,
                    product_category: product.category,
                    product_ids: [product._id],
                    product_image: "https://sitaramall.com/" + product.images[0],
                    product_price: product.price,
                    product_price_after_discount: product.priceAfterDiscount || product.price,
                    product_quantity: product.quantity,
                    product_images: product.images.map(image => "https://sitaramall.com/" + image),
                    value: product.priceAfterDiscount || product.price,
                    currency: 'EGP',
                    ip_address: ipAddress,
                    user_agent: userAgent
                });

                await sendMetaConversion('ViewContent', {
                    product_name: product.title,
                    product_category: product.category,
                    product_ids: [product._id],
                    product_image: "https://sitaramall.com/" + product.images[0],
                    product_images: product.images.map(image => "https://sitaramall.com/" + image),
                    product_price: product.price,
                    product_price_after_discount: product.priceAfterDiscount || product.price,
                    value: product.priceAfterDiscount || product.price,
                }, ipAddress, userAgent);
            })
            .catch(error => console.error('Error fetching IP address:', error));
    };

    return (
        <Link href={`/product/${product._id}`} onClick={ViewContentEvent}>
            <div className="flex-col md:flex-row justify-between flex gap-4 mx-4 py-12 hover:cursor-pointer">
                <div className="flex bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 flex-col md:flex-row relative group flex-1">
                    <div className="relative w-full md:w-[300px] h-[300px] flex-shrink-0 overflow-hidden md:flex-1">

                        <Slider {...settings}>
                            {product.images.map((image, index) => (
                                <div key={index}>
                                    <img src={image.startsWith("/") ? image : `/${image}`} alt={`Product Image ${index + 1}`}
                                        className="w-full h-[300px] transform group-hover:scale-110 transition-transform duration-300" />
                                </div>
                            ))}
                        </Slider>
                        {product.quantity == 0 && (
                            <>
                                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-md shadow-lg z-10">نفذت الكمية</span>
                            </>
                        )}
                        {product.discountPercentage > 0 && <span className="absolute top-2 right-2 bg-red-600 text-white text-sm font-bold px-2 py-1 rounded-md shadow-lg z-10">
                            خصم {Math.round(product.discountPercentage)}%
                        </span>}
                    </div>
                    <div className="flex flex-col justify-between p-6 flex-1">
                        <div className="space-y-2">
                            <h1 className="flex-auto text-xl font-semibold text-gray-800">{product.title}</h1>
                            <div className="text-sm text-gray-600 line-clamp-2" dangerouslySetInnerHTML={{ __html: sanitizeHTML(product.description) }} />
                            {product.discountPercentage > 0 ? (
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-gray-500">قبل الخصم: <span className="text-red-500 line-through">{Math.round(product.price)}</span></span>
                                    <span className="text-gray-500">بعد الخصم: <span className="text-green-600 font-bold">{Math.round(product.priceAfterDiscount)}</span></span>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-gray-500">السعر: <span className="text-green-600 font-bold">{Math.round(product.price)}</span></span>
                                </div>
                            )}
                            <div className="flex justify-start items-center text-sm pt-4">
                                <span className="text-gray-500">
                                    {product.quantity > 0 ? (
                                        <span className={`text-lg  `}>
                                            {product.quantity > 10 ? (<span className="text-green-500">متبقي <span className="font-bold">{product.quantity}</span> - اطلب الان</span>) : (<span className="text-red-500">تبقي <span className="font-bold">{product.quantity}</span> فقط - اطلب الان</span>)}
                                        </span>
                                    ) : (
                                        <span className="text-red-500  font-bold">غير متاح الان</span>
                                    )}
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-center gap-2">
                            {/* {cartQuantity > 0 ? (
                                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-full" onClick={(e) => e.preventDefault()}>
                                    <button
                                        onClick={(e) => handleQuantityChange(e, -1)}
                                        className="w-7 h-7 flex items-center justify-center bg-white text-gray-700 hover:bg-amazon-orange hover:text-white rounded-full transition-all duration-200 shadow-sm"
                                    >
                                        -
                                    </button>
                                    <span className="w-8 text-center font-medium">{cartQuantity}</span>
                                    <button
                                        onClick={(e) => handleQuantityChange(e, 1)}
                                        className={`w-7 h-7 flex items-center justify-center bg-white text-gray-700 rounded-full transition-all duration-200 shadow-sm ${cartQuantity >= product.quantity ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amazon-orange hover:text-white'}`}
                                        disabled={cartQuantity >= product.quantity}
                                    >
                                        +
                                    </button>
                                </div>
                            ) : ( */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    if (cartQuantity > 0) {
                                        handleQuantityChange(e, 1)
                                    } else {
                                        handleAddToCart(e, product)
                                    }
                                }}
                                className={`flex-1 bg-amazon-orange hover:bg-amazon-orange-dark  rounded-full transition-all duration-300  flex items-center justify-center gap-2 text-sm ${product.quantity === 0 || cartQuantity >= product.quantity ? 'opacity-50 cursor-not-allowed bg-gray-300  text-amazon-dark hover:bg-gray-300 ' : 'text-white hover:scale-105 hover:shadow-lg'}`}
                                disabled={product.quantity === 0}
                            >
                                {!cartQuantity >= product.quantity ? <ShoppingCart className="h-4 w-4" /> : ""}
                                {product.quantity === 0 ? "نفذت الكمية" : (cartQuantity >= product.quantity ? "انتهت الكمية المتاحة" : "اضف الى العربة")}
                            </button>
                            {/* )} */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleAddToFavorite(e, product)
                                }}
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