// prisma/seed.ts
// Seeds the database with an admin user and demo students
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

const PROGRAMS = [
  "Computer Science",
  "Electrical Engineering",
  "Business Administration",
  "Mathematics",
  "Physics",
  "Biology",
  "Psychology",
  "English Literature",
  "Mechanical Engineering",
  "Data Science",
];

const FIRST_NAMES = [
  "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason",
  "Isabella", "James", "Mia", "Benjamin", "Charlotte", "Lucas", "Amelia",
  "Henry", "Harper", "Alexander", "Evelyn", "Daniel", "Luna", "Matthew",
  "Chloe", "Sebastian", "Penelope", "Jack", "Layla", "Owen", "Riley",
  "Theodore",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
  "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark",
  "Ramirez", "Lewis", "Robinson",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function randomGpa(): number {
  return Math.round((Math.random() * 2.5 + 1.5) * 100) / 100; // 1.50 - 4.00
}

async function main() {
  console.info("🌱 Seeding database...\n");

  // ─── Create Admin User ─────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@123456", SALT_ROUNDS);
  const admin = await prisma.user.upsert({
    where: { email: "admin@sms.dev" },
    update: {},
    create: {
      email: "admin@sms.dev",
      name: "System Admin",
      password: adminPassword,
      role: "ADMIN",
      isActive: true,
    },
  });
  console.info(`✅ Admin user: ${admin.email} (password: Admin@123456)`);

  // ─── Create Regular User ──────────────────────────────────
  const userPassword = await bcrypt.hash("User@123456", SALT_ROUNDS);
  const user = await prisma.user.upsert({
    where: { email: "user@sms.dev" },
    update: {},
    create: {
      email: "user@sms.dev",
      name: "Regular User",
      password: userPassword,
      role: "USER",
      isActive: true,
    },
  });
  console.info(`✅ Regular user: ${user.email} (password: User@123456)`);

  // ─── Create Demo Students ─────────────────────────────────
  const statuses = ["ACTIVE", "ACTIVE", "ACTIVE", "ACTIVE", "INACTIVE", "GRADUATED", "SUSPENDED"] as const;
  const genders = ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"] as const;

  const studentsToCreate = 50;
  const usedEmails = new Set<string>();
  let created = 0;

  for (let i = 0; i < studentsToCreate; i++) {
    const firstName = randomItem(FIRST_NAMES);
    const lastName = randomItem(LAST_NAMES);
    let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@university.edu`;

    // Ensure unique emails
    if (usedEmails.has(email)) {
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@university.edu`;
    }
    if (usedEmails.has(email)) continue;
    usedEmails.add(email);

    await prisma.student.create({
      data: {
        firstName,
        lastName,
        email,
        dateOfBirth: randomDate(new Date("1998-01-01"), new Date("2005-12-31")),
        gender: randomItem([...genders]),
        phone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
        address: `${Math.floor(Math.random() * 9999) + 1} Main Street`,
        city: randomItem(["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "San Diego"]),
        state: randomItem(["NY", "CA", "IL", "TX", "AZ"]),
        zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        country: "US",
        enrollmentDate: randomDate(new Date("2021-08-01"), new Date("2024-09-01")),
        program: randomItem(PROGRAMS),
        year: Math.floor(Math.random() * 4) + 1,
        gpa: randomGpa(),
        status: randomItem([...statuses]),
      },
    });
    created++;
  }

  console.info(`✅ Created ${created} demo students`);

  // ─── Create Feature Flags ─────────────────────────────────
  const flags = [
    { key: "csv_import", enabled: true, description: "Enable CSV import feature" },
    { key: "csv_export", enabled: true, description: "Enable CSV export feature" },
    { key: "dark_mode", enabled: true, description: "Enable dark mode toggle" },
    { key: "analytics_dashboard", enabled: true, description: "Enable analytics dashboard" },
    { key: "pdf_export", enabled: false, description: "Enable PDF export (coming soon)" },
    { key: "2fa", enabled: false, description: "Enable two-factor authentication" },
    { key: "onboarding", enabled: false, description: "Enable onboarding tutorial" },
  ];

  for (const flag of flags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: {},
      create: flag,
    });
  }
  console.info(`✅ Created ${flags.length} feature flags`);

  // ─── Create Initial Audit Log ─────────────────────────────
  await prisma.auditLog.create({
    data: {
      action: "CREATE",
      entity: "User",
      entityId: null, // No student reference for user creation audit
      userId: admin.id,
      userName: admin.name,
      changes: JSON.stringify({ seed: true }),
      metadata: JSON.stringify({ source: "seed-script" }),
    },
  });
  console.info("✅ Created initial audit log entry");

  console.info("\n🎉 Seeding completed successfully!");
  console.info("\n📋 Login credentials:");
  console.info("   Admin: admin@sms.dev / Admin@123456");
  console.info("   User:  user@sms.dev / User@123456");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
