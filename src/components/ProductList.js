import React, { useState } from "react";
import ProductCard from "./ProductCard";
import { Edit, Trash2 } from "lucide-react";

const ProductList = ({
  products,
  onEdit,
  onDelete,
  loadingDelete,
}) => {
  const [selectedCategory, setSelectedCategory] =
    useState("All");
  const categories = [
    "All",
    ...new Set(
      products.map((product) => product.category)
    ),
  ];

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter(
        (product) =>
          product.category === selectedCategory
      );

  return (
    <div className="">
      <div className="mb-4">
        <label
          htmlFor="category-filter"
          className="mr-2"
        >
          تصفية حسب الفئة: 
        </label>
        <select
          id="category-filter"
          value={selectedCategory}
          onChange={(e) =>
            setSelectedCategory(e.target.value)
          }
          className="border rounded bg-gray-50"
        >
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <h3 className="text-xl font-semibold text-gray-700 mb-5 text-center">
        المنتجات الحالية
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4  direction-rtl">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onEdit={onEdit}
            onDelete={onDelete}
            loadingDelete={loadingDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
