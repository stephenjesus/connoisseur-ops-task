import type { CreateStyleInput, StyleDto } from "@connoisseur/shared";
import { NotFoundError } from "@connoisseur/shared";
import { prisma } from "../prisma";

function toStyleDto(style: {
  id: string;
  sku: string;
  name: string;
  createdAt: Date;
}): StyleDto {
  return {
    id: style.id,
    sku: style.sku,
    name: style.name,
    createdAt: style.createdAt.toISOString(),
  };
}

export async function listStyles(): Promise<StyleDto[]> {
  const styles = await prisma.style.findMany({ orderBy: { createdAt: "desc" } });
  return styles.map(toStyleDto);
}

export async function createStyle(input: CreateStyleInput): Promise<StyleDto> {
  const style = await prisma.style.create({
    data: {
      sku: input.sku,
      name: input.name,
    },
  });
  return toStyleDto(style);
}

export async function getStyleById(id: string): Promise<StyleDto> {
  const style = await prisma.style.findUnique({ where: { id } });
  if (!style) throw new NotFoundError("Style not found");
  return toStyleDto(style);
}
