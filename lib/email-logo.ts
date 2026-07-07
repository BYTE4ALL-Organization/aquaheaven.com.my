import fs from "fs";
import path from "path";

/** CID referenced in HTML as `cid:aquaheaven-logo@aquaheaven.com.my` (Gmail-safe inline image). */
export const EMAIL_LOGO_CID = "aquaheaven-logo@aquaheaven.com.my";

export function getEmailLogoPath(): string {
  return path.join(process.cwd(), "public", "email", "aquaheaven-logo.jpg");
}

/** `src` value for branded email `<img>` tags (nodemailer / Resend inline attachment). */
export function getEmailLogoImgSrc(): string {
  return `cid:${EMAIL_LOGO_CID}`;
}

export function getEmailLogoAttachment(): {
  filename: string;
  path: string;
  cid: string;
  contentType: string;
} {
  return {
    filename: "aquaheaven-logo.jpg",
    path: getEmailLogoPath(),
    cid: EMAIL_LOGO_CID,
    contentType: "image/jpeg",
  };
}

export function getEmailLogoResendAttachment(): {
  content: Buffer;
  filename: string;
  contentId: string;
  contentType: string;
} {
  return {
    content: readEmailLogoBuffer(),
    filename: "aquaheaven-logo.jpg",
    contentId: EMAIL_LOGO_CID,
    contentType: "image/jpeg",
  };
}

/** Read logo bytes (e.g. when `path` is unavailable in serverless bundles). */
export function readEmailLogoBuffer(): Buffer {
  return fs.readFileSync(getEmailLogoPath());
}
