"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { Edit, Plus } from "lucide-react";

export default function PanelsPage() {
  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedPanel, setSelectedPanel] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image: "",
  });
  const [errors, setErrors] = useState({
    title: "",
    subtitle: "",
    image: "",
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
    fetchPanels();
  }, []);

  const fetchPanels = async () => {
    try {
      const response = await fetch("/api/panels");
      if (!response.ok) throw new Error("Failed to fetch panels");
      const data = await response.json();
      setPanels(data);
    } catch (error) {
      setError("Error fetching panels: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    setErrors({
      title: "",
      subtitle: "",
      image: "",
    });

    let hasError = false;

    if (!formData.title || formData.title.trim() === "") {
      setErrors((prev) => ({ ...prev, title: "العنوان مطلوب" }));
      hasError = true;
    }

    if (!formData.subtitle || formData.subtitle.trim() === "") {
      setErrors((prev) => ({ ...prev, subtitle: "العنوان الفرعي مطلوب" }));
      hasError = true;
    }

    if (!formData.image) {
      setErrors((prev) => ({ ...prev, image: "الصورة مطلوبة" }));
      hasError = true;
    }

    if (hasError) {
      setSubmitLoading(false);
      return;
    }

    try {
      const url =
        modalMode === "add"
          ? "/api/panels"
          : `/api/panels/${selectedPanel._id}`;
      const method = modalMode === "add" ? "POST" : "PUT";

      let bodyData = formData;
      if (formData.image instanceof File) {
        const images = new FormData();
        images.append("images", formData.image);

        const uploadResponse = await fetch("/upload-images", {
          method: "POST",
          body: images,
        });

        if (!uploadResponse.ok) throw new Error("حدث خطأ أثناء رفع الصور");
        const uploadResult = await uploadResponse.json();
        bodyData = { ...formData, image: uploadResult.files[0] };
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) throw new Error("Operation failed");

      await fetchPanels();
      closeModal();
    } catch (error) {
      setError("Error: " + error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const openModal = (mode, panel = null) => {
    setModalMode(mode);
    setSelectedPanel(panel);
    setFormData(panel || { title: "", subtitle: "", image: "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPanel(null);
    setFormData({ title: "", subtitle: "", image: "" });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!isLoggedIn) return null;

  return (
    <div className="bg-gray-100 shadow-xl rounded-lg p-6 w-full mt-5">
      <div className="container mx-auto px-4 py-8 rtl text-right">
        <div className="flex justify-between mb-4">
          <h1 className="text-3xl font-bold mr-0 text-gray-800">
            إدارة اللوحات
          </h1>
          <button
            onClick={() => openModal("add")}
            className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            إضافة لوحة جديدة <Plus size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {panels.map((panel) => (
            <div
              key={panel._id}
              className="bg-white border p-4 rounded shadow-lg hover:bg-gray-50"
            >
              <img
                src={
                  panel.image?.startsWith("/") ? panel.image : `/${panel.image}`
                }
                alt={panel.title}
                className="w-full h-48 object-cover mb-4 rounded"
              />
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold">{panel.title}</h3>
                <Edit
                  className="text-gray-500 hover:cursor-pointer hover:text-blue-700"
                  onClick={() => openModal("edit", panel)}
                />
              </div>
              <p className="text-gray-600">{panel.subtitle}</p>
            </div>
          ))}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              <h2 className="text-xl font-semibold mb-4 text-right">
                {modalMode === "add" ? "إضافة لوحة جديدة" : "تعديل اللوحة"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 text-right">
                    العنوان
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      setErrors({ ...errors, title: "" });
                    }}
                    className="w-full p-2 border rounded text-right"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm">{errors.title}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 text-right">
                    العنوان الفرعي
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => {
                      setFormData({ ...formData, subtitle: e.target.value });
                      setErrors({ ...errors, subtitle: "" });
                    }}
                    className="w-full p-2 border rounded text-right"
                  />
                  {errors.subtitle && (
                    <p className="text-red-500 text-sm">{errors.subtitle}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 text-right">
                    الصورة
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setFormData({ ...formData, image: e.target.files[0] });
                      setErrors({ ...errors, image: "" });
                    }}
                    className="w-full p-2 border rounded text-right"
                  />
                  {errors.image && (
                    <p className="text-red-500 text-sm">{errors.image}</p>
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
