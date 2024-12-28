"use client";

import React, {
  useState,
  useEffect,
} from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import ShoppingCart from "@/components/ShoppingCart";
import { useUser } from "@clerk/nextjs";

export default function CategoryPage() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] =
    useState(null);
  const [cart, setCart] = useState([]);
  const [isCartVisible, setIsCartVisible] =
    useState(false);
  const [viewMode, setViewMode] =
    useState("carousel");
  const [selectedImages, setSelectedImages] =
    useState([]);
  const { category } = useParams();
  const { user } = useUser();

  useEffect(() => {
    async function fetchCategoryProducts() {
      try {
        const response = await fetch(
          `/api/products?category=${category}`
        );
        if (!response.ok) {
          throw new Error(
            "Failed to fetch category products"
          );
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error(
          "Error fetching category products:",
          error
        );
      }
    }

    fetchCategoryProducts();
    const savedCart =
      localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, [category]);

  useEffect(() => {
    localStorage.setItem(
      "cart",
      JSON.stringify(cart)
    );
  }, [cart]);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setSelectedImages(product.images);
    setViewMode("carousel");
  };

  const handleAddToCart = (
    product,
    quantity,
    selectedImages = []
  ) => {
    const itemToAdd = {
      ...product,
      quantity,
      selectedImages:
        selectedImages.length > 0
          ? selectedImages
          : product.images,
    };

    const existingItemIndex = cart.findIndex(
      (item) =>
        item._id === product._id &&
        JSON.stringify(item.selectedImages) ===
        JSON.stringify(itemToAdd.selectedImages)
    );

    if (existingItemIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity +=
        quantity;
      setCart(updatedCart);
    } else {
      setCart([...cart, itemToAdd]);
    }
    setIsCartVisible(true);
  };

  const handleUpdateCartItem = (
    productId,
    newQuantity,
    selectedImages
  ) => {
    setCart(
      cart
        .map((item) =>
          item._id === productId &&
            JSON.stringify(item.selectedImages) ===
            JSON.stringify(selectedImages)
            ? { ...item, quantity: newQuantity }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveFromCart = (
    productId,
    selectedImages
  ) => {
    setCart(
      cart.filter(
        (item) =>
          !(
            item._id === productId &&
            JSON.stringify(
              item.selectedImages
            ) === JSON.stringify(selectedImages)
          )
      )
    );
  };

  const calculateDiscountedPrice = (product) => {
    return (
      product.price *
      (1 - product.discountPercentage / 100)
    );
  };

  const toggleImageSelection = (image) => {
    setSelectedImages((prevSelected) =>
      prevSelected.includes(image)
        ? prevSelected.filter(
          (img) => img !== image
        )
        : [...prevSelected, image]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 capitalize">
        جميع ال {products[0]?.category}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform  hover:scale-105"
          >
            <div className="relative h-64">
              <Image
                src={product.images[0]}
                alt={product.title}
                layout="fill"
                objectFit="cover"
                className="cursor-pointer"
                onClick={() =>
                  handleProductClick(product)
                }
              />
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black to-transparent p-4">
                <h2 className="text-white text-lg font-semibold">
                  {product.title}
                </h2>
              </div>
            </div>
            <div className="p-4">
              <div className="flex flex-col mb-4">
                <span className="text-gray-500 line-through text-sm">
                  السعر الأصلي:
                  {product.price.toFixed(2)}
                </span>
                <span className="text-red-500 font-bold">
                  نسبه الخصم:
                  {product.discountPercentage}%
                </span>
                <span className="text-green-600 font-bold text-lg">
                  السعر الان :
                  {calculateDiscountedPrice(
                    product
                  ).toFixed(2)}
                </span>
              </div>
              <button
                onClick={() =>
                  handleAddToCart(product, 1)
                }
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
              >
                أضف إلى السلة
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-end mb-4">
              <button
                onClick={() =>
                  setViewMode(
                    viewMode === "carousel"
                      ? "grid"
                      : "carousel"
                  )
                }
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
              >
                {viewMode === "carousel"
                  ? "عرض الشبكة"
                  : "عرض دائري"}
              </button>
              <button
                onClick={() =>
                  setSelectedProduct(null)
                }
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                اغلاق
              </button>
            </div>
            {viewMode === "carousel" ? (
              <Carousel showThumbs={false}>
                {selectedProduct.images.map(
                  (image, index) => (
                    <div key={index}>
                      <Image
                        src={image}
                        alt={`${selectedProduct.title
                          } - Image ${index + 1}`}
                        width={500}
                        height={500}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )
                )}
              </Carousel>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {selectedProduct.images.map(
                  (image, index) => (
                    <div
                      key={index}
                      className="relative"
                    >
                      <Image
                        src={image}
                        alt={`${selectedProduct.title
                          } - Image ${index + 1}`}
                        width={200}
                        height={200}
                        className={`w-full h-full object-cover rounded-lg ${selectedImages.includes(
                          image
                        )
                            ? "border-4 border-blue-500"
                            : ""
                          }`}
                        onClick={() =>
                          toggleImageSelection(
                            image
                          )
                        }
                      />
                      <input
                        type="checkbox"
                        checked={selectedImages.includes(
                          image
                        )}
                        onChange={() =>
                          toggleImageSelection(
                            image
                          )
                        }
                        className="absolute top-2 right-2 h-5 w-5"
                      />
                    </div>
                  )
                )}
              </div>
            )}
            <h2 className="mt-4 text-2xl font-bold">
              {selectedProduct.title}
            </h2>
            <p className="mt-2 text-gray-600">
              {selectedProduct.description}
            </p>
            <div className="mt-4 flex flex-col">
              <span className="text-gray-500 line-through">
                السعر الأصلي:
                {selectedProduct.price.toFixed(2)}
              </span>
              <span className="text-red-500 font-bold">
                الخصم:
                {
                  selectedProduct.discountPercentage
                }
                %
              </span>
              <span className="text-green-600 font-bold text-xl">
                الآن:
                {calculateDiscountedPrice(
                  selectedProduct
                ).toFixed(2)}
              </span>
            </div>
            <div className="mt-4 flex items-center">
              <input
                type="number"
                min="1"
                defaultValue="1"
                className="w-20 mr-4 px-2 py-1 border rounded"
                id="quantity"
              />
              <button
                onClick={() => {
                  const quantity = parseInt(
                    document.getElementById(
                      "quantity"
                    ).value,
                    10
                  );
                  handleAddToCart(
                    selectedProduct,
                    quantity,
                    selectedImages.length > 0
                      ? selectedImages
                      : selectedProduct.images
                  );
                  setSelectedProduct(null);
                }}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105"
              >
                أضف إلى السلة
              </button>
            </div>
          </div>
        </div>
      )}

      <ShoppingCart
        cart={cart}
        isVisible={isCartVisible}
        setIsVisible={setIsCartVisible}
        onUpdateItem={handleUpdateCartItem}
        onRemoveItem={handleRemoveFromCart}
        userEmail={
          user?.primaryEmailAddress?.emailAddress
        }
      />
      <button
        onClick={() =>
          setIsCartVisible(!isCartVisible)
        }
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg z-10 transition duration-300 ease-in-out transform hover:scale-110"
      >
        🛒
      </button>
    </div>
  );
}
