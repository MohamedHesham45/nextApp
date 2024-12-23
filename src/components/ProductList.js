import React, { useState } from "react";
import ProductCard from "./ProductCard";

const ProductList = ({
  products,
  onEdit,
  onDelete,
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
    <div>
      <div className="mb-4">
        <label
          htmlFor="category-filter"
          className="mr-2"
        >
          Filter by category:
        </label>
        <select
          id="category-filter"
          value={selectedCategory}
          onChange={(e) =>
            setSelectedCategory(e.target.value)
          }
          className="border rounded py-2 px-3"
        >
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
