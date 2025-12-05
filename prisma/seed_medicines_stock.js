// prisma/seed_medicines_stock.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// YOUR MASTER MEDICINE LIST
const MEDICINES = [
  { name: "Paracetamol 650", salt: "Paracetamol", company: "Cipla" },
  { name: "Dolo 650", salt: "Paracetamol", company: "Micro Labs" },
  { name: "Azithromycin 500", salt: "Azithromycin", company: "Zydus" },
  { name: "Amoxicillin 500", salt: "Amoxicillin", company: "Cipla" },
  { name: "Cetrizine 10mg", salt: "Cetirizine", company: "Cipla" },
  { name: "Pantoprazole 40", salt: "Pantoprazole", company: "Sun Pharma" },
  { name: "Omeprazole 20", salt: "Omeprazole", company: "Dr. Reddy" },
  { name: "Metformin 500", salt: "Metformin", company: "Sun Pharma" },
  { name: "Atorvastatin 10", salt: "Atorvastatin", company: "Ranbaxy" },
  { name: "ORS Sachet", salt: "Glucose + Electrolytes", company: "Dr. Reddy" },
  { name: "Ibuprofen 400", salt: "Ibuprofen", company: "Cipla" },
  { name: "Losartan 50", salt: "Losartan", company: "Torrent" },
  { name: "Amlodipine 5", salt: "Amlodipine", company: "Zydus" },
  { name: "Levocetirizine 5mg", salt: "Levocetirizine", company: "Cipla" },
  { name: "Domperidone 10", salt: "Domperidone", company: "Sun Pharma" },
];

// PHARMACY-WISE CUSTOM MEDICINE LIST
const PHARMACY_MEDICINES = {
  "Shri Sai Medicals": ["Dolo 650", "Azithromycin 500", "ORS Sachet"],

  "Shree Vithal Medical": ["Paracetamol 650", "Pantoprazole 40", "Cetrizine 10mg"],

  "Vijayant Medical Store": ["Amoxicillin 500", "Ibuprofen 400", "Omeprazole 20"],

  "MedPlus Pharmacy": ["Dolo 650", "Metformin 500", "Losartan 50"],

  "Ambika Medical Stores": ["Amlodipine 5", "Levocetirizine 5mg", "Domperidone 10"],

  // fallback if pharmacy not listed
  default: ["Paracetamol 650", "ORS Sachet"],
};

// Random generator
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log("💊 Seeding medicines per pharmacy...");

  // 1) Insert MASTER medicines
  await prisma.pharmacyStock.deleteMany();
  await prisma.medicine.deleteMany();

  console.log("🧹 Cleared Medicine + Stock tables");

  await prisma.medicine.createMany({
    data: MEDICINES,
    skipDuplicates: true,
  });

  const allMeds = await prisma.medicine.findMany();
  console.log("📦 Medicines in DB:", allMeds.length);

  // 2) Fetch pharmacies
  const pharmacies = await prisma.pharmacy.findMany();
  console.log("🏥 Pharmacies found:", pharmacies.length);

  const stockData = [];

  // 3) Assign SPECIFIC medicines per pharmacy
  for (const pharmacy of pharmacies) {
    const medNames =
      PHARMACY_MEDICINES[pharmacy.name] || PHARMACY_MEDICINES.default;

    // Fetch only the medicines required for this pharmacy
    const meds = allMeds.filter((m) => medNames.includes(m.name));

    for (const med of meds) {
      stockData.push({
        pharmacyId: pharmacy.id,
        medicineId: med.id,
        quantity: getRandomInt(5, 40), // left stock
        price: getRandomInt(50, 300), // ₹ price
      });
    }
  }

  console.log("🧾 Total stock rows:", stockData.length);

  await prisma.pharmacyStock.createMany({
    data: stockData,
  });

  console.log("🚀 Pharmacy stock seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
