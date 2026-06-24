import type { DashboardDto, StockTransferInput } from "@connoisseur/shared";
import { InsufficientStockError } from "@connoisseur/shared";
import { prisma } from "../prisma";

export async function getDashboard(): Promise<DashboardDto> {
  const [bundles, stock, recentActivity] = await Promise.all([
    prisma.bundle.groupBy({
      by: ["currentStage"],
      _count: { id: true },
    }),
    prisma.stockBalance.findMany({
      include: { style: { select: { id: true, sku: true, name: true } } },
      orderBy: [{ style: { sku: "asc" } }, { location: "asc" }],
    }),
    prisma.stageTransition.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        bundle: {
          include: { style: { select: { id: true, sku: true, name: true } } },
        },
      },
    }),
  ]);

  const wipByStage = {
    CUTTING: 0,
    STITCHING: 0,
    FINISHING: 0,
    PACKING: 0,
    COMPLETED: 0,
  };

  for (const row of bundles) {
    wipByStage[row.currentStage] = row._count.id;
  }

  return {
    wipByStage,
    stock: stock.map((s) => ({
      styleId: s.styleId,
      location: s.location,
      quantity: s.quantity,
      style: s.style,
    })),
    recentActivity: recentActivity.map((t) => ({
      id: t.id,
      bundleId: t.bundleId,
      fromStage: t.fromStage,
      toStage: t.toStage,
      createdAt: t.createdAt.toISOString(),
      user: t.user,
      bundle: {
        id: t.bundle.id,
        style: t.bundle.style,
      },
    })),
  };
}

export async function transferStock(input: StockTransferInput) {
  if (input.fromLocation === input.toLocation) {
    throw new InsufficientStockError("Source and destination must differ");
  }

  await prisma.$transaction(async (tx) => {
    const source = await tx.stockBalance.findUnique({
      where: {
        styleId_location: {
          styleId: input.styleId,
          location: input.fromLocation,
        },
      },
    });

    if (!source || source.quantity < input.quantity) {
      throw new InsufficientStockError(
        `Not enough stock in ${input.fromLocation}`,
      );
    }

    await tx.stockBalance.update({
      where: { id: source.id },
      data: { quantity: { decrement: input.quantity } },
    });

    await tx.stockBalance.upsert({
      where: {
        styleId_location: {
          styleId: input.styleId,
          location: input.toLocation,
        },
      },
      create: {
        styleId: input.styleId,
        location: input.toLocation,
        quantity: input.quantity,
      },
      update: {
        quantity: { increment: input.quantity },
      },
    });
  });
}
