import React, {
  useState,
  useEffect,
} from "react";

const CategoryManager = ({
  onCategoryChange,
  onDeleteCategory,
}) => {
  const [categories, setCategories] = useState(
    []
  );
  const [newCategory, setNewCategory] =
    useState("");

  useEffect(() => {
    const storedCategories =
      localStorage.getItem("categories");
    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
    }
  }, []);

  const addCategory = () => {
    if (
      newCategory &&
      !categories.includes(newCategory)
    ) {
      const updatedCategories = [
        ...categories,
        newCategory,
      ];
      setCategories(updatedCategories);
      localStorage.setItem(
        "categories",
        JSON.stringify(updatedCategories)
      );
      setNewCategory("");
      onCategoryChange(updatedCategories);
    }
  };

  const removeCategory = (categoryToRemove) => {
    onDeleteCategory(categoryToRemove);
  };

  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold mb-2">
        إدارة الفئات
      </h2>
      <div className="flex mb-2">
        <input
          type="text"
          value={newCategory}
          onChange={(e) =>
            setNewCategory(e.target.value)
          }
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
          placeholder="New category"
        />
        <button
          onClick={addCategory}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          إضافة
        </button>
      </div>
      <div className="flex flex-wrap">
        {categories.map((category, index) => (
          <div
            key={index}
            className="bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
          >
            {category}
            <button
              onClick={() =>
                removeCategory(category)
              }
              className="ml-2 text-red-500 font-bold"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManager;
