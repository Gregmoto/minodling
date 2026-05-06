import Link from "next/link";
import Image from "next/image";
import { Package, Eye } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "./AddToCartButton";

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  stockQuantity: number;
  isFeatured: boolean;
  difficultyLevel: string | null;
  createdAt: Date;
  category?: { name: string; slug: string } | null;
}

interface Props {
  product: ProductCardData;
  /** Visa som "Populär" (baserat på extern beräkning) */
  isPopular?: boolean;
}

function isNew(createdAt: Date): boolean {
  return Date.now() - new Date(createdAt).getTime() < 30 * 24 * 60 * 60 * 1000;
}

function difficultyLabel(level: string | null): string | null {
  if (level === "easy")   return "Nybörjarvänlig";
  if (level === "medium") return "Medel";
  if (level === "hard")   return "Avancerad";
  return null;
}

function difficultyColor(level: string | null): string {
  if (level === "easy")   return "bg-emerald-100 text-emerald-700";
  if (level === "medium") return "bg-amber-100 text-amber-700";
  if (level === "hard")   return "bg-red-100 text-red-600";
  return "";
}

export function ProductCard({ product, isPopular }: Props) {
  const outOfStock   = product.stockQuantity === 0;
  const onSale       = !!product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPct  = onSale ? Math.round((1 - product.price / product.compareAtPrice!) * 100) : null;
  const isNewProduct = isNew(product.createdAt);
  const isRecommended = product.isFeatured;
  const isBeginner   = product.difficultyLevel === "easy";

  // Prioritetsordning för övre badges
  const topBadge = isRecommended
    ? { label: "Rekommenderad", cls: "bg-green-600 text-white" }
    : isPopular
    ? { label: "Populär", cls: "bg-orange-500 text-white" }
    : isNewProduct
    ? { label: "Nyhet", cls: "bg-blue-500 text-white" }
    : null;

  return (
    <div className="group bg-white rounded-2xl border border-sage-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col h-full">

      {/* ── BILD ─────────────────────────────────── */}
      <Link href={`/butik/produkt/${product.slug}`} className="block relative aspect-[4/3] bg-sage-50 overflow-hidden shrink-0">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-10 w-10 text-sage-200" />
          </div>
        )}

        {/* Badges övre vänster */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {topBadge && (
            <span className={`${topBadge.cls} text-[10px] font-bold px-2 py-0.5 rounded-full leading-5`}>
              {topBadge.label}
            </span>
          )}
          {discountPct && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-5">
              -{discountPct}%
            </span>
          )}
        </div>

        {/* Slut i lager-overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-white text-gray-500 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
              Slut i lager
            </span>
          </div>
        )}
      </Link>

      {/* ── INNEHÅLL ─────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 gap-2">

        {/* Kategori + svårighetsgrad */}
        <div className="flex flex-wrap items-center gap-1.5 min-h-[1.5rem]">
          {product.category && (
            <span className="text-[11px] font-medium text-sage-700 bg-sage-50 border border-sage-100 px-2 py-0.5 rounded-full">
              {product.category.name}
            </span>
          )}
          {isBeginner && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              🌱 Passar nybörjare
            </span>
          )}
          {!isBeginner && product.difficultyLevel && (
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${difficultyColor(product.difficultyLevel)}`}>
              {difficultyLabel(product.difficultyLevel)}
            </span>
          )}
        </div>

        {/* Namn */}
        <Link href={`/butik/produkt/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 leading-snug group-hover:text-green-700 transition-colors line-clamp-2 text-sm sm:text-base">
            {product.name}
          </h3>
        </Link>

        {/* Kortbeskrivning */}
        {product.shortDescription && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        )}

        {/* ── PRIS + KNAPPAR ───────────────────────── */}
        <div className="mt-auto pt-3 space-y-3">
          {/* Pris */}
          <div className="flex items-baseline gap-2">
            <span className={`text-lg font-bold ${onSale ? "text-red-600" : "text-gray-900"}`}>
              {formatPrice(product.price)}
            </span>
            {onSale && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>

          {/* Knappar */}
          <div className="flex gap-2">
            <Link
              href={`/butik/produkt/${product.slug}`}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-sage-200 text-sage-700 hover:bg-sage-50 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              Visa produkt
            </Link>
            <AddToCartButton
              product={{
                productId:  product.id,
                slug:       product.slug,
                name:       product.name,
                price:      product.price,
                imageUrl:   product.imageUrl,
                stock:      product.stockQuantity,
              }}
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
