import { CartProvider } from "@/components/shop/CartContext";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
