"use client";

import React, { useEffect, useState } from "react";
import emailjs from "emailjs-com";
import { Phone, MapPin, Mail } from "lucide-react";
import useMetaConversion from "@/components/SendMetaConversion";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [email, setEmail] = useState("sitaramall97@gmail.com");
  const [whatsappNumber, setWhatsappNumber] = useState("201223821206");
  const [error, setError] = useState(null);
  const sendMetaConversion = useMetaConversion();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  useEffect(() => {
    fetchEmail();
  }, []);
  const fetchEmail = async () => {
    const response = await fetch("/v2/api/customize?name=ايميل التواصل");
    const res = await fetch("/v2/api/customize?name=رقم الواتس");
    const data = await response.json();
    const data2 = await res.json();
    setEmail(data[0].value);
    setWhatsappNumber(data2[0].value);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (formData.name === "") {
      newErrors.name = "الاسم مطلوب";
    }
    if (formData.email === "") {
      newErrors.email = "الايميل مطلوب";
    }
    if (formData.message === "") {
      newErrors.message = "الرسالة مطلوبة";
    }
    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/v2/api/contact-us", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      var userAgent = navigator.userAgent;

      // fetch('https://api.ipify.org?format=json')
      //   .then(response => response.json())
      //   .then(async (data) => {
      //     var ipAddress = data.ip;
      //     await sendMetaConversion('Contact', {}, ipAddress, userAgent);
      //   })
      //   .catch(error => console.error('Error fetching IP address:', error));

      setSubmitResult({ success: true, message: result.message });
    } catch (error) {
      setSubmitResult({ success: false, message: "Error sending message" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 shadow-xl rounded-lg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-200 rounded-lg shadow-xl mb-8">
          <div className="bg-gray-300 p-8 text-black text-center">
            <h2 className="text-4xl font-bold mb-4 ">Call Us in Person</h2>
            <a
              href={`tel:${whatsappNumber}`}
              className="text-3xl font-bold hover:text-white transition duration-300 ease-in-out transform hover:scale-105 inline-block"
            >
              {whatsappNumber}
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl ">
          <div className="md:flex">
            <div className="md:flex-shrink-0 bg-gray-300 p-8 text-black direction-rtl">
              <h2 className="text-3xl font-bold mb-4">تواصل معنا</h2>
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <MapPin className="mr-2 text-amazon-yellow" /> موقعنا
                </h3>
                <p className="text-lg leading-relaxed text-gray-800">
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
                  <Mail className="mr-2 text-amazon-yellow" /> ارسال لنا
                </h3>
                <a
                  href={`mailto:${email}`}
                  className="text-lg hover:text-gray-600 transition duration-300"
                >
                  {email}
                </a>
              </div>
            </div>
            <div className="p-8 md:w-2/3">
              <form onSubmit={handleSubmit} className="space-y-6">
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
                    onChange={(e) => {
                      handleChange(e);
                      setError({ ...error, name: null });
                      setSubmitResult(null);
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {error && error.name && (
                    <p className="text-red-500 text-sm mt-1">{error.name}</p>
                  )}
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
                    onChange={(e) => {
                      handleChange(e);
                      setError({ ...error, email: null });
                      setSubmitResult(null);
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {error && error.email && (
                    <p className="text-red-500 text-sm mt-1">{error.email}</p>
                  )}
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
                    onChange={(e) => {
                      handleChange(e);
                      setError({ ...error, message: null });
                      setSubmitResult(null);
                    }}
                    rows="4"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  ></textarea>
                  {error && error.message && (
                    <p className="text-red-500 text-sm mt-1">{error.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-3 px-5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amazon hover:bg-amazon-yellow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
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
