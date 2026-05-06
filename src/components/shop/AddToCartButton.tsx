"use client";
import { useCart, CartItem } from "./CartContext";
import { ShoppingCart, Check } from "lucide-react";
import { useState } from "react";

interface Props {
  product: Omit<CartItem, "quantity">;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export function AddToCartButton({ product, disabled, size = "md" }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handle() {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const sizeClass = {
    sm: "px-3 py-2 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-5 py-3 text-base gap-2",
  }[size];

  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  const outOfStock = product.stock === 0;

  return (
    <button
      onClick={handle}
      disabled={disabled || outOfStock}
      className={`flex items-center justify-center rounded-xl font-medium transition-all ${sizeClass} ${
        added
          ? "bg-green-600 text-white"
          : outOfStock
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "bg-green-600 text-white hover:bg-green-700 active:scale-95"
      }`}
    >
      {added
        ? <Check className={iconSize} />
        : <ShoppingCart className={iconSize} />}
      <span className={size === "sm" ? "hidden sm:inline" : undefined}>
        {outOfStock ? "Slut i lager" : added ? "Tillagd!" : "Lägg i varukorg"}
      </span>
    </button>
  );
}
