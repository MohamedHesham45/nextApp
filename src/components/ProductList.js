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
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    "All",
    ...new Set(
      products.map((product) => product.category)
    ),
  ];

  const filteredProducts = products
    .filter((product) =>
      selectedCategory === "All" || product.category === selectedCategory
    )
    .filter((product) => {
      const productName = product?.title?.toLowerCase() || "";
      return productName.includes(searchTerm.trim().toLowerCase());
    });

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
          className="border rounded bg-gray-50  mx-3 p-1 border-gray-300"
        >
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="search-input" className="mr-2">
          بحث:
        </label>
        <input
          id="search-input"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded bg-gray-50 h-10 mx-3 p-4 border-gray-300"
          placeholder="بحث..."
        />
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
