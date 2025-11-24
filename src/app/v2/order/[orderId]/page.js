"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Edit } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function OrderPage({ params }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("customer");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [governorates, setGovernorates] = useState([]);
  const [shippingTypes, setShippingTypes] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [buyTypes, setBuyTypes] = useState([]);
  const [area, setArea] = useState("");
  const [street, setStreet] = useState("");
  const [architecture, setArchitecture] = useState("");
  const [apartment, setApartment] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    governorate: "",
    neighborhood: "",
    buyType: "",
    shippingType: "",
    preferredContactMethod: "",
    deliveryInstructions: "",
    message: "",
    quantity: 1,
  });
  const [formErrors, setFormErrors] = useState({
    name: "",
    phone: "",
    email: "",
    governorate: "",
    neighborhood: "",
    area: "",
    street: "",
    architecture: "",
    apartment: "",
    buyType: "",
    shippingType: "",
    preferredContactMethod: "",
  });
  const router = useRouter();

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/v2/api/orders/${params.orderId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch order");
      }
      const data = await response.json();
      setOrder(data);

      // Find the governorate ID based on the name
      const governorateId = governorates.find(
        (g) => g.nameAr === data.customerDetails.governorate
      )?._id;

      // Fetch neighborhoods for the selected governorate
      if (governorateId) {
        const neighborhoodResponse = await fetch(
          `/v2/api/governorate/neighborhood/governorate/${governorateId}`
        );
        const neighborhoodData = await neighborhoodResponse.json();
        setNeighborhoods(neighborhoodData);
      }

      // Find the shipping type ID based on the name
      const shippingTypeId = shippingTypes.find(
        (st) => st.name === data.customerDetails.shippingType
      )?._id;
      // Find the buy type ID based on the name
      const buyTypeId = buyTypes.find(
        (bt) => bt.name === data.customerDetails.buyType
      )?._id;

      // Split the centerArea into its components
      const [
        areaValue = "",
        streetValue = "",
        architectureValue = "",
        apartmentValue = "",
      ] = (data.customerDetails.centerArea || "")
        .split("،")
        .map((s) => s.trim());

      setArea(areaValue);
      setStreet(streetValue);
      setArchitecture(architectureValue);
      setApartment(apartmentValue);

      setFormData({
        name: data.customerDetails.name || "",
        phone: data.customerDetails.phone || "",
        email: data.customerDetails.email || "",
        governorate: governorateId || "",
        neighborhood: data.customerDetails.neighborhood || "",
        buyType: buyTypeId || "",
        shippingType: shippingTypeId || "",
        preferredContactMethod:
          data.customerDetails.preferredContactMethod || "واتساب",
        deliveryInstructions: data.customerDetails.deliveryInstructions || "",
        message: data.customerDetails.message || "",
        quantity: 1,
        centerArea: data.customerDetails.centerArea || "",
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("حدث خطأ في تحميل الطلب");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [governoratesRes, shippingTypesRes, buyTypesRes] =
          await Promise.all([
            fetch("/v2/api/governorate"),
            fetch("/v2/api/shippingType"),
            fetch("/v2/api/buyType"),
          ]);

        const governoratesData = await governoratesRes.json();
        const shippingTypesData = await shippingTypesRes.json();
        const buyTypesData = await buyTypesRes.json();

        setGovernorates(governoratesData);
        setShippingTypes(shippingTypesData);
        setBuyTypes(buyTypesData);

        await fetchOrder();
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("حدث خطأ في تحميل البيانات");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const combinedCenterArea =
      `${area}، ${street}، ${architecture}، ${apartment}`.trim();
    setFormData((prev) => ({
      ...prev,
      centerArea: combinedCenterArea,
    }));
  }, [area, street, architecture, apartment]);

  const calculateShippingCost = () => {
    if (!formData.governorate || !formData.shippingType) return 0;

    const governorate = governorates.find(
      (g) => g._id === formData.governorate
    );
    if (!governorate) return 0;

    const shippingPrice = governorate.shippingPrices.find(
      (sp) => sp.shippingTypeId === formData.shippingType
    );

    return shippingPrice ? shippingPrice.price : 0;
  };

  const validateForm = () => {
    let isValid = true;
    const errors = {};
    const phoneRegex = /^01[0125][0-9]{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name) {
      errors.name = "الاسم مطلوب";
      isValid = false;
    }

    if (!formData.phone) {
      errors.phone = "رقم الهاتف مطلوب";
      isValid = false;
    } else if (!phoneRegex.test(formData.phone)) {
      errors.phone = "رقم الهاتف غير صحيح";
      isValid = false;
    }

    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = "البريد الإلكتروني غير صحيح";
      isValid = false;
    }

    if (!formData.governorate) {
      errors.governorate = "المحافظة مطلوبة";
      isValid = false;
    }

    if (!formData.neighborhood) {
      errors.neighborhood = "المنطقة مطلوبة";
      isValid = false;
    }

    if (!area) {
      errors.area = "المركز/المنطقة مطلوب";
      isValid = false;
    }

    if (!street) {
      errors.street = "الشارع مطلوب";
      isValid = false;
    }

    if (!architecture) {
      errors.architecture = "رقم العمارة مطلوب";
      isValid = false;
    }

    if (!apartment) {
      errors.apartment = "رقم الشقة مطلوب";
      isValid = false;
    }

    if (!formData.shippingType) {
      errors.shippingType = "طريقة الشحن مطلوبة";
      isValid = false;
    }

    if (!formData.buyType) {
      errors.buyType = "طريقة الدفع مطلوبة";
      isValid = false;
    }

    if (!formData.preferredContactMethod) {
      errors.preferredContactMethod = "طريقة التواصل مطلوبة";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleUpdateCustomerDetails = async () => {
    if (!order) return;
    if (!validateForm()) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    setIsUpdating(true);

    try {
      const shippingCost = calculateShippingCost();

      const response = await fetch(`/v2/api/orders/${params.orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...order,
          status: order.status || "Pending",
          orderDate: Date.now(),
          shippingCost: shippingCost,
          customerDetails: {
            ...order.customerDetails,
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            governorate:
              governorates.find((g) => g._id === formData.governorate)
                ?.nameAr || order.customerDetails.governorate,
            neighborhood: formData.neighborhood,
            centerArea: formData.centerArea,
            buyType:
              buyTypes.find((bt) => bt._id === formData.buyType)?.name ||
              order.customerDetails.buyType,
            shippingType:
              shippingTypes.find((st) => st._id === formData.shippingType)
                ?.name || order.customerDetails.shippingType,
            preferredContactMethod: formData.preferredContactMethod,
            deliveryInstructions: formData.deliveryInstructions,
            message: formData.message,
            userId: order.customerDetails.userId || "",
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update customer details");
      }

      await fetchOrder();
      toast.success("تم تحديث بيانات العميل بنجاح");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating customer details:", error);
      toast.error("حدث خطأ أثناء تحديث بيانات العميل");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateItemQuantity = async () => {
    if (!order || !selectedItem) return;
    setIsUpdating(true);

    try {
      const newQuantity = parseInt(formData.quantity);

      // Validate quantity
      if (!formData.quantity || isNaN(newQuantity)) {
        toast.error("يرجى إدخال كمية صحيحة");
        setIsUpdating(false);
        return;
      }

      // Check minimum quantity
      if (
        selectedItem.category?.minCount &&
        newQuantity < selectedItem.category.minCount
      ) {
        toast.error(`الحد الأدنى للكمية هو ${selectedItem.category.minCount}`);
        setIsUpdating(false);
        return;
      }

      // Check maximum quantity
      if (newQuantity > selectedItem.productQuantity) {
        toast.error(`الكمية المتاحة هي ${selectedItem.productQuantity}`);
        setIsUpdating(false);
        return;
      }

      const quantityDifference = newQuantity - selectedItem.quantity;

      const updatedItems = order.orderItems.map((item) => {
        if (item.productId === selectedItem.productId) {
          return {
            ...item,
            quantity: newQuantity,
            quantityDifference: quantityDifference,
          };
        }
        return item;
      });

      const newTotalPrice = updatedItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      const updatedOrder = {
        ...order,
        updateQuantity: true,
        status: order.status || "Pending",
        orderDate: Date.now(),
        orderItems: updatedItems,
        totalPrice: newTotalPrice,
        customerDetails: order.customerDetails,
      };

      const response = await fetch(`/v2/api/orders/${params.orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedOrder),
      });

      if (!response.ok) {
        throw new Error("Failed to update item quantity");
      }

      await fetchOrder();
      toast.success("تم تحديث الكمية بنجاح");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating item quantity:", error);
      toast.error("حدث خطأ أثناء تحديث الكمية");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      const response = await fetch(`/v2/api/orders/${params.orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "Cancelled",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel order");
      }

      await fetchOrder();
      toast.success("تم إلغاء الطلب بنجاح");
      setIsCancelModalOpen(false);
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("حدث خطأ أثناء إلغاء الطلب");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amazon-light-gray to-white">
      {/* Header Section */}
      <div className="bg-amazon relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amazon-yellow/10 via-amazon-orange/10 to-amazon-blue/10"></div>
        <div className="container mx-auto px-4 py-8 sm:py-10 relative">
          <div className="flex flex-col items-center justify-center space-y-3">
            <h1 className="text-2xl sm:text-4xl font-bold text-white direction-rtl px-2">
              تفاصيل الطلب{" "}
              <span className="text-amazon-yellow">{order._id}</span>
            </h1>
            <div className="text-amazon-light-gray flex items-center gap-2 flex-wrap justify-center">
              <span className="inline-block w-2 h-2 rounded-full bg-amazon-orange"></span>
              تاريخ الطلب:{" "}
              {new Date(order.orderDate).toLocaleDateString("ar-EG")}
              <span className="inline-block w-2 h-2 rounded-full bg-amazon-orange"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-amazon-light-gray">
          <div className="p-4 sm:p-6 md:p-8">
            {/* Customer Details Section */}
            <div className="mb-8 sm:mb-12">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <div className="w-full sm:w-auto">
                  {order.status === "Pending" && (
                    <button
                      onClick={() => {
                        setModalMode("customer");
                        setIsModalOpen(true);
                      }}
                      className="bg-amazon-blue hover:opacity-90 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center gap-2 transform transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
                    >
                      <Edit className="h-5 w-5" />
                      تعديل البيانات الأساسية
                    </button>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-amazon">
                  البيانات الشخصية
                </h3>
              </div>
              <div className="bg-gradient-to-br from-amazon-light-gray/30 to-white p-4 sm:p-6 rounded-xl shadow-sm space-y-3 direction-rtl border border-amazon-light-gray">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="font-semibold text-amazon">الاسم:</span>
                      <span className="text-amazon-dark-gray">
                        {order.customerDetails.name}
                      </span>
                    </p>
                    <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="font-semibold text-amazon">الهاتف:</span>
                      <span className="text-amazon-dark-gray">
                        {order.customerDetails.phone}
                      </span>
                    </p>
                    <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="font-semibold text-amazon">
                        البريد الإلكتروني:
                      </span>
                      <span className="text-amazon-dark-gray">
                        {order.customerDetails.email || "غير متوفر"}
                      </span>
                    </p>
                  </div>
                  <div className="space-y-4">
                    <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="font-semibold text-amazon">
                        المحافظة:
                      </span>
                      <span className="text-amazon-dark-gray">
                        {order.customerDetails.governorate}
                      </span>
                    </p>
                    <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="font-semibold text-amazon">
                        المنطقة:
                      </span>
                      <span className="text-amazon-dark-gray">
                        {order.customerDetails.neighborhood}
                      </span>
                    </p>
                    <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="font-semibold text-amazon">
                        العنوان:
                      </span>
                      <span className="text-amazon-dark-gray">
                        {order.customerDetails.centerArea}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-amazon-light-gray mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="font-semibold text-amazon">
                        طريقة التواصل:
                      </span>
                      <span className="px-3 py-1 bg-amazon-blue/10 text-amazon-blue rounded-full text-sm">
                        {order.customerDetails.preferredContactMethod}
                      </span>
                    </p>
                    <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="font-semibold text-amazon">
                        طريقة الشحن:
                      </span>
                      <span className="px-3 py-1 bg-amazon-orange/10 text-amazon-orange-dark rounded-full text-sm">
                        {order.customerDetails.shippingType}
                      </span>
                    </p>
                    <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="font-semibold text-amazon">
                        طريقة الدفع:
                      </span>
                      <span className="px-3 py-1 bg-amazon-yellow/20 text-amazon rounded-full text-sm">
                        {order.customerDetails.buyType}
                      </span>
                    </p>
                  </div>
                </div>
                {(order.customerDetails.deliveryInstructions ||
                  order.customerDetails.message) && (
                  <div className="pt-4 border-t border-amazon-light-gray mt-4 space-y-3">
                    {order.customerDetails.deliveryInstructions && (
                      <p className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                        <span className="font-semibold text-amazon">
                          تعليمات التوصيل:
                        </span>
                        <span className="text-amazon-dark-gray">
                          {order.customerDetails.deliveryInstructions}
                        </span>
                      </p>
                    )}
                    {order.customerDetails.message && (
                      <p className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                        <span className="font-semibold text-amazon">
                          رسالة إضافية:
                        </span>
                        <span className="text-amazon-dark-gray">
                          {order.customerDetails.message}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Order Items Section */}
            <div className="mb-8 sm:mb-12">
              <h3 className="text-xl sm:text-2xl font-bold text-amazon mb-6 direction-rtl">
                المنتجات المطلوبة
              </h3>
              <div className="space-y-4">
                {order.orderItems.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-amazon-light-gray/30 to-white p-4 sm:p-6 rounded-xl shadow-sm border border-amazon-light-gray flex flex-col sm:flex-row items-center justify-between gap-4 transform transition-all duration-200 hover:shadow-md"
                  >
                    <div className="w-full sm:w-auto">
                      {order.status === "Pending" && (
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setFormData({
                              ...formData,
                              quantity: item.quantity,
                            });
                            setModalMode("item");
                            setIsModalOpen(true);
                          }}
                          className="bg-amazon-orange hover:bg-amazon-orange-dark text-white px-4 py-2 rounded-xl flex items-center gap-2 transform transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
                        >
                          <Edit className="h-4 w-4" />
                          تعديل الكمية
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
                      <div className="text-center sm:text-right space-y-2 order-2 sm:order-1">
                        <p className="text-lg font-bold text-amazon">
                          {item.title}
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
                          <p className="text-sm text-amazon-dark-gray bg-amazon-light-gray px-3 py-1 rounded-full">
                            الكمية: {item.quantity}
                          </p>
                          <p className="text-sm text-amazon-dark-gray bg-amazon-light-gray px-3 py-1 rounded-full">
                            السعر: {item.price.toFixed(2)} ج.م
                          </p>
                        </div>
                        <p className="text-lg font-semibold text-amazon-orange">
                          الإجمالي: {(item.price * item.quantity).toFixed(2)}{" "}
                          ج.م
                        </p>
                      </div>
                      <img
                        src={
                          item.selectedImages?.[0]?.startsWith("/")
                            ? item.selectedImages[0]
                            : `/${item.selectedImages[0]}`
                        }
                        alt={item.title}
                        className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl shadow-md order-1 sm:order-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary Section */}
            <div className="border-t border-amazon-light-gray pt-6">
              <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
                <div className="flex gap-4 w-full sm:w-auto justify-center sm:justify-start">
                  <div className="flex gap-4 w-full sm:w-auto">
                    <button
                      onClick={() => router.push("/")}
                      className="bg-amazon hover:opacity-90 text-white font-bold py-3 px-6 rounded-xl transition duration-200 hover:scale-105 shadow-md hover:shadow-lg w-full sm:w-auto"
                    >
                      العودة للرئيسية
                    </button>
                    {order.status === "Pending" && (
                      <button
                        onClick={() => setIsCancelModalOpen(true)}
                        className="bg-red-500 hover:bg-red-600 hover:opacity-90 text-white font-bold py-3 px-6 rounded-xl transition duration-200 hover:scale-105 shadow-md hover:shadow-lg w-full sm:w-auto"
                      >
                        الغاء الطلب
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-center sm:text-right bg-gradient-to-r from-amazon-yellow/10 to-white p-4 rounded-xl border border-amazon-yellow w-full sm:w-auto">
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-amazon-dark-gray">
                      تكلفة المنتجات:{" "}
                      {order.orderItems.reduce(
                        (total, item) => total + item.price * item.quantity,
                        0
                      )}{" "}
                      ج.م
                    </p>
                    <p className="text-sm text-amazon-dark-gray">
                      تكلفة الشحن: {order.shippingCost} ج.م
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-amazon-orange">
                      الإجمالي:{" "}
                      {order.orderItems.reduce(
                        (total, item) => total + item.price * item.quantity,
                        0
                      ) + Number(order.shippingCost)}{" "}
                      ج.م
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && modalMode === "customer" && (
        <div className="fixed inset-0 bg-amazon bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-[32rem]">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-right text-amazon">
              تعديل البيانات الأساسية
            </h2>
            <div className="space-y-4 h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-amazon mb-2 text-right">
                  الاسم
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setFormErrors({ ...formErrors, name: "" });
                  }}
                  className={`w-full p-3 border ${
                    formErrors.name
                      ? "border-red-500"
                      : "border-amazon-light-gray"
                  } rounded-xl text-right`}
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1 text-right">
                    {formErrors.name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-amazon mb-2 text-right">
                  الهاتف
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    setFormErrors({ ...formErrors, phone: "" });
                  }}
                  className={`w-full p-3 border ${
                    formErrors.phone
                      ? "border-red-500"
                      : "border-amazon-light-gray"
                  } rounded-xl text-right`}
                />
                {formErrors.phone && (
                  <p className="text-red-500 text-sm mt-1 text-right">
                    {formErrors.phone}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-amazon mb-2 text-right">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setFormErrors({ ...formErrors, email: "" });
                  }}
                  className={`w-full p-3 border ${
                    formErrors.email
                      ? "border-red-500"
                      : "border-amazon-light-gray"
                  } rounded-xl text-right`}
                />
                {formErrors.email && (
                  <p className="text-red-500 text-sm mt-1 text-right">
                    {formErrors.email}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-amazon mb-2 text-right">
                  المحافظة
                </label>
                <select
                  value={formData.governorate}
                  onChange={async (e) => {
                    const newGovernorateId = e.target.value;
                    setFormData({ ...formData, governorate: newGovernorateId });
                    setFormErrors({ ...formErrors, governorate: "" });

                    // Fetch neighborhoods for the new governorate
                    if (newGovernorateId) {
                      try {
                        const response = await fetch(
                          `/api/governorate/neighborhood/governorate/${newGovernorateId}`
                        );
                        const data = await response.json();
                        setNeighborhoods(data);

                        // Check if current neighborhood exists in new list
                        const neighborhoodExists = data.some(
                          (n) => n.nameAr === formData.neighborhood
                        );
                        if (!neighborhoodExists) {
                          setFormData((prev) => ({
                            ...prev,
                            neighborhood: "",
                          }));
                        }
                      } catch (error) {
                        console.error("Error fetching neighborhoods:", error);
                        toast.error("حدث خطأ في تحميل المناطق");
                      }
                    } else {
                      setNeighborhoods([]);
                      setFormData((prev) => ({ ...prev, neighborhood: "" }));
                    }
                  }}
                  className={`w-full p-3 border ${
                    formErrors.governorate
                      ? "border-red-500"
                      : "border-amazon-light-gray"
                  } rounded-xl text-right`}
                >
                  <option value="">اختر المحافظة</option>
                  {governorates.map((gov) => (
                    <option key={gov._id} value={gov._id}>
                      {gov.nameAr}
                    </option>
                  ))}
                </select>
                {formErrors.governorate && (
                  <p className="text-red-500 text-sm mt-1 text-right">
                    {formErrors.governorate}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-amazon mb-2 text-right">
                  المنطقة
                </label>
                <select
                  value={formData.neighborhood}
                  onChange={(e) =>
                    setFormData({ ...formData, neighborhood: e.target.value })
                  }
                  className={`w-full p-3 border ${
                    formErrors.neighborhood
                      ? "border-red-500"
                      : "border-amazon-light-gray"
                  } rounded-xl text-right`}
                >
                  <option value="">اختر المنطقة</option>
                  {neighborhoods.map((neighborhood) => (
                    <option key={neighborhood._id} value={neighborhood.nameAr}>
                      {neighborhood.nameAr}
                    </option>
                  ))}
                </select>
                {formErrors.neighborhood && (
                  <p className="text-red-500 text-sm mt-1 text-right">
                    {formErrors.neighborhood}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-amazon mb-2 text-right">
                  المركز/المنطقة
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className={`w-full p-3 border ${
                    formErrors.area
                      ? "border-red-500"
                      : "border-amazon-light-gray"
                  } rounded-xl text-right`}
                />
                {formErrors.area && (
                  <p className="text-red-500 text-sm mt-1 text-right">
                    {formErrors.area}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-amazon mb-2 text-right">
                  الشارع
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className={`w-full p-3 border ${
                    formErrors.street
                      ? "border-red-500"
                      : "border-amazon-light-gray"
                  } rounded-xl text-right`}
                />
                {formErrors.street && (
                  <p className="text-red-500 text-sm mt-1 text-right">
                    {formErrors.street}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-amazon mb-2 text-right">
                  رقم العمارة
                </label>
                <input
                  type="text"
                  value={architecture}
                  onChange={(e) => setArchitecture(e.target.value)}
                  className={`w-full p-3 border ${
                    formErrors.architecture
                      ? "border-red-500"
                      : "border-amazon-light-gray"
                  } rounded-xl text-right`}
                />
                {formErrors.architecture && (
                  <p className="text-red-500 text-sm mt-1 text-right">
                    {formErrors.architecture}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-amazon mb-2 text-right">
                  رقم الشقة
                </label>
                <input
                  type="text"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  className={`w-full p-3 border ${
                    formErrors.apartment
                      ? "border-red-500"
                      : "border-amazon-light-gray"
                  } rounded-xl text-right`}
                />
                {formErrors.apartment && (
                  <p className="text-red-500 text-sm mt-1 text-right">
                    {formErrors.apartment}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-amazon mb-2 text-right">
                  طريقة التواصل المفضلة
                </label>
                <select
                  value={formData.preferredContactMethod}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      preferredContactMethod: e.target.value,
                    });
                    setFormErrors({
                      ...formErrors,
                      preferredContactMethod: "",
                    });
                  }}
                  className={`w-full p-3 border ${
                    formErrors.preferredContactMethod
                      ? "border-red-500"
                      : "border-amazon-light-gray"
                  } rounded-xl text-right`}
                >
                  <option value="واتساب">واتساب</option>
                  <option value="اتصال">اتصال</option>
                </select>
                {formErrors.preferredContactMethod && (
                  <p className="text-red-500 text-sm mt-1 text-right">
                    {formErrors.preferredContactMethod}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-amazon mb-2 text-right">
                  طريقة الشحن
                </label>
                <select
                  value={formData.shippingType}
                  onChange={(e) => {
                    setFormData({ ...formData, shippingType: e.target.value });
                    setFormErrors({ ...formErrors, shippingType: "" });
                  }}
                  className={`w-full p-3 border ${
                    formErrors.shippingType
                      ? "border-red-500"
                      : "border-amazon-light-gray"
                  } rounded-xl text-right`}
                >
                  <option value="">اختر طريقة الشحن</option>
                  {shippingTypes.map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                {formErrors.shippingType && (
                  <p className="text-red-500 text-sm mt-1 text-right">
                    {formErrors.shippingType}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-amazon mb-2 text-right">
                  طريقة الدفع
                </label>
                <select
                  value={formData.buyType}
                  onChange={(e) => {
                    setFormData({ ...formData, buyType: e.target.value });
                    setFormErrors({ ...formErrors, buyType: "" });
                  }}
                  className={`w-full p-3 border ${
                    formErrors.buyType
                      ? "border-red-500"
                      : "border-amazon-light-gray"
                  } rounded-xl text-right`}
                >
                  <option value="">اختر طريقة الدفع</option>
                  {buyTypes.map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                {formErrors.buyType && (
                  <p className="text-red-500 text-sm mt-1 text-right">
                    {formErrors.buyType}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-amazon mb-2 text-right">
                  تعليمات التوصيل
                </label>
                <textarea
                  value={formData.deliveryInstructions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      deliveryInstructions: e.target.value,
                    })
                  }
                  className={`w-full p-3 border ${
                    formErrors.deliveryInstructions
                      ? "border-red-500"
                      : "border-amazon-light-gray"
                  } rounded-xl text-right`}
                  rows="2"
                />
                {formErrors.deliveryInstructions && (
                  <p className="text-red-500 text-sm mt-1 text-right">
                    {formErrors.deliveryInstructions}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-amazon mb-2 text-right">
                  رسالة إضافية
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className={`w-full p-3 border ${
                    formErrors.message
                      ? "border-red-500"
                      : "border-amazon-light-gray"
                  } rounded-xl text-right`}
                  rows="2"
                />
                {formErrors.message && (
                  <p className="text-red-500 text-sm mt-1 text-right">
                    {formErrors.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-start gap-3 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 bg-amazon-dark-gray text-white rounded-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50 w-full sm:w-auto"
                disabled={isUpdating}
              >
                إلغاء
              </button>
              <button
                onClick={handleUpdateCustomerDetails}
                className="px-6 py-3 bg-amazon-orange text-white rounded-xl hover:bg-amazon-orange-dark transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg w-full sm:w-auto"
                disabled={isUpdating}
              >
                {isUpdating ? "جاري الحفظ..." : "حفظ التغييرات"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-amazon bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-[32rem]">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-right text-amazon">
              تأكيد إلغاء الطلب
            </h2>
            <p className="text-right mb-8 text-amazon-dark-gray">
              هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟
            </p>
            <div className="flex justify-start gap-3">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-6 py-3 bg-amazon-dark-gray text-white rounded-xl hover:opacity-90 transition-all duration-200 w-full sm:w-auto"
              >
                تراجع
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto"
              >
                تأكيد الإلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quantity Edit Modal */}
      {isModalOpen && modalMode === "item" && (
        <div className="fixed inset-0 bg-amazon bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-[32rem]">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-right text-amazon">
              تعديل كمية المنتج
            </h2>
            <div>
              <label className="block text-amazon mb-2 text-right">
                الكمية
              </label>
              <div className="flex items-center justify-center gap-4 w-full">
                <button
                  onClick={() => {
                    const currentQuantity = parseInt(formData.quantity) || 0;
                    const minQuantity = selectedItem?.category?.minCount || 1;
                    const maxQuantity = selectedItem?.productQuantity || 1;
                    const newQuantity = currentQuantity + 1;

                    if (newQuantity <= maxQuantity) {
                      setFormData({ ...formData, quantity: newQuantity });
                    } else {
                      toast.error(
                        `الكمية المتاحة هي ${selectedItem.productQuantity}`
                      );
                    }
                  }}
                  className="px-4 py-2 bg-amazon-light-gray text-amazon rounded-full"
                >
                  +
                </button>
                <span className="text-lg font-bold">{formData.quantity}</span>
                <button
                  onClick={() => {
                    const currentQuantity = parseInt(formData.quantity) || 0;
                    const minQuantity = selectedItem?.category?.minCount || 1;
                    const maxQuantity = selectedItem?.productQuantity || 1;
                    const newQuantity = currentQuantity - 1;

                    if (newQuantity >= minQuantity) {
                      setFormData({ ...formData, quantity: newQuantity });
                    } else {
                      toast.error(
                        `الحد الأدنى للكمية هو ${selectedItem.category.minCount}`
                      );
                    }
                  }}
                  className="px-4 py-2 bg-amazon-light-gray text-amazon rounded-full"
                >
                  -
                </button>
              </div>
            </div>

            <div className="flex justify-start gap-3 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 bg-amazon-dark-gray text-white rounded-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50 w-full sm:w-auto"
                disabled={isUpdating}
              >
                إلغاء
              </button>
              <button
                onClick={handleUpdateItemQuantity}
                className="px-6 py-3 bg-amazon-orange text-white rounded-xl hover:bg-amazon-orange-dark transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg w-full sm:w-auto"
                disabled={isUpdating}
              >
                {isUpdating ? "جاري الحفظ..." : "حفظ التغييرات"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
