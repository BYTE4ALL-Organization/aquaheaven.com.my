import { NextRequest, NextResponse } from "next/server";
import { seedTowelReviews } from "@/lib/seed-towel-reviews";
import { requireAdminApi } from "../_utils";

export async function POST(request: NextRequest) {
  const forbidden = await requireAdminApi(request);
  if (forbidden) return forbidden;

  try {
    const body = await request.json().catch(() => ({}));
    const productId = typeof body.productId === "string" ? body.productId : undefined;
    const result = await seedTowelReviews(productId ? { productId } : undefined);
    const message = productId
      ? `Added ${result.reviews} reviews to this product.`
      : `Added ${result.reviews} reviews across ${result.products} cotton/feminine product(s).`;
    return NextResponse.json({
      success: true,
      message,
      ...result,
    });
  } catch (error) {
    console.error("Seed towel reviews error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to seed reviews",
      },
      { status: 500 }
    );
  }
}
