"use client";

import React, {
  useState,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from 'react-hot-toast';
export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, isLoaded, isLoggedIn, role, profile } = useAuth();
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] =
    useState(null);
  const [isModalOpen, setIsModalOpen] =
    useState(false);



  useEffect(() => {
    if (token) {
      if (isLoaded) {
        if (isLoggedIn && role === 'user') {
          router.push("/");
        } else {
          fetchOrders();
        }
      }
    } else {
      router.push("/");
    }
  }, [isLoaded, role, router, token])

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/orders");
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error(
        "Error fetching orders:",
        err
      );
      setError(
        "فشل في تحميل الطلبات. يرجى المحاولة مرة أخرى لاحقًا."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (
    orderId,
    newStatus
  ) => {
    try {
      const response = await fetch(
        `/api/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "فشل في تحديث حالة الطلب"
        );
      }

      setOrders(
        orders.map((order) =>
          order._id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      );
      const status = newStatus === "Pending" ? "قيد الانتظار" : newStatus === "Processing" ? "قيد المعالجة" : newStatus === "Shipped" ? "تم الشحن" : newStatus === "Delivered" ? "تم التسليم" : "ملغى"
      toast.success('تم تحديث حالة الطلب بنجاح إلى ' + status)
    } catch (error) {
      console.error(
        "حدث خطأ أثناء تحديث حالة الطلب:",
        error
      );
      toast.error('فشل في تحديث حالة الطلب. يرجى المحاولة مرة أخرى.')
    }
  };

  const copyOrderDetails = (order) => {
    const addressParts = order.customerDetails.centerArea.split('،');
    const details = `رقم الطلب: ${order._id}
اسم العميل: ${order.customerDetails.name}
رقم الهاتف: ${order.customerDetails.phone}
البريد الإلكتروني: ${order.customerDetails.email}
الحالة: ${order.status === "Pending" ? "قيد الانتظار"
        : order.status === "Processing" ? "قيد المعالجة"
          : order.status === "Shipped" ? "تم الشحن"
            : order.status === "Delivered" ? "تم التسليم"
              : "ملغى"}
السعر الإجمالي: ${parseFloat(order.totalPrice) + parseFloat(order.shippingCost)} ج.م
تاريخ الطلب: ${new Date(order.orderDate).toLocaleString("ar-EG")}

تفاصيل العنوان:
المحافظة: ${order.customerDetails.governorate}
المنطقة: ${addressParts[0] || ''}
الشارع: ${addressParts[1] || ''}
العمارة: ${addressParts[2] || ''}
الشقة: ${addressParts[3] || ''}
الحي: ${order.customerDetails.neighborhood}
طريقة الاتصال: ${order.customerDetails.preferredContactMethod}
نوع الدفع: ${order.customerDetails.buyType}
نوع الشحن: ${order.customerDetails.shippingType}
تعليمات التسليم: ${order.customerDetails.deliveryInstructions}
رسائل اضافية: ${order.customerDetails.message}

العناصر:
${order.orderItems.map(item => `- ${item.title}
  الكمية: ${item.quantity}
  السعر: ${item.price.toFixed(2)} ج.م`).join('\n')}`;

    navigator.clipboard.writeText(details);
    alert("تم نسخ تفاصيل الطلب إلى الحافظة!");
  };

  if (loading) {
    return (
      <div className="text-center mt-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-8 text-red-500">
        {error}
      </div>
    );
  }

  const statusOrder = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  return (
    <div className="bg-gray-100 shadow-xl rounded-lg p-6 w-full mt-5">

      <div
        className="container mx-auto px-4 py-8"
        dir="rtl"
      >
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          إدارة الطلبات
        </h1>
        {statusOrder.map((status) => (
          <div key={status} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {status === "Pending"
                ? "قيد الانتظار"
                : status === "Processing"
                  ? "قيد المعالجة"
                  : status === "Shipped"
                    ? "تم الشحن"
                    : status === "Delivered"
                      ? "تم التسليم"
                      : "ملغى"}
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 uppercase text-sm leading-normal text-center">
                    <th className="py-3 px-6 ">
                      رقم الطلب
                    </th>
                    <th className="py-3 px-6 ">
                      اسم العميل
                    </th>
                    <th className="py-3 px-6 ">
                      السعر الإجمالي
                    </th>
                    <th className="py-3 px-6 ">
                      تاريخ الطلب
                    </th>
                    <th className="py-3 px-6 ">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {orders
                    .filter(
                      (order) =>
                        order.status === status
                    )
                    .map((order) => (
                      <tr
                        key={order._id}
                        className="border border-gray-200 hover:bg-gray-50"
                      >
                        <td className="border py-3 px-6 text-center whitespace-nowrap">
                          {order._id}
                        </td>
                        <td className="border py-3 px-6 text-center">
                          {
                            order.customerDetails
                              .name
                          }
                        </td>
                        <td className="border py-3 px-6 text-center">
                          ج.م
                          {order.totalPrice.toFixed(
                            2
                          )}
                        </td>
                        <td className="border py-3 px-6 text-center">
                          {new Date(
                            order.orderDate
                          ).toLocaleString("ar-EG")}
                        </td>
                        <td className="border py-3 px-6 text-center">
                          <button
                            onClick={() =>
                              handleViewDetails(
                                order
                              )
                            }
                            className="bg-green-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-1"
                          >
                            عرض التفاصيل
                          </button>
                          <select
                            onChange={(e) =>
                              handleUpdateStatus(
                                order._id,
                                e.target.value
                              )
                            }
                            value={order.status}
                            className="bg-white border border-gray-300 text-gray-700 py-1 px-4 rounded  leading-tight focus:outline-none focus:bg-white focus:border-gray-500 m-1"
                          >
                            <option value="Pending">
                              قيد الانتظار
                            </option>
                            <option value="Processing">
                              قيد المعالجة
                            </option>
                            <option value="Shipped">
                              تم الشحن
                            </option>
                            <option value="Delivered">
                              تم التسليم
                            </option>
                            <option value="Cancelled">
                              ملغى
                            </option>
                          </select>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        {isModalOpen && selectedOrder && (
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  تفاصيل الطلب :
                </h3>
                <p className="text-sm text-gray-500 mb-1">
                  اسم العميل :{" "}
                  {
                    selectedOrder.customerDetails
                      .name
                  }
                </p>
                <p className="text-sm text-gray-500 mb-1">
                  رقم الهاتف :{" "}
                  {
                    selectedOrder.customerDetails
                      .phone
                  }
                </p>
                <p className="text-sm text-gray-500 mb-1">
                  رقم الطلب : {selectedOrder._id}
                </p>
                <p className="text-sm text-gray-500 mb-1">
                  الحالة : {selectedOrder.status === "Pending"
                    ? "قيد الانتظار"
                    : selectedOrder.status === "Processing"
                      ? "قيد المعالجة"
                      : selectedOrder.status === "Shipped"
                        ? "تم الشحن"
                        : selectedOrder.status === "Delivered"
                          ? "تم التسليم"
                          : "ملغى"}
                </p>
                <p className="text-sm text-gray-500 mb-1">
                  التاريخ :{" "}
                  {new Date(
                    selectedOrder.orderDate
                  ).toLocaleString("ar-EG")}
                </p>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    تفاصيل العنوان :
                  </h4>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>
                      <span className="font-medium me-1">
                        المحافظة :
                      </span>{" "}
                      {
                        selectedOrder
                          .customerDetails
                          .governorate
                      }
                    </p>
                    <p>
                      <span className="font-medium">
                        تفاصيل العنوان:
                      </span>{" "}
                      {(() => {
                        const addressParts = selectedOrder.customerDetails.centerArea.split('،');
                        return (
                          <>
                            <div>المنطقة: {addressParts[0] || ''}</div>
                            <div>الشارع: {addressParts[1] || ''}</div>
                            <div>العمارة: {addressParts[2] || ''}</div>
                            <div>الشقة: {addressParts[3] || ''}</div>
                          </>
                        );
                      })()}
                    </p>
                    <p>
                      <span className="font-medium me-1">
                        الحي :
                      </span>{" "}
                      {
                        selectedOrder
                          .customerDetails
                          .neighborhood
                      }
                    </p>
                    <p>
                      <span className="font-medium me-1">
                        طريقة الاتصال :
                      </span>{" "}
                      {selectedOrder.customerDetails.preferredContactMethod}
                    </p>
                    <p>
                      <span className="font-medium me-1">
                        نوع الدفع :
                      </span>{" "}
                      {selectedOrder.customerDetails.buyType}
                    </p>
                    <p>
                      <span className="font-medium me-1">
                        نوع الشحن :
                      </span>{" "}
                      {selectedOrder.customerDetails.shippingType}
                    </p>
                    {selectedOrder.customerDetails.deliveryInstructions && <p>
                      <span className="font-medium me-1">
                        تعليمات التسليم :
                      </span>{" "}
                      {
                        selectedOrder
                          .customerDetails
                          .deliveryInstructions
                      }
                    </p>}
                    {selectedOrder.customerDetails.message && <p>
                      <span className="font-medium me-1">
                        رسائل اضافية :
                      </span>{" "}
                      {selectedOrder.customerDetails.message}
                    </p>}
                  </div>
                </div>
                <h4 className="text-sm font-medium text-gray-900 mt-4 mb-2">
                  عناصر الطلب :
                </h4>
                <ul className="space-y-2">
                  {selectedOrder.orderItems.map(
                    (item, index) => (
                      <li
                        key={index}
                        className="flex items-center space-x-2 "
                      >
                        <img
                          src={
                            item
                              .selectedImages?.[0]?.startsWith('/') ? item.selectedImages[0] : `/${item.selectedImages[0]}` ||
                            "/placeholder.png"
                          }
                          alt={item.title}
                          width={70}
                          height={70}
                          className="rounded m-2"
                        />
                        <div>
                          <p className="text-sm font-medium ">
                            {item.title} :
                          </p>
                          <p className="text-xs text-gray-500">
                            الكمية: {item.quantity}{" "}
                            - السعر:
                            {item.price.toFixed(2)} ج.م
                          </p>
                        </div>
                      </li>
                    )
                  )}
                </ul>
                <hr />
                <p className="text-sm font-medium text-gray-900 mt-4 mb-8">
                  السعر :
                  {selectedOrder.totalPrice.toFixed(
                    2
                  )} ج.م
                </p>
                <p className="text-sm font-medium text-gray-900 mt-4 mb-8">
                  سعر التوصيل:
                  {selectedOrder.shippingCost.toFixed(
                    2
                  )} ج.م
                </p>
                <p className="text-sm font-medium text-gray-900 mt-4 mb-8">
                  السعر الإجمالي:
                  {parseFloat(selectedOrder.totalPrice) + parseFloat(selectedOrder.shippingCost)} ج.م
                </p>
                <div className="mt-4 flex justify-between print:hidden">
                  <button
                    onClick={() =>
                      copyOrderDetails(
                        selectedOrder
                      )
                    }
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    نسخ التفاصيل
                  </button>
                  <button
                    onClick={() =>
                      window.print()
                    }
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  >
                    طباعة
                  </button>
                  <button
                    onClick={() =>
                      setIsModalOpen(false)
                    }
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
