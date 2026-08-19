import { ImageResponse } from "next/og";
import { BRAND_COLOR, BRAND_NAME, SITE_TAGLINE } from "@/lib/brand";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: `linear-gradient(135deg, ${BRAND_COLOR} 0%, #084354 100%)`,
          color: "white",
          fontFamily: "Arial",
          padding: "40px",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: 1 }}>
          {BRAND_NAME}
        </div>
        <div style={{ marginTop: 16, fontSize: 28, opacity: 0.9, textAlign: "center" }}>
          {SITE_TAGLINE.slice(0, 80)}
          {SITE_TAGLINE.length > 80 ? "…" : ""}
        </div>
      </div>
    ),
    size
  );
}
