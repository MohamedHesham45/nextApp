import React, { useState, useEffect } from "react";
import { XCircle } from "lucide-react";
import dynamic from "next/dynamic";
import imageCompression from "browser-image-compression";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }],
    [{ script: "sub" }, { script: "super" }],
    ["blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }],
    [{ align: [] }],
    ["link"],
    ["clean"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "script",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "direction",
  "align",
  "link",
];

const ProductForm = ({
  onSubmit,
  initialData,
  onCancel,
  categories,
  loadingSubmit,
  errorSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState({});
  const [price, setPrice] = useState("");
  const [priceAfterDiscount, setPriceAfterDiscount] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState({});
  const [video, setVideo] = useState(null);
  const [videoError, setVideoError] = useState("");

  useEffect(() => {
    if (initialData) {
      const category = categories.find(
        (cat) => cat._id === initialData.categoryId._id
      );
      setTitle(initialData.title);
      setDescription(initialData.description);
      setImages(initialData.images || []);
      setCategory(category || {});
      setPrice(initialData.price || "");
      setPriceAfterDiscount(initialData.priceAfterDiscount || "");
      setQuantity(initialData.quantity || 1);
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
    formData.append("priceAfterDiscount", parseFloat(priceAfterDiscount) || 0);
    formData.append("categoryId", category._id);
    formData.append("quantity", parseInt(quantity, 10));
    images.forEach((image) => {
      formData.append(`images`, image);
    });
    if (video) {
      formData.append("video", video);
    }

    try {
      await onSubmit(formData);

      var userAgent = navigator.userAgent;

      fetch("https://api.ipify.org?format=json")
        .then((response) => response.json())
        .then(async (data) => {
          var ipAddress = data.ip;
          fbq("trackCustom", "AddProduct", {
            product_name: formData.title,
            product_category: formData.category,
            // product_ids: [product._id],
            product_image: "https://sitaramall.com/" + formData.images[0],
            product_price: formData.price,
            product_price_after_discount:
              formData.priceAfterDiscount || formData.price,
            product_quantity: formData.quantity,
            product_images: formData.images.map(
              (image) => "https://sitaramall.com/" + image
            ),
            value: formData.priceAfterDiscount || formData.price,
            currency: "EGP",
            ip_address: ipAddress,
            user_agent: userAgent,
          });
        })
        .catch((error) => console.error("Error fetching IP address:", error));
    } catch (error) {
      setErrors({ backend: errorSubmit });
    }
  };
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const processedFiles = [];

    for (let file of files) {
      try {
        const compressionOptions = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };

        if (file.size > compressionOptions.maxSizeMB * 1024 * 1024) {
          const compressedFile = await imageCompression(
            file,
            compressionOptions
          );

          const renamedFile = new File(
            [compressedFile],
            "updated_image_" + new Date().getTime() + ".jpg",
            { type: compressedFile.type }
          );

          processedFiles.push(renamedFile);
        } else {
          processedFiles.push(file);
        }
      } catch (error) {
        console.error("Error compressing file:", error);
      }
    }

    setImages((prevImages) => [...prevImages, ...processedFiles]);
  };
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setVideoError("");

    if (!file.type.startsWith("video/")) {
      setVideoError("يجب اختيار فيديو فقط");
      return;
    }

    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.src = url;

    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        if (video.duration > 300) {
          setVideoError("المدة يجب أن تكون أقل من 5 دقائق");
          return;
        }
        resolve();
      };
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const maxHeight = 480;
    const scale = maxHeight / video.videoHeight;

    canvas.width = video.videoWidth * scale;
    canvas.height = maxHeight;

    const stream = canvas.captureStream();
    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm",
      videoBitsPerSecond: 700000,
    });

    const chunks = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };

    recorder.start();

    video.play();

    const draw = () => {
      if (!video.paused && !video.ended) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        requestAnimationFrame(draw);
      }
    };
    draw();

    await new Promise((resolve) => {
      video.onended = () => resolve();
    });

    recorder.stop();

    const compressedBlob = await new Promise((resolve) => {
      recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
    });

    const compressedFile = new File(
      [compressedBlob],
      "compressed_" + Date.now() + ".webm",
      { type: "video/webm" }
    );

    setVideo(compressedFile);
  };

  const handleDeleteImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  return (
    <div className="max-h-screen overflow-y-auto ">
      <form onSubmit={handleSubmit} className="direction-rtl my-8 mx-4">
        <div className="mb-4 ">
          <label
            className="block text-gray-700 text-sm font-bold mb-2 "
            htmlFor="title"
          >
            العنوان
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setErrors({ ...errors, title: null, backend: null });
            }}
          />
          {errors.title && <p className="text-red-500">{errors.title}</p>}
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="description"
          >
            الوصف
          </label>
          <div>
            <ReactQuill
              theme="snow"
              value={description}
              onChange={(content) => {
                setDescription(content);
                setErrors({ ...errors, description: null, backend: null });
              }}
              modules={modules}
              formats={formats}
              className="h-full direction-rtl"
            />
          </div>
          {errors.description && (
            <p className="text-red-500">{errors.description}</p>
          )}
        </div>
        <div className="flex justify-between gap-2">
          <div className="mb-4 w-full">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="category"
            >
              الفئه
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="category"
              value={JSON.stringify(category)}
              onChange={(e) => {
                setCategory(JSON.parse(e.target.value));
                setErrors({ ...errors, category: null, backend: null });
              }}
            >
              <option value="">حدد الفئة</option>
              {categories.map((cat, index) => (
                <option key={index} value={JSON.stringify(cat)}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500">{errors.category}</p>
            )}
          </div>
          <div className="mb-4 w-full">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="quantity"
            >
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
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="price"
            >
              السعر
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 text-gray-700 focus:outline-none focus:shadow-outline"
              id="price"
              type="number"
              min="0"
              step="1"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                setErrors({ ...errors, price: null, backend: null });
              }}
            />
            {errors.price && <p className="text-red-500">{errors.price}</p>}
          </div>
          <div className="mb-4 w-full">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="priceAfterDiscount"
            >
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
            onChange={(e) => {
              handleImageUpload(e);
              setErrors({ ...errors, images: null, backend: null });
            }}
          />
          {errors.images && <p className="text-red-500">{errors.images}</p>}
        </div>
        {images.length > 0 && (
          <div className="mb-4">
            <p className="block text-gray-700 text-sm font-bold mb-2">
              Current Images:
            </p>
            <div className="flex flex-wrap">
              {images.map((image, index) => (
                <div key={index} className="relative m-1">
                  <img
                    src={
                      typeof image === "string"
                        ? image?.startsWith("/")
                          ? image
                          : `/${image}`
                        : URL.createObjectURL(image)
                    }
                    alt={`Image ${index}`}
                    className="w-20 h-20 object-cover"
                  />
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
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            إضافة فيديو (اختياري)
          </label>

          <input
            type="file"
            accept="video/*"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            onChange={handleVideoUpload}
          />

          {videoError && <p className="text-red-500">{videoError}</p>}

          {/* {video && (
            <video
              controls
              src={
                typeof video === "string"
                  ? video?.startsWith("/")
                    ? video
                    : `/${video}`
                  : URL.createObjectURL(video)
              }
              className="mt-2 w-40 rounded"
            />
          )} */}
        </div>

        <div className="flex justify-end gap-2">
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={loadingSubmit}
          >
            {loadingSubmit
              ? "جاري التحديث..."
              : initialData
              ? "تحديث المنتج"
              : "إضافة المنتج"}
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
    </div>
  );
};

export default ProductForm;
