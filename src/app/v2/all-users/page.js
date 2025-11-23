"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { Trash2, Edit } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AllUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [role, setRole] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingRole, setEditingRole] = useState("");
  const [errorSubmit, setErrorSubmit] = useState(false);
  const auth = useAuth();
  const isLoggedIn = auth?.isLoggedIn || false;
  const token = auth?.token || null;
  const isLoaded = auth?.isLoaded || false;
  const router = useRouter();

  useEffect(() => {
    if (token) {
      if (isLoaded) {
        if (isLoggedIn && role === "user") {
          router.push("/");
        }
      }
    } else {
      router.push("/");
    }
  }, [isLoaded, isLoggedIn, router, token]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/v2/api/user/profile");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data.profiles);
        setFilteredUsers(data.profiles);
      } catch (error) {
        setError("Error fetching users: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const deleteUser = async () => {
    if (!userToDelete) return;

    setLoading(true);

    try {
      const response = await fetch(
        `/v2/api/user/profile/${userToDelete.userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      const updatedUsers = users.filter(
        (user) => user.userId !== userToDelete.userId
      );
      setUsers(updatedUsers);

      const updatedFilteredUsers = filteredUsers.filter(
        (user) => user.userId !== userToDelete.userId
      );
      setFilteredUsers(updatedFilteredUsers);
      toast.success("تم حذف المستخدم بنجاح");
    } catch (error) {
      setError("حدث خطأ أثناء حذف المستخدم");
      toast.error("حدث خطأ أثناء حذف المستخدم");
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      setErrorSubmit(true);
      const response = await fetch(`/v2/api/user/profile/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user role");
      }

      const updatedUsers = users.map((user) =>
        user.userId === userId ? { ...user, role: newRole } : user
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      setEditingUserId(null);
      toast.success("تم تحديث حالة المستخدم بنجاح ل " + newRole);
    } catch (error) {
      setError("حدث خطأ أثناء تحديث حالة المستخدم");
      toast.error("حدث خطأ أثناء تحديث حالة المستخدم");
    } finally {
      setErrorSubmit(false);
    }
  };

  useEffect(() => {
    if (role === "all") {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter((user) => user.role === role));
    }
  }, [role, users]);

  const handleRoleChange = (event) => {
    setRole(event.target.value);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!isLoggedIn) return null;

  return (
    <div className="container mx-auto px-4 py-8 direction-rtl">
      <div className="flex justify-between mb-4">
        <h1 className="text-3xl font-bold text-gray-800">كل المستخدمين</h1>

        <select
          value={role}
          onChange={handleRoleChange}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="all">All</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="flex flex-col flex-wrap  sm:flex-row gap-4 md:gap-16">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user.userId}
              className=" border p-8 rounded shadow-lg hover:bg-gray-100"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <div className="flex gap-2">
                  <Edit
                    className={`text-gray-500 hover:cursor-pointer hover:text-blue-700 ${
                      localStorage.getItem("userProfile") &&
                      JSON.parse(localStorage.getItem("userProfile")).userId ===
                        user.userId
                        ? "cursor-not-allowed opacity-50"
                        : ""
                    }`}
                    onClick={() => {
                      const currentUserId =
                        localStorage.getItem("userProfile") &&
                        JSON.parse(localStorage.getItem("userProfile")).userId;
                      if (currentUserId === user.userId) return;
                      setEditingUserId(user.userId);
                      setEditingRole(user.role);
                    }}
                  />
                  <Trash2
                    className={`text-red-500 hover:cursor-pointer hover:text-red-700 ${
                      localStorage.getItem("userProfile") &&
                      JSON.parse(localStorage.getItem("userProfile")).userId ===
                        user.userId
                        ? "cursor-not-allowed opacity-50"
                        : ""
                    }`}
                    onClick={() => {
                      const currentUserId =
                        localStorage.getItem("userProfile") &&
                        JSON.parse(localStorage.getItem("userProfile")).userId;
                      if (currentUserId === user.userId) return;
                      setUserToDelete(user);
                      setIsModalOpen(true);
                    }}
                  />
                </div>
              </div>
              <p className="text-gray-500">
                Role:{" "}
                {editingUserId === user.userId ? (
                  <select
                    value={editingRole}
                    onChange={(e) => setEditingRole(e.target.value)}
                    className="border rounded p-1"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  user.role
                )}
              </p>
              <p>البريد الإلكتروني: {user.email}</p>
              <p>رقم الهاتف: {user.phone}</p>
              <p>المحافظة: {user.governorate}</p>
              <p>المدينة: {user.centerArea}</p>
              <p>الحي: {user.neighborhood}</p>
              {editingUserId === user.userId && (
                <button
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
                  disabled={errorSubmit}
                  onClick={() => updateUserRole(user.userId, editingRole)}
                >
                  {errorSubmit ? "جاري الحفظ ..." : "حفظ"}
                </button>
              )}
            </div>
          ))
        ) : (
          <p>لا يوجد مستخدمين</p>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h3 className="text-xl font-semibold mb-4">
              هل تريد حذف المستخدم {userToDelete?.name}
            </h3>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={deleteUser}
              >
                تأكيد
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
}
