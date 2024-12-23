"use client";

import React, {
  useState,
  useEffect,
} from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] =
    useState(null);
  const [isModalOpen, setIsModalOpen] =
    useState(false);

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push("/sign-in");
      } else if (!isAuthorized(user)) {
        router.push("/");
      } else {
        fetchOrders();
      }
    }
  }, [isLoaded, user, router]);

  const isAuthorized = (user) => {
    const authorizedEmails = [
      "aliellool202020@gmail.com",
      "sitaramall97@gmail.com",
    ];
    return authorizedEmails.includes(
      user?.primaryEmailAddress?.emailAddress
    );
  };

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
          "Failed to update order status"
        );
      }

      setOrders(
        orders.map((order) =>
          order._id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      );
    } catch (error) {
      console.error(
        "Error updating order status:",
        error
      );
      alert(
        "فشل في تحديث حالة الطلب. يرجى المحاولة مرة أخرى."
      );
    }
  };

  const copyOrderDetails = (order) => {
    const details = `
    رقم الطلب: ${order._id}
    اسم العميل: ${order.customerDetails.name}
    رقم الهاتف: ${order.customerDetails.phone}
    البريد الإلكتروني: ${
      order.customerDetails.email
    }
    الحالة: ${order.status}
    السعر الإجمالي: ج.م${order.totalPrice.toFixed(
      2
    )}
    تاريخ الطلب: ${new Date(
      order.orderDate
    ).toLocaleString("ar-EG")}

    تفاصيل العنوان:
    المحافظة: ${order.customerDetails.governorate}
    المركز/المنطقة: ${
      order.customerDetails.centerArea
    }
    الحي: ${order.customerDetails.neighborhood}
    تعليمات التسليم: ${
      order.customerDetails.deliveryInstructions
    }

    العناصر:
    ${order.orderItems
      .map(
        (item) =>
          `- ${item.title} (الكمية: ${
            item.quantity
          }, السعر: ج.م${item.price.toFixed(2)})`
      )
      .join("\n")}
  `;

    navigator.clipboard.writeText(details);
    alert("تم نسخ تفاصيل الطلب إلى الحافظة!");
  };
  // const copyOrderDetails = (order) => {
  //   const details = `
  //     رقم الطلب: ${order._id}
  //     اسم العميل: ${order.customerDetails.name}
  //   رقم الهاتف: ${order.customerDetails.phone}
  //     الحالة: ${order.status}
  //     السعر الإجمالي: ج.م${order.totalPrice.toFixed(
  //       2
  //     )}
  //     تاريخ الطلب: ${new Date(
  //       order.orderDate
  //     ).toLocaleString("ar-EG")}
  //     العناصر:
  //     ${order.orderItems
  //       .map(
  //         (item) =>
  //           `- ${item.title} (الكمية: ${
  //             item.quantity
  //           }, السعر: ج.م${item.price.toFixed(
  //             2
  //           )})`
  //       )
  //       .join("\n")}
  //   `;
  //   navigator.clipboard.writeText(details);
  //   alert("تم نسخ تفاصيل الطلب إلى الحافظة!");
  // };

  if (loading) {
    return (
      <div className="text-center mt-8">
        جاري التحميل...
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
    <div
      className="container mx-auto px-4 py-8"
      dir="rtl"
    >
      <h1 className="text-3xl font-bold mb-6">
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
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-right">
                    رقم الطلب
                  </th>
                  <th className="py-3 px-6 text-right">
                    اسم العميل
                  </th>
                  <th className="py-3 px-6 text-right">
                    السعر الإجمالي
                  </th>
                  <th className="py-3 px-6 text-right">
                    تاريخ الطلب
                  </th>
                  <th className="py-3 px-6 text-right">
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
                      className="border-b border-gray-200 hover:bg-gray-100"
                    >
                      <td className="py-3 px-6 text-right whitespace-nowrap">
                        {order._id}
                      </td>
                      <td className="py-3 px-6 text-right">
                        {
                          order.customerDetails
                            .name
                        }
                      </td>
                      <td className="py-3 px-6 text-right">
                        ج.م
                        {order.totalPrice.toFixed(
                          2
                        )}
                      </td>
                      <td className="py-3 px-6 text-right">
                        {new Date(
                          order.orderDate
                        ).toLocaleString("ar-EG")}
                      </td>
                      <td className="py-3 px-6 text-right">
                        <button
                          onClick={() =>
                            handleViewDetails(
                              order
                            )
                          }
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
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
                          className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded  leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
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
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                تفاصيل الطلب
              </h3>
              <p className="text-sm text-gray-500 mb-1">
                اسم العميل:{" "}
                {
                  selectedOrder.customerDetails
                    .name
                }
              </p>
              <p className="text-sm text-gray-500 mb-1">
                رقم الهاتف:{" "}
                {
                  selectedOrder.customerDetails
                    .phone
                }
              </p>
              <p className="text-sm text-gray-500 mb-1">
                رقم الطلب: {selectedOrder._id}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                الحالة: {selectedOrder.status}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                التاريخ:{" "}
                {new Date(
                  selectedOrder.orderDate
                ).toLocaleString("ar-EG")}
              </p>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  تفاصيل العنوان:
                </h4>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>
                    <span className="font-medium">
                      المحافظة:
                    </span>{" "}
                    {
                      selectedOrder
                        .customerDetails
                        .governorate
                    }
                  </p>
                  <p>
                    <span className="font-medium">
                      المركز/المنطقة:
                    </span>{" "}
                    {
                      selectedOrder
                        .customerDetails
                        .centerArea
                    }
                  </p>
                  <p>
                    <span className="font-medium">
                      الحي:
                    </span>{" "}
                    {
                      selectedOrder
                        .customerDetails
                        .neighborhood
                    }
                  </p>
                  <p>
                    <span className="font-medium">
                      تعليمات التسليم:
                    </span>{" "}
                    {
                      selectedOrder
                        .customerDetails
                        .deliveryInstructions
                    }
                  </p>
                </div>
              </div>
              <h4 className="text-sm font-medium text-gray-900 mt-4 mb-2">
                عناصر الطلب:
              </h4>
              <ul className="space-y-2">
                {selectedOrder.orderItems.map(
                  (item, index) => (
                    <li
                      key={index}
                      className="flex items-center space-x-2"
                    >
                      <Image
                        src={
                          item
                            .selectedImages?.[0] ||
                          "/placeholder.png"
                        }
                        alt={item.title}
                        width={50}
                        height={50}
                        className="rounded"
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          الكمية: {item.quantity}{" "}
                          - السعر: ج.م
                          {item.price.toFixed(2)}
                        </p>
                      </div>
                    </li>
                  )
                )}
              </ul>
              <p className="text-sm font-medium text-gray-900 mt-4">
                السعر الإجمالي: ج.م
                {selectedOrder.totalPrice.toFixed(
                  2
                )}
              </p>
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() =>
                    copyOrderDetails(
                      selectedOrder
                    )
                  }
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  نسخ التفاصيل
                </button>
                <button
                  onClick={() =>
                    setIsModalOpen(false)
                  }
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
