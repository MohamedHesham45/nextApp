"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import UserOrdersPage from "../user/orders/page";
import CategoryPage from "../category/[category]/page";
import OrdersPage from "../admin/orders/page";
import AdminPage from "../admin/page";
import AllUsers from "../all-users/page";
import LoadingSpinner from "@/components/LoadingSpinner";

const DashboardContent = () => (
  <div>
    <p>test</p>
  </div>
);

export default function AdminDashboard() {
  const [selectedComponent, setSelectedComponent] = useState("dashboard");
  const { isLoggedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isLoggedIn) {
      alert("You are not logged in. Redirecting to the home page.");
      router.push("/");
    }
  }, [isLoaded, isLoggedIn, router]);

  const renderComponent = () => {
    switch (selectedComponent) {
      case "userorders":
        return <UserOrdersPage />;
      case "category":
        return <CategoryPage />;
      case "orders":
        return <OrdersPage />;
      case "adminpage":
        return <AdminPage />;
      case "allusers":
        return <AllUsers />;
      default:
        return <DashboardContent />;
    }
  };

  if (!isLoaded) {
    return <LoadingSpinner />;
  }
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">

      <div className="flex-1 p-5">
        {renderComponent()}
      </div>


      <div className="w-full md:w-64 bg-gray-100 p-5 border-l border-gray-300 direction-rtl">
        <ul className="list-none p-0">
          <li
            className={`my-2 cursor-pointer hover:text-blue-500 hover:bg-gray-200 p-2 rounded ${selectedComponent === "userorders" ? "bg-blue-500 text-white" : ""}`}
            onClick={() => setSelectedComponent("userorders")}
          >
            طلبات المستخدم
          </li>
          <li
            className={`my-2 cursor-pointer hover:text-blue-500 hover:bg-gray-200 p-2 rounded ${selectedComponent === "category" ? "bg-blue-500 text-white" : ""}`}
            onClick={() => setSelectedComponent("category")}
          >
            الفئة
          </li>
          <li
            className={`my-2 cursor-pointer hover:text-blue-500 hover:bg-gray-200 p-2 rounded ${selectedComponent === "orders" ? "bg-blue-500 text-white" : ""}`}
            onClick={() => setSelectedComponent("orders")}
          >
            الطلبات
          </li>
          <li
            className={`my-2 cursor-pointer hover:text-blue-500 hover:bg-gray-200 p-2 rounded ${selectedComponent === "adminpage" ? "bg-blue-500 text-white" : ""}`}
            onClick={() => setSelectedComponent("adminpage")}
          >
            صفحة المدير
          </li>
          <li
            className={`my-2 cursor-pointer hover:text-blue-500 hover:bg-gray-200 p-2 rounded ${selectedComponent === "allusers" ? "bg-blue-500 text-white" : ""}`}
            onClick={() => setSelectedComponent("allusers")}
          >
            كل المستخدمين
          </li>
        </ul>
      </div>
    </div>
  );
}
