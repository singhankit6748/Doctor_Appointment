"use client";

import { useEffect, useState } from "react";

export default function PharmacyPage() {
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  if (!("geolocation" in navigator)) {
    console.error("Geolocation not supported");
    setPharmacies([]);
    setLoading(false);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;

      try {
        const res = await fetch(
          `/api/pharmacies/nearby?lat=${latitude}&lng=${longitude}`
        );

        const data = await res.json();
        console.log("API pharmacy response:", data);

        if (Array.isArray(data)) {
          setPharmacies(data);
        } else {
          console.error("Expected array, got:", data);
          setPharmacies([]);
        }
      } catch (err) {
        console.error("Pharmacy fetch error:", err);
        setPharmacies([]);
      } finally {
        setLoading(false);
      }
    },

    async (err) => {
      console.error("Geolocation error:", err);

      // --- FALLBACK (Nagpur default) ---
      const fallbackLat = 21.1458;
      const fallbackLng = 79.0882;

      try {
        const res = await fetch(
          `/api/pharmacies/nearby?lat=${fallbackLat}&lng=${fallbackLng}`
        );
        const data = await res.json();

        setPharmacies(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Fallback fetch error:", e);
        setPharmacies([]);
      } finally {
        setLoading(false);
      }
    },

    {
      enableHighAccuracy: true,
      timeout: 10000,
    }
  );
}, []);


  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Nearby Medical Stores</h1>
        <p>Loading nearby medicals...</p>
      </div>
    );
  }

  // ------------------ DETAIL VIEW (ek medical select hone ke baad) ------------------
  if (selectedPharmacy) {
    const meds = Array.isArray(selectedPharmacy.medicines)
      ? selectedPharmacy.medicines
      : [];

    return (
      <div className="p-6">
        <button
          onClick={() => setSelectedPharmacy(null)}
          className="mb-4 px-3 py-1 rounded bg-gray-200 text-sm"
        >
          ← Back to nearby medicals
        </button>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <img
              src={
                selectedPharmacy.imageUrl || "/images/medical-placeholder.jpg"
              }
              alt={selectedPharmacy.name}
              className="w-full h-56 object-cover rounded-xl border"
            />
          </div>

          <div className="md:w-2/3 space-y-1">
            <h1 className="text-2xl font-bold">{selectedPharmacy.name}</h1>
            {selectedPharmacy.address && (
              <p className="text-sm text-gray-300">
                {selectedPharmacy.address}
              </p>
            )}
            {typeof selectedPharmacy.distanceKm === "number" && (
              <p className="text-sm text-gray-400">
                Distance: {selectedPharmacy.distanceKm.toFixed(2)} km
              </p>
            )}
            {selectedPharmacy.googleMapsUrl && (
              <a
                href={selectedPharmacy.googleMapsUrl}
                target="_blank"
                className="inline-block mt-2 text-sm underline text-blue-400"
              >
                View on Google Maps
              </a>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-3">Available Medicines</h2>
          {meds.length ? (
            <ul className="space-y-2">
              {meds.map((med, idx) => (
                <li
                  key={med.id ?? idx}
                  className="border rounded-lg px-4 py-2 text-sm bg-black/20"
                >
                  {typeof med === "string"
                    ? med
                    : `${med.name} — ${med.left} left${
                        med.price ? ` (₹${med.price})` : ""
                      }`}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">
              No medicines data available for this store.
            </p>
          )}
        </div>
      </div>
    );
  }

  // ------------------ LIST VIEW (grid of medicals) ------------------
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Nearby Medical Stores</h1>

      {(!Array.isArray(pharmacies) || pharmacies.length === 0) && (
        <p className="text-sm text-gray-400">No nearby medicals found.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(pharmacies) &&
          pharmacies.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPharmacy(p)}
              className="text-left bg-black/30 border border-gray-700 rounded-2xl overflow-hidden hover:border-blue-400 transition cursor-pointer"
            >
              <div className="w-full h-40 overflow-hidden">
                <img
                  src={p.imageUrl || "/images/medical-placeholder.jpg"}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 space-y-1">
                <h2 className="font-semibold text-lg">{p.name}</h2>

                {typeof p.distanceKm === "number" && (
                  <p className="text-xs text-gray-400">
                    Distance: {p.distanceKm.toFixed(2)} km
                  </p>
                )}

                {p.address && (
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {p.address}
                  </p>
                )}

                {p.googleMapsUrl && (
                  <a
                    href={p.googleMapsUrl}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()} // taaki card click se conflict na ho
                    className="inline-block mt-2 text-xs underline text-blue-400"
                  >
                    View on Google Maps
                  </a>
                )}

                <p className="mt-3 text-xs text-gray-300">
                  Click card to view medicines →
                </p>
              </div>
            </button>
          ))}
      </div>
    </div>
  );
}
