"use client";
import React, { useState, useEffect } from "react";
import { Edit } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";


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
  const { profile, setProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [governorates, setGovernorates] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [selectedGovernorate, setSelectedGovernorate] = useState(null);
  useEffect(() => {
   setFormData(profile);
  }, [profile]);

  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  useEffect(() => {
    const fetchGovernorates = async () => {
      if (!isEditing) return;
      
      const response = await fetch("/api/governorate");
      const data = await response.json();
      setGovernorates(data);
      
      const savedGovernorate = data.find(gov => gov.nameAr === formData.governorate);
      if (savedGovernorate) {
        setSelectedGovernorate(savedGovernorate);
      }
    };

    fetchGovernorates();
  }, [isEditing, formData.governorate]);

  useEffect(() => {
    const fetchNeighborhoods = async () => {
      if (!isEditing || !selectedGovernorate) return;
      
      try {
        const response = await fetch(
          `/api/governorate/neighborhood/governorate/${selectedGovernorate._id}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setNeighborhoods(data);
      } catch (error) {
        console.error("Error fetching neighborhoods:", error);
      }
    };

    fetchNeighborhoods();
  }, [selectedGovernorate, isEditing]);

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
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/user/profile/${profile.userId}`,
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
    } finally {
      setIsLoading(false);
    }
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
        className="bg-white p-6 rounded-md shadow-2xl w-full md:w-2/3 lg:w-2/3 relative"
        onClick={(e) => e.stopPropagation()}
      >

          {!isEditing && (<div
            className="cursor-pointer absolute top-4 left-5"
            onClick={() => setIsEditing(true)}
          >
            <Edit size={24} className="text-blue-500 hover:text-blue-600" />
          </div>)}
        <div className="flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold mb-4">الملف الشخصي</h2>
            <div className="pb-4 text-5xl font-bold rounded-full bg-amazon text-white w-24 h-24   flex items-center justify-center">{formData.name[0]}</div>
          </div>
          <hr className="my-4 w-full border-gray-300" />
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
            </div>
            <div className="flex gap-2">
              <div className="w-1/2">
                <label htmlFor="governorate" className="block text-sm font-medium mb-1">
                  المحافظة
                </label>
                <select
                  id="governorate"
                  name="governorate"
                  value={formData.governorate}
                  onChange={(e) => {
                    const selected = governorates.find(gov => gov.nameAr === e.target.value);
                    setSelectedGovernorate(selected);
                    handleChange({
                      target: { name: 'governorate', value: e.target.value }
                    });
                  }}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">اختر المحافظة</option>
                  {governorates.map((gov) => (
                    <option key={gov._id} value={gov.nameAr}>
                      {gov.nameAr}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-1/2">
                <label htmlFor="neighborhood" className="block text-sm font-medium mb-1">
                  الحي
                </label>
                <select
                  id="neighborhood"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">اختر الحي</option>
                  {neighborhoods.map((neighborhood) => (
                    <option key={neighborhood._id} value={neighborhood.nameAr}>
                      {neighborhood.nameAr}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-amazon text-white py-2 rounded-full hover:bg-amazon-orange"
              disabled={isLoading}
            >
              {isLoading ? "جاري التحديث..." : "حفظ"}
            </button>
          </form>
        ) : (
          <div className="space-y-4 direction-rtl">
            <div className="flex flex-wrap gap-3 md:gap-4">
              <div className="bg-gray-50 p-3 md:p-4 rounded-lg flex-grow basis-full md:basis-[calc(50%-0.5rem)]">
                <p className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm md:text-base">الاسم:</span>
                  <span className="font-semibold text-sm md:text-base">{formData.name}</span>
                </p>
              </div>
              <div className="bg-gray-50 p-3 md:p-4 rounded-lg flex-grow basis-full md:basis-[calc(50%-0.5rem)]">
                <p className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm md:text-base">البريد الإلكتروني:</span>
                  <span className="font-semibold text-sm md:text-base">{formData.email}</span>
                </p>
              </div>
              <div className="bg-gray-50 p-3 md:p-4 rounded-lg flex-grow basis-full md:basis-[calc(50%-0.5rem)]">
                <p className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm md:text-base">رقم الهاتف:</span>
                  <span className="font-semibold text-sm md:text-base">{formData.phone}</span>
                </p>
              </div>
              <div className="bg-gray-50 p-3 md:p-4 rounded-lg flex-grow basis-full md:basis-[calc(50%-0.5rem)]">
                <p className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm md:text-base">المدينة:</span>
                  <span className="font-semibold text-sm md:text-base">{formData.centerArea}</span>
                </p>
              </div>
              <div className="bg-gray-50 p-3 md:p-4 rounded-lg flex-grow basis-full md:basis-[calc(50%-0.5rem)]">
                <p className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm md:text-base">الحي:</span>
                  <span className="font-semibold text-sm md:text-base">{formData.neighborhood}</span>
                </p>
              </div>
              <div className="bg-gray-50 p-3 md:p-4 rounded-lg flex-grow basis-full md:basis-[calc(50%-0.5rem)]">
                <p className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm md:text-base">المحافظة:</span>
                  <span className="font-semibold text-sm md:text-base">{formData.governorate}</span>
                </p>
              </div>
            </div>
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
