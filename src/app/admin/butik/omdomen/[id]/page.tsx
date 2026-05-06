export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/shop/StarRating";
import { formatDate } from "@/lib/utils";
import { ReviewActions } from "./ReviewActions";

export const metadata: Metadata = { title: "Omdöme | Butik | Admin" };

const statusVariant: Record<string, "success" | "warning" | "danger" | "default"> = {
  approved: "success",
  pending:  "warning",
  rejected: "danger",
  hidden:   "default",
};

const statusLabel: Record<string, string> = {
  approved: "Godkänd",
  pending:  "Väntar",
  rejected: "Nekad",
  hidden:   "Dold",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOmdomeDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const review = await prisma.shopProductReview.findUnique({
    where: { id },
    include: {
      product: { select: { id: true, name: true, slug: true } },
      user:    { select: { username: true, fullName: true, email: true } },
    },
  }).catch(() => null);

  if (!review) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">Omdöme</h1>
            <Badge variant={statusVariant[review.status] ?? "default"}>
              {statusLabel[review.status] ?? review.status}
            </Badge>
          </div>
          <p className="text-gray-500 text-sm mt-1">{formatDate(review.createdAt)}</p>
        </div>
        <Link href="/admin/butik/omdomen" className="text-sm text-gray-500 hover:text-gray-700">
          ← Tillbaka till omdömen
        </Link>
      </div>

      {/* Produkt + Användare */}
      <Card padding="md">
        <h2 className="font-semibold text-gray-900 mb-4">Information</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400 text-xs mb-1">Produkt</p>
            <Link
              href={`/butik/produkt/${review.product.slug}`}
              target="_blank"
              className="font-medium text-green-700 hover:underline flex items-center gap-1"
            >
              {review.product.name}
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Användare</p>
            <p className="font-medium text-gray-900">
              {review.user?.fullName ?? review.user?.username ?? "Anonym"}
            </p>
            {review.user?.email && (
              <p className="text-gray-500 text-xs">{review.user.email}</p>
            )}
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Betyg</p>
            <div className="flex items-center gap-2">
              <StarRating rating={review.rating} size="sm" />
              <span className="text-sm font-medium text-gray-700">{review.rating}/5</span>
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Verifierat köp</p>
            <p className="font-medium text-gray-900">
              {review.isVerifiedPurchase ? "Ja" : "Nej"}
            </p>
          </div>
        </div>
      </Card>

      {/* Omdömesinnehåll */}
      <Card padding="md">
        <h2 className="font-semibold text-gray-900 mb-4">Innehåll</h2>
        <div className="space-y-3">
          {review.title && (
            <div>
              <p className="text-gray-400 text-xs mb-1">Rubrik</p>
              <p className="font-semibold text-gray-900">{review.title}</p>
            </div>
          )}
          {review.content && (
            <div>
              <p className="text-gray-400 text-xs mb-1">Omdöme</p>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{review.content}</p>
            </div>
          )}
          {!review.title && !review.content && (
            <p className="text-gray-400 text-sm italic">Inget innehåll (bara betyg)</p>
          )}
        </div>

        {/* Images */}
        {review.imageUrls.length > 0 && (
          <div className="mt-4">
            <p className="text-gray-400 text-xs mb-2">Bilder ({review.imageUrls.length})</p>
            <div className="flex flex-wrap gap-2">
              {review.imageUrls.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative h-20 w-20 rounded-xl overflow-hidden border border-sage-100 hover:opacity-80 transition-opacity shrink-0"
                >
                  <Image
                    src={url}
                    alt={`Bild ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Admin reply preview */}
      {review.adminReply && (
        <Card padding="md" variant="green">
          <h2 className="font-semibold text-green-800 mb-2">Nuvarande svar från butiken</h2>
          <p className="text-sm text-green-800 leading-relaxed whitespace-pre-wrap">
            {review.adminReply}
          </p>
          {review.adminRepliedAt && (
            <p className="text-xs text-green-600 mt-2">{formatDate(review.adminRepliedAt)}</p>
          )}
        </Card>
      )}

      {/* Actions */}
      <Card padding="md">
        <h2 className="font-semibold text-gray-900 mb-4">Åtgärder</h2>
        <ReviewActions
          reviewId={review.id}
          currentStatus={review.status}
          currentReply={review.adminReply}
        />
      </Card>

      {/* Technical info */}
      <Card padding="md">
        <h2 className="font-semibold text-gray-900 mb-3 text-sm">Teknisk information</h2>
        <div className="space-y-1 text-xs text-gray-500 font-mono">
          <div className="flex gap-3">
            <span className="text-gray-400 w-24 shrink-0">Review ID</span>
            <span className="text-gray-700 break-all">{review.id}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-gray-400 w-24 shrink-0">Product ID</span>
            <span className="text-gray-700 break-all">{review.productId}</span>
          </div>
          {review.userId && (
            <div className="flex gap-3">
              <span className="text-gray-400 w-24 shrink-0">User ID</span>
              <span className="text-gray-700 break-all">{review.userId}</span>
            </div>
          )}
          <div className="flex gap-3">
            <span className="text-gray-400 w-24 shrink-0">Skapad</span>
            <span className="text-gray-700">{review.createdAt.toISOString()}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-gray-400 w-24 shrink-0">Uppdaterad</span>
            <span className="text-gray-700">{review.updatedAt.toISOString()}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
