import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { updateSetting } from "@/app/admin/actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Inställningar | Admin" };

function formatKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function InstallningarPage() {
  const settings = await prisma.adminSetting.findMany({
    orderBy: { key: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Inställningar</h1>

      <div className="rounded-xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm text-amber-700">
        Ändringar träder i kraft direkt.
      </div>

      {settings.length === 0 && (
        <p className="text-gray-400 text-sm">Inga inställningar hittades.</p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {settings.map((setting) => (
          <Card key={setting.key} className="space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                {setting.key}
              </p>
              <p className="mt-0.5 text-base font-semibold text-gray-900">
                {formatKey(setting.key)}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Nuvarande: <span className="font-medium text-gray-700">{setting.value ?? "–"}</span>
              </p>
            </div>
            <form
              action={async (formData: FormData) => {
                "use server";
                await updateSetting(setting.key, formData.get("value") as string);
              }}
              className="flex gap-2"
            >
              <input
                name="value"
                defaultValue={setting.value ?? ""}
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sage-300 min-w-0"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-medium bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors shrink-0"
              >
                Spara
              </button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
