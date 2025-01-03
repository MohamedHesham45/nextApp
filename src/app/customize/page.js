"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { Trash2, Edit, Plus } from "lucide-react";

export default function CustomizePage() {
    const [customFields, setCustomFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add"); 
    const [selectedField, setSelectedField] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        value: "",
    });
    const [errors, setErrors] = useState({
        name: "",
        value: "",
    });

    const { isLoggedIn, isLoaded,token ,role} = useAuth();
    const router = useRouter();

    useEffect(() => {
        if(token){
            if (isLoaded) {
                if (isLoggedIn && role==='user') {
                    router.push("/");
                }
            }
        }else{
            router.push("/");
        }
    }, [isLoaded, isLoggedIn, router,token]);

    useEffect(() => {
        fetchCustomFields();
    }, []);

    const fetchCustomFields = async () => {
        try {
            const response = await fetch("/api/customize");
            if (!response.ok) throw new Error("Failed to fetch custom fields");
            const data = await response.json();
            setCustomFields(data);
        } catch (error) {
            setError("Error fetching custom fields: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        // Reset errors
        setErrors({
            name: "",
            value: "",
        });

        let hasError = false;

        // Basic validation
        if (!formData.name || formData.name.trim() === "") {
            setErrors((prevErrors) => ({ ...prevErrors, name: "الاسم مطلوب" }));
            hasError = true;
        }

        if (!formData.value || formData.value.trim() === "") {
            setErrors((prevErrors) => ({ ...prevErrors, value: "القيمة مطلوبة" }));
            hasError = true;
        }

        if (hasError) {
            setSubmitLoading(false);
            return;
        }

        try {
            const url =
                modalMode === "add"
                    ? "/api/customize"
                    : `/api/customize/${selectedField._id}`;

            const method = modalMode === "add" ? "POST" : "PUT";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error("Operation failed");

            await fetchCustomFields();
            closeModal();
        } catch (error) {
            setError("Error: " + error.message);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setSelectedField(customFields.find(field => field._id === id));
        setModalMode('delete');
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        setSubmitLoading(true);
        try {
            const response = await fetch(`/api/customize/${selectedField._id}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Failed to delete");
            await fetchCustomFields();
            closeModal();
        } catch (error) {
            setError("Error deleting: " + error.message);
        } finally {
            setSubmitLoading(false);
        }
    };

    const openModal = (mode, field = null) => {
        setModalMode(mode);
        setSelectedField(field);
        setFormData(field || { name: "", value: "" });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedField(null);
        setFormData({ name: "", value: "" });
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!isLoggedIn) return null;

    return (
        <div className="bg-gray-100 shadow-xl rounded-lg p-6 w-full mt-5">

            <div className="container mx-auto px-4 py-8 rtl text-right">
                <div className="flex justify-between mb-4">
                    <h1 className="text-3xl font-bold mr-0">إدارة الحقول المخصصة</h1>
                    <button
                        onClick={() => openModal("add")}
                        className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
                    >
                        إضافة حقل جديد <Plus size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {customFields.map((field) => (
                        <div key={field._id} className="bg-white border p-4 rounded shadow-lg hover:bg-gray-50">
                            <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-xl font-semibold text-right">{field.name}</h3>
                                <div className="flex gap-2">
                                    
                                    <Edit
                                        className="text-gray-500 hover:cursor-pointer hover:text-blue-700"
                                        onClick={() => openModal("edit", field)}
                                    />
                                </div>
                            </div>
                            <p className="overflow-hidden text-ellipsis whitespace-nowrap text-gray-600 text-right">{field.value}</p>
                        </div>
                    ))}
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded shadow-lg w-96">
                            
                                <>
                                    <h2 className="text-xl font-semibold mb-4 text-right">
                                        {modalMode === "add"
                                            ? "إضافة حقل جديد"
                                            : "تعديل الحقل"}
                                    </h2>
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 mb-2 text-right">الاسم</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                disabled={modalMode === "edit"}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, name: e.target.value })
                                                    setErrors({ ...errors, name: "" })
                                                }}
                                                className="w-full p-2 border rounded text-right"
                                            />
                                            {errors.name && (
                                                <p className="text-red-500 text-sm">{errors.name}</p>
                                            )}
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 mb-2 text-right">القيمة</label>
                                            <input
                                                type="text"
                                                value={formData.value}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, value: e.target.value })
                                                    setErrors({ ...errors, value: "" })
                                                }}
                                                className="w-full p-2 border rounded text-right"
                                            />
                                            {errors.value && (
                                                <p className="text-red-500 text-sm">{errors.value}</p>
                                            )}
                                        </div>
                                        <div className="flex justify-start gap-2">
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-blue-600 text-white rounded"
                                                disabled={submitLoading}
                                            >
                                                {submitLoading ? "جاري الحفظ ..." : modalMode === "add" ? "إضافة" : "حفظ"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    closeModal()
                                                    setErrors({ name: "", value: "" })
                                                }}
                                                className="px-4 py-2 bg-gray-500 text-white rounded"
                                            >
                                                إلغاء
                                            </button>
                                        </div>
                                    </form>
                                </>
                            
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
