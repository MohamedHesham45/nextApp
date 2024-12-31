"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ProductList from "@/components/ProductList";
import ProductForm from "@/components/ProductForm";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";

export default function AdminPage() {
  const { email, isLoaded } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      const data = await res.json();
      console.log(data);
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/category");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data.categories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories. Please try again later.");
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      if (!email) {
        router.push("/");
      } else {
        fetchProducts();
        fetchCategories();
      }
    }
  }, [isLoaded, email, router, fetchProducts, fetchCategories]);

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (productId) => {
    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete product");
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to delete product. Please try again.");
    }
  };

  const handleSubmit = async (productData) => {
    try {
      const method = editingProduct ? "PUT" : "POST";
      const url = editingProduct
        ? `/api/products/${editingProduct._id}`
        : "/api/products";
      const res = await fetch(url, { method, body: productData });
      if (!res.ok) throw new Error("Failed to save product");
      fetchProducts();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save product. Please try again.");
    }
  };

  if (!isLoaded || loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchProducts}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full">
      <div className="bg-gray-100 shadow-xl rounded-lg p-6 w-full">
        <div className="flex items-center justify-between mb-8 ">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">إدارة المنتجات</h1>
          <button
            onClick={handleCreate}
            className="mb-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            إضافة منتج جديد +
          </button>
        </div>
        <ProductList
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
              <ProductForm
                onSubmit={handleSubmit}
                initialData={editingProduct}
                onCancel={() => setIsModalOpen(false)}
                categories={categories}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
