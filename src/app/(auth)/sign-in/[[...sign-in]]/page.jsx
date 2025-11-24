"use client";
import { useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/app/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function SignInModal({ isOpen, onClose, setModalType }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setValidationError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Sign-In failed");
      }

      const data = await response.json();

      const { token, profile } = data;
      login(token, profile);

      onClose();
    } catch (err) {
      setValidationError("اسم المستخدم أو كلمة المرور غير صحيحة.");
      console.error(err.message);
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
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="text-2xl font-bold mb-4">تسجيل الدخول</h1>
        {validationError && (
          <p className="text-red-500 mb-4">{validationError}</p>
        )}

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1"
              >
                كلمة السر
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-2 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 rounded-full text-white py-2 hover:bg-blue-600"
            >
              تسجيل الدخول
            </button>
          </form>
        )}
        <div className="mt-4 text-sm text-center">
          لا تمتلك حساب؟{" "}
          <button
            onClick={() => setModalType("sign-up")}
            className="text-blue-500 hover:underline"
          >
            إنشاء حساب
          </button>
        </div>
      </div>
    </div>
  );
}
