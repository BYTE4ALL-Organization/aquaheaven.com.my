import { ImageResponse } from "next/og";
import { BRAND_COLOR, BRAND_NAME } from "@/lib/brand";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function TwitterImage() {
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
          background: `linear-gradient(135deg, #084354 0%, ${BRAND_COLOR} 100%)`,
          color: "white",
          fontFamily: "Arial",
          padding: "40px",
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: 1 }}>
          {BRAND_NAME}
        </div>
        <div style={{ marginTop: 14, fontSize: 28, opacity: 0.9 }}>
          Discover quality bath and body essentials
        </div>
      </div>
    ),
    size
  );
}
