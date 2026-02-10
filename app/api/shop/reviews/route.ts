import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** GET: latest reviews from DB for Happy Customers section (read-only). */
export async function GET() {
  try {
    const limit = 12;
    const rows = await prisma.review.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
      },
    });

    const reviews = rows.map((r) => ({
      id: r.id,
      user: r.user.name || "Customer",
      content: r.comment || r.title || "",
      rating: r.rating,
      date: r.createdAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    }));

    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error("Error fetching happy customer reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
