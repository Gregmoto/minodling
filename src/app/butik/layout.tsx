import { CartProvider } from "@/components/shop/CartContext";
import { ShopCartButton } from "@/components/shop/ShopCartButton";
import { getShopShippingSettings } from "@/lib/shopSettings";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const { shippingCost, freeShippingThreshold } = await getShopShippingSettings();

  return (
    <CartProvider shippingCost={shippingCost} freeShippingThreshold={freeShippingThreshold}>
      {children}
      <ShopCartButton />
    </CartProvider>
  );
}
