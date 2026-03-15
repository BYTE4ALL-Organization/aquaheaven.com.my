import { NextResponse } from "next/server";
import { authAdmin } from "@/lib/auth";

export async function requireAdminApi(request: Request): Promise<NextResponse | null> {
  const result = await authAdmin(request);
  if (result.ok) return null;
  return NextResponse.json(
    { success: false, error: result.error },
    { status: result.status }
  );
}
