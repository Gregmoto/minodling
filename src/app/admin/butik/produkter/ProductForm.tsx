"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import { createProduct, updateProduct } from "@/app/admin/butik/actions";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  imageUrl: string | null;
  categoryId: string | null;
  price: number;
  compareAtPrice: number | null;
  sku: string | null;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
}

interface Props {
  categories: Category[];
  product?: Product;
}

export function ProductForm({ categories, product }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      if (product) {
        await updateProduct(product.id, fd);
      } else {
        await createProduct(fd);
      }
      router.push("/admin/butik/produkter");
    });
  }

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Namn *</label>
          <input
            name="name"
            required
            defaultValue={product?.name}
            className={inputClass}
            onChange={(e) => {
              const slugInput = e.currentTarget.form?.elements.namedItem("slug") as HTMLInputElement | null;
              if (slugInput && !product) slugInput.value = slugify(e.target.value);
            }}
          />
        </div>
        <div>
          <label className={labelClass}>Slug *</label>
          <input
            name="slug"
            required
            defaultValue={product?.slug}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Kort beskrivning</label>
        <input name="shortDescription" defaultValue={product?.shortDescription ?? ""} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Beskrivning</label>
        <textarea
          name="description"
          defaultValue={product?.description ?? ""}
          rows={5}
          className={`${inputClass} resize-y`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Pris (SEK) *</label>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={product ? (product.price / 100).toFixed(2) : ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Jämförpris (SEK)</label>
          <input
            name="compareAtPrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.compareAtPrice ? (product.compareAtPrice / 100).toFixed(2) : ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Lager *</label>
          <input
            name="stockQuantity"
            type="number"
            min="0"
            required
            defaultValue={product?.stockQuantity ?? 0}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Kategori</label>
          <select name="categoryId" defaultValue={product?.categoryId ?? ""} className={inputClass}>
            <option value="">Ingen kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>SKU</label>
          <input name="sku" defaultValue={product?.sku ?? ""} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Bild-URL</label>
        <input name="imageUrl" type="url" defaultValue={product?.imageUrl ?? ""} className={inputClass} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>SEO-titel</label>
          <input name="seoTitle" defaultValue={product?.seoTitle ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>SEO-beskrivning</label>
          <input name="seoDescription" defaultValue={product?.seoDescription ?? ""} className={inputClass} />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={product?.isActive ?? true}
            className="h-4 w-4 rounded text-green-600"
          />
          <span className="text-sm font-medium text-gray-700">Aktiv</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={product?.isFeatured ?? false}
            className="h-4 w-4 rounded text-green-600"
          />
          <span className="text-sm font-medium text-gray-700">Utvald produkt</span>
        </label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-60 transition-colors"
        >
          {pending ? "Sparar..." : product ? "Spara ändringar" : "Skapa produkt"}
        </button>
        <a href="/admin/butik/produkter" className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
          Avbryt
        </a>
      </div>
    </form>
  );
}
