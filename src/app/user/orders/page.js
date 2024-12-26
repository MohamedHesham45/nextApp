"use client";

import React, {
  useState,
  useEffect,
  useCallback,
} from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function UserOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] =
    useState(null);
  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const fetchUserOrders =
    useCallback(async () => {
      if (!user) return;
      try {
        setLoading(true);
        const response = await fetch(
          `/api/user/orders?userId=${user.emailAddresses[0].emailAddress}`
        );
        if (!response.ok) {
          throw new Error(
            "Failed to fetch orders"
          );
        }
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        console.error(
          "Error fetching orders:",
          err
        );
        setError(
          "Failed to load orders. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    }, [user]);

  // useEffect(() => {
  //   if (isLoaded) {
  //     if (!user) {
  //       router.push("/sign-in");
  //     } else {
  //       fetchUserOrders();
  //     }
  //   }
  // }, [isLoaded, user, router, fetchUserOrders]);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleUpdateOrder = async (
    orderId,
    updates
  ) => {
    try {
      const response = await fetch(
        `/api/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update order");
      }

      fetchUserOrders();
    } catch (error) {
      console.error(
        "Error updating order:",
        error
      );
      alert(
        "Failed to update order. Please try again."
      );
    }
  };

  const copyOrderDetails = (order) => {
    const details = `
      Order ID: ${order._id}
      Status: ${order.status}
      Total Price: ج.م${order.totalPrice.toFixed(
        2
      )}
      Order Date: ${new Date(
        order.orderDate
      ).toLocaleString()}
      Items:
      ${order.orderItems
        .map(
          (item) =>
            `- ${item.title} (Quantity: ${
              item.quantity
            }, Price: ج.م${item.price.toFixed(
              2
            )})`
        )
        .join("\n")}
    `;
    navigator.clipboard.writeText(details);
    alert("Order details copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="text-center mt-8">
        Loading...
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        My Orders
      </h1>
      {orders.length === 0 ? (
        <p>You havent placed any orders yet.</p>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white shadow-md rounded-lg p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Order #{order._id}
                </h2>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    order.status === "Delivered"
                      ? "bg-green-200 text-green-800"
                      : order.status === "Shipped"
                      ? "bg-blue-200 text-blue-800"
                      : order.status ===
                        "Processing"
                      ? "bg-yellow-200 text-yellow-800"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-gray-600">
                Date:{" "}
                {new Date(
                  order.orderDate
                ).toLocaleString()}
              </p>
              <p className="text-gray-600">
                Total: ج.م
                {order.totalPrice.toFixed(2)}
              </p>
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() =>
                    handleViewDetails(order)
                  }
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  View Details
                </button>
                {order.status === "Pending" && (
                  <button
                    onClick={() =>
                      handleUpdateOrder(
                        order._id,
                        { status: "Cancelled" }
                      )
                    }
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
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
                Order Details
              </h3>
              <p className="text-sm text-gray-500 mb-1">
                Order ID: {selectedOrder._id}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                Status: {selectedOrder.status}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                Date:{" "}
                {new Date(
                  selectedOrder.orderDate
                ).toLocaleString()}
              </p>
              <h4 className="text-sm font-medium text-gray-900 mt-4 mb-2">
                Order Items:
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
                          Quantity:{" "}
                          {item.quantity} - Price:
                          ج.م
                          {item.price.toFixed(2)}
                        </p>
                      </div>
                    </li>
                  )
                )}
              </ul>
              <p className="text-sm font-medium text-gray-900 mt-4">
                Total Price: ج.م
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
                  Copy Details
                </button>
                <button
                  onClick={() =>
                    setIsModalOpen(false)
                  }
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
