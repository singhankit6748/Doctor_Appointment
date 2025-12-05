import  prisma  from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q) {
      return NextResponse.json([], { status: 200 });
    }

    const medicines = await prisma.medicine.findMany({
      where: {
        name: { contains: q, mode: "insensitive" },
      },
      include: {
        stocks: {
          include: {
            pharmacy: true,
          },
        },
      },
    });

    return NextResponse.json(medicines);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
