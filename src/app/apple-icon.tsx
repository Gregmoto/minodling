import { ImageResponse } from "next/og";

export const size        = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background:     "#4f664f",
          borderRadius:   "40px",
          width:          "100%",
          height:         "100%",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
        }}
      >
        {/* Sprout-ikon i vitt */}
        <svg
          width="110"
          height="110"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stjälk */}
          <line x1="50" y1="72" x2="50" y2="46" stroke="white" strokeWidth="5" strokeLinecap="round" />
          {/* Vänster blad */}
          <path d="M50 58 C50 58 34 54 30 40 C38 40 50 46 50 58Z" fill="white" />
          {/* Höger blad */}
          <path d="M50 52 C50 52 66 44 72 30 C62 32 50 42 50 52Z" fill="white" />
          {/* Knopp */}
          <circle cx="50" cy="34" r="5" fill="white" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
