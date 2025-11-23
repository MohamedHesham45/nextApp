"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { Trash2, Edit, Plus } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ShippingTypes() {
  const [shippingTypes, setShippingTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [selectedType, setSelectedType] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    description: "",
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
    fetchShippingTypes();
  }, []);

  const fetchShippingTypes = async () => {
    try {
      const response = await fetch("/api/shippingType");
      if (!response.ok) throw new Error("Failed to fetch shipping types");
      const data = await response.json();
      setShippingTypes(data);
    } catch (error) {
      setError("حدث خطأ أثناء جلب أنواع الشحن");
      toast.error("حدث خطأ أثناء جلب أنواع الشحن");
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset errors
    setErrors({
      name: "",
      description: "",
    });

    let hasError = false;

    // Basic validation
    if (!formData.name || formData.name.trim() === "") {
      setErrors((prevErrors) => ({ ...prevErrors, name: "الاسم مطلوب" }));
      hasError = true;
    }

    if (!formData.description || formData.description.trim() === "") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        description: "الوصف مطلوب",
      }));
      hasError = true;
    }

    try {
      setSubmitLoading(true);
      const url =
        modalMode === "add"
          ? "/api/shippingType"
          : `/api/shippingType/${selectedType._id}`;

      const method = modalMode === "add" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Operation failed");

      await fetchShippingTypes();
      closeModal();
      toast.success("تم إضافة أو تعديل نوع الشحن بنجاح");
    } catch (error) {
      setError("حدث خطأ أثناء إضافة أو تعديل نوع الشحن");
      toast.error("حدث خطأ أثناء إضافة أو تعديل نوع الشحن");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setSelectedType(shippingTypes.find((type) => type._id === id));
    setModalMode("delete");
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setSubmitLoading(true);
      const response = await fetch(`/api/shippingType/${selectedType._id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      await fetchShippingTypes();
      closeModal();
      toast.success("تم حذف نوع الشحن بنجاح");
    } catch (error) {
      setError("حدث خطأ أثناء حذف نوع الشحن");
      toast.error("حدث خطأ أثناء حذف نوع الشحن");
    } finally {
      setSubmitLoading(false);
    }
  };

  const openModal = (mode, type = null) => {
    setModalMode(mode);
    setSelectedType(type);
    setFormData(type || { name: "", description: "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedType(null);
    setFormData({ name: "", description: "" });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!isLoggedIn) return null;

  return (
    <div className="bg-gray-100 shadow-xl rounded-lg p-6 w-full mt-5">
      <div className="container mx-auto px-4 py-8 rtl text-right ">
        <div className="flex justify-between mb-4">
          <h1 className="text-3xl font-bold mr-0 text-gray-800">أنواع الشحن</h1>
          <button
            onClick={() => openModal("add")}
            className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            إضافة نوع شحن جديد <Plus size={20} />
          </button>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-5 text-center">
          انوع الشحن الحالية
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shippingTypes.map((type) => (
            <div
              key={type._id}
              className="bg-white border p-4 rounded shadow-lg hover:bg-gray-50"
              onClick={() => openModal("view", type)}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold text-right">
                  {type.name}
                </h3>
                <div className="flex gap-2">
                  <Edit
                    className="text-gray-500 hover:cursor-pointer hover:text-blue-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal("edit", type);
                    }}
                  />
                  <Trash2
                    className="text-red-500 hover:cursor-pointer hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(type._id);
                    }}
                  />
                </div>
              </div>
              <h3 className="overflow-hidden text-ellipsis whitespace-nowrap text-gray-600 text-right">
                {type.description}
              </h3>
            </div>
          ))}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              {modalMode === "delete" ? (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-right">
                    تأكيد الحذف
                  </h2>
                  <p className="text-right mb-4">
                    هل أنت متأكد من حذف نوع الشحن "{selectedType?.name}"؟
                  </p>
                  <div className="flex justify-start gap-2">
                    <button
                      onClick={confirmDelete}
                      disabled={submitLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded"
                    >
                      {submitLoading ? "جاري الحذف ..." : "حذف"}
                    </button>
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 bg-gray-500 text-white rounded"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : modalMode === "view" ? (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-right">
                    عرض تفاصيل الشحن
                  </h2>
                  <div>
                    <p>
                      <strong>الاسم:</strong> {selectedType?.name}
                    </p>
                    <p>
                      <strong>الوصف:</strong> {selectedType?.description}
                    </p>
                  </div>
                  <div className="flex justify-start gap-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 bg-gray-500 text-white rounded"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-right">
                    {modalMode === "add"
                      ? "إضافة نوع شحن جديد"
                      : "تعديل نوع الشحن"}
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
                          setErrors({ ...errors, name: "" });
                        }}
                        className="w-full p-2 border rounded text-right"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm">{errors.name}</p>
                      )}
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2 text-right">
                        الوصف
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          });
                          setErrors({ ...errors, description: "" });
                        }}
                        className="w-full p-2 border rounded text-right"
                        rows="3"
                      />
                      {errors.description && (
                        <p className="text-red-500 text-sm">
                          {errors.description}
                        </p>
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
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
