import React, { useState, useEffect, useRef } from "react";
import { useCartFavorite } from "@/app/context/cartFavoriteContext";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from 'react-hot-toast';
import useMetaConversion from "./SendMetaConversion";
import { useRouter } from "next/navigation";
export default function ShoppingCartPage({ isVisible, setIsVisible }) {
  const { cart, setCart } = useCartFavorite();
  const { profile, setProfile, isLoggedIn } = useAuth();
  const router = useRouter();
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    email: "",
    phone: "",
    governorate: "",
    centerArea: "",
    neighborhood: "",
    message: "",
    preferredContactMethod: "واتساب",
    deliveryInstructions: "",
    userId: "",
    shippingType: "",
  });
  const [editingItem, setEditingItem] = useState({});
  const [shippingCost, setShippingCost] = useState(0);
  const [governorates, setGovernorates] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [shippingTypes, setShippingTypes] = useState([]);
  const [selectedGovernorate, setSelectedGovernorate] = useState({});
  const [selectedNeighborhood, setSelectedNeighborhood] = useState({});
  const [selectedShippingType, setSelectedShippingType] = useState("");
  const [selectedShippingTypeDetails, setSelectedShippingTypeDetails] = useState(null);
  const [categoryErrors, setCategoryErrors] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [allCategoriesError, setAllCategoriesError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [selectedBuyType, setSelectedBuyType] = useState("");
  const [buyTypes, setBuyTypes] = useState([]);
  const [minCartPrice, setMinCartPrice] = useState(0);
  const [area, setArea] = useState('')
  const [street, setStreet] = useState('')
  const [architecture, setArchitecture] = useState('')
  const [apartment, setApartment] = useState('')
  const sendMetaConversion = useMetaConversion();

  // Create refs for form fields
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const shippingTypeRef = useRef(null);
  const governorateRef = useRef(null);
  const neighborhoodRef = useRef(null);
  const centerAreaRef = useRef(null);
  const buyTypeRef = useRef(null);
  const categoryRef = useRef(null);
  const areaRef = useRef(null);
  const streetRef = useRef(null);
  const architectureRef = useRef(null);
  const apartmentRef = useRef(null);

  // Create a ref object to store refs for each category
  const categoryRefs = useRef({});

  // Add new state for modal
  const [isMinPriceModalOpen, setIsMinPriceModalOpen] = useState(false);

  // Add ref for the cart container
  const cartRef = useRef(null);

  useEffect(() => {
    setCategoryErrors({});
    setAllCategoriesError("");
  }, [cart]);
  useEffect(() => {
    const savedDetails = localStorage.getItem("customerDetails");
    if (savedDetails) {
      setCustomerDetails(JSON.parse(savedDetails));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("customerDetails", JSON.stringify(customerDetails));
  }, [customerDetails]);

  useEffect(() => {
    const fetchGovernorates = async () => {
      const response = await fetch("/api/governorate");
      const data = await response.json();
      setGovernorates(data);
    };
    const fetchBuyTypes = async () => {
      const response = await fetch("/api/buyType");
      const data = await response.json();
      setBuyTypes(data);
    };
    const fetchMinCartPrice = async () => {
      const response = await fetch("/api/customize?name=اقل قيمه للشراء");
      const data = await response.json();
      setMinCartPrice(data[0].value);
    };
    fetchGovernorates();
    fetchBuyTypes();
    fetchMinCartPrice();
  }, []);
  useEffect(() => {
    if (profile) {
      // Split centerArea if it exists
      const addressParts = profile.centerArea ? profile.centerArea.split('،') : ['', '', '', ''];
      setArea(addressParts[0] || '');
      setStreet(addressParts[1] || '');
      setArchitecture(addressParts[2] || '');
      setApartment(addressParts[3] || '');

      setCustomerDetails({
        ...customerDetails,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        governorate: profile.governorate,
        neighborhood: profile.neighborhood,
        centerArea: profile.centerArea,
      });
    }
    if (profile.governorate) {
      const governorate = governorates.find(
        (gov) => gov.nameAr === profile.governorate
      );
      if (governorate) {
        setSelectedGovernorate(governorate);
      }
    }
  }, [profile]);

  useEffect(() => {
    const fetchNeighborhoods = async () => {
      if (selectedGovernorate) {
        try {
          const response = await fetch(
            `/api/governorate/neighborhood/governorate/${selectedGovernorate._id}`
          );
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          setNeighborhoods(data);
        } catch (error) {
          console.error("Error fetching neighborhoods:", error);
        }
      }
    };
    fetchNeighborhoods();
  }, [selectedGovernorate]);
  useEffect(() => {
    if (profile.neighborhood) {
      const neighborhood = neighborhoods.find(
        (nb) => nb.nameAr === profile.neighborhood
      );

      if (neighborhood) {
        setSelectedNeighborhood(neighborhood);
      }
    }
  }, [neighborhoods]);

  useEffect(() => {
    const fetchShippingTypes = async () => {
      const response = await fetch("/api/shippingType");
      const data = await response.json();
      setShippingTypes(data);
    };
    fetchShippingTypes();
  }, []);

  const calculateDiscountedPrice = (item) => {
    return parseInt(item.price) * (1 - parseInt(item.discountPercentage) / 100);
  };

  const calculateShippingCost = () => {
    const selectedType = selectedGovernorate?.shippingPrices?.find(
      (type) => type.shippingTypeId == selectedShippingType
    );
    return selectedType ? selectedType.price : 0;
  };

  useEffect(() => {
    setShippingCost(calculateShippingCost());
  }, [selectedShippingType]);

  const totalAmount = cart.reduce(
    (total, item) => total + calculateDiscountedPrice(item) * item.quantityCart,
    0
  );

  const groupedCartItems = cart.reduce((acc, item) => {
    const categoryId = item.categoryId._id;
    if (!acc[categoryId]) {
      acc[categoryId] = {
        items: [],
        category: item.categoryId,
        totalQuantity: 0,
      };
    }
    acc[categoryId].items.push(item);
    acc[categoryId].totalQuantity += item.quantityCart;
    return acc;
  }, {});

  const validateMinimumQuantities = () => {
    console.log("here")
    const errors = {};
    Object.values(groupedCartItems).forEach((group) => {
      if (group.totalQuantity < group.category.minCount) {
        errors[
          group.category._id
        ] = `الحد الأدنى للطلب في فئة ${group.category.name} هو ${group.category.minCount} قطع`;
      }
    });
    setCategoryErrors(errors);

    // Scroll to the first category error if it exists
    const firstErrorKey = Object.keys(errors)[0];
    if (firstErrorKey && categoryRefs.current[firstErrorKey]) {
      categoryRefs.current[firstErrorKey].scrollIntoView({ behavior: 'smooth' });
    }

    return Object.keys(errors).length === 0;
  };

  const validateForm = () => {
    const errors = {};

    // Required field validation
    if (!customerDetails.name) errors.name = "الاسم مطلوب";
    if (!customerDetails.phone) errors.phone = "رقم الهاتف مطلوب";
    if (!selectedShippingType) errors.shippingType = "نوع الشحن مطلوب";
    if (!selectedGovernorate) errors.governorate = "المحافظة مطلوبة";
    if (!customerDetails.neighborhood) errors.neighborhood = "الحي مطلوب";
    if (!area)
      errors.area = "المركز/المنطقة مطلوب";
    if (!street)
      errors.street = "الشارع طلب";
    if (!apartment)
      errors.apartment = "رقم الشقة مطلوب";
    if (!architecture)
      errors.architecture = "رقم العمارة مطلوب";
    if (!customerDetails.preferredContactMethod) errors.preferredContactMethod = "طريقة الاتصال مطلوبة";
    if (!customerDetails.buyType) errors.buyType = "نوع الدفع مطلوب";
    //if (totalAmount < minCartPrice) errors.minCartPrice = `الحد الأدنى للشراء هو ${minCartPrice} ج.م`;

    setFormErrors(errors);

    // Scroll to the first error
    if (Object.keys(errors).length > 0) {
      if (errors.name) nameRef.current.scrollIntoView({ behavior: 'smooth' });
      else if (errors.phone) phoneRef.current.scrollIntoView({ behavior: 'smooth' });
      else if (errors.shippingType) shippingTypeRef.current.scrollIntoView({ behavior: 'smooth' });
      else if (errors.governorate) governorateRef.current.scrollIntoView({ behavior: 'smooth' });
      else if (errors.neighborhood) neighborhoodRef.current.scrollIntoView({ behavior: 'smooth' });
      else if (errors.area) areaRef.current.scrollIntoView({ behavior: 'smooth' });
      else if (errors.street) streetRef.current.scrollIntoView({ behavior: 'smooth' });
      else if (errors.apartment) apartmentRef.current.scrollIntoView({ behavior: 'smooth' });
      else if (errors.architecture) architectureRef.current.scrollIntoView({ behavior: 'smooth' });
      else if (errors.buyType) buyTypeRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    return Object.keys(errors).length === 0;
  };
  useEffect(() => {
    const combinedCenterArea = `${area}، ${street}، ${architecture}، ${apartment}`.trim();
    setCustomerDetails(prev => ({
      ...prev,
      centerArea: combinedCenterArea
    }));
  }, [area, street, architecture, apartment]);
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // Combine address fields

    if (!validateForm()) {
      return;
    }

    if (!validateMinimumQuantities()) {
      // categoryRef.current.scrollIntoView({ behavior: 'smooth' });
      setAllCategoriesError("يرجى التحقق من الحد الأدنى للكميات في كل فئة");
      return;
    }

    // Replace toast with modal
    if (totalAmount < minCartPrice) {
      setIsMinPriceModalOpen(true);
      return;
    }

    const orderData = {
      customerDetails,
      orderItems: cart.map((item) => ({
        productId: item._id,
        title: item.title,
        quantity: item.quantityCart,
        price: calculateDiscountedPrice(item),
        selectedImages: item.selectedImages,
      })),
      totalPrice: totalAmount + shippingCost,
      userId: profile.userId || "",
      saveToProfile: saveToProfile,
    };

    try {
      setLoading(true);
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`تم إنشاء الطلب بنجاح! رقم الطلب: ${result.orderId}`);
        // alert(`Order placed successfully! Order ID: ${result.orderId}`);
        // Clear the cart or perform any other necessary actions
        // You might want to add a function to clear the cart and update the parent component
        var userAgent = navigator.userAgent;

        fetch('https://api.ipify.org?format=json')
          .then(response => response.json())
          .then(async (data) => {
            var ipAddress = data.ip;
            fbq('track', 'Purchase', {
              order_products_data: orderData,
              order_total_price: totalAmount + shippingCost,
              currency: 'EGP',
              user_name: customerDetails.name || "",
              user_email: customerDetails.email || "",
              user_phone: customerDetails.phone || "",
              user_governorate: customerDetails.governorate || "",
              user_neighborhood: customerDetails.neighborhood || "",
              user_center_area: customerDetails.centerArea || "",
              value: totalAmount + shippingCost,
              ip_address: ipAddress,
              user_agent: userAgent
            });
            await sendMetaConversion('Purchase', {
              order_products_data: orderData,
              order_total_price: totalAmount + shippingCost,
              currency: 'EGP',
              user_name: customerDetails.name || "",
              user_email: customerDetails.email || "",
              user_phone: customerDetails.phone || "",
              user_governorate: customerDetails.governorate || "",
              user_neighborhood: customerDetails.neighborhood || "",
              user_center_area: customerDetails.centerArea || "",
              value: totalAmount + shippingCost,
            }, ipAddress, userAgent);
          })
          .catch(error => console.error('Error fetching IP address:', error));

        if (saveToProfile) {
          setProfile({
            ...profile,
            governorate: customerDetails.governorate,
            neighborhood: customerDetails.neighborhood,
            centerArea: customerDetails.centerArea,
          });
        }
        setLoading(false);
        setIsVisible(false);
        setCart([]);
        localStorage.removeItem("customerDetails");
        localStorage.removeItem("cart");

        router.push(`/order/${result.orderId}`)
      } else {
        throw new Error("Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("حدث خطأ اعد المحاوله");
      setLoading(false);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem({
      ...item,
      editedImages: [...item.selectedImages],
    });
  };
  const onRemoveItem = (itemId, images) => {
    setCart(cart.filter((item) => item._id !== itemId));
    setEditingItem(null);
  };
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);
  const handleSaveEdit = () => {
    if (editingItem) {
      const updatedCart = cart.map((item) => {
        if (item._id === editingItem._id) {
          return { ...item, quantityCart: editingItem.quantityCart };
        }
        return item;
      });
      setCart(updatedCart);
      setEditingItem(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const toggleImageSelection = (image) => {
    if (editingItem) {
      const updatedImages = editingItem.editedImages.includes(image)
        ? editingItem.editedImages.filter((img) => img !== image)
        : [...editingItem.editedImages, image];
      setEditingItem({
        ...editingItem,
        editedImages: updatedImages,
      });
    }
  };

  // Add useEffect to handle body scroll
  useEffect(() => {
    if (isVisible) {
      // Prevent scrolling on the main body when cart is open
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable scrolling when cart is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to re-enable scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  // Add click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setIsVisible(false);
      }
    }

    // Add event listener when component mounts
    document.addEventListener('mousedown', handleClickOutside);

    // Clean up event listener when component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsVisible]);

  if (!isVisible) return null;

  return (
    <div
      ref={cartRef}
      className="fixed inset-y-0 right-0 w-full sm:w-1/3 bg-white shadow-lg z-50 overflow-hidden direction-rtl flex flex-col"
    >
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">عربة التسوق</h2>
          <button
            onClick={() => setIsVisible(false)}
            className="flex items-center justify-center px-4 py-2 text-lg font-medium text-white bg-amazon-orange hover:bg-amazon rounded-lg transition-colors duration-300"
          >
            العودة
            <span className="mr-2">&larr;</span>
          </button>
        </div>
        {cart.length === 0 ? (
          <p>لا يوجد منتجات في العربة.</p>
        ) : (
          <>
            {Object.values(groupedCartItems).map((group) => (
              <div
                key={group.category._id}
                className="mb-6 bg-gray-100 p-2 rounded-lg"
                ref={(el) => (categoryRefs.current[group.category._id] = el)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg">{group.category.name}</h3>
                  <span
                    className={`text-sm ${group.totalQuantity < group.category.minCount
                      ? "text-red-500"
                      : "text-green-500"
                      }`}
                  >
                    {group.totalQuantity} / {group.category.minCount} قطعة
                  </span>
                </div>

                {categoryErrors[group.category._id] && (
                  <div className="text-red-500 text-sm mb-2">
                    {categoryErrors[group.category._id]}
                  </div>
                )}

                <ul className="space-y-4">
                  {group.items.map((item) => (
                    <li
                      key={`${item._id}-${item.selectedImages?.join()}`}
                      className="flex flex-col bg-white p-2 rounded-lg"
                    >
                      {editingItem && editingItem._id === item._id ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{item.title}</h3>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  setEditingItem({
                                    ...editingItem,
                                    quantityCart: Math.max(
                                      1,
                                      editingItem.quantityCart - 1
                                    ),
                                  })
                                }
                                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition duration-300"
                              >
                                -
                              </button>
                              <span>{editingItem.quantityCart}</span>
                              <button
                                onClick={() =>
                                  setEditingItem({
                                    ...editingItem,
                                    quantityCart: editingItem.quantityCart + 1,
                                  })
                                }
                                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition duration-300"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <p
                            className={`text-sm text-gray-500  ${item.discountPercentage > 0
                              ? "line-through"
                              : " text-green-600 font-bold"
                              }`}
                          >
                            {Math.round(item.price)} ج.م
                          </p>
                          {item.discountPercentage > 0 && (
                            <p className="text-sm font-bold text-green-600">
                              {Math.round(calculateDiscountedPrice(item))} ج.م
                              <span className="text-red-500 mr-4">
                                ({Math.round(item.discountPercentage)}
                                %)
                              </span>
                            </p>
                          )}
                          <div className="grid grid-cols-3 gap-2">
                            <div className="relative">
                              <img
                                src={item.selectedImages?.[0]?.startsWith('/') ? item.selectedImages?.[0] : `/${item.selectedImages?.[0]}`}
                                alt={`${item.title} - Image 1`}
                                width={80}
                                height={80}
                                className={`w-full h-20 object-cover rounded-lg cursor-pointer ${editingItem.editedImages.includes(
                                  item.selectedImages[0]
                                )
                                  ? "border-2 border-blue-500"
                                  : ""
                                  }`}
                                onClick={() =>
                                  toggleImageSelection(item.selectedImages[0])
                                }
                              />
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={handleSaveEdit}
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300 mx-2"
                            >
                              حفظ
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300"
                            >
                              الغاء
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 m-2">
                            <img
                              src={item.selectedImages?.[0]?.startsWith('/') ? item.selectedImages?.[0] : `/${item.selectedImages?.[0]}`}
                              alt={item.title}
                              width={50}
                              height={50}
                              className="rounded"
                            />
                          </div>
                          <div className="flex-1 ">
                            <h3 className="font-semibold">{item.title}</h3>
                            <p
                              className={`text-sm text-gray-500  ${item.discountPercentage > 0
                                ? "line-through"
                                : " text-green-600 font-bold"
                                }`}
                            >
                              {Math.round(item.price)} ج.م
                            </p>
                            {item.discountPercentage > 0 && (
                              <p className="text-sm font-bold text-green-600">
                                {Math.round(calculateDiscountedPrice(item))} ج.م
                                <span className="text-red-500 mr-4">
                                  ({Math.round(item.discountPercentage)}
                                  %)
                                </span>
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span>{item.quantityCart}</span>
                          </div>
                          <button
                            onClick={() => handleEditItem(item)}
                            className="text-blue-500 hover:text-blue-700 transition duration-300"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() =>
                              onRemoveItem(item._id, item.selectedImages)
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
              </div>
            ))}
            <form onSubmit={handlePlaceOrder} className="mt-6 space-y-4">
              <div ref={nameRef}>
                <label htmlFor="name" className="block mb-1">
                  الاسم
                </label>
                <input
                  type="text"
                  id="name"
                  value={customerDetails.name}
                  onChange={(e) => {
                    setCustomerDetails({
                      ...customerDetails,
                      name: e.target.value,
                    });
                    setFormErrors({
                      ...formErrors,
                      name: "",
                    });
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.name ? "border-red-500" : ""
                    }`}
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="block mb-1">
                  البريد الالكتروني
                </label>
                <input
                  type="email"
                  id="email"
                  value={customerDetails.email}
                  onChange={(e) => {
                    setCustomerDetails({
                      ...customerDetails,
                      email: e.target.value,
                    });
                    setFormErrors({
                      ...formErrors,
                      email: "",
                    });
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.email ? "border-red-500" : ""
                    }`}
                />
                {formErrors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>
              <div ref={phoneRef}>
                <label htmlFor="phone" className="block mb-1">
                  الهاتف
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={customerDetails.phone}
                  onChange={(e) => {
                    setCustomerDetails({
                      ...customerDetails,
                      phone: e.target.value,
                    });
                    setFormErrors({
                      ...formErrors,
                      phone: "",
                    });
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right ${formErrors.phone ? "border-red-500" : ""
                    }`}
                />
                {formErrors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.phone}
                  </p>
                )}
              </div>
              <div ref={shippingTypeRef}>
                <label htmlFor="shippingType" className="block mb-1">
                  نوع الشحن
                </label>
                <select
                  id="shippingType"
                  value={selectedShippingType}
                  onChange={(e) => {
                    const selectedType = shippingTypes.find(
                      (type) => type._id === e.target.value
                    );
                    setSelectedShippingType(e.target.value);
                    if (selectedType) {
                      setSelectedShippingTypeDetails(selectedType);
                      setCustomerDetails({
                        ...customerDetails,
                        shippingType: selectedType.name,
                      });
                    } else {
                      setSelectedShippingTypeDetails(null);
                    }
                    setFormErrors({
                      ...formErrors,
                      shippingType: "",
                    });
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.shippingType ? "border-red-500" : ""
                    }`}
                >
                  <option value="">اختر نوع الشحن</option>
                  {shippingTypes.map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                {formErrors.shippingType && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.shippingType}
                  </p>
                )}

                {selectedShippingTypeDetails && (
                  <div className="mt-2 bg-gray-100 p-4 rounded-lg" >
                    <p className="text-lg font-bold mt-1">
                      تفاصيل نوع الشحن :
                    </p>
                    <p className="text-lg text-amazon-orange  mt-1">
                      {selectedShippingTypeDetails.description}
                    </p>
                  </div>
                )}
              </div>
              <div ref={governorateRef}>
                <label htmlFor="governorate" className="block mb-1">
                  المحافظة
                </label>
                <select
                  id="governorate"
                  value={selectedGovernorate?._id || ""}
                  onChange={(e) => {
                    const selectedGov = governorates.find(
                      (gov) => gov._id === e.target.value
                    );
                    setCustomerDetails({
                      ...customerDetails,
                      governorate: selectedGov.nameAr,
                    });
                    setSelectedGovernorate(selectedGov || null);
                    setNeighborhoods([]);
                    setFormErrors({
                      ...formErrors,
                      governorate: "",
                    });
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.governorate ? "border-red-500" : ""
                    }`}
                >
                  <option value="">اختر المحافظة</option>
                  {governorates.map((gov) => (
                    <option key={gov._id} value={gov._id}>
                      {gov.nameAr}
                    </option>
                  ))}
                </select>
                {formErrors.governorate && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.governorate}
                  </p>
                )}
              </div>
              <div ref={neighborhoodRef}>
                <label htmlFor="neighborhood" className="block mb-1">
                  الحي
                </label>
                <select
                  id="neighborhood"
                  value={selectedNeighborhood?._id || ""}
                  onChange={(e) => {
                    const selectedNeighborhood = neighborhoods.find(
                      (neighborhood) => neighborhood._id === e.target.value
                    );
                    setCustomerDetails({
                      ...customerDetails,
                      neighborhood: selectedNeighborhood.nameAr,
                    });
                    setFormErrors({
                      ...formErrors,
                      neighborhood: "",
                    });
                    setSelectedNeighborhood(selectedNeighborhood || null);
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.neighborhood ? "border-red-500" : ""
                    }`}
                >
                  <option value="">اختر الحي</option>
                  {neighborhoods.map((neighborhood) => (
                    <option key={neighborhood._id} value={neighborhood._id}>
                      {neighborhood.nameAr}
                    </option>
                  ))}
                </select>
                {formErrors.neighborhood && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.neighborhood}
                  </p>
                )}
              </div>
              <div className="flex justify-between gap-4">
                <div className="flex-1" ref={areaRef}>
                  <label htmlFor="area" className="block mb-1">
                    المركز/المنطقة
                  </label>
                  <input
                    type="text"
                    id="area"
                    value={area}
                    onChange={(e) => {
                      setArea(e.target.value);
                      setFormErrors({
                        ...formErrors,
                        area: "",
                      });
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.area ? "border-red-500" : ""
                      }`}
                  />
                  {formErrors.area && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.area}</p>
                  )}
                </div>

                <div className="flex-1" ref={streetRef}>
                  <label htmlFor="street" className="block mb-1">
                    الشارع
                  </label>
                  <input
                    type="text"
                    id="street"
                    value={street}
                    onChange={(e) => {
                      setStreet(e.target.value);
                      setFormErrors({
                        ...formErrors,
                        street: "",
                      });
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.street ? "border-red-500" : ""
                      }`}
                  />
                  {formErrors.street && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.street}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between gap-4">
                <div className="flex-1" ref={architectureRef}>
                  <label htmlFor="architecture" className="block mb-1">
                    رقم العمارة
                  </label>
                  <input
                    type="text"
                    id="architecture"
                    value={architecture}
                    onChange={(e) => {
                      setArchitecture(e.target.value);
                      setFormErrors({
                        ...formErrors,
                        architecture: "",
                      });
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.architecture ? "border-red-500" : ""
                      }`}
                  />
                  {formErrors.architecture && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.architecture}</p>
                  )}
                </div>

                <div className="flex-1" ref={apartmentRef}>
                  <label htmlFor="apartment" className="block mb-1">
                    رقم الشقة
                  </label>
                  <input
                    type="text"
                    id="apartment"
                    value={apartment}
                    onChange={(e) => {
                      setApartment(e.target.value);
                      setFormErrors({
                        ...formErrors,
                        apartment: "",
                      });
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.apartment ? "border-red-500" : ""
                      }`}
                  />
                  {formErrors.apartment && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.apartment}</p>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="preferredContactMethod" className="block mb-1">
                  طريقة الاتصال المفضلة
                </label>
                <select
                  id="preferredContactMethod"
                  value={customerDetails.preferredContactMethod}
                  onChange={(e) => {
                    setCustomerDetails({
                      ...customerDetails,
                      preferredContactMethod: e.target.value,
                    });
                    setFormErrors({
                      ...formErrors,
                      preferredContactMethod: "",
                    });
                  }}
                  className="w-full px-3 py-2  border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="واتساب">واتساب</option>
                  <option value="تيليجرام">تيليجرام</option>
                  <option value="بريد إلكتروني">بريد إلكتروني</option>
                </select>
              </div>
              <div ref={buyTypeRef}>
                <label htmlFor="buyType" className="block mb-1">
                  نوع الدفع
                </label>
                <select
                  id="buyType"
                  value={selectedBuyType}
                  onChange={(e) => {
                    const selectedType = buyTypes.find(
                      (type) => type._id === e.target.value
                    );
                    setFormErrors({
                      ...formErrors,
                      buyType: "",
                    });
                    setSelectedBuyType(e.target.value);
                    setCustomerDetails({
                      ...customerDetails,
                      buyType: selectedType.name,
                    });
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">اختر نوع الدفع</option>
                  {buyTypes.map((type) => (
                    <option key={type._id} value={type._id}>{type.name}</option>
                  ))}
                </select>
                {formErrors.buyType && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.buyType}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="deliveryInstructions" className="block mb-1">
                  تعليمات التسليم
                </label>
                <textarea
                  id="deliveryInstructions"
                  value={customerDetails.deliveryInstructions}
                  onChange={(e) => {
                    setCustomerDetails({
                      ...customerDetails,
                      deliveryInstructions: e.target.value,
                    });
                    setFormErrors({
                      ...formErrors,
                      deliveryInstructions: "",
                    });
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                ></textarea>
              </div>
              <div>
                <label htmlFor="message" className="block mb-1">
                  رسالة إضافية
                </label>
                <textarea
                  id="message"
                  value={customerDetails.message}
                  onChange={(e) => {
                    setCustomerDetails({
                      ...customerDetails,
                      message: e.target.value,
                    });
                    setFormErrors({
                      ...formErrors,
                      message: "",
                    });
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                ></textarea>
              </div>
              {isLoggedIn && (
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="saveToProfile"
                    checked={saveToProfile}
                    onChange={(e) => setSaveToProfile(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-blue-600 mx-2"
                  />
                  <label htmlFor="saveToProfile" className="mr-2 font-bold">
                    حفظ العنوان في الملف الشخصي
                  </label>
                </div>
              )}
              <div className="font-bold text-lg">
                {minCartPrice && totalAmount < minCartPrice && (
                  <div className="text-red-500 text-sm mb-2">
                    الحد الأدنى للشراء هو {minCartPrice} ج.م
                  </div>
                )}
                <div>
                  المجموع: <span className="text-amazon-orange">{Math.round(totalAmount)} ج.م</span>
                </div>
                <div className="mb-2">
                  تكلفة الشحن: <span className="text-amazon-orange">{calculateShippingCost()} ج.م</span>
                </div>
                <hr className="my-2" />
                <div className="mb-4">
                  الإجمالي مع الشحن:{" "}
                  <span className="text-green-500">
                    {Math.round(totalAmount + calculateShippingCost())} ج.م
                  </span>
                </div>
              </div>
              {allCategoriesError && (
                <div className="text-red-500 text-sm mb-2">ll{allCategoriesError}</div>
              )}
            </form>
          </>
        )}
      </div>

      {/* Fixed bottom section - only show when cart is not empty */}
      {cart.length > 0 && (
        <div className="border-t border-gray-200 bg-white p-4 shadow-lg">

          <button
            type="button"
            className="w-full bg-amazon hover:bg-amazon-orange text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 transform hover:scale-105"
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? "جاري الإنشاء..." : "تابع الطلب"}
          </button>
        </div>
      )}

      {/* Add Modal */}
      {isMinPriceModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-center">تنبيه</h3>
            <p className="text-center mb-6">
              الحد الأدنى للشراء هو {minCartPrice} ج.م
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => setIsMinPriceModalOpen(false)}
                className="bg-amazon-orange hover:bg-amazon text-white font-bold py-2 px-6 rounded transition duration-300"
              >
                حسناً
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
