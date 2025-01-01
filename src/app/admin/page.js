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
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      if (err.status === 502) {
        fetchProducts();
      }
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

  const handleDelete = async (product) => {
    try {
      setLoadingDelete(true)
      const res = await fetch(`/api/products/${product._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete product");
      
      await fetch("https://93.127.202.37:3001/remove-images", {
        method: "DELETE",
        headers:{
          "Content-Type":"application/json"
        },
        body: JSON.stringify({ filenames: product.images })
      });
      
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to delete product. Please try again.");
    } finally {
      setLoadingDelete(false)
    }
  };

  const handleSubmit = async (productData) => {
    try {
      setLoadingSubmit(true)
      const imagesProduct=productData.getAll("images")
      const finalData={}
      const imagess=[]
      productData.forEach((value,key)=>{
        if(key!="images"){
          finalData[key]=value
        }else{
          if(typeof value==="string"){
            imagess.push(value)
          }
        }
      })
      if(imagesProduct.length>0){
        const images=new FormData()
        imagesProduct.forEach(image=>{
          images.append("images",image)
        })
        
        const res=await fetch("/upload-images",{
          method:"POST",
          body: images
        })
        if(!res.ok)throw new Error("Failed to upload images")
        const data=await res.json()
        data.files.forEach(file=>{
          imagess.push(file)
        })
        finalData.images=imagess
      }
      const method = editingProduct ? "PUT" : "POST";
      const url = editingProduct
        ? `/api/products/${editingProduct._id}`
        : "/api/products";
      const res = await fetch(url, { method
        ,
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify(finalData) });
      if (!res.ok) throw new Error("Failed to save product");
      fetchProducts();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save product. Please try again.");
    } finally {
      setLoadingSubmit(false)
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
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const data = [
  {
    category: "كوشن",
    products: [
      {
        name: "كوشن 1",
        price: 100,
      },
      {
        name: "كوشن 2",
        price: 200,
      },
    ],
  },
  {
    category: "ستاير",
    products: [
      {
        name: "ستاير 1",
        price: 300,
      },
      {
        name: "ستاير 2",
        price: 400,
      },
    ],
  },
];
