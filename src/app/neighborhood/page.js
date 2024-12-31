"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { Trash2, Edit, Plus } from "lucide-react";

export default function Neighborhoods() {
    const [neighborhoods, setNeighborhoods] = useState([]);
    const [governorates, setGovernorates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add"); // 'add', 'edit', 'delete'
    const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);
    const [formData, setFormData] = useState({
        nameAr: "",
        nameEn: "",
        governorateID: "",
    });
    const [errors, setErrors] = useState([]);
    const [selectedGovernorate, setSelectedGovernorate] = useState("");

    const { isLoggedIn, isLoaded } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded) {
            if (!isLoggedIn) {
                router.push("/");
            }
        }
    }, [isLoaded, isLoggedIn, router]);

    useEffect(() => {
        fetchData();
        fetchGovernorates();
    }, []);

    const fetchGovernorates = async () => {
        try {
            const response = await fetch("/api/governorate");
            const data = await response.json();
            setGovernorates(data);
        } catch (error) {
            console.error("Error fetching governorates:", error);
        }
    };

    const fetchData = async () => {
        try {
            const response = await fetch("/api/governorate/neighborhood");
            const data = await response.json();
            setNeighborhoods(data);
        } catch (error) {
            setError("خطأ في جلب البيانات: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchNeighborhoodsByGovernorate = async (governorateID) => {
        try {
            const response = await fetch(`/api/governorate/neighborhood/governorate/${governorateID}`);
            const data = await response.json();
            setNeighborhoods(data);
        } catch (error) {
            setError("خطأ في جلب الأحياء: " + error.message);
        }
    };

    const handleGovernorateChange = (event) => {
        const governorateID = event.target.value;
        setSelectedGovernorate(governorateID);
        if (governorateID) {
            fetchNeighborhoodsByGovernorate(governorateID);
        } else {
            fetchData(); // إذا لم يتم اختيار محافظة، استرجع جميع الأحياء
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.nameAr) {
            newErrors.nameAr = "يرجى إدخال الاسم بالعربية.";
        }
        if (!formData.nameEn) {
            newErrors.nameEn = "يرجى إدخال الاسم بالإنجليزية.";
        }
        if (!formData.governorateID) {
            newErrors.governorateID = "يرجى اختيار المحافظة.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            let response;
            if (modalMode === "add") {
                response = await fetch("/api/governorate/neighborhood", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        nameAr: formData.nameAr,
                        nameEn: formData.nameEn,
                        governorateID: formData.governorateID,
                    }),
                });
            } else if (modalMode === "edit") {
                response = await fetch(`/api/governorate/neighborhood/${selectedNeighborhood._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
            }

            if (!response.ok) throw new Error("فشلت العملية");
            await fetchData();
            closeModal();
        } catch (error) {
            setError("خطأ: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (mode, neighborhood = null) => {
        setModalMode(mode);
        setSelectedNeighborhood(neighborhood);
        setFormData({
            nameAr: neighborhood?.nameAr || "",
            nameEn: neighborhood?.nameEn || "",
            governorateID: neighborhood?.governorateID || "",
        });
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/governorate/neighborhood/${selectedNeighborhood._id}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("فشل الحذف");
            await fetchData();
            closeModal();
        } catch (error) {
            setError("خطأ في الحذف: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedNeighborhood(null);
        setFormData({ nameAr: "", nameEn: "", governorateID: "" });
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!isLoggedIn) return null;

    return (
        <div className="bg-gray-100 shadow-xl rounded-lg p-6 w-full mt-5">
            <div className="container mx-auto px-4 py-8 rtl">
                <div className="flex justify-between mb-4">
                    <h1 className="text-3xl font-bold">الأحياء</h1>
                    <button
                        onClick={() => openModal("add")}
                        className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
                    >
                        إضافة حي جديد <Plus size={20} />
                    </button>
                </div>

                <div className="mb-4 flex  items-center">
                    <label className="block m-2">اختر المحافظة:</label>
                    <select
                        value={selectedGovernorate}
                        onChange={handleGovernorateChange}
                        className="border px-4 py-1 bg-gray-50"
                    >
                        <option value="">-- كل المحافظات --</option>
                        {governorates.map((gov) => (
                            <option key={gov._id} value={gov._id}>
                                {gov.nameAr}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border">
                        <thead>
                            <tr className="bg-gray-50 text-center">
                                <th className="border p-2">الحي</th>
                                <th className="border p-2">المحافظة</th>
                                <th className="border p-2">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {neighborhoods.map((neighborhood) => (
                                <tr key={neighborhood._id}>
                                    <td className="border p-2 text-center">{neighborhood.nameAr}</td>
                                    <td className="border p-2 text-center">{neighborhood.governorateNameAr||''}</td>
                                    <td className="border p-2">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => openModal("edit", neighborhood)}
                                                className="text-gray-600 hover:text-gray-800"
                                            >
                                                <Edit size={20} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedNeighborhood(neighborhood);
                                                    setModalMode("delete");
                                                    setIsModalOpen(true);
                                                }}
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
                                    <h2 className="text-xl font-semibold mb-4 text-right">تأكيد الحذف</h2>
                                    <p className="text-right mb-4">
                                        هل أنت متأكد من حذف الحي "{selectedNeighborhood?.nameAr}"؟
                                    </p>
                                    <div className="flex justify-start gap-2">
                                        <button
                                            onClick={confirmDelete}
                                            className="px-4 py-2 bg-red-600 text-white rounded"
                                        >
                                            حذف
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
                                        {modalMode === "add" ? "إضافة حي جديد" : "تعديل الحي"}
                                    </h2>
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-4">
                                            <label className="block text-right mb-2">الاسم بالعربية</label>
                                            <input
                                                type="text"
                                                value={formData.nameAr}
                                                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                                                className="w-full p-2 border rounded text-right"
                                            />
                                            {errors.nameAr && (
                                                <p className="text-red-500 text-right">{errors.nameAr}</p>
                                            )}
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-right mb-2">الاسم بالإنجليزية</label>
                                            <input
                                                type="text"
                                                value={formData.nameEn}
                                                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                                                className="w-full p-2 border rounded text-right"
                                            />
                                            {errors.nameEn && (
                                                <p className="text-red-500 text-right">{errors.nameEn}</p>
                                            )}
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-right mb-2">المحافظة</label>
                                            <select
                                                value={formData.governorateID}
                                                onChange={(e) => setFormData({ ...formData, governorateID: e.target.value })}
                                                className="w-full py-2 border rounded text-right"
                                            >
                                                <option value="">اختر المحافظة</option>
                                                {governorates.map((gov) => (
                                                    <option key={gov._id} value={gov._id}>
                                                        {gov.nameAr}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.governorateID && (
                                                <p className="text-red-500 text-right">{errors.governorateID}</p>
                                            )}
                                        </div>
                                        <div className="flex justify-start gap-2">
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-blue-600 text-white rounded"
                                            >
                                                {modalMode === "add" ? "إضافة" : "حفظ"}
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
