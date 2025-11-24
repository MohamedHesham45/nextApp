"use client";
import { useState, useEffect } from "react";
import { Truck } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function DeliveryTypes() {
  const [governorates, setGovernorates] = useState([]);
  const [selectedGovernorate, setSelectedGovernorate] = useState("");
  const [selectedShippingType, setSelectedShippingType] = useState("");
  const [loading, setLoading] = useState(true);
  const [shippingTypes, setShippingTypes] = useState([]);

  useEffect(() => {
    fetchGovernorates();
    fetchShippingTypes();
  }, []);

  const fetchShippingTypes = async () => {
    try {
      const response = await fetch("/api/shippingType");
      const data = await response.json();
      setShippingTypes(data);
    } catch (error) {
      console.error("Error fetching shipping types:", error);
    }
  };

  const fetchGovernorates = async () => {
    try {
      const response = await fetch("/api/governorate");
      const data = await response.json();
      setGovernorates(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching governorates:", error);
      setLoading(false);
    }
  };

  const getShippingPrice = () => {
    if (!selectedGovernorate || !selectedShippingType) return null;
    const governorate = governorates.find(
      (gov) => gov._id === selectedGovernorate
    );
    if (!governorate?.shippingPrices) return null;
    const shippingPrice = governorate.shippingPrices.find(
      (price) => price.shippingTypeId === selectedShippingType
    );
    return shippingPrice;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 direction-rtl text-amazon-dark-gray bg-gray-50">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">أنواع التوصيل</h1>
        <p>اختر نوع الشحن والمحافظة لمعرفة تكلفة التوصيل</p>
      </header>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">أنواع الشحن المتوفرة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shippingTypes.map((type, index) => (
            <div
              key={type._id}
              className="p-4 rounded-lg border shadow-md bg-white border-r-4 border-amazon-yellow"
            >
              <div className="flex items-center gap-3">
                <div className="bg-amazon-yellow/20 p-2 rounded-lg">
                  <Truck className="text-amazon-yellow" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{type.name}</h3>
                  <p className="text-sm">{type.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block mb-2 font-semibold text-amazon-dark-gray">
            نوع الشحن
          </label>
          <select
            className="w-full p-2 border border-amazon-dark-gray/20 rounded-lg focus:ring-2 focus:ring-amazon-yellow focus:border-amazon-yellow outline-none bg-white disabled:bg-amazon-light-gray disabled:cursor-not-allowed"
            onChange={(e) => setSelectedShippingType(e.target.value)}
            value={selectedShippingType}
          >
            <option value="">اختر نوع الشحن</option>
            {shippingTypes.map((type) => (
              <option key={type._id} value={type._id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-2 font-semibold text-amazon-dark-gray">
            المحافظة
          </label>
          <select
            className="w-full p-2 border border-amazon-dark-gray/20 rounded-lg focus:ring-2 focus:ring-amazon-yellow focus:border-amazon-yellow outline-none bg-white text-amazon-dark-gray disabled:bg-amazon-light-gray disabled:cursor-not-allowed"
            onChange={(e) => setSelectedGovernorate(e.target.value)}
            value={selectedGovernorate}
          >
            <option value="">اختر المحافظة</option>
            {governorates.map((gov) => (
              <option key={gov._id} value={gov._id}>
                {gov.nameAr}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="space-y-4">
        {!selectedGovernorate || !selectedShippingType ? (
          <div className="text-center py-12">
            <Truck className="mx-auto mb-4 text-amazon-dark-gray" size={48} />
            <p>الرجاء اختيار نوع الشحن والمحافظة لعرض تكلفة التوصيل</p>
          </div>
        ) : (
          <div className="p-6 rounded-lg border shadow-md bg-white border-r-4 border-amazon-yellow">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-between gap-4">
                <div className="bg-amazon-yellow/20 p-2 rounded-lg">
                  <Truck className="text-amazon-yellow" size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-semibold m-0">
                    {
                      shippingTypes.find(
                        (type) => type._id === selectedShippingType
                      )?.name
                    }
                  </h4>
                  <p className="text-sm">
                    {
                      governorates.find(
                        (gov) => gov._id === selectedGovernorate
                      )?.nameAr
                    }
                  </p>
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-xl font-bold text-amazon-yellow m-0">
                  {getShippingPrice()?.price} جنيه مصري
                </h3>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
