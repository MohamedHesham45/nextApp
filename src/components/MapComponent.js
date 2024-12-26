import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for missing marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function MapComponent() {
  useEffect(() => {
    const map = L.map("map").setView(
      [31.263354, 32.292418],
      15
    );

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    ).addTo(map);

    L.marker([31.263354, 32.292418])
      .addTo(map)
      .bindPopup(
        `عنواننا هو بورسعيد
        شارع 100 
        بعد ديوان حى العرب
        ثانى محل على الشمال 
        معرض ستارة مول، 
        محافظة بورسعيد، مصر`
      )
      .openPopup();

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div
      id="map"
      className="h-96 rounded-lg shadow-md z-40"
    ></div>
  );
}
