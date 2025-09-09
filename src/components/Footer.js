'use client'
import React, { useEffect, useState } from "react";
import {
  Facebook,
  Phone,
  Mail,
} from "lucide-react";

export default function Footer() {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const year = new Date().getFullYear();
 
  const fetchEmail = async () => {
    const response = await fetch('/api/customize?name=ايميل التواصل');
    const data = await response.json();
    setEmail(data[0].value);
  };
  const fetchWhatsappNumber = async () => {
    const response = await fetch('/api/customize?name=رقم الواتس');
    const data = await response.json();
    setWhatsappNumber(data[0].value);
  };
  useEffect(() => {
    fetchWhatsappNumber();
    fetchEmail();
  }, []);
  return (
    <footer className="bg-amazon text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between items-center">
          <div className="w-full md:w-1/3 text-center md:text-left mb-4 md:mb-0">
            <h3 className="text-2xl font-bold mb-2">
              Sitara Mall
            </h3>
            <p className="text-gray-400">
              Quality products at unbeatable
              prices
            </p>
          </div>
          <div className="w-full md:w-1/3 text-center mb-4 md:mb-0">
            <h4 className="text-xl font-semibold mb-2">
              Contact Us
            </h4>
            <a
              href={`tel:${whatsappNumber||'+201223821206'}`}
              className="flex items-center justify-center md:justify-start text-gray-400 hover:text-white transition duration-300"
            >
              <Phone className="mr-2" size={18} />
              {whatsappNumber||'+20 122 382 1206'}
            </a>
            <a
              href={`mailto:${email||'sitaramall97@gmail.com'}`}
              className="flex items-center justify-center md:justify-start text-gray-400 hover:text-white transition duration-300 mt-2"
            >
              <Mail className="mr-2" size={18} />
              {email||'sitaramall97@gmail.com'}
            </a>
          </div>
          <div className="w-full md:w-1/3 text-center md:text-right">
            <h4 className="text-xl font-semibold mb-2">
              Follow Us
            </h4>
            <div className="flex justify-center md:justify-end space-x-4">
              <a
                href="https://www.facebook.com/profile.php?id=61558001937849"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition duration-300"
              >
                <Facebook size={24} />
              </a>
              <a
                href="https://wa.me/201223821206"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-400">
          <p>
            &copy; {year} Our Store. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
