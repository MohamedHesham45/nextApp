"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import toast from "react-hot-toast";
import useMetaConversion from "@/components/SendMetaConversion";

export default function UserOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userId, isLoaded } = useAuth();
  const [loadingSub, setLoadingSub] = useState(false);

  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sendMetaConversion = useMetaConversion();
  useEffect(() => {
    const trackPageView = async () => {
      const userAgent = navigator.userAgent;
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        await sendMetaConversion('ViewContent', {
          content_name: 'Orders Page View',
          content_type: 'orders',
          content_category: 'User Orders',
          value: 0,
        }, ipData.ip, userAgent);
      } catch (error) {
        console.error('Error tracking conversion:', error);
      }
    };
  
    trackPageView();
  }, []);
  

  const fetchUserOrders = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/user/orders/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      setOrders(data);

      

    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isLoaded) {
      if (!userId) {
        router.push("/");
      } else {
        fetchUserOrders();
      }
    }
  }, [isLoaded, userId, router, fetchUserOrders]);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleUpdateOrder = async (orderId, updates) => {
    try {
      setLoadingSub(true);
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update order");
      }

      fetchUserOrders();
      toast.success("تم الإلغاء الطلب بنجاح");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("حدث خطأ أثناء تحديث الطلب اعد المحاولة");
    } finally {
      setLoadingSub(false);
    }
  };

  const copyOrderDetails = (order) => {
    const details = `
      Order ID: ${order._id}
      Status: ${order.status}
      Total Price: ج.م${order.totalPrice.toFixed(2)}
      Order Date: ${new Date(order.orderDate).toLocaleString()}
      Items:
      ${order.orderItems
        .map(
          (item) =>
            `- ${item.title} (Quantity: ${item.quantity
            }, Price: ج.م${item.price.toFixed(2)})`
        )
        .join("\n")}
    `;
    navigator.clipboard.writeText(details);
    alert("Order details copied to clipboard!");
  };

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 direction-rtl">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-amazon">
          <div className="absolute inset-0 bg-gradient-to-r from-amazon-orange/10 via-amazon-yellow/20 to-amazon-blue/20"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amazon/30 to-amazon/90"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amazon-yellow via-amazon-orange to-amazon-blue"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amazon-orange/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-amazon-yellow/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                <span className="text-amazon-yellow">كل </span>{" "}
                <span className="text-white">طلباتي</span>
              </h1>
              <p className="text-amazon-light-gray/80 text-lg max-w-2xl mx-auto mb-8">
                يمكنك مراجعة جميع طلباتك هنا
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto"></div>
            </div>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">قائمة الطلبات فارغة</h2>
          <p className="text-gray-500">لم تقم بإجراء أي طلبات حتى الآن.</p>
        </div>
      ) : (
        <div className="grid  gap-6 bg-gray-50 p-10 ">
          {orders.map((order) => (
            <div
              key={order._id}
              className=" bg-white shadow-md rounded-lg p-6  "
            >
              <div className="flex flex-row justify-between items-center mb-4 direction-rtl">
                <h2 className="text-xl font-semibold">طلب رقم #{order._id}</h2>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${order.status === "Delivered"
                    ? "bg-green-200 text-green-800"
                    : order.status === "Shipped"
                      ? "bg-blue-200 text-blue-800"
                      : order.status === "Processing"
                        ? "bg-yellow-200 text-yellow-800"
                        : order.status === "Pending"
                          ? "bg-gray-200 text-gray-800"
                          : "bg-black text-white"
                    }`}
                >
                  {order.status === "Delivered"
                    ? "تم التوصيل"
                    : order.status === "Shipped"
                      ? "تم الشحن"
                      : order.status === "Processing"
                        ? "قيد المعالجة"
                        : order.status === "Pending"
                          ? "قيد الانتظار"
                          : order.status === "Cancelled"
                            ? "ملغي"
                            : order.status}
                </span>
              </div>
              {order.orderItems.map((item, index) => (
                <div key={index} className="flex flex-row items-center gap-2 my-4">
                  <div className="flex flex-row items-center gap-2 my-4">
                    <img
                      src={item?.selectedImages?.[0]?.startsWith('/')
                        ? item.selectedImages[0]
                        : `/${item.selectedImages[0]}`}
                      alt={item?.title || "Order image"}
                      className="w-20 h-20 rounded-md object-cover"
                    />
                  </div>
                  <div className="flex flex-row text-2xl justify-between items-center my-4">
                    <p>{item?.title}</p>
                  </div>
                </div>
              ))}
              <div className="text-right">
                <p className="text-gray-600">
                  <span className="text-black">التاريخ:</span>{" "}
                  {new Date(order.orderDate).toLocaleString("ar-EG")}
                </p>
                <p className="text-gray-600">
                  <span className="text-black">الإجمالي:</span>
                  <span className="text-amazon-orange">
                    {" "}
                    {order.totalPrice.toFixed(2)} ج.م
                  </span>
                </p>
              </div>

              <div className="mt-4 flex flex-row justify-between items-center">
                <button
                  onClick={() => router.push(`/order/${order._id}`)}
                  className="bg-amazon hover:bg-amazon-blue text-white font-bold py-2 px-4 rounded"
                >
                  عرض التفاصيل
                </button>
                {order.status === "Pending" && (
                  <button
                    onClick={() =>
                      handleUpdateOrder(order._id, { status: "Cancelled" })
                    }
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    disabled={loadingSub}
                  >
                    {loadingSub ? "جاري التحديث..." : "إلغاء الطلب"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {isModalOpen && selectedOrder && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full direction-rtl"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mt-3 text-right">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                تفاصيل الطلب
              </h3>
              <p className="text-sm text-gray-500 mb-1">
                رقم الطلب: {selectedOrder._id}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                الحالة:{" "}
                {selectedOrder.status === "Delivered"
                  ? "تم التوصيل"
                  : selectedOrder.status === "Shipped"
                    ? "تم الشحن"
                    : selectedOrder.status === "Processing"
                      ? "قيد المعالجة"
                      : selectedOrder.status === "Pending"
                        ? "قيد الانتظار"
                        : selectedOrder.status === "Cancelled"
                          ? "ملغي"
                          : selectedOrder.status}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                التاريخ:{" "}
                {new Date(selectedOrder.orderDate).toLocaleString("ar-EG")}
              </p>
              <h4 className="text-sm font-medium text-gray-900 mt-4 mb-2">
                المنتجات:
              </h4>
              <ul className="space-y-2">
                {selectedOrder.orderItems.map((item, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <img
                      src={item.selectedImages?.[0]?.startsWith('/') ? item.selectedImages[0] : `/${item.selectedImages[0]}` || "/placeholder.png"}
                      alt={item.title}
                      width={50}
                      height={50}
                      className="rounded"
                    />
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-gray-500">
                        الكمية: {item.quantity} - السعر: {item.price.toFixed(2)}{" "}
                        ج.م
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="text-sm font-medium text-gray-900 mt-4">
                السعر الإجمالي: {selectedOrder.totalPrice.toFixed(2)} ج.م
              </p>
              <div className="mt-4 flex print:hidden justify-between">
                <button
                  onClick={() => copyOrderDetails(selectedOrder)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  نسخ التفاصيل
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  طباعة
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
