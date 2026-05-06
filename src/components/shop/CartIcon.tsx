"use client";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./CartContext";

export function CartIcon() {
  const { count } = useCart();
  return (
    <Link href="/butik/varukorg" className="relative inline-flex items-center p-2 text-gray-600 hover:text-green-700 transition-colors">
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-green-600 text-white text-[10px] font-bold flex items-center justify-center">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
