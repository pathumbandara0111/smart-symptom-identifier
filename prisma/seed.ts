import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...");

  // ── Hospitals ────────────────────────────────────────────────────────────────
  const hospitals = await Promise.all([
    prisma.hospital.upsert({
      where: { id: "h1" },
      update: {},
      create: {
        id: "h1",
        name: "National Hospital Colombo",
        address: "Regent Street, Colombo 07, Sri Lanka",
        lat: 6.9271,
        lng: 79.8612,
        phone: "+94112691111",
        type: "Government",
      },
    }),
    prisma.hospital.upsert({
      where: { id: "h2" },
      update: {},
      create: {
        id: "h2",
        name: "Asiri Medical Hospital",
        address: "181 Kirula Road, Colombo 05, Sri Lanka",
        lat: 6.8952,
        lng: 79.8697,
        phone: "+94115522222",
        type: "Private",
      },
    }),
    prisma.hospital.upsert({
      where: { id: "h3" },
      update: {},
      create: {
        id: "h3",
        name: "Nawaloka Hospital",
        address: "23 Deshamanya H.K. Dharmadasa Mawatha, Colombo 02",
        lat: 6.9155,
        lng: 79.8553,
        phone: "+94115777777",
        type: "Private",
      },
    }),
    prisma.hospital.upsert({
      where: { id: "h4" },
      update: {},
      create: {
        id: "h4",
        name: "Kandy Teaching Hospital",
        address: "Norwood Road, Kandy, Sri Lanka",
        lat: 7.2906,
        lng: 80.6337,
        phone: "+94812222261",
        type: "Government",
      },
    }),
    prisma.hospital.upsert({
      where: { id: "h5" },
      update: {},
      create: {
        id: "h5",
        name: "Teaching Hospital Galle",
        address: "Wackwella Road, Galle, Sri Lanka",
        lat: 6.0535,
        lng: 80.2210,
        phone: "+94912222261",
        type: "Government",
      },
    }),
  ]);

  console.log(`✅ Created ${hospitals.length} hospitals`);

  // ── Doctors ──────────────────────────────────────────────────────────────────
  const doctors = [
    { id: "d1", hospitalId: "h1", name: "Dr. Priya Wijesekara", speciality: "General Physician", fee: 1500, phone: "+94112691111" },
    { id: "d2", hospitalId: "h1", name: "Dr. Nuwan Bandara", speciality: "Emergency Medicine", fee: 2000, phone: "+94112691112" },
    { id: "d3", hospitalId: "h2", name: "Dr. Sachini Perera", speciality: "Dermatologist", fee: 3500, phone: "+94115522233" },
    { id: "d4", hospitalId: "h2", name: "Dr. Ruvini Fernando", speciality: "Pediatrician", fee: 3000, phone: "+94115522244" },
    { id: "d5", hospitalId: "h3", name: "Dr. Kasun Rajapaksha", speciality: "Cardiologist", fee: 5000, phone: "+94115777788" },
    { id: "d6", hospitalId: "h3", name: "Dr. Malini Silva", speciality: "General Physician", fee: 2500, phone: "+94115777799" },
    { id: "d7", hospitalId: "h4", name: "Dr. Thilanka Jayasuriya", speciality: "General Physician", fee: 1200, phone: "+94812222262" },
    { id: "d8", hospitalId: "h5", name: "Dr. Anusha Dissanayake", speciality: "Neurologist", fee: 4500, phone: "+94912222262" },
  ];

  for (const doctor of doctors) {
    await prisma.doctor.upsert({
      where: { id: doctor.id },
      update: {},
      create: doctor,
    });
  }

  console.log(`✅ Created ${doctors.length} doctors`);

  // ── Illnesses & First Aid ────────────────────────────────────────────────────
  const illnessData = [
    {
      id: "i1", name: "Common Cold", description: "Viral infection of the nose and throat", category: "respiratory",
      steps: ["Rest and drink plenty of fluids", "Take over-the-counter pain relievers if needed", "Use saline nasal spray", "Gargle with warm salt water for sore throat", "Avoid spreading by washing hands regularly"],
    },
    {
      id: "i2", name: "Fever", description: "Elevated body temperature above 38°C", category: "general",
      steps: ["Rest in a cool room", "Drink plenty of fluids to avoid dehydration", "Apply a cool damp cloth to the forehead", "Remove excess clothing or blankets", "Seek medical help if fever exceeds 39°C or lasts more than 3 days"],
    },
    {
      id: "i3", name: "Minor Burns", description: "First-degree burns affecting the outer skin layer", category: "injuries",
      steps: ["Cool the burn under cool (not cold) running water for 10-20 minutes", "Do NOT apply ice, butter, or toothpaste", "Cover loosely with a sterile dressing or clean cloth", "Take paracetamol for pain relief if needed", "Seek medical attention if burn is larger than 3cm or on face/hands"],
    },
    {
      id: "i4", name: "Cuts & Wounds", description: "Minor cuts and lacerations", category: "injuries",
      steps: ["Apply direct pressure with a clean cloth to stop bleeding", "Clean the wound gently with clean water", "Apply antiseptic cream", "Cover with a sterile bandage", "Change the dressing daily and watch for signs of infection (redness, swelling, pus)"],
    },
    {
      id: "i5", name: "Food Poisoning", description: "Illness caused by eating contaminated food", category: "digestive",
      steps: ["Rest and avoid solid food for a few hours", "Sip small amounts of water or oral rehydration solution frequently", "Avoid dairy, fatty, spicy foods until recovered", "Seek help if vomiting continues more than 24 hours or blood in stool", "Go to emergency if severely dehydrated (no urination, dizziness, dry mouth)"],
    },
    {
      id: "i6", name: "Allergic Reaction (Mild)", description: "Mild allergic response to triggers like food, pollen, or insects", category: "allergies",
      steps: ["Remove or avoid the trigger if possible", "Apply a cold compress to reduce swelling", "Take an antihistamine if available", "Do NOT scratch hives or rashes", "Go to EMERGENCY IMMEDIATELY if throat swells or breathing becomes difficult"],
    },
    {
      id: "i7", name: "Choking", description: "Airway blockage preventing breathing", category: "emergency",
      steps: ["Ask 'Are you choking?' — if they cannot speak or breathe, act immediately", "Call emergency services (1990) immediately", "Give 5 firm back blows between the shoulder blades", "Give 5 abdominal thrusts (Heimlich maneuver)", "Repeat until the object is dislodged or help arrives"],
    },
    {
      id: "i8", name: "Fainting", description: "Temporary loss of consciousness", category: "emergency",
      steps: ["Lay the person on their back", "Raise their legs above heart level (30cm) to improve blood flow", "Loosen any tight clothing around neck/chest", "Do not give anything to eat or drink until fully conscious", "Call emergency if person does not regain consciousness within 1 minute"],
    },
  ];

  for (const illness of illnessData) {
    await prisma.illness.upsert({
      where: { id: illness.id },
      update: {},
      create: {
        id: illness.id,
        name: illness.name,
        description: illness.description,
        category: illness.category,
        firstAids: {
          create: illness.steps.map((instruction, index) => ({
            step: index + 1,
            instruction,
          })),
        },
      },
    });
  }

  console.log(`✅ Created ${illnessData.length} illnesses with first-aid steps`);

  // ── Admin ────────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: adminPassword,
    },
  });
  console.log("✅ Created default admin account (admin / admin123)");

  console.log("🎉 Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
