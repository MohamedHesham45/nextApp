"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ChevronDown,
  LogOut,
  User,
  ShoppingCart,
  Heart,
  LayoutDashboard,
  ClipboardList,
  Image,
  Phone,
  UserCheck,
  Home,
} from "lucide-react";
import SignInModal from "@/app/(auth)/sign-in/[[...sign-in]]/page";
import SignUpModal from "@/app/(auth)/sign-up/[[...sign-up]]/page";
import { useAuth } from "@/app/context/AuthContext";
import { useCartFavorite } from "@/app/context/cartFavoriteContext";
import ShoppingCartPage from "./ShoppingCart";
import useMetaConversion from "./SendMetaConversion";
import V2ProfileModal from "./V2ProfileModal";

export default function V2Navbar() {
  const { numberOfCartItems, numberOfFavoriteItems } = useCartFavorite();
  const { userName, isLoggedIn, role, logout } = useAuth();
  const firstName = userName?.split(" ")[0];

  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const [modalType, setModalType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCartVisible, setIsCartVisible] = useState(false);

  const dropdownRef = useRef(null);
  const sendMetaConversion = useMetaConversion();

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
      ? [{ href: "/v2/admin-dashboard", label: "لوحة التحكم", icon: <LayoutDashboard size={22} /> }]
      : [{ href: "/v2/user/orders", label: "إدارة الطلبات", icon: <ClipboardList size={22} /> }]
    : [];

  const galleryConversionEvent = () => {
    var userAgent = navigator.userAgent;
    // Meta pixel conversion can be added here
  };

  return (
    <>
      {/* Desktop Navbar only */}
      <header
        className={`bg-amazon shadow md:fixed md:h-16 w-full z-50 transition-transform duration-300 hidden md:block ${visible ? "translate-y-0" : "-translate-y-full"
          }`}
      >

        <nav className="container mx-auto px-6 h-16 flex justify-between items-center">
          <div className="text-xl font-semibold text-white order-2">
            <Link href="/v2">ستارة مول</Link>
          </div>

          <div className="hidden md:flex items-center h-full order-1">
            <Link
              href="/v2/gallery"
              className="relative text-white hover:text-amazon-yellow transition group order-6 mx-4"
              onClick={galleryConversionEvent}
            >
              <span className="block pb-1">المعرض</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-amazon-yellow group-hover:w-full transition-all duration-300"></span>
            </Link>

            <Link
              href="/v2/contact"
              className="relative text-white hover:text-amazon-yellow transition group order-5 mx-4"
            >
              <span className="block pb-1">تواصل معنا</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-amazon-yellow group-hover:w-full transition-all duration-300"></span>
            </Link>

            {roleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-white hover:text-amazon-yellow transition group order-4 mx-4"
              >
                <span className="block pb-1">{link.label}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-amazon-yellow group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}

            <button
              onClick={() => setIsCartVisible(!isCartVisible)}
              className="relative text-white hover:text-amazon-yellow transition group order-3 px-4"
            >

              <span className="block pb-1 absolute top-[-12px] right-[3px] text-sm bg-amazon-yellow text-amazon-dark-gray px-1 rounded-full">
                {numberOfCartItems}
              </span>

              <ShoppingCart />
            </button>

            <Link
              href="/v2/favorites"
              className="relative text-white hover:text-amazon-yellow transition group order-2 px-4"
            >
              {numberOfFavoriteItems > 0 && (
                <span className="block pb-1 absolute top-[-12px] right-[3px] text-sm bg-amazon-yellow text-amazon-dark-gray px-1 rounded-full">
                  {numberOfFavoriteItems}
                </span>
              )}
              <Heart />
            </Link>

            {isLoggedIn ? (
              <div className="relative order-1" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center hover:bg-amazon-blue/20 px-2 rounded-md transition h-10"
                >
                  <img
                    src="/avatar.png"
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full border border-amazon-yellow order-2"
                  />
                  <span className="text-white order-1 px-2">
                    {firstName || "User"}
                  </span>
                  <ChevronDown size={16} className="text-white" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white border rounded-md shadow-lg transition-transform transform origin-top-right scale-100 direction-rtl">
                    <div className="px-4 py-2">
                      <p className="text-sm text-amazon-dark-gray mb-2">
                        تسجيل الدخول ك
                      </p>
                      <p className="text-sm font-medium text-amazon-dark-gray">
                        {userName || "User"}
                      </p>
                    </div>
                    <hr className="my-2" />
                    <button
                      onClick={openProfileModal}
                      className="flex items-center w-full px-4 py-2 text-sm text-amazon-dark-gray hover:bg-amazon-light-gray transition"
                    >
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
            ) : (
              <button
                onClick={() => openModal("sign-in")}
                className="relative text-white hover:text-amazon-yellow transition group"
              >
                <span className="block pb-1">تسجيل الدخول</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-amazon-yellow group-hover:w-full transition-all duration-300"></span>
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile Bottom Navbar */}
      <nav className="fixed bottom-0 left-0 w-full bg-amazon text-white border-t border-amazon-yellow shadow-md flex justify-around items-center py-2 md:hidden z-50">
        <button
          className="flex flex-col items-center text-xs relative"
          onClick={() => {
            if (isLoggedIn) {
              setIsProfileModalOpen(true);
            } else {
              openModal("sign-in");
            }
          }}
        >
          <UserCheck size={22} className={` text-amazon-yellow ${isLoggedIn ? "" : "hidden"}`} />
          <User size={22} className={` ${isLoggedIn ? "hidden" : ""}`} />
          <span>
            {isLoggedIn ? (firstName || "مستخدم") : "الحساب"}
          </span>
        </button>
        <Link href="/v2/favorites" className="flex flex-col items-center text-xs relative">
          {numberOfFavoriteItems > 0 && (
            <span className="absolute -top-1 -right-2 text-[10px] bg-amazon-yellow text-amazon-dark-gray px-1 rounded-full">
              {numberOfFavoriteItems}
            </span>
          )}
          <Heart size={22} />
          <span>المفضلة</span>
        </Link>
        <button
          onClick={() => setIsCartVisible(!isCartVisible)}
          className="flex flex-col items-center text-xs relative"
        >
          {/* {numberOfCartItems > 0 && ( */}
            <span className="absolute -top-1 -right-2 text-[10px] bg-amazon-yellow text-amazon-dark-gray px-1 rounded-full">
              {numberOfCartItems}
            </span>
          {/* )} */}
          <ShoppingCart size={22} />
          <span>السلة</span>
        </button>
        {roleLinks.map((link) => (
          <Link key={link.href} href={link.href} className="flex flex-col items-center text-xs">
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}
        <Link href="/v2" className="flex flex-col items-center text-xs">
          <Home size={22} />
          <span>الرئيسية</span>
        </Link>
        <Link href="/v2/gallery" className="flex flex-col items-center text-xs">
          <Image size={22} />
          <span>المعرض</span>
        </Link>
        <Link href="/v2/contact" className="flex flex-col items-center text-xs">
          <Phone size={22} />
          <span>تواصل</span>
        </Link>
      </nav>

      {/* Modals */}
      {isModalOpen && modalType === "sign-in" && (
        <SignInModal
          isOpen={isModalOpen}
          onClose={closeModal}
          setModalType={setModalType}
        />
      )}
      {isModalOpen && modalType === "sign-up" && (
        <SignUpModal
          isOpen={isModalOpen}
          onClose={closeModal}
          setModalType={setModalType}
        />
      )}
      <V2ProfileModal isOpen={isProfileModalOpen} onRequestClose={closeProfileModal} />
      <ShoppingCartPage isVisible={isCartVisible} setIsVisible={setIsCartVisible} />
    </>
  );
}
