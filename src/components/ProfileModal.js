"use client";
import React, { useState, useEffect } from "react";
import { Edit } from "lucide-react";


const ProfileModal = ({ isOpen, onRequestClose }) => {
  const [formData, setFormData] = useState({
    centerArea: "",
    email: "",
    governorate: "",
    name: "",
    neighborhood: "",
    phone: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedProfile = localStorage.getItem("userProfile");
      setUserProfile(storedProfile);
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userProfile) {
        console.log("User is not logged in");
        return;
      }

      const userId = JSON.parse(userProfile).userId;
      try {
        const response = await fetch(`/api/user/profile/${userId}`);
        if (!response.ok) {
          throw new Error(`Error fetching user data: ${response.statusText}`);
        }
        const data = await response.json();
        setFormData(data.profile);


      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const filteredData = {
      centerArea: formData.centerArea,
      email: formData.email,
      governorate: formData.governorate,
      name: formData.name,
      neighborhood: formData.neighborhood,
      phone: formData.phone,
    };
    const userId = JSON.parse(localStorage.getItem("userProfile")).userId;
    try {
      const response = await fetch(
        `/api/user/profile/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(filteredData),
        }
      );
      if (!response.ok) {
        throw new Error(`Error updating profile: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Profile updated successfully:", data);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
    console.log(formData); 
  };

  if (!isOpen) return null;

  return (
    <div
      id="modal-backdrop"
      onClick={(e) => {
        if (e.target.id === "modal-backdrop") onRequestClose();
      }}
      className="direction-rtl fixed inset-0 backdrop-blur-lg flex items-center justify-center z-50 px-5 backdrop-brightness-75"
    >
      <div
        className="bg-white p-6 rounded-md shadow-2xl w-96"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex content-between justify-between">
          <h2 className="text-2xl font-bold mb-4">الملف الشخصي</h2>
          {!isEditing && (<div
            className="cursor-pointer"
            onClick={() => setIsEditing(true)}
          >
            <Edit size={24} className="text-blue-500 hover:text-blue-600" />
          </div>)}
        </div>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                الاسم
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="flex gap-2">
              <div className="w-1/2">
                <label htmlFor="centerArea" className="block text-sm font-medium mb-1">
                  المدينة
                </label>
                <input
                  type="text"
                  id="centerArea"
                  name="centerArea"
                  value={formData.centerArea}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="w-1/2">
                <label htmlFor="neighborhood" className="block text-sm font-medium mb-1">
                  الحي
                </label>
                <input
                  type="text"
                  id="neighborhood"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-1/2">
                <label
                  htmlFor="governorate"
                  className="block text-sm font-medium mb-1"
                >
                  المحافظة
                </label>
                <input
                  type="text"
                  id="governorate"
                  name="governorate"
                  value={formData.governorate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="w-1/2">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium mb-1"
                >
                  رقم الهاتف
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-full hover:bg-blue-600"
            >
              حفظ
            </button>
          </form>
        ) : (
          <div className="space-y-2 direction-rtl">
            <p>
              <strong>الاسم:</strong> {formData.name}
            </p>
            <p>
              <strong>البريد الإلكتروني:</strong> {formData.email}
            </p>
            <p>
              <strong>المدينة:</strong> {formData.centerArea}
            </p>
            <p>
              <strong>الحي:</strong> {formData.neighborhood}
            </p>
            <p>
              <strong>المحافظة:</strong> {formData.governorate}
            </p>
            <p>
              <strong>رقم الهاتف:</strong> {formData.phone}
            </p>
          </div>

        )}
        {/* <button
          onClick={onRequestClose}
          className="mt-4 w-full bg-gray-500 text-white py-2 rounded-full hover:bg-gray-600"
        >
          Close
        </button> */}
      </div>
    </div>
  );
};

export default ProfileModal;
