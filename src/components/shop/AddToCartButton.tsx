"use client";
import { useCart, CartItem } from "./CartContext";
import { ShoppingCart, Check } from "lucide-react";
import { useState } from "react";

interface Props {
  product: Omit<CartItem, "quantity">;
  disabled?: boolean;
}

export function AddToCartButton({ product, disabled }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handle() {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      onClick={handle}
      disabled={disabled || product.stock === 0}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
        added
          ? "bg-green-600 text-white"
          : product.stock === 0
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "bg-green-600 text-white hover:bg-green-700 active:scale-95"
      }`}
    >
      {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
      {product.stock === 0 ? "Slut i lager" : added ? "Tillagd!" : "Lägg i varukorg"}
    </button>
  );
}
