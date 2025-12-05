// prisma/seed.js
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Optional: manual overrides (agar kisi ka special image rakhna ho)
const pharmacyImageMap = {
  "Ambika Medical Store": "/pharmacies/Ambika.png",
  "HERD Pharmacy": "/pharmacies/herd.webp",
  "Ketan Medical": "/pharmacies/ketan medical.webp",
  // baaki chaho to yahan add kar sakte ho
};

async function main() {
  console.log("🚀 Starting Pharmacy Seeder...");

  // 1) Load JSON
  const filePath = path.join(__dirname, "pharmacies.json");

  if (!fs.existsSync(filePath)) {
    console.error("❌ pharmacies.json not found at:", filePath);
    return;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  let rows = [];

  try {
    rows = JSON.parse(raw);
  } catch (e) {
    console.error("❌ JSON parse error:", e.message);
    return;
  }

  console.log("📄 Total rows in JSON:", rows.length);

  // 2) Convert JSON → DB format
  const data = rows
    .map((row, idx) => {
      const name = row.name ? String(row.name).trim() : "";
      const lat = Number(row.lat);
      const lng = Number(row.lng);

      if (!name || Number.isNaN(lat) || Number.isNaN(lng)) {
        console.log("⚠️ Invalid row, skipping:", idx + 1, row);
        return null;
      }

      // --- IMAGE URL NORMALIZATION ---

      let imageUrl = null;

      // a) start from JSON value if present
      if (row.imageUrl) {
        let rawPath = String(row.imageUrl).trim();

        // remove leading "public" / "/public"
        if (rawPath.startsWith("/public/")) {
          rawPath = rawPath.replace(/^\/public/, "");
        } else if (rawPath.startsWith("public/")) {
          rawPath = rawPath.replace(/^public/, "");
        }

        // ensure it starts with "/"
        if (!rawPath.startsWith("/")) {
          rawPath = "/" + rawPath;
        }

        imageUrl = rawPath; // e.g. "/pharmacies/1. shri sai medicals.png"
      }

      // b) manual override from pharmacyImageMap (if exists)
      if (pharmacyImageMap[name]) {
        imageUrl = pharmacyImageMap[name];
      }

      return {
        name,
        address: row.address || null,
        phone: row.phone || null,
        lat,
        lng,
        isOpen24x7: row.isOpen24x7 ?? false,
        imageUrl, // final normalized URL
      };
    })
    .filter(Boolean);

  console.log("✅ Valid rows to insert:", data.length);

  // 3) Clear table
  console.log("📊 Count before:", await prisma.pharmacy.count());
  await prisma.pharmacy.deleteMany({});
  console.log("🧹 Cleared Pharmacy table");

  // 4) Insert fresh
  const inserted = await prisma.pharmacy.createMany({
    data,
    skipDuplicates: true,
  });

  console.log("🚀 Inserted rows:", inserted.count);
  console.log("📊 Count after:", await prisma.pharmacy.count());

  // 5) Check images exist
  console.log("\n🖼 Checking missing image files...");

  data.forEach((d) => {
    if (!d.imageUrl) return;

    // d.imageUrl like "/pharmacies/xyz.png"
    const relPath = d.imageUrl.startsWith("/")
      ? d.imageUrl.slice(1)
      : d.imageUrl;

    const fullPath = path.join(process.cwd(), "public", relPath);

    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️ Missing image for: ${d.name}`);
      console.log(`   → Expected: ${d.imageUrl}`);
    }
  });

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
