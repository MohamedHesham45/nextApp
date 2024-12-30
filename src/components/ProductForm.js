import React, { useState, useEffect } from "react";
import { XCircle } from "lucide-react";

const ProductForm = ({ onSubmit, initialData, onCancel, categories }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState({});
  const [price, setPrice] = useState("");
  const [priceAfterDiscount, setPriceAfterDiscount] = useState("");
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    if (initialData) {
      const category=categories.find(cat=>cat._id===initialData.categoryId)
      setTitle(initialData.title);
      setDescription(initialData.description);
      setImages(initialData.images || []);
      setCategory(category||{});
      setPrice(initialData.price || "");
      setPriceAfterDiscount(initialData.priceAfterDiscount || "");
      setQuantity(initialData.quantity || "");
      
    } else {
      setTitle("");
      setDescription("");
      setImages([]);
      setCategory({});
      setPrice("");
      setPriceAfterDiscount("");
      setQuantity("");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category.name);
    formData.append("price", parseFloat(price));
    formData.append("priceAfterDiscount", parseFloat(priceAfterDiscount));
    formData.append("categoryId", category._id);
    formData.append("quantity", parseInt(quantity, 10));
    images.forEach((image) => {
      formData.append(`images`, image);
    });

    onSubmit(formData);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const handleDeleteImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="direction-rtl">
      <div className="mb-4 ">
        <label className="block text-gray-700 text-sm font-bold mb-2 " htmlFor="title">
          العنوان
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
          الوصف
        </label>
        <textarea
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div className="flex justify-between gap-2">
        <div className="mb-4 w-full">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
            الفئه
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="category"
            value={JSON.stringify(category)}
            onChange={(e) => setCategory(JSON.parse(e.target.value))}
            required
          >
            <option value="">حدد الفئة</option>
            {categories.map((cat, index) => (
              <option key={index} value={JSON.stringify(cat)}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4 w-full">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">
            الكمية
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="flex justify-between gap-2">
        <div className="mb-4 w-full">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
            السعر
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 text-gray-700 focus:outline-none focus:shadow-outline"
            id="price"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div className="mb-4 w-full">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="priceAfterDiscount">
            السعر بعد التخفيض
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 text-gray-700 focus:outline-none focus:shadow-outline"
            id="priceAfterDiscount"
            type="number"
            step="0.1"
            value={priceAfterDiscount}
            onChange={(e) => setPriceAfterDiscount(e.target.value)}
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="images">
          اضافه صور
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="images"
          type="file"
          multiple
          onChange={handleImageUpload}
        />
      </div>
      {images.length > 0 && (
        <div className="mb-4">
          <p className="block text-gray-700 text-sm font-bold mb-2">Current Images:</p>
          <div className="flex flex-wrap">
            {images.map((image, index) => (
              <div key={index} className="relative m-1">
                <p className="text-gray-700 text-xs">{image.name}</p>
                <button
                  type="button"
                  onClick={() => handleDeleteImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                >
                  <XCircle size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex justify-end gap-2">
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          {initialData ? "تحديث المنتج" : "إضافة المنتج"}
        </button>
        
          <button
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={onCancel}
          >
            إلغاء
          </button>
        
      </div>
    </form>
  );
};

export default ProductForm;
