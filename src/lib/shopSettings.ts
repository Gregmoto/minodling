import { unstable_cache } from "next/cache";
import prisma from "./prisma";

export interface ShopShippingSettings {
  shippingCost: number;           // öre
  freeShippingThreshold: number;  // öre
}

const SHIPPING_DEFAULTS: ShopShippingSettings = {
  shippingCost: 4900,
  freeShippingThreshold: 49900,
};

/**
 * Reads shop_shipping_cost and shop_free_shipping_threshold from ShopSetting.
 * Cached for 5 minutes with tag "shop-settings" for targeted revalidation.
 */
export const getShopShippingSettings = unstable_cache(
  async (): Promise<ShopShippingSettings> => {
    try {
      const rows = await prisma.shopSetting.findMany({
        where: { key: { in: ["shop_shipping_cost", "shop_free_shipping_threshold"] } },
      });
      const map = Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]));

      const cost      = parseInt(map["shop_shipping_cost"] ?? "", 10);
      const threshold = parseInt(map["shop_free_shipping_threshold"] ?? "", 10);

      return {
        shippingCost:           isNaN(cost)      ? SHIPPING_DEFAULTS.shippingCost      : cost,
        freeShippingThreshold:  isNaN(threshold) ? SHIPPING_DEFAULTS.freeShippingThreshold : threshold,
      };
    } catch {
      return SHIPPING_DEFAULTS;
    }
  },
  ["shop-shipping-settings"],
  { tags: ["shop-settings"], revalidate: 300 }
);

/**
 * Reads a single ShopSetting value by key.
 */
export async function getSetting(key: string): Promise<string | null> {
  try {
    const row = await prisma.shopSetting.findUnique({ where: { key } });
    return row?.value ?? null;
  } catch {
    return null;
  }
}
