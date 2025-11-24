"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { Edit, Plus } from "lucide-react";

export default function BuyTypePage() {
  const [buyTypes, setBuyTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedField, setSelectedField] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
  });
  const [errors, setErrors] = useState({
    name: "",
  });

  const { isLoggedIn, isLoaded, token, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (token) {
      if (isLoaded) {
        if (isLoggedIn && role === "user") {
          router.push("/");
        }
      }
    } else {
      router.push("/");
    }
  }, [isLoaded, isLoggedIn, router, token]);

  useEffect(() => {
    fetchBuyTypes();
  }, []);

  const fetchBuyTypes = async () => {
    try {
      const response = await fetch("/v2/api/buyType");
      if (!response.ok) throw new Error("Failed to fetch buy types");
      const data = await response.json();
      setBuyTypes(data);
    } catch (error) {
      setError("Error fetching buy types: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    setErrors({ name: "" });

    if (!formData.name || formData.name.trim() === "") {
      setErrors({ name: "الاسم مطلوب" });
      setSubmitLoading(false);
      return;
    }

    try {
      const url =
        modalMode === "add"
          ? "/v2/api/buyType"
          : `/v2/api/buyType/${selectedField._id}`;
      const method = modalMode === "add" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Operation failed");

      await fetchBuyTypes();
      closeModal();
    } catch (error) {
      setError("Error: " + error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const openModal = (mode, field = null) => {
    setModalMode(mode);
    setSelectedField(field);
    setFormData(field || { name: "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedField(null);
    setFormData({ name: "" });
    setErrors({ name: "" });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!isLoggedIn) return null;

  return (
    <div className="bg-gray-100 shadow-xl rounded-lg p-6 w-full mt-5">
      <div className="container mx-auto px-4 py-8 rtl text-right">
        <div className="flex justify-between mb-4">
          <h1 className="text-3xl font-bold mr-0 text-gray-800">
            إدارة أنواع الدفع
          </h1>
          <button
            onClick={() => openModal("add")}
            className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            إضافة نوع جديد <Plus size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {buyTypes.map((type) => (
            <div
              key={type._id}
              className="bg-white border p-4 rounded shadow-lg hover:bg-gray-50"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold text-right">
                  {type.name}
                </h3>
                <Edit
                  className="text-gray-500 hover:cursor-pointer hover:text-blue-700"
                  onClick={() => openModal("edit", type)}
                />
              </div>
            </div>
          ))}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              <h2 className="text-xl font-semibold mb-4 text-right">
                {modalMode === "add" ? "إضافة نوع جديد" : "تعديل النوع"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 text-right">
                    الاسم
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setErrors({ name: "" });
                    }}
                    className="w-full p-2 border rounded text-right"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                </div>
                <div className="flex justify-start gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                    disabled={submitLoading}
                  >
                    {submitLoading
                      ? "جاري الحفظ ..."
                      : modalMode === "add"
                      ? "إضافة"
                      : "حفظ"}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-500 text-white rounded"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
