import { NextResponse } from "next/server";
import { readdirSync } from "fs";
import path from "path";

const IMAGE_EXT = /\.(png|jpg|jpeg|gif|webp|svg)$/i;

/** Recursively list all image files under public; URLs use forward slashes (e.g. /images/pic1.png, /images/clothing/dress-style-1.png). */
function listImagesInDir(dir: string, baseUrl: string): string[] {
  const out: string[] = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      // Always use forward slash for URLs (works on Windows too)
      const segment = e.name.replace(/\\/g, "/");
      const url = baseUrl ? `${baseUrl}/${segment}` : `/${segment}`;
      if (e.isFile() && IMAGE_EXT.test(e.name)) {
        out.push(url);
      } else if (e.isDirectory()) {
        out.push(...listImagesInDir(full, url));
      }
    }
  } catch {
    // ignore missing or unreadable dirs
  }
  return out;
}

export async function GET() {
  try {
    const publicPath = path.join(process.cwd(), "public");
    const all = listImagesInDir(publicPath, "");
    // Ensure every path starts with / and uses forward slashes only
    const withSlash = all.map((p) => {
      const normalized = p.replace(/\\/g, "/");
      return normalized.startsWith("/") ? normalized : `/${normalized}`;
    });
    withSlash.sort();
    return NextResponse.json({ images: withSlash });
  } catch (error) {
    console.error("List images error:", error);
    return NextResponse.json(
      { error: "Failed to list images" },
      { status: 500 }
    );
  }
}
