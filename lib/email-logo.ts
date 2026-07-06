import fs from "fs";
import path from "path";

let cachedDataUri: string | null = null;

/**
 * Embedded Aquaheaven logo for email headers (not linked — data URI only).
 */
export function getEmailLogoDataUri(): string {
  if (cachedDataUri) return cachedDataUri;

  const logoPath = path.join(process.cwd(), "public", "email", "aquaheaven-logo.jpg");
  const data = fs.readFileSync(logoPath);
  cachedDataUri = `data:image/jpeg;base64,${data.toString("base64")}`;
  return cachedDataUri;
}
