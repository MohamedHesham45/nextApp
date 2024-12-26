"use client";
import { useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function SignUpModal({ isOpen, onClose, setModalType }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
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

      if(response.ok){
        setModalType("sign-in");
      }

      const data = await response.json();
      
      setMessage(data.message);
      setFormData({ name: "", email: "", password: "" });
    } catch (err) {
      setError(err.message);
    }finally {
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
      className="fixed inset-0 backdrop-blur-lg flex items-center justify-center z-50 px-5 backdrop-brightness-75"
    >
      <div
        className="bg-white p-6 rounded-md shadow-2xl w-96"
        onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
      >
        <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
        {message && <p className="text-green-500">{message}</p>}
        {error && <p className="text-red-500">{error}</p>}
        {isLoading ? ( 
          <LoadingSpinner />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Name
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
                Email
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
                Password
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
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-full hover:bg-blue-600"
            >
              Sign Up
            </button>
          </form>
        )}
        <div className="mt-4 text-sm text-center">
          Already have an account?{" "}
          <button
            onClick={() => setModalType('sign-in')}
            className="text-blue-500 hover:underline"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
