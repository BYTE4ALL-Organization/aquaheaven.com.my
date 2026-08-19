import { getEmailLogoImgSrc } from "@/lib/email-logo";
import { BRAND, BRAND_ACCENT, SITE_NAME } from "@/lib/brand";

export { BRAND, BRAND_ACCENT };
export const TEXT = "#111111";
export const TEXT_MUTED = "#6b7280";
export const SUCCESS = "#166534";
export const BG = "#ffffff";
export const BORDER = "#e5e7eb";

export function emailLayout(params: { title: string; bodyHtml: string }): string {
  const logo = getEmailLogoImgSrc();
  const { title, bodyHtml } = params;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:24px;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:${TEXT}">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto">
    <tr>
      <td style="background:linear-gradient(135deg,${BRAND} 0%,${BRAND_ACCENT} 100%);height:6px;border-radius:8px 8px 0 0"></td>
    </tr>
    <tr>
      <td style="background:${BG};padding:32px 28px 24px;border-left:1px solid ${BORDER};border-right:1px solid ${BORDER}">
        <div style="text-align:center;margin-bottom:24px">
          <img src="${logo}" alt="Aquaheaven" width="200" style="display:block;margin:0 auto;max-width:200px;height:auto;border:0"/>
        </div>
        ${bodyHtml}
      </td>
    </tr>
    <tr>
      <td style="background:${BG};padding:16px 28px 28px;border:1px solid ${BORDER};border-top:0;border-radius:0 0 8px 8px;text-align:center">
        <p style="margin:0;font-size:13px;color:${TEXT_MUTED}">${SITE_NAME}</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailButton(href: string, label: string): string {
  return `<p style="margin:24px 0 0;text-align:center">
  <a href="${href}" style="display:inline-block;padding:12px 24px;background:${BRAND};color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px">${label}</a>
</p>`;
}
