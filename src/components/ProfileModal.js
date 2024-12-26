"use client";
import React, { useState, useEffect } from "react";

const ProfileModal = ({ isOpen, onRequestClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    city: "",
    governorate: "",
    neighborhood: "",
    phone: "",
    centerArea: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    /*
    const fetchUserData = async () => {
      const userId = JSON.parse(localStorage.getItem("userProfile")).userId;
      try {
        const response = await fetch(`api/user/profile/${userId}`);
        if (!response.ok) {
          throw new Error(`Error fetching user data: ${response.statusText}`);
        }
        const data = await response.json();
        setFormData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
    */

    const userData = JSON.parse(localStorage.getItem("userProfile"));
    if (userData) {
      setFormData({
        ...formData,
        name: userData.name || "",
        email: userData.email || "",
        city: userData.city || "",
        governorate: userData.governorate || "",
        neighborhood: userData.neighborhood || "",
        phone: userData.phone || "",
        centerArea: userData.centerArea || "",
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    /*
    const userId = JSON.parse(localStorage.getItem("userProfile")).userId;
    try {
      const response = await fetch(`api/user/profile/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error(`Error updating profile: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Profile updated successfully:", data);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
    */
  };

  if (!isOpen) return null;

  return (
    <div
      id="modal-backdrop"
      onClick={(e) => {
        if (e.target.id === "modal-backdrop") onRequestClose();
      }}
      className="fixed inset-0 backdrop-blur-lg flex items-center justify-center z-50 px-5 backdrop-brightness-75"
    >
      <div
        className="bg-white p-6 rounded-md shadow-2xl w-96"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">Profile</h2>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: "Name", id: "name" },
              { label: "Email", id: "email" },
              { label: "Password", id: "password" },
              { label: "City", id: "city" },
              { label: "Governorate", id: "governorate" },
              { label: "Neighborhood", id: "neighborhood" },
              { label: "Phone", id: "phone" },
              { label: "Center Area", id: "centerArea" },
            ].map(({ label, id }) => (
              <div key={id}>
                <label htmlFor={id} className="block text-sm font-medium mb-1">
                  {label}
                </label>
                <input
                  type={id === "password" ? "password" : "text"}
                  id={id}
                  name={id}
                  value={formData[id]}
                  onChange={handleChange}
                  required={id !== "password"}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            ))}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-full hover:bg-blue-600"
            >
              Save
            </button>
          </form>
        ) : (
          <div className="space-y-2">
            {Object.entries(formData).map(
              ([key, value]) =>
                key !== "password" && (
                  <p key={key}>
                    <strong>
                      {key.charAt(0).toUpperCase() + key.slice(1)}:
                    </strong>{" "}
                    {value}
                  </p>
                )
            )}
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-blue-500 text-white py-2 rounded-full hover:bg-blue-600"
            >
              Edit
            </button>
          </div>
        )}
        <button
          onClick={onRequestClose}
          className="mt-4 w-full bg-gray-500 text-white py-2 rounded-full hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;
