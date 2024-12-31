"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import UserOrdersPage from "../user/orders/page";
import OrdersPage from "../admin/orders/page";
import AdminPage from "../admin/page";
import AllUsers from "../all-users/page";
import LoadingSpinner from "@/components/LoadingSpinner";
import CategoryManager from "@/components/CategoryManager";
import ShippingTypes from "../shipping-type/page";
import Governorates from "../governorate/page";
import CustomizePage from "../customize/page";
import Neighborhoods from "../neighborhood/page";

export default function AdminDashboard() {
  const [selectedComponent, setSelectedComponent] = useState("dashboard");
  const { isLoggedIn, isLoaded } = useAuth();
  const [categories, setCategories] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      if (!isLoggedIn) {
        router.push("/");
      }
    }
  }, [isLoaded, isLoggedIn, router]);

  const handleCategoryChange = (
    newCategories
  ) => {
    setCategories(newCategories);
    localStorage.setItem(
      "categories",
      JSON.stringify(newCategories)
    );
  };

  const handleDeleteCategory = (
    categoryToDelete
  ) => {
    const updatedCategories = categories.filter(
      (category) => category !== categoryToDelete
    );
    setCategories(updatedCategories);
    localStorage.setItem(
      "categories",
      JSON.stringify(updatedCategories)
    );
  };

  const componentsMap = {
    // userorders: { component: <UserOrdersPage />, label: "طلبات المستخدم" },
    orders: { component: <OrdersPage />, label: "الطلبات" },
    category: {
      component: <CategoryManager
        categories={categories}
        onCategoryChange={handleCategoryChange}
        onDeleteCategory={handleDeleteCategory}
      />, label: "إدارة الفئات"
    },
    adminpage: { component: <AdminPage />, label: "إدارة المنتجات" },
    allusers: { component: <AllUsers />, label: "كل المستخدمين" },
    shippingtype: { component: <ShippingTypes />, label: "نوع الشحن" },
    governorates: { component: <Governorates />, label: "المحافظات" },
    neighborhoods: { component: <Neighborhoods />, label: "المناطق" },
    customizepage: { component: <CustomizePage />, label: "الحقول المخصصة" },
  };

  const renderComponent = () => {
    return componentsMap[selectedComponent]?.component || <OrdersPage />;
  };

  if (!isLoaded) {
    return <LoadingSpinner />;
  }
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row direction-rtl">
      <div className="w-full md:w-64 bg-gray-100 p-5 border-l border-gray-300">
        <ul className="list-none p-0">
          {Object.entries(componentsMap).map(([key, { label }]) => (
            <li
              key={key}
              className={`my-2 cursor-pointer hover:text-blue-500 hover:bg-gray-200 p-2 rounded ${selectedComponent === key ? "bg-blue-500 text-white" : ""
                }`}
              onClick={() => setSelectedComponent(key)}
            >
              {label}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 p-5">
        {renderComponent()}
      </div>
    </div>
  );
}
