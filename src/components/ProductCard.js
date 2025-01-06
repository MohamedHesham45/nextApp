import React, { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import DOMPurify from 'dompurify';
export const sanitizeHTML = (dirty) => {
  return DOMPurify.sanitize(dirty);
};

const ProductCard = ({
  product,
  onEdit,
  onDelete,
  loadingDelete,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const discountedPrice =
    product.price *
    (1 - product.discountPercentage / 100);
    

  return (
    <div className="m-5 relative flex flex-col w-full max-w-sm mx-auto rounded-xl bg-white bg-clip-border text-gray-700 shadow-md direction-rtl">
      <div className="relative mx-4 -mt-6 h-40 overflow-hidden rounded-xl bg-blue-gray-500 bg-clip-border text-white shadow-lg shadow-blue-gray-500/40 bg-gradient-to-r">
        {product.images && product.images.length > 0 ? (
          <Swiper
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
          >
            {product.images.map((image, index) => (
              <SwiperSlide key={index}>
                <img
                  src={image?.startsWith('/') ? image : `/${image}` || "/1.jpg"}
                  alt={`Product Image ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <img
            src="/1.jpg"
            alt="Placeholder"
            className="object-cover w-full h-full"
          />
        )}
        {product.quantity == 0 && <span className="absolute top-2 left-2 bg-blue-600 text-white text-sm font-bold px-2 py-1 rounded-md shadow-lg z-10">نفذت الكمية</span>}
        {product.discountPercentage > 0 && <span className="absolute top-2 right-2 bg-red-600 text-white text-sm font-bold px-2 py-1 rounded-md shadow-lg z-10">
          خصم {product.discountPercentage.toFixed(1)}%
        </span>}
      </div>

      <div className="p-6">
        <span className="block mb-2 text-sm font-medium text-gray-600">
          كود مرجعي: <span className="text-blue-600">{product.referenceCode}</span>
        </span>

        <span className="block mb-1 text-sm font-medium text-gray-600">
          فئة المنتج: <span className="text-blue-600">{product.category || "Uncategorized"}</span>
        </span>

        <h5 className="mb-2 block text-xl font-semibold leading-snug tracking-normal text-blue-gray-900 antialiased">
          {product.title}
        </h5>
        {/* <p className="block text-base font-light leading-relaxed text-inherit antialiased truncate-lines">
          {product.description}
        </p> */}
        <div className="block text-base font-light leading-relaxed text-inherit antialiased truncate-lines" dangerouslySetInnerHTML={{ __html: sanitizeHTML(product.description) }} />

        <span>الكمية المتاحة: <span className="text-green-600">{product.quantity}</span></span>

        {product.discountPercentage > 0 ? (
          <div className="mt-4 flex justify-between text-sm font-medium text-gray-700">
            <span>قبل الخصم: <span className="text-red-600 line-through">{product.price.toFixed(2)}</span></span>
            <span>بعد الخصم: <span className="text-green-600">{discountedPrice.toFixed(2)}</span></span>
          </div>
        ) : (
          <div className="mt-4 flex justify-between text-sm font-medium text-gray-700">
            <span>السعر: <span className="text-green-600">{product.price.toFixed(2)}</span></span>
          </div>
        )}
      </div>

      <div className="px-10">
        <div className="flex justify-around items-center py-3 border-t pt-2 space-x-4">
          <div className="flex gap-2 text-gray-600 hover:scale-110 duration-200 hover:cursor-pointer" onClick={() => onEdit(product)}>
            <Edit className="text-green-700" />
            <button className="font-semibold text-sm text-green-700">تعديل</button>
          </div>
          <div className="flex gap-2 text-gray-600 hover:scale-110 duration-200 hover:cursor-pointer" onClick={() => setIsModalOpen(true)}>
            <Trash2 className="text-red-600" />
            <button className="font-semibold text-sm text-red-600">حذف</button>
          </div>
        </div>
      </div>

      {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-1/3">
                        <h3 className="text-xl font-semibold mb-4">هل تريد حذف المنتج:{product.title}؟</h3>
                        <div className="flex justify-end">
                            <button
                                className="px-4 py-2 bg-red-600 text-white rounded"
                                onClick={() => onDelete(product)}
                                disabled={loadingDelete}
                            >
                                {loadingDelete ? "جاري الحذف..." : "تأكيد"}
                            </button>
                            <button
                                className="px-4 py-2 bg-gray-500 text-white rounded mr-2"
                                onClick={() => setIsModalOpen(false)}
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
    </div>
  );
};

export default ProductCard;
