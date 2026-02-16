import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { seedBathBodyReviews } from "@/lib/seed-bath-body-reviews";

export async function POST(request: NextRequest) {
  const session = await auth(request);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const productId = typeof body.productId === "string" ? body.productId : undefined;
    const result = await seedBathBodyReviews(productId ? { productId } : undefined);
    const message = productId
      ? `Added ${result.reviews} reviews to this product.`
      : `Added ${result.reviews} reviews across ${result.products} Bath & body product(s).`;
    return NextResponse.json({
      success: true,
      message,
      ...result,
    });
  } catch (error) {
    console.error("Seed Bath & body reviews error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to seed reviews",
      },
      { status: 500 }
    );
  }
}
