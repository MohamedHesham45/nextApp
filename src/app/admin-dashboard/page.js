"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import OrdersPage from "../admin/orders/page";
import AdminPage from "../admin/page";
import AllUsers from "../all-users/page";
import LoadingSpinner from "@/components/LoadingSpinner";
import CategoryManager from "@/components/CategoryManager";
import ShippingTypes from "../shipping-type/page";
import Governorates from "../governorate/page";
import CustomizePage from "../customize/page";
import Neighborhoods from "../neighborhood/page";
import BuyTypePage from "../buyType/page";
import PanelsPage from "../panels/page";

export default function AdminDashboard() {
  const [selectedComponent, setSelectedComponent] = useState("dashboard");
  const { token, isLoggedIn, isLoaded, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (token) {
      if (isLoaded) {
        if (isLoggedIn && role === "user") {
          router.push("/");
        } else {
          setLoading(false);
        }
      }
    } else {
      router.push("/");
    }
  }, [isLoaded, role, router, token]);

  const handleCategoryChange = (newCategories) => {
    setCategories(newCategories);
    localStorage.setItem("categories", JSON.stringify(newCategories));
  };

  const handleDeleteCategory = (categoryToDelete) => {
    const updatedCategories = categories.filter(
      (category) => category !== categoryToDelete
    );
    setCategories(updatedCategories);
    localStorage.setItem("categories", JSON.stringify(updatedCategories));
  };

  const componentsMap = {
    // userorders: { component: <UserOrdersPage />, label: "طلبات المستخدم" },
    orders: { component: <OrdersPage />, label: "الطلبات" },
    category: {
      component: (
        <CategoryManager
          categories={categories}
          onCategoryChange={handleCategoryChange}
          onDeleteCategory={handleDeleteCategory}
        />
      ),
      label: "إدارة الفئات",
    },
    adminpage: { component: <AdminPage />, label: "إدارة المنتجات" },
    allusers: { component: <AllUsers />, label: "كل المستخدمين" },
    shippingtype: { component: <ShippingTypes />, label: "نوع الشحن" },
    governorates: { component: <Governorates />, label: "المحافظات" },
    neighborhoods: { component: <Neighborhoods />, label: "المناطق" },
    customizepage: { component: <CustomizePage />, label: "الحقول المخصصة" },
    panels: { component: <PanelsPage />, label: "اللوحات" },
    buytype: { component: <BuyTypePage />, label: "نوع الدفع" },
  };

  const renderComponent = () => {
    return componentsMap[selectedComponent]?.component || <OrdersPage />;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row direction-rtl">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-gray-100 p-2 md:p-5 border-b md:border-l border-gray-300">
        <ul className="flex overflow-x-auto md:flex-col list-none p-0 gap-2 md:gap-0">
          {Object.entries(componentsMap).map(([key, { label }]) => (
            <li
              key={key}
              className={`cursor-pointer whitespace-nowrap hover:text-amazon-blue hover:bg-gray-200 p-2 rounded 
            ${selectedComponent === key ? "bg-amazon-blue text-white" : ""}`}
              onClick={() => setSelectedComponent(key)}
            >
              {label}
            </li>
          ))}
        </ul>
      </div>

      {/* Content */}
      <div className="flex-1 p-5">{renderComponent()}</div>
    </div>
  );
}
