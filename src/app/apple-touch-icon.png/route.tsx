/**
 * Serves the apple-touch-icon at the standard iOS fallback URL.
 * iOS Safari looks for /apple-touch-icon.png even without a <link> tag.
 */
export const runtime = "edge";

import { ImageResponse } from "next/og";

export async function GET() {
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
        <svg
          width="110"
          height="110"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="50" y1="72" x2="50" y2="46" stroke="white" strokeWidth="5" strokeLinecap="round" />
          <path d="M50 58 C50 58 34 54 30 40 C38 40 50 46 50 58Z" fill="white" />
          <path d="M50 52 C50 52 66 44 72 30 C62 32 50 42 50 52Z" fill="white" />
          <circle cx="50" cy="34" r="5" fill="white" />
        </svg>
      </div>
    ),
    { width: 180, height: 180 },
  );
}
