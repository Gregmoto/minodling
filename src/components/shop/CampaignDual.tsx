import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface DualCard {
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  buttonText?: string | null;
  buttonUrl?: string | null;
}

interface Props {
  cards: DualCard[];
}

export function CampaignDual({ cards }: Props) {
  if (cards.length === 0) return null;

  return (
    <section className="py-8">
      <div className="container-main">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map((card, i) => (
            <div
              key={i}
              className="relative rounded-2xl overflow-hidden h-64 sm:h-72 group"
            >
              {/* Background image */}
              {card.imageUrl ? (
                <Image
                  src={card.imageUrl}
                  alt={card.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-sage-300 to-sage-500" />
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                {card.subtitle && (
                  <p className="text-white/75 text-xs font-medium uppercase tracking-wider mb-1">
                    {card.subtitle}
                  </p>
                )}
                <h3 className="text-white font-bold text-lg leading-tight mb-3">
                  {card.title}
                </h3>
                {card.buttonText && card.buttonUrl && (
                  <Link
                    href={card.buttonUrl}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-400 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    {card.buttonText}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
