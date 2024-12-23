"use client";

import React, { useState } from "react";
import emailjs from "emailjs-com";
import {
  Phone,
  MapPin,
  Mail,
} from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [submitResult, setSubmitResult] =
    useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    emailjs
      .send(
        "YOUR_SERVICE_ID",
        "YOUR_TEMPLATE_ID",
        formData,
        "YOUR_USER_ID"
      )
      .then(
        (result) => {
          setSubmitResult({
            success: true,
            message: "Message sent successfully!",
          });
          setFormData({
            name: "",
            email: "",
            message: "",
          });
        },
        (error) => {
          setSubmitResult({
            success: false,
            message:
              "Failed to send message. Please try again.",
          });
        }
      )
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-800 p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">
              Call Us in Person
            </h2>
            <a
              href="tel:+201223821206"
              className="text-4xl font-bold hover:text-blue-200 transition duration-300 ease-in-out transform hover:scale-105 inline-block"
            >
              +20 122 382 1206
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0 bg-gradient-to-b from-blue-600 to-indigo-800 p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">
                Contact Us
              </h2>
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <MapPin className="mr-2" /> Our
                  Location
                </h3>
                <p className="text-lg leading-relaxed">
                  ستارة مول
                  <br />
                  شارع 100، بعد ديوان حي العرب
                  <br />
                  ثاني محل على الشمال
                  <br />
                  بورسعيد، مصر
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Mail className="mr-2" /> Email
                  Us
                </h3>
                <a
                  href="mailto:info@ourstore.com"
                  className="text-lg hover:text-blue-200 transition duration-300"
                >
                  info@ourstore.com
                </a>
              </div>
            </div>
            <div className="p-8 md:w-2/3">
              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Sending..."
                    : "Send Message"}
                </button>
              </form>
              {submitResult && (
                <div
                  className={`mt-4 p-4 rounded-md ${
                    submitResult.success
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  } transition-all duration-300 ease-in-out`}
                >
                  {submitResult.message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
