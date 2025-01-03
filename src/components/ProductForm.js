import React, { useState, useEffect } from "react";
import { XCircle } from "lucide-react";

const ProductForm = ({ onSubmit, initialData, onCancel, categories,loadingSubmit ,errorSubmit }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState({});
  const [price, setPrice] = useState("");
  const [priceAfterDiscount, setPriceAfterDiscount] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState({});

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
      setQuantity(1);
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setErrors({});

    const newErrors = {};
    if (!title) newErrors.title = "العنوان مطلوب";
    if (!description) newErrors.description = "الوصف مطلوب";
    if (!category._id) newErrors.category = "الفئة مطلوبة";
    if (!price) newErrors.price = "السعر مطلوب";
    if (images.length === 0) newErrors.images = "الصور مطلوبة";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

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

    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors({ backend: errorSubmit });
      console.log("errorSubmit",errorSubmit)
    }
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
          onChange={(e) =>{
            setTitle(e.target.value)
            setErrors({...errors,title:null,backend:null})
          }}
          />
          {errors.title && <p className="text-red-500">{errors.title}</p>}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
          الوصف
        </label>
        <textarea
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="description"
          value={description}
          onChange={(e) =>{
            setDescription(e.target.value)
            setErrors({...errors,description:null,backend:null})
          }}
        />
        {errors.description && <p className="text-red-500">{errors.description}</p>}
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
            onChange={(e) =>{
              setCategory(JSON.parse(e.target.value))
              setErrors({...errors,category:null,backend:null})
            }}
          >
            <option value="">حدد الفئة</option>
            {categories.map((cat, index) => (
              <option key={index} value={JSON.stringify(cat)}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-red-500">{errors.category}</p>}
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
            onChange={(e) =>{
              setPrice(e.target.value)
              setErrors({...errors,price:null,backend:null})
            }}
          />
          {errors.price && <p className="text-red-500">{errors.price}</p>}
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
          onChange={(e)=>{
            handleImageUpload(e)
            setErrors({...errors,images:null,backend:null})
          }}
        />
        {errors.images && <p className="text-red-500">{errors.images}</p>}
      </div>
      {images.length > 0 && (
        <div className="mb-4">
          <p className="block text-gray-700 text-sm font-bold mb-2">Current Images:</p>
          <div className="flex flex-wrap">
            {images.map((image, index) => (
              <div key={index} className="relative m-1">
                <img src={typeof image === 'string' ? image : URL.createObjectURL(image)} alt={`Image ${index}`} className="w-20 h-20 object-cover" />
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
          disabled={loadingSubmit}
        >
         {loadingSubmit ? "جاري التحديث..." : initialData ? "تحديث المنتج" : "إضافة المنتج"}
        </button>
        
          <button
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={onCancel}
          >
            إلغاء
          </button>
        
      </div>
      {errors.backend && <p className="text-red-500">{errors.backend}</p>}
    </form>
  );
};

export default ProductForm;
