import type { BundleDto, CreateBundleInput } from "@connoisseur/shared";
import {
  getNextStage,
  InvalidTransitionError,
  NotFoundError,
} from "@connoisseur/shared";
import { prisma } from "../prisma";

function toBundleDto(bundle: {
  id: string;
  styleId: string;
  quantity: number;
  currentStage: BundleDto["currentStage"];
  createdAt: Date;
  style: { id: string; sku: string; name: string };
}): BundleDto {
  return {
    id: bundle.id,
    styleId: bundle.styleId,
    quantity: bundle.quantity,
    currentStage: bundle.currentStage,
    createdAt: bundle.createdAt.toISOString(),
    style: bundle.style,
  };
}

export async function getBundleById(id: string): Promise<BundleDto> {
  const bundle = await prisma.bundle.findUnique({
    where: { id },
    include: { style: { select: { id: true, sku: true, name: true } } },
  });

  if (!bundle) {
    throw new NotFoundError(`Bundle ${id} not found`);
  }

  return toBundleDto(bundle);
}

export async function listBundles(): Promise<BundleDto[]> {
  const bundles = await prisma.bundle.findMany({
    include: { style: { select: { id: true, sku: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return bundles.map(toBundleDto);
}

export async function createBundle(input: CreateBundleInput): Promise<BundleDto> {
  const style = await prisma.style.findUnique({ where: { id: input.styleId } });
  if (!style) {
    throw new NotFoundError("Style not found");
  }

  const id =
    input.id ??
    `BND-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  const existing = await prisma.bundle.findUnique({ where: { id } });
  if (existing) {
    throw new InvalidTransitionError(`Bundle ID ${id} already exists`);
  }

  const bundle = await prisma.bundle.create({
    data: {
      id,
      styleId: input.styleId,
      quantity: input.quantity,
      currentStage: "CUTTING",
    },
    include: { style: { select: { id: true, sku: true, name: true } } },
  });

  return toBundleDto(bundle);
}

export async function transitionBundle(
  bundleId: string,
  userId: string,
  toStage: BundleDto["currentStage"],
  fromStage?: BundleDto["currentStage"],
  idempotencyKey?: string,
): Promise<BundleDto> {
  if (idempotencyKey) {
    const existing = await prisma.idempotencyKey.findUnique({
      where: { key: idempotencyKey },
    });
    if (existing) {
      return existing.response as BundleDto;
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const bundle = await tx.bundle.findUnique({
      where: { id: bundleId },
      include: { style: { select: { id: true, sku: true, name: true } } },
    });

    if (!bundle) {
      throw new NotFoundError(`Bundle ${bundleId} not found`);
    }

    if (fromStage && bundle.currentStage !== fromStage) {
      throw new InvalidTransitionError(
        `Bundle is in ${bundle.currentStage}, not ${fromStage}`,
        { currentStage: bundle.currentStage },
      );
    }

    const expectedNext = getNextStage(bundle.currentStage);
    if (!expectedNext || expectedNext !== toStage) {
      throw new InvalidTransitionError(
        `Cannot transition from ${bundle.currentStage} to ${toStage}`,
        { currentStage: bundle.currentStage, expectedNext },
      );
    }

    const updated = await tx.bundle.update({
      where: { id: bundleId },
      data: { currentStage: toStage },
      include: { style: { select: { id: true, sku: true, name: true } } },
    });

    await tx.stageTransition.create({
      data: {
        bundleId,
        fromStage: bundle.currentStage,
        toStage,
        userId,
      },
    });

    if (bundle.currentStage === "PACKING" && toStage === "COMPLETED") {
      await tx.stockBalance.upsert({
        where: {
          styleId_location: {
            styleId: bundle.styleId,
            location: "FACTORY_STORE",
          },
        },
        create: {
          styleId: bundle.styleId,
          location: "FACTORY_STORE",
          quantity: bundle.quantity,
        },
        update: {
          quantity: { increment: bundle.quantity },
        },
      });
    }

    return toBundleDto(updated);
  });

  if (idempotencyKey) {
    await prisma.idempotencyKey.create({
      data: {
        key: idempotencyKey,
        response: result,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
  }

  return result;
}
