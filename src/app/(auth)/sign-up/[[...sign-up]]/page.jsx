"use client";
import { useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function SignUpModal({ isOpen, onClose, setModalType }) {
  const [formData, setFormData] = useState({
    centerArea: "",
    email: "",
    governorate: "",
    name: "",
    neighborhood: "",
    phone: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Signup failed");
      }

      if (response.ok) {
        setModalType("sign-in");
      }

      const data = await response.json();

      setMessage(data.message);
      setFormData({ name: "", email: "", password: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target.id === "modal-backdrop") {
      onClose();
    }
  };

  if (!isOpen) return null;


  return (
    <div
      id="modal-backdrop"
      onClick={handleBackdropClick}
      className="direction-rtl fixed inset-0 backdrop-blur-lg flex items-center justify-center z-50 px-5 backdrop-brightness-75"
    >
      <div
        className="bg-white p-6 rounded-md shadow-2xl w-96"
        onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
      >
        <h1 className="text-2xl font-bold mb-4">حساب جديد</h1>
        {message && <p className="text-green-500">{message}</p>}
        {error && <p className="text-red-500">{error}</p>}
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                الأسم
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                كلمة السر
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {/* Central Area and Governorate in one line */}
            <div className="flex gap-2">
              <div className="w-1/2">
                <label htmlFor="centerArea" className="block text-sm font-medium mb-1">
                  المنطقة المركزية
                </label>
                <input
                  type="text"
                  id="centerArea"
                  name="centerArea"
                  value={formData.centerArea}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="w-1/2">
                <label htmlFor="governorate" className="block text-sm font-medium mb-1">
                  المحافظة
                </label>
                <input
                  type="text"
                  id="governorate"
                  name="governorate"
                  value={formData.governorate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <div className="w-1/2">
                <label htmlFor="neighborhood" className="block text-sm font-medium mb-1">
                  الحي
                </label>
                <input
                  type="text"
                  id="neighborhood"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="w-1/2">
                <label htmlFor="phone" className="block text-sm font-medium mb-1">
                  رقم الهاتف
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-full hover:bg-blue-600"
            >
              إنشاء حساب
            </button>
          </form>

        )}
        <div className="mt-4 text-sm text-center">
          هل لديك حساب بالفعل؟{" "}
          <button
            onClick={() => setModalType('sign-in')}
            className="text-blue-500 hover:underline"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    </div>
  );
}
