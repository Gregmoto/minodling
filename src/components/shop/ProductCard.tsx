import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ProductCardProduct {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  stockQuantity: number;
  isFeatured: boolean;
  category?: { name: string; slug: string } | null;
}

interface Props {
  product: ProductCardProduct;
  badge?: string; // t.ex. "Nyhet", "Populär"
  badgeColor?: string;
}

export function ProductCard({ product, badge, badgeColor = "bg-green-600" }: Props) {
  const isOnSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const outOfStock = product.stockQuantity === 0;
  const discount = isOnSale
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : null;

  return (
    <Link href={`/butik/produkt/${product.slug}`} className="group block h-full">
      <div className="bg-white rounded-2xl border border-sage-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden h-full flex flex-col">
        {/* Bild */}
        <div className="relative aspect-[4/3] bg-sage-50 overflow-hidden shrink-0">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-10 w-10 text-sage-200" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {badge && (
              <span className={`${badgeColor} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>
                {badge}
              </span>
            )}
            {discount && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                -{discount}%
              </span>
            )}
          </div>

          {outOfStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="bg-white text-gray-500 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                Slut i lager
              </span>
            </div>
          )}
        </div>

        {/* Innehåll */}
        <div className="p-4 flex flex-col gap-2 flex-1">
          {product.category && (
            <span className="text-[11px] font-medium text-sage-700 bg-sage-50 border border-sage-100 px-2 py-0.5 rounded-full self-start">
              {product.category.name}
            </span>
          )}

          <h3 className="font-semibold text-gray-900 leading-snug group-hover:text-green-700 transition-colors line-clamp-2">
            {product.name}
          </h3>

          {product.shortDescription && (
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {product.shortDescription}
            </p>
          )}

          {/* Pris */}
          <div className="mt-auto pt-3 flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className={`text-lg font-bold ${isOnSale ? "text-red-600" : "text-gray-900"}`}>
                {formatPrice(product.price)}
              </span>
              {isOnSale && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.compareAtPrice!)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
