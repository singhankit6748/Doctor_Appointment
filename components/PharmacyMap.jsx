"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon issue in Next.js / Leaflet
const defaultIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function PharmacyMap({ pharmacies }) {
  if (!pharmacies?.length) return null;

  const center = [pharmacies[0].lat, pharmacies[0].lng];

  return (
    <div className="w-full h-80 rounded-lg overflow-hidden border mb-6">
      <MapContainer
        center={center}
        zoom={14}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pharmacies.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={defaultIcon}
          >
            <Popup>
              <strong>{p.name}</strong>
              <br />
              {p.address || "No address"}
              <br />
              Distance: {p.distance?.toFixed(2)} km
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
