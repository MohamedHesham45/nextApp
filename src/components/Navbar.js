"use client";
import React, { useState, useEffect, useRef } from "react";
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
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

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
      ]
      : [{ href: "/user/orders", label: "إدارة الطلبات" }]
    : [];

  return (
    <>
      <header
        className={`bg-amazon shadow fixed w-full z-50 transition-transform duration-300 ${visible ? "translate-y-0" : "-translate-y-full"
          }`}
      >
        <nav className="container mx-auto px-6 h-16 flex justify-between items-center">
          <div className="text-xl font-semibold text-white order-2">
            <Link href="/">ستارة مول</Link>
          </div>
          <div className="hidden md:flex space-x-6 items-center h-full order-1">
            <Link href="/gallery" className="relative text-white hover:text-amazon-yellow transition group">
              <span className="block pb-1">المعرض</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-amazon-yellow group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="/contact" className="relative text-white hover:text-amazon-yellow transition group">
              <span className="block pb-1">تواصل معنا</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-amazon-yellow group-hover:w-full transition-all duration-300"></span>
            </Link>

            {/* Role Check Start */}
            {roleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-white hover:text-amazon-yellow transition group"
              >
                <span className="block pb-1">{link.label}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-amazon-yellow group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
            {/* Role Check End */}

            {/* Logged In Check Start */}
            {isLoggedIn && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 hover:bg-amazon-blue/20 px-2 rounded-md transition-colors h-10"
                >
                  <img
                    src="/avatar.png"
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full border border-amazon-yellow"
                  />
                  <span className="text-white">{firstName || "User"}</span>
                  <ChevronDown size={16} className="text-white" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg transition-transform transform origin-top-right scale-100">
                    <div className="px-4 py-2">
                      <p className="text-sm text-amazon-dark-gray">Logged in as</p>
                      <p className="text-sm font-medium text-amazon-dark-gray">{userName || "User"}</p>
                    </div>
                    <hr className="my-2" />
                    <button
                      onClick={openProfileModal}
                      className="flex items-center w-full px-4 py-2 text-sm text-amazon-dark-gray hover:bg-amazon-light-gray transition"
                    >
                      <User size={16} className="mr-2" />
                      الملف الشخصي
                    </button>
                    <button
                      onClick={logout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-amazon-light-gray transition"
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
                className="relative text-white hover:text-amazon-yellow transition group"
              >
                <span className="block pb-1">تسجيل الدخول</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-amazon-yellow group-hover:w-full transition-all duration-300"></span>
              </button>
            )}
          </div>
          {/* Logged In Check End */}

          {/* Mobile Mode Menu Start */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-white">
              <Menu size={24} />
            </button>
          </div>
        </nav>
        {isMenuOpen && (
          <div className="md:hidden mt-4 px-6 bg-amazon text-white">
            {isLoggedIn && (
              <div>
                <div className="pb-2">
                  <p className="text-sm text-amazon-yellow">Logged in as</p>
                  <p className="text-sm font-medium text-white">{userName || "User"}</p>
                </div>
                <button
                  onClick={openProfileModal}
                  className="flex items-center text-white hover:text-amazon-yellow transition-colors"
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
                className="block py-2 text-white hover:text-amazon-yellow transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/gallery"
              className="relative block text-white hover:text-amazon-yellow transition-colors group"
            >
              <span className="block py-2 pb-3">المعرض</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-amazon-yellow group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="/contact" className="block py-2 text-white hover:text-amazon-yellow transition-colors">
              تواصل معنا
            </Link>
            {isLoggedIn && (
              <button
                onClick={logout}
                className="flex items-center w-full py-2 text-sm text-red-500 hover:text-red-400 transition-colors"
              >
                <LogOut size={16} className="mr-2" />
                تسجيل الخروج
              </button>
            )}

            {!isLoggedIn && (
              <button
                onClick={() => openModal("sign-in")}
                className="block w-full text-left py-2 text-white hover:text-amazon-yellow transition-colors"
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