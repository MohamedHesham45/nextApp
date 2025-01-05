"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const MapComponent = dynamic(
  () => import("./MapComponent"),
  {
    ssr: false,
    loading: () => <p>Loading map...</p>,
  }
);

export default function MapLocation() {
  const [isMounted, setIsMounted] =
    useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section className="mb-16 container mx-auto px-6 bg-amazon-light-gray">
      <h2 className="text-3xl font-bold mb-8 text-center">
        Find Us
      </h2>
      {isMounted && <MapComponent />}
      <a
        href="https://maps.apple.com/?ll=31.263354,32.292418&q=%D8%A7%D9%84%D8%B3%D9%8A%D8%A7%D8%B1%D8%A9%20%D9%85%D8%B1%D9%83%D9%88%D9%86%D8%A9&t=h"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 underline mt-4 block text-center "
      >
        View on Apple Maps
      </a>
    </section>
  );
}

// "use client";

// import { useEffect } from "react";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";

// // Fix for missing marker icons
// delete L.Icon.Default.prototype._getIconUrl;

// L.Icon.Default.mergeOptions({
//   iconRetinaUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
//   iconUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
//   shadowUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
// });

// export default function MapLocation() {
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const map = L.map("map").setView(
//         [31.263354, 32.292418], // New location coordinates for بورسعيد
//         15
//       );

//       L.tileLayer(
//         "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
//         {
//           attribution:
//             '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//         }
//       ).addTo(map);

//       L.marker([31.263354, 32.292418]) // Update marker coordinates
//         .addTo(map)
//         .bindPopup(
//           `عنواننا هو بورسعيد
//           شارع 100
//           بعد ديوان حى العرب
//           ثانى محل على الشمال
//           معرض ستارة مول،
//           محافظة بورسعيد، مصر`
//         ) // Update popup text
//         .openPopup();

//       return () => {
//         map.remove();
//       };
//     }
//   }, []);

//   return (
//     <section className="mb-16 container mx-auto px-6">
//       <h2 className="text-3xl font-bold mb-8 text-center">
//         Find Us
//       </h2>
//       <div
//         id="map"
//         className="h-96 rounded-lg shadow-md"
//       ></div>
//       <a
//         href="https://maps.apple.com/?ll=31.263354,32.292418&q=%D8%A7%D9%84%D8%B3%D9%8A%D8%A7%D8%B1%D8%A9%20%D9%85%D8%B1%D9%83%D9%88%D9%86%D8%A9&t=h"
//         target="_blank"
//         rel="noopener noreferrer"
//         className="text-blue-500 underline mt-4 block text-center"
//       >
//         View on Apple Maps
//       </a>
//     </section>
//   );
// }
