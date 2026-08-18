import { ImageResponse } from "next/og";

export const size        = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background:     "#1e5450",
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
          <rect width="100" height="100" rx="24" fill="#1e5450" />
          <path d="M50 84 V50" stroke="#f7f5ef" strokeWidth="10" strokeLinecap="round" />
          <path d="M51 58C51 38 40 22 20 18C16 40 29 55 51 58Z" fill="#f7f5ef" />
          <path d="M49 58C49 38 60 22 80 18C84 40 71 55 49 58Z" fill="#7fbf7c" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
