import React, {
  useState,
  useEffect,
} from "react";
import Image from "next/image";

export default function ShoppingCartPage({
  cart,
  isVisible,
  setIsVisible,
  onUpdateItem,
  onRemoveItem,
  userEmail,
}) {
  const [customerDetails, setCustomerDetails] =
    useState({
      name: "",
      email: userEmail || "",
      phone: "",
      governorate: "",
      centerArea: "",
      neighborhood: "",
      message: "",
      preferredContactMethod: "whatsapp",
      deliveryInstructions: "",
    });
  const [editingItem, setEditingItem] =
    useState(null);
  const [shippingCost, setShippingCost] =
    useState(0);

  useEffect(() => {
    const savedDetails = localStorage.getItem(
      "customerDetails"
    );
    if (savedDetails) {
      setCustomerDetails(
        JSON.parse(savedDetails)
      );
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "customerDetails",
      JSON.stringify(customerDetails)
    );
  }, [customerDetails]);

  const calculateDiscountedPrice = (item) => {
    return (
      item.price *
      (1 - item.discountPercentage / 100)
    );
  };

  const calculateShippingCost = (governorate) => {
    const shippingRates = {
      PortSaid: 20,
      Ismailia: 30,
      Damietta: 30,
      Cairo: 50,
      Giza: 60,
      Alexandria: 75,
      Dakahlia: 40,
      Sharqia: 45,
      Gharbia: 50,
      KafrElSheikh: 55,
      Monufia: 55,
      Beheira: 65,
      Qalyubia: 50,
    };
    return shippingRates[governorate] || 100;
  };

  useEffect(() => {
    setShippingCost(
      calculateShippingCost(
        customerDetails.governorate
      )
    );
  }, [customerDetails.governorate]);

  const totalAmount = cart.reduce(
    (total, item) =>
      total +
      calculateDiscountedPrice(item) *
      item.quantity,
    0
  );

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    const orderData = {
      customerDetails,
      orderItems: cart.map((item) => ({
        productId: item._id,
        title: item.title,
        quantity: item.quantity,
        price: calculateDiscountedPrice(item),
        selectedImages: item.selectedImages,
      })),
      totalPrice: totalAmount + shippingCost,
    };

    try {
      const response = await fetch(
        "/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert(
          `Order placed successfully! Order ID: ${result.orderId}`
        );
        // Clear the cart or perform any other necessary actions
        // You might want to add a function to clear the cart and update the parent component
      } else {
        throw new Error("Failed to place order");
      }
    } catch (error) {
      console.error(
        "Error placing order:",
        error
      );
      alert(
        "Failed to place order. Please try again."
      );
    }
  };

  const handleEditItem = (item) => {
    setEditingItem({
      ...item,
      editedImages: [...item.selectedImages],
    });
  };

  const handleSaveEdit = () => {
    if (editingItem) {
      onUpdateItem(
        editingItem._id,
        editingItem.quantity,
        editingItem.editedImages
      );
      setEditingItem(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const toggleImageSelection = (image) => {
    if (editingItem) {
      const updatedImages =
        editingItem.editedImages.includes(image)
          ? editingItem.editedImages.filter(
            (img) => img !== image
          )
          : [...editingItem.editedImages, image];
      setEditingItem({
        ...editingItem,
        editedImages: updatedImages,
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-lg z-50 overflow-y-auto">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            عربة التسوق
          </h2>
          <button
            onClick={() => setIsVisible(false)}
            className="flex items-center justify-center px-4 py-2 text-lg font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors duration-300"
          >
            <span className="mr-2">&larr;</span>
            العودة
          </button>
        </div>
        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <ul className="space-y-4">
              {cart.map((item) => (
                <li
                  key={`${item._id
                    }-${item.selectedImages.join()}`}
                  className="flex flex-col bg-gray-100 p-2 rounded-lg"
                >
                  {editingItem &&
                    editingItem._id === item._id ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">
                          {item.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              setEditingItem({
                                ...editingItem,
                                quantity:
                                  Math.max(
                                    1,
                                    editingItem.quantity -
                                    1
                                  ),
                              })
                            }
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition duration-300"
                          >
                            -
                          </button>
                          <span>
                            {editingItem.quantity}
                          </span>
                          <button
                            onClick={() =>
                              setEditingItem({
                                ...editingItem,
                                quantity:
                                  editingItem.quantity +
                                  1,
                              })
                            }
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition duration-300"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {item.images.map(
                          (image, index) => (
                            <div
                              key={index}
                              className="relative"
                            >
                              <img
                                src={image}
                                alt={`${item.title
                                  } - Image ${index + 1
                                  }`}
                                width={80}
                                height={80}
                                className={`w-full h-20 object-cover rounded-lg cursor-pointer ${editingItem.editedImages.includes(
                                  image
                                )
                                    ? "border-2 border-blue-500"
                                    : ""
                                  }`}
                                onClick={() =>
                                  toggleImageSelection(
                                    image
                                  )
                                }
                              />
                            </div>
                          )
                        )}
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
                        >
                          حفظ
                        </button>
                        <button
                          onClick={
                            handleCancelEdit
                          }
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300"
                        >
                          الغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={
                            item.selectedImages[0]
                          }
                          alt={item.title}
                          width={50}
                          height={50}
                          className="rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {item.title}
                        </h3>
                        <p className={`text-sm text-gray-500  ${item.discountPercentage>0?"line-through":" text-green-600 font-bold"}`}>
                          ${item.price.toFixed(2)}
                        </p>
                        {item.discountPercentage>0 && <p className="text-sm font-bold text-green-600">
                          $
                          {calculateDiscountedPrice(
                            item
                          ).toFixed(2)}
                          <span className="text-red-500 ml-2">
                            (-
                            {
                              item.discountPercentage.toFixed(1)
                            }
                            %)
                          </span>
                        </p>}
                        
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>
                          {item.quantity}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          handleEditItem(item)
                        }
                        className="text-blue-500 hover:text-blue-700 transition duration-300"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() =>
                          onRemoveItem(
                            item._id,
                            item.selectedImages
                          )
                        }
                        className="text-red-500 hover:text-red-700 transition duration-300"
                      >
                        حذف
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-4 font-bold text-lg">
              <div>
                المجموع:ج.م
                {totalAmount.toFixed(2)}
              </div>
              <div>
                تكلفة الشحن: ج.م
                {shippingCost.toFixed(2)}
              </div>
              <div>
                الإجمالي مع الشحن: ج.م
                {(
                  totalAmount + shippingCost
                ).toFixed(2)}
              </div>
            </div>
            <form
              onSubmit={handlePlaceOrder}
              className="mt-6 space-y-4"
            >
              <div>
                <label
                  htmlFor="name"
                  className="block mb-1"
                >
                  الاسم
                </label>
                <input
                  type="text"
                  id="name"
                  value={customerDetails.name}
                  onChange={(e) =>
                    setCustomerDetails({
                      ...customerDetails,
                      name: e.target.value,
                    })
                  }
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-1"
                >
                  البريد الالكتروني
                </label>
                <input
                  type="email"
                  id="email"
                  value={customerDetails.email}
                  onChange={(e) =>
                    setCustomerDetails({
                      ...customerDetails,
                      email: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block mb-1"
                >
                  الهاتف
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={customerDetails.phone}
                  onChange={(e) =>
                    setCustomerDetails({
                      ...customerDetails,
                      phone: e.target.value,
                    })
                  }
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="governorate"
                  className="block mb-1"
                >
                  المحافظة
                </label>
                <select
                  id="governorate"
                  value={
                    customerDetails.governorate
                  }
                  onChange={(e) =>
                    setCustomerDetails({
                      ...customerDetails,
                      governorate: e.target.value,
                    })
                  }
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">
                    اختر المحافظة
                  </option>
                  <option value="Cairo">
                    القاهرة
                  </option>
                  <option value="Alexandria">
                    الإسكندرية
                  </option>
                  <option value="Giza">
                    الجيزة
                  </option>
                  <option value="PortSaid">
                    بور سعيد
                  </option>
                  <option value="Ismailia">
                    الإسماعيلية
                  </option>
                  <option value="Damietta">
                    دمياط
                  </option>
                  <option value="Dakahlia">
                    الدقهلية
                  </option>
                  <option value="Sharqia">
                    الشرقية
                  </option>
                  <option value="Gharbia">
                    الغربية
                  </option>
                  <option value="KafrElSheikh">
                    كفر الشيخ
                  </option>
                  <option value="Monufia">
                    المنوفية
                  </option>
                  <option value="Beheira">
                    البحيرة
                  </option>
                  <option value="Qalyubia">
                    القليوبية
                  </option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="centerArea"
                  className="block mb-1"
                >
                  المركز/المنطقة
                </label>
                <input
                  type="text"
                  id="centerArea"
                  value={
                    customerDetails.centerArea
                  }
                  onChange={(e) =>
                    setCustomerDetails({
                      ...customerDetails,
                      centerArea: e.target.value,
                    })
                  }
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="neighborhood"
                  className="block mb-1"
                >
                  الحي
                </label>
                <input
                  type="text"
                  id="neighborhood"
                  value={
                    customerDetails.neighborhood
                  }
                  onChange={(e) =>
                    setCustomerDetails({
                      ...customerDetails,
                      neighborhood:
                        e.target.value,
                    })
                  }
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="preferredContactMethod"
                  className="block mb-1"
                >
                  طريقة الاتصال المفضلة
                </label>
                <select
                  id="preferredContactMethod"
                  value={
                    customerDetails.preferredContactMethod
                  }
                  onChange={(e) =>
                    setCustomerDetails({
                      ...customerDetails,
                      preferredContactMethod:
                        e.target.value,
                    })
                  }
                  className="w-full px-3 py-2  border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="whatsapp">
                    واتساب
                  </option>
                  <option value="telegram">
                    تيليجرام
                  </option>
                  <option value="email">
                    بريد إلكتروني
                  </option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="deliveryInstructions"
                  className="block mb-1"
                >
                  تعليمات التسليم
                </label>
                <textarea
                  id="deliveryInstructions"
                  value={
                    customerDetails.deliveryInstructions
                  }
                  onChange={(e) =>
                    setCustomerDetails({
                      ...customerDetails,
                      deliveryInstructions:
                        e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block mb-1"
                >
                  رسالة إضافية
                </label>
                <textarea
                  id="message"
                  value={customerDetails.message}
                  onChange={(e) =>
                    setCustomerDetails({
                      ...customerDetails,
                      message: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 transform hover:scale-105"
              >
                Place Order
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
