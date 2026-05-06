import { CartProvider } from "@/components/shop/CartContext";
import { ShopCartButton } from "@/components/shop/ShopCartButton";
import { FreeShippingBanner } from "@/components/shop/FreeShippingBanner";
import { getShopShippingSettings } from "@/lib/shopSettings";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const { shippingCost, freeShippingThreshold } = await getShopShippingSettings();

  return (
    <CartProvider shippingCost={shippingCost} freeShippingThreshold={freeShippingThreshold}>
      {/* Slim announcement bar – always at top of all /butik pages */}
      <FreeShippingBanner />
      {children}
      <ShopCartButton />
    </CartProvider>
  );
}
