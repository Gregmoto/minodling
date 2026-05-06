"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Package } from "lucide-react";
import { useCart } from "@/components/shop/CartContext";
import { formatPrice } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

export default function VarukorgsPage() {
  const { items, count, total, removeItem, updateQty } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-cream-50">
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <ShoppingBag className="h-20 w-20 text-sage-200 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Varukorgen är tom</h1>
            <p className="text-gray-500 mb-6">Lägg till produkter från butiken för att fortsätta.</p>
            <Link
              href="/butik"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors"
            >
              Gå till butiken
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const shipping = total >= 49900 ? 0 : 4900;
  const orderTotal = total + shipping;

  return (
    <div className="flex min-h-screen flex-col bg-cream-50">
      <main className="flex-1 py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Varukorg <span className="text-gray-400 text-lg font-normal">({count} varor)</span>
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Varor */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => (
                <Card key={item.productId} padding="sm" className="flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 bg-sage-50 rounded-xl overflow-hidden">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-6 w-6 text-sage-200" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/butik/produkt/${item.slug}`}
                      className="font-semibold text-gray-900 hover:text-green-700 transition-colors text-sm line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-green-700 font-medium mt-0.5">{formatPrice(item.price)}</p>
                  </div>

                  {/* Antal */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateQty(item.productId, item.quantity - 1)}
                      className="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                      aria-label="Minska antal"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="h-7 w-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-40 transition-colors"
                      aria-label="Öka antal"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Summa */}
                  <div className="text-right shrink-0 w-20">
                    <p className="font-semibold text-gray-900 text-sm">{formatPrice(item.price * item.quantity)}</p>
                  </div>

                  {/* Ta bort */}
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="shrink-0 h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    aria-label="Ta bort"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </Card>
              ))}
            </div>

            {/* Sammanfattning */}
            <div className="lg:col-span-1">
              <Card padding="lg" className="sticky top-24">
                <h2 className="font-bold text-gray-900 mb-4">Ordersammanfattning</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Delsumma</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Frakt</span>
                    <span>{shipping === 0 ? <span className="text-green-600">Gratis</span> : formatPrice(shipping)}</span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-gray-400">Fri frakt över {formatPrice(49900)}</p>
                  )}
                  <div className="border-t border-sage-100 pt-2 flex justify-between font-bold text-gray-900">
                    <span>Totalt</span>
                    <span>{formatPrice(orderTotal)}</span>
                  </div>
                </div>

                <Link
                  href="/butik/kassa"
                  className="mt-5 flex items-center justify-center gap-2 w-full py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors"
                >
                  Till kassan
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/butik"
                  className="mt-3 block text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Fortsätt handla
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
