import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const operator = await prisma.user.upsert({
    where: { email: "operator@demo.com" },
    update: {},
    create: {
      email: "operator@demo.com",
      passwordHash,
      name: "Floor Operator",
      role: "OPERATOR",
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@demo.com" },
    update: {},
    create: {
      email: "manager@demo.com",
      passwordHash,
      name: "Production Manager",
      role: "MANAGER",
    },
  });

  const styles = await Promise.all([
    prisma.style.upsert({
      where: { sku: "SKU-TEE-001" },
      update: {},
      create: { sku: "SKU-TEE-001", name: "Classic Cotton Tee" },
    }),
    prisma.style.upsert({
      where: { sku: "SKU-POLO-002" },
      update: {},
      create: { sku: "SKU-POLO-002", name: "Blue Polo Shirt" },
    }),
    prisma.style.upsert({
      where: { sku: "SKU-HOOD-003" },
      update: {},
      create: { sku: "SKU-HOOD-003", name: "Fleece Hoodie" },
    }),
  ]);

  const bundleData = [
    { id: "BND-0001", styleId: styles[0].id, quantity: 48, stage: "CUTTING" as const },
    { id: "BND-0002", styleId: styles[0].id, quantity: 36, stage: "STITCHING" as const },
    { id: "BND-0003", styleId: styles[1].id, quantity: 50, stage: "STITCHING" as const },
    { id: "BND-0004", styleId: styles[1].id, quantity: 40, stage: "FINISHING" as const },
    { id: "BND-0005", styleId: styles[2].id, quantity: 30, stage: "FINISHING" as const },
    { id: "BND-0006", styleId: styles[2].id, quantity: 25, stage: "PACKING" as const },
    { id: "BND-0007", styleId: styles[0].id, quantity: 60, stage: "PACKING" as const },
    { id: "BND-0008", styleId: styles[1].id, quantity: 45, stage: "COMPLETED" as const },
    { id: "BND-0009", styleId: styles[2].id, quantity: 35, stage: "COMPLETED" as const },
  ];

  for (const bundle of bundleData) {
    await prisma.bundle.upsert({
      where: { id: bundle.id },
      update: { currentStage: bundle.stage },
      create: {
        id: bundle.id,
        styleId: bundle.styleId,
        quantity: bundle.quantity,
        currentStage: bundle.stage,
      },
    });
  }

  await prisma.stockBalance.upsert({
    where: {
      styleId_location: { styleId: styles[0].id, location: "FACTORY_STORE" },
    },
    update: { quantity: 120 },
    create: { styleId: styles[0].id, location: "FACTORY_STORE", quantity: 120 },
  });

  await prisma.stockBalance.upsert({
    where: {
      styleId_location: { styleId: styles[0].id, location: "DISPATCH" },
    },
    update: { quantity: 80 },
    create: { styleId: styles[0].id, location: "DISPATCH", quantity: 80 },
  });

  await prisma.stockBalance.upsert({
    where: {
      styleId_location: { styleId: styles[1].id, location: "FACTORY_STORE" },
    },
    update: { quantity: 95 },
    create: { styleId: styles[1].id, location: "FACTORY_STORE", quantity: 95 },
  });

  await prisma.stockBalance.upsert({
    where: {
      styleId_location: { styleId: styles[1].id, location: "DISPATCH" },
    },
    update: { quantity: 150 },
    create: { styleId: styles[1].id, location: "DISPATCH", quantity: 150 },
  });

  await prisma.stockBalance.upsert({
    where: {
      styleId_location: { styleId: styles[2].id, location: "FACTORY_STORE" },
    },
    update: { quantity: 60 },
    create: { styleId: styles[2].id, location: "FACTORY_STORE", quantity: 60 },
  });

  console.log("Seed complete");
  console.log({ operator: operator.email, manager: manager.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
