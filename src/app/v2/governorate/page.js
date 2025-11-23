"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { Trash2, Edit, Plus } from "lucide-react";
import { toast } from "react-hot-toast";

export default function Governorates() {
  const [governorates, setGovernorates] = useState([]);
  const [shippingTypes, setShippingTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add', 'edit', 'addShipping'
  const [selectedGovernorate, setSelectedGovernorate] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    nameAr: "",
    nameEn: "",
    shippingTypeId: "",
    price: "",
  });
  const [errors, setErrors] = useState({});

  const auth = useAuth();
  const isLoggedIn = auth?.isLoggedIn || false;
  const token = auth?.token || null;
  const isLoaded = auth?.isLoaded || false;
  const role = auth?.role || null;
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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [governoratesRes, shippingTypesRes] = await Promise.all([
        fetch("/v2/api/governorate"),
        fetch("/v2/api/shippingType"),
      ]);

      const governoratesData = await governoratesRes.json();
      const shippingTypesData = await shippingTypesRes.json();

      setGovernorates(governoratesData);
      setShippingTypes(shippingTypesData);
    } catch (error) {
      setError("Error fetching data: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  const validateForm = () => {
    const newErrors = {};

    if (modalMode === "addShipping") {
      if (!formData.shippingTypeId) {
        newErrors.shippingTypeId = "يرجى اختيار نوع الشحن.";
      }
      if (!formData.price || formData.price <= 0) {
        newErrors.price = "يرجى إدخال سعر صالح.";
      }
    } else {
      if (!formData.nameAr) {
        newErrors.nameAr = "يرجى إدخال الاسم بالعربية.";
      }
      if (!formData.nameEn) {
        newErrors.nameEn = "يرجى إدخال الاسم بالإنجليزية.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitLoading(true);
    try {
      let response;
      if (modalMode === "add") {
        response = await fetch("/v2/api/governorate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nameAr: formData.nameAr,
            nameEn: formData.nameEn,
          }),
        });
        toast.success("تم إضافة المحافظة بنجاح");
      } else if (modalMode === "addShipping") {
        response = await fetch(
          `/v2/api/governorate/${selectedGovernorate._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              shippingPrices: [
                {
                  shippingTypeId: formData.shippingTypeId,
                  price: parseFloat(formData.price),
                },
              ],
            }),
          }
        );
      }
      if (!response.ok) throw new Error("Operation failed");
      await fetchData();
      toast.success("تم إضافة أو تعديل السعر بنجاح");
      closeModal();
    } catch (error) {
      setError("حدث خطأ أثناء إضافة أو تعديل المحافظة");
      toast.error("حدث خطأ أثناء إضافة أو تعديل المحافظة");
    } finally {
      setSubmitLoading(false);
    }
  };

  const openModal = (mode, governorate = null) => {
    setModalMode(mode);
    setSelectedGovernorate(governorate);
    setFormData({
      nameAr: governorate?.nameAr || "",
      nameEn: governorate?.nameEn || "",
      shippingTypeId: "",
      price: "",
    });
    setIsModalOpen(true);
  };
  const confirmDelete = async () => {
    setSubmitLoading(true);
    try {
      const response = await fetch(
        `/v2/api/governorate/${selectedGovernorate._id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to delete");
      await fetchData();
      toast.success("تم حذف المحافظة بنجاح");
      closeModal();
    } catch (error) {
      setError("حدث خطأ أثناء حذف المحافظة");
      toast.error("حدث خطأ أثناء حذف المحافظة");
    } finally {
      setSubmitLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGovernorate(null);
    setFormData({ nameAr: "", nameEn: "", shippingTypeId: "", price: "" });
  };

  const handleDelete = async (id) => {
    setSelectedGovernorate(
      governorates.find((governorate) => governorate._id === id)
    );
    setModalMode("delete");
    setIsModalOpen(true);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!isLoggedIn) return null;

  return (
    <div className="bg-gray-100 shadow-xl rounded-lg p-6 w-full mt-5">
      <div className="container mx-auto px-4 py-8 rtl">
        <div className="flex justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-800">المحافظات</h1>
          <button
            onClick={() => openModal("add")}
            className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            إضافة محافظة جديدة <Plus size={20} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-50 text-center">
                <th className="border p-2">المحافظة</th>
                {shippingTypes.map((type) => (
                  <th key={type._id} className="border p-2">
                    {type.name}
                  </th>
                ))}
                <th className="border p-2">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {governorates.map((governorate) => (
                <tr key={governorate._id}>
                  <td className="border p-2 text-center">
                    {governorate.nameAr}
                  </td>
                  {shippingTypes.map((type) => {
                    const price = governorate.shippingPrices.find(
                      (sp) => sp.shippingTypeId === type._id
                    )?.price;
                    return (
                      <td key={type._id} className="border p-2 text-center">
                        {price !== undefined && price !== null
                          ? price.toLocaleString()
                          : "-"}
                      </td>
                    );
                  })}
                  <td className="border p-2">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openModal("addShipping", governorate)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Plus size={20} />
                      </button>
                      <button
                        onClick={() => openModal("edit", governorate)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(governorate._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              {modalMode === "delete" ? (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-right">
                    تأكيد الحذف
                  </h2>
                  <p className="text-right mb-4">
                    هل أنت متأكد من حذف المحافظة "{selectedGovernorate?.nameAr}
                    "؟
                  </p>
                  <div className="flex justify-start gap-2">
                    <button
                      onClick={confirmDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded"
                      disabled={submitLoading}
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
              ) : (
                <>
                  <h2 className="text-xl font-semibold mb-4 text-right">
                    {modalMode === "add"
                      ? "إضافة محافظة جديدة"
                      : modalMode === "addShipping"
                      ? "إضافة سعر شحن"
                      : "تعديل المحافظة"}
                  </h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (validateForm()) {
                        handleSubmit(e);
                      }
                    }}
                  >
                    {modalMode === "addShipping" ? (
                      <>
                        <div className="mb-4">
                          <label className="block text-right mb-2">
                            نوع الشحن
                          </label>
                          <select
                            value={formData.shippingTypeId}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                shippingTypeId: e.target.value,
                              });
                              setErrors({
                                ...errors,
                                shippingTypeId: "",
                              });
                            }}
                            className="w-full py-2 border rounded text-right"
                          >
                            <option value="">اختر نوع الشحن</option>
                            {shippingTypes.map((type) => (
                              <option key={type._id} value={type._id}>
                                {type.name}
                              </option>
                            ))}
                          </select>
                          {errors.shippingTypeId && (
                            <p className="text-red-500 text-right">
                              {errors.shippingTypeId}
                            </p>
                          )}
                        </div>
                        <div className="mb-4">
                          <label className="block text-right mb-2">السعر</label>
                          <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                price: e.target.value,
                              });
                              setErrors({
                                ...errors,
                                price: "",
                              });
                            }}
                            className="w-full p-2 border rounded text-right"
                          />
                          {errors.price && (
                            <p className="text-red-500 text-right">
                              {errors.price}
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mb-4">
                          <label className="block text-right mb-2">
                            الاسم بالعربية
                          </label>
                          <input
                            type="text"
                            value={formData.nameAr}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                nameAr: e.target.value,
                              });
                              setErrors({
                                ...errors,
                                nameAr: "",
                              });
                            }}
                            className="w-full p-2 border rounded text-right"
                          />
                          {errors.nameAr && (
                            <p className="text-red-500 text-right">
                              {errors.nameAr}
                            </p>
                          )}
                        </div>
                        <div className="mb-4">
                          <label className="block text-right mb-2">
                            الاسم بالإنجليزية
                          </label>
                          <input
                            type="text"
                            value={formData.nameEn}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                nameEn: e.target.value,
                              });
                              setErrors({
                                ...errors,
                                nameEn: "",
                              });
                            }}
                            className="w-full p-2 border rounded text-right"
                          />
                          {errors.nameEn && (
                            <p className="text-red-500 text-right">
                              {errors.nameEn}
                            </p>
                          )}
                        </div>
                      </>
                    )}
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
                          : modalMode === "addShipping"
                          ? "إضافة السعر"
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
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
