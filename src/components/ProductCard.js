import React from "react";
import Image from "next/image";

const ProductCard = ({
  product,
  onEdit,
  onDelete,
}) => {
  const discountedPrice =
    product.price *
    (1 - product.discountPercentage / 100);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 m-2">
      <h2 className="text-xl font-bold mb-2">
        {product.title}
      </h2>
      <p className="text-gray-600 mb-2">
        {product.description}
      </p>
      <p className="text-blue-600 mb-2">
        Reference Code: {product.referenceCode}
      </p>
      <p className="text-green-600 font-bold mb-2">
        :السعر الأصلي
        {product.price.toFixed(2)}
      </p>
      {product.discountPercentage > 0 && (
        <>
          <p className="text-red-600 font-bold mb-2">
            {product.discountPercentage} الخصم %
          </p>
          <p className="text-green-600 font-bold mb-2">
            :الآن
            {discountedPrice.toFixed(2)}
          </p>
        </>
      )}
      <p className="text-blue-600 mb-4">
        الفئة
        {product.category || "Uncategorized"}
      </p>
      <div className="flex flex-wrap mb-4">
        {product.images &&
          product.images.map((image, index) => (
            <Image
              key={index}
              src={image}
              alt={`${product.title} - Image ${
                index + 1
              }`}
              width={100}
              height={100}
              className="rounded-md m-1"
            />
          ))}
      </div>
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => onEdit(product)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          تعديل
        </button>
        <button
          onClick={() => onDelete(product._id)}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          حذف
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
