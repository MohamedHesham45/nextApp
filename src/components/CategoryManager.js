"use client"
import React, { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { Edit, Trash2 } from "lucide-react";
import { toast } from 'react-hot-toast';

const CategoryManager = ({ onCategoryChange, onDeleteCategory }) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [minCount, setMinCount] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [errorSubmit, setErrorSubmit] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/category");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories);
        } else {
          console.error("Failed to fetch categories");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const addCategory = async () => {
    if (newCategory && !categories.find((cat) => cat.name === newCategory)) {
      try {
        setIsLoading(true);
        setErrorSubmit(true)
        const response = await fetch("/api/category", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: newCategory, minCount }),
        });

        if (response.ok) {
          const createdCategory = await response.json();
          const updatedCategories = [...categories, createdCategory];
          setCategories(updatedCategories);
          setNewCategory("");
          setMinCount(1);
          onCategoryChange(updatedCategories);
          setIsModalOpen(false);
          toast.success('تم إضافة الفئة بنجاح')
        } else {
          console.error("Failed to add category");
          const errorData = await response.json();
          setErrorMessage(errorData.error || "حدث خطأ أثناء إضافة الفئة");
          toast.error(errorData.error || "حدث خطأ أثناء إضافة الفئة")
        }
      } catch (error) {
        console.error("Error adding category:", error);

      } finally {
        setIsLoading(false);
        setErrorSubmit(false)
      }
    } else if (!newCategory) {
      setErrorMessage("اسم الفئة مطلوب");
    } else if (categories.find((cat) => cat.name === newCategory)) {
      setErrorMessage("الفئة موجودة بالفعل");
    }
  };

  const handleDeleteCategory = async () => {
    if (categoryToDelete) {
      try {
        setIsLoading(true);
        setErrorSubmit(true)
        const response = await fetch(`/api/category/${categoryToDelete._id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          const updatedCategories = categories.filter(
            (cat) => cat._id !== categoryToDelete._id
          );
          setCategories(updatedCategories);
          onCategoryChange(updatedCategories);
          setIsDeleteModalOpen(false);
          toast.success('تم حذف الفئة بنجاح')
        } else {
          toast.error(errorData.error || "حدث خطأ أثناء حذف الفئة")
          console.error("Failed to delete category");
          const errorData = await response.json();
          setErrorMessage(errorData.error || "حدث خطأ أثناء حذف الفئة");

        }
      } catch (error) {
        console.error("Error deleting category:", error);
      } finally {
        setIsLoading(false);
        setErrorSubmit(false)
      }
    }
  };

  const editCategory = async () => {
    if (categoryToEdit && newCategory) {
      try {
        setIsLoading(true);
        setErrorSubmit(true);
        const response = await fetch(`/api/category/${categoryToEdit._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: newCategory, minCount }),
        });

        if (response.ok) {
          const updatedCategory = await response.json();
          const updatedCategories = categories.map((cat) =>
            cat._id === categoryToEdit._id ? updatedCategory : cat
          );
          setCategories(updatedCategories);
          onCategoryChange(updatedCategories);
          setIsModalOpen(false);
          setNewCategory("");
          setMinCount(1);
          setCategoryToEdit(null);
          setIsEditing(false);
          toast.success('تم تعديل الفئة بنجاح');
        } else {
          const errorData = await response.json();
          setErrorMessage(errorData.error || "حدث خطأ أثناء تعديل الفئة");
          toast.error(errorData.error || "حدث خطأ أثناء تعديل الفئة");
        }
      } catch (error) {
        console.error("Error editing category:", error);
      } finally {
        setIsLoading(false);
        setErrorSubmit(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full direction-rtl">
      <div className="bg-gray-100 shadow-xl rounded-lg p-6 w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            إدارة الفئات
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-6"
          >
            إضافة فئة جديدة +
          </button>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-5 text-center">
            الفئات الحالية
          </h3>
          {isLoading ? (
            <div className="flex justify-center items-center mt-4">
              <LoadingSpinner />
            </div>
          ) : categories.length === 0 ? (
            <div className="flex justify-center items-center mt-4 text-gray-600">
              <p>لايوجد فئات</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm"
                >
                  <div>
                    <p className="text-gray-800 font-semibold">{category.name}</p>
                    <p className="text-gray-600 text-sm">
                      الحد الأدنى: {category.minCount}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setCategoryToEdit(category);
                        setNewCategory(category.name);
                        setMinCount(category.minCount);
                        setIsModalOpen(true);
                      }}
                      className="text-gray-500 hover:cursor-pointer hover:text-blue-700"
                    >
                      <Edit />
                    </button>
                    <button
                      onClick={() => {
                        setCategoryToDelete(category);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-500 hover:text-red-700 font-bold text-lg"
                    >
                      <Trash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 direction-rtl">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h3 className="text-xl font-semibold mb-4">{isEditing ? "تعديل الفئة" : "إضافة فئة جديدة"}</h3>
            {errorMessage && (
              <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
            )}
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
              placeholder="اسم الفئة"
            />
            <input
              type="number"
              value={minCount}
              onChange={(e) => setMinCount(Number(e.target.value))}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
              placeholder="الحد الأدنى للعدد"
              min="1"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={isEditing ? editCategory : addCategory}
                disabled={errorSubmit}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {errorSubmit ? "جاري الحفظ ..." : isEditing ? "تعديل" : "إضافة"}
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditing(false);
                  setCategoryToEdit(null);
                  setNewCategory("");
                  setMinCount(1);
                  setErrorMessage("");
                }}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                إلغاء
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 direction-rtl">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h3 className="text-xl font-semibold mb-4">تأكيد الحذف</h3>
            <p className="text-gray-700 mb-4">
              هل أنت متأكد أنك تريد حذف الفئة: {categoryToDelete?.name}؟
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleDeleteCategory}
                disabled={errorSubmit}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {errorSubmit ? "جاري الحذف ..." : "حذف"}
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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

export default CategoryManager;
