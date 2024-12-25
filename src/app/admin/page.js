"use client";

import React, {
  useState,
  useEffect,
  useCallback,
} from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import ProductList from "@/components/ProductList";
import ProductForm from "@/components/ProductForm";
import CategoryManager from "@/components/CategoryManager";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] =
    useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState(
    []
  );

  const isAuthorized = useCallback((user) => {
    const authorizedEmails = [
      "aliellool202020@gmail.com",
      "sitaramall97@gmail.com",
      "mohmedadm733@gmail.com",
      "muhammedreda6@gmail.com",
      "mohmedhesham2024@gmail.com"
    ];
    return authorizedEmails.includes(
      user?.primaryEmailAddress?.emailAddress
    );
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      if (!res.ok) {
        throw new Error(
          "Failed to fetch products"
        );
      }
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(
        "Error fetching products:",
        err
      );
      setError(
        "Failed to load products. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push("/sign-in");
      } else if (!isAuthorized(user)) {
        router.push("/");
      } else if (
        !localStorage.getItem(
          "adminPasscodeVerified"
        )
      ) {
        router.push("/verify-passcode");
      } else {
        fetchProducts();
        const storedCategories =
          localStorage.getItem("categories");
        if (storedCategories) {
          setCategories(
            JSON.parse(storedCategories)
          );
        }
      }
    }
  }, [
    isLoaded,
    user,
    isAuthorized,
    router,
    fetchProducts,
  ]);

  const handleSubmit = async (productData) => {
    try {
      const method = editingProduct
        ? "PUT"
        : "POST";
      const url = editingProduct
        ? `/api/products/${editingProduct._id}`
        : "/api/products";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        throw new Error("Failed to save product");
      }

      fetchProducts();
      setEditingProduct(null);
    } catch (err) {
      console.error(err);
      alert(
        "Failed to save product. Please try again."
      );
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleDelete = async (productId) => {
    try {
      const res = await fetch(
        `/api/products/${productId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error(
          "Failed to delete product"
        );
      }

      fetchProducts();
    } catch (err) {
      console.error(err);
      alert(
        "Failed to delete product. Please try again."
      );
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleCategoryChange = (
    newCategories
  ) => {
    setCategories(newCategories);
    localStorage.setItem(
      "categories",
      JSON.stringify(newCategories)
    );
  };

  const handleDeleteCategory = (
    categoryToDelete
  ) => {
    const updatedCategories = categories.filter(
      (category) => category !== categoryToDelete
    );
    setCategories(updatedCategories);
    localStorage.setItem(
      "categories",
      JSON.stringify(updatedCategories)
    );
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Product Management
      </h1>
      <CategoryManager
        categories={categories}
        onCategoryChange={handleCategoryChange}
        onDeleteCategory={handleDeleteCategory}
      />
      <ProductForm
        onSubmit={handleSubmit}
        initialData={editingProduct}
        onCancel={handleCancelEdit}
        categories={categories}
      />
      <ProductList
        products={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
