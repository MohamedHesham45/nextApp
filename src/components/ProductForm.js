import React, {
  useState,
  useEffect,
} from "react";
import { XCircle } from "lucide-react";

const ProductForm = ({
  onSubmit,
  initialData,
  onCancel,
  categories,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [
    discountPercentage,
    setDiscountPercentage,
  ] = useState("");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setImages(initialData.images || []);
      setCategory(initialData.category || "");
      setPrice(initialData.price || "");
      setDiscountPercentage(
        initialData.discountPercentage || ""
      );
    } else {
      setTitle("");
      setDescription("");
      setImages([]);
      setCategory("");
      setPrice("");
      setDiscountPercentage("");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      images,
      category,
      price: parseFloat(price),
      discountPercentage: parseFloat(
        discountPercentage
      ),
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const promises = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) =>
          resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then((results) => {
      setImages((prevImages) => [
        ...prevImages,
        ...results,
      ]);
    });
  };

  const handleDeleteImage = (index) => {
    setImages((prevImages) =>
      prevImages.filter((_, i) => i !== index)
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 bg-white shadow-md rounded px-8 pt-6 pb-8 "
    >
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="title"
        >
          العنوان
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="title"
          type="text"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          required
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="description"
        >
          الوصف
        </label>
        <textarea
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          required
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="category"
        >
          الفئه
        </label>
        <select
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="category"
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
          required
        >
          <option value="">حدد الفئة</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="price"
        >
          السعر
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="price"
          type="number"
          step="0.01"
          value={price}
          onChange={(e) =>
            setPrice(e.target.value)
          }
          required
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="discountPercentage"
        >
          نسبه التخفيض
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="discountPercentage"
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={discountPercentage}
          onChange={(e) =>
            setDiscountPercentage(e.target.value)
          }
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="images"
        >
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
          <p className="block text-gray-700 text-sm font-bold mb-2">
            Current Images:
          </p>
          <div className="flex flex-wrap">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative m-1"
              >
                <img
                  src={image}
                  alt={`Product image ${
                    index + 1
                  }`}
                  className="w-20 h-20 object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleDeleteImage(index)
                  }
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                >
                  <XCircle size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          {initialData
            ? "تحديث المنتج"
            : "إضافة المنتج"}
        </button>
        {initialData && (
          <button
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={onCancel}
          >
            إلغاء
          </button>
        )}
      </div>
    </form>
  );
};

export default ProductForm;
