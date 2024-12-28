"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, ChevronDown, LogOut, User } from "lucide-react";
import SignInModal from "@/app/(auth)/sign-in/[[...sign-in]]/page";
import SignUpModal from "@/app/(auth)/sign-up/[[...sign-up]]/page";
import { useAuth } from "@/app/context/AuthContext";
import ProfileModal from "./ProfileModal";

export default function Navbar() {
  const { userName, isLoggedIn, role, logout } = useAuth();
  const firstName = userName?.split(" ")[0];
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);
  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  const roleLinks = isLoggedIn
    ? role === "admin"
      ? [
        { href: "/admin-dashboard", label: "لوحة التحكم" },
        // { href: "/admin/orders", label: "إدارة الطلبات" },
        // { href: "/admin", label: "إدارة المحتوى" },
      ]
      : [{ href: "/user/orders", label: "إدارة الطلبات" }]
    : [];

  return (
    <>
      <header
        className={`bg-white shadow fixed w-full z-50 transition-transform duration-300 ${visible ? "translate-y-0" : "-translate-y-full"
          }`}
      >
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="text-xl font-semibold text-gray-700">
            <Link href="/">ستارة مول</Link>
          </div>
          <div className="hidden md:flex space-x-6 items-center">
            <Link href="/gallery" className="text-gray-800 hover:text-gray-600 transition">
              المعرض
            </Link>
            <Link href="/contact" className="text-gray-800 hover:text-gray-600 transition">
              تواصل معنا
            </Link>

            {/* Role Check Start */}
            {roleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-gray-800 hover:text-gray-600 transition duration-300"
              >
                {link.label}
              </Link>
            ))}
            {/* Role Check End */}

            {/* Logged In Check Start */}
            {isLoggedIn && (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 hover:rounded-md hover:bg-gray-200"
                >
                  <img
                    src="/avatar.png"
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full border border-gray-300"
                  />
                  <span className="text-gray-800">{firstName || "User"}</span>
                  <ChevronDown size={16} />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg transition-transform transform origin-top-right scale-100">
                    <div className="px-4 py-2">
                      <p className="text-sm text-gray-500">Logged in as</p>
                      <p className="text-sm font-medium text-gray-800">{userName || "User"}</p>
                    </div>
                    <hr className="my-2" />
                    <button
                      // href="/profile"
                      onClick={openProfileModal}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                    >
                      <User size={16} className="mr-2" />
                      الملف الشخصي
                    </button>
                    <button
                      onClick={logout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-100 transition"
                    >
                      <LogOut size={16} className="mr-2" />
                      تسجيل خروج
                    </button>
                  </div>
                )}
              </div>
            )}
            {!isLoggedIn && (
              <button
                onClick={() => openModal("sign-in")}
                className="text-gray-800 hover:text-gray-600 transition"
              >
                تسجيل الدخول
              </button>
            )}
          </div>
          {/* Logged In Check End */}

          {/* Mobile Mode Menu Start */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-gray-800">
              <Menu size={24} />
            </button>
          </div>
        </nav>
        {isMenuOpen && (
          <div className="md:hidden mt-4 px-6">
            {isLoggedIn && (
              <div>
                <div className="pb-2">
                  <p className="text-sm text-gray-500">Logged in as</p>
                  <p className="text-sm font-medium text-gray-800">{userName || "User"}</p>
                </div>
                <button
                  // href="/profile"
                  onClick={openProfileModal}
                  className="flex items-center text-gray-800 hover:text-gray-600"
                >
                  <User size={16} className="mr-2" />
                  الملف الشخصي
                </button>
              </div>
            )}
            {roleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-gray-800 hover:text-gray-600 transition duration-300"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/gallery" className="block py-2 text-gray-800 hover:text-gray-600">
              المعرض
            </Link>
            <Link href="/contact" className="block py-2 text-gray-800 hover:text-gray-600">
              تواصل معنا
            </Link>
            {isLoggedIn && (
              <button
                onClick={logout}
                className="flex items-center w-full  py-2 text-sm text-red-500 hover:bg-gray-100 transition"
              >
                <LogOut size={16} className="mr-2" />
                تسجيل الخروج
              </button>
            )}

            {!isLoggedIn && (
              <button
                onClick={() => openModal("sign-in")}
                className="block w-full text-left py-2 text-gray-800 hover:text-gray-600"
              >
                تسجيل الدخول
              </button>
            )}
          </div>
        )}
        {/* Mobile Mode Menu End */}

      </header>
      {isModalOpen && modalType === "sign-in" && (
        <SignInModal isOpen={isModalOpen} onClose={closeModal} setModalType={setModalType} />
      )}
      {isModalOpen && modalType === "sign-up" && (
        <SignUpModal isOpen={isModalOpen} onClose={closeModal} setModalType={setModalType} />
      )}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onRequestClose={closeProfileModal}
      />
    </>
  );
}