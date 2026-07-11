import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             "Minodling – Sveriges odlingscommunity",
    short_name:       "Minodling",
    description:      "Tips, guider och community för odling i Sverige",
    start_url:        "/",
    display:          "standalone",
    background_color: "#ffffff",
    theme_color:      "#4A7C59",
    icons: [
      {
        src:   "/apple-touch-icon.png",
        sizes: "180x180",
        type:  "image/png",
      },
    ],
  };
}
