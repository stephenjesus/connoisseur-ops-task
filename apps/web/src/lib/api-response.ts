import type { ApiResponse } from "@connoisseur/shared";
import { AppError } from "@connoisseur/shared";
import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: ResponseInit) {
  const body: ApiResponse<T> = { success: true, data };
  return NextResponse.json(body, init);
}

export function fail(error: unknown) {
  if (error instanceof AppError) {
    const body: ApiResponse<never> = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
    return NextResponse.json(body, { status: error.statusCode });
  }

  console.error(error);
  const body: ApiResponse<never> = {
    success: false,
    error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
  };
  return NextResponse.json(body, { status: 500 });
}
