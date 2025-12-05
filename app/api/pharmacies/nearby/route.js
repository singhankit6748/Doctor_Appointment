import { NextResponse } from "next/server";
import prisma from "@/lib/db";

const R = 6371; // km
const toRad = (deg) => (deg * Math.PI) / 180;

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const latParam = url.searchParams.get("lat");
    const lngParam = url.searchParams.get("lng");

    const lat = latParam ? parseFloat(latParam) : null;
    const lng = lngParam ? parseFloat(lngParam) : null;

    // DB se pharmacies + stocks + medicine
    const pharmacies = await prisma.pharmacy.findMany({
      include: {
        stocks: {
          where: { quantity: { gt: 0 } },
          include: {
            medicine: true,
          },
        },
      },
    });

    let result = pharmacies.map((p) => {
      const plat = p.lat;
      const plng = p.lng;

      // distance calculate (agar user ne lat/lng bheja hai)
      let distanceKm = null;
      if (
        lat != null &&
        lng != null &&
        typeof plat === "number" &&
        typeof plng === "number"
      ) {
        const dLat = toRad(plat - lat);
        const dLng = toRad(plng - lng);

        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(lat)) *
            Math.cos(toRad(plat)) *
            Math.sin(dLng / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distanceKm = R * c;
      }

      const finalImage =
        typeof p.imageUrl === "string" && p.imageUrl.trim() !== ""
          ? p.imageUrl
          : "/pharmacies/default.jpg";

      return {
        id: p.id,
        name: p.name,
        address: p.address,
        lat: plat,
        lng: plng,
        distanceKm: distanceKm != null ? Number(distanceKm.toFixed(2)) : null,
        googleMapsUrl:
          plat != null && plng != null
            ? `https://www.google.com/maps/search/?api=1&query=${plat},${plng}`
            : null,
        imageUrl: finalImage,
        medicines: (p.stocks ?? []).map((s) => ({
          id: s.medicine.id,
          name: s.medicine.name,
          salt: s.medicine.salt,
          company: s.medicine.company,
          left: s.quantity,
          price: s.price ?? null,
        })),
      };
    });

    // agar user ne location bheji hai to distance ke hisaab se filter+sort
    if (lat != null && lng != null) {
      result = result
        .filter((p) => p.distanceKm != null && p.distanceKm <= 5)
        .sort((a, b) => a.distanceKm - b.distanceKm);
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("API Error /api/pharmacies/nearby:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
