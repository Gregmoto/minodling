import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { SeoSettingsClient } from "./SeoForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "SEO | Admin" };

export default async function SeoPage() {
  const settings = await prisma.seoSetting.findMany({
    orderBy: { pageType: "asc" },
  });

  return (
    <div className="space-y-4">
      <SeoSettingsClient settings={settings} />
    </div>
  );
}
