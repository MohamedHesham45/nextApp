"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ProductList from "@/components/ProductList";
import ProductForm from "@/components/ProductForm";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

export default function AdminPage() {
  const { token, isLoaded, role, isLoggedIn } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [errorSubmit, setErrorSubmit] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/v2/api/products");
      if (!res.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await res.json();
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
      const res = await fetch("/v2/api/category");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data.categories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories. Please try again later.");
    }
  }, []);
  useEffect(() => {
    if (token) {
      if (isLoaded) {
        if (isLoggedIn && role === "user") {
          router.push("/");
        } else {
          fetchProducts();
          fetchCategories();
        }
      }
    } else {
      router.push("/");
    }
  }, [isLoaded, role, router, token]);

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (product) => {
    try {
      setLoadingDelete(true);
      const res = await fetch(`/v2/api/products/${product._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete product");

      await fetch("/remove-images", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filenames: product.images }),
      });
      if (product.video) {
        await fetch("/remove-videos", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filenames: [product.video] }),
        });
      }

      fetchProducts();
      toast.success("تم حذف المنتج بنجاح");
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء حذف المنتج اعد المحاولة");
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleSubmit = async (productData) => {
    try {
      setLoadingSubmit(true);
      const imagesProduct = productData.getAll("images");
      const finalData = {};
      const imagess = [];
      const images = new FormData();
      const checkImages = [];
      const videoFile = productData.get("video");

      const videoForm = new FormData();
      let newVideoPath = null;
      if (videoFile && typeof videoFile !== "string") {
        videoForm.append("video", videoFile);

        const res = await fetch("/upload-video", {
          method: "POST",
          body: videoForm,
        });

        if (!res.ok) throw new Error("فشل رفع الفيديو");

        const data = await res.json();
        newVideoPath = data.file;

        finalData.video = newVideoPath;
      } else {
        finalData.video = videoFile;
      }

      productData.forEach((value, key) => {
        if (key != "images") {
          finalData[key] = value;
        } else {
          if (typeof value === "string") {
            imagess.push(value);
          }
        }
      });
      if (imagesProduct.length > 0) {
        imagesProduct.forEach((image) => {
          if (typeof image !== "string") {
            images.append("images", image);
          }
        });
        if (images.getAll("images").length > 0) {
          const res = await fetch("/upload-images", {
            method: "POST",
            body: images,
          });
          if (!res.ok) throw new Error("حدث خطأ أثناء رفع الصور حاول مرة أخرى");
          const data = await res.json();
          const checkImages = [];
          data.files.forEach((file) => {
            checkImages.push(file);

            imagess.push(file);
          });
        }
        finalData.images = imagess;
      }
      const method = editingProduct ? "PUT" : "POST";
      const url = editingProduct
        ? `/v2/api/products/${editingProduct._id}`
        : "/v2/api/products";

      const res = await fetch(url, {
        method,

        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        if (checkImages.length > 0) {
          await fetch("/remove-images", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ filenames: checkImages }),
          });
          if (newVideoPath) {
            await fetch("/remove-videos", {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ filenames: [newVideoPath] }),
            });
          }
        }
        throw new Error(errorData.message || "حدث خطأ أثناء إضافة المنتج");
      }

      fetchProducts();
      setIsModalOpen(false);
      toast.success("تم إضافة المنتج بنجاح");
    } catch (err) {
      toast.error(err.message || "حدث خطأ أثناء إضافة المنتج");
      setErrorSubmit(err.message);
      throw new Error(err.message);
    } finally {
      setLoadingSubmit(false);
    }
  };

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
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full">
      <div className="bg-gray-100 shadow-xl rounded-lg p-6 w-full">
        <div className="flex items-center justify-between mb-8 ">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">
            إدارة المنتجات
          </h1>
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
          loadingDelete={loadingDelete}
        />
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
              <ProductForm
                onSubmit={handleSubmit}
                initialData={editingProduct}
                onCancel={() => setIsModalOpen(false)}
                categories={categories}
                loadingSubmit={loadingSubmit}
                errorSubmit={errorSubmit}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
