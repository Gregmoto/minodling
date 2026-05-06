import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string | null;
  content?: string | null;
  imageUrl?: string | null;
  buttonText?: string | null;
  buttonUrl?: string | null;
  reverse?: boolean;
}

export function CampaignBanner({
  title,
  subtitle,
  content,
  imageUrl,
  buttonText,
  buttonUrl,
  reverse = false,
}: Props) {
  return (
    <section className="py-8">
      <div className="container-main">
        <div
          className={`flex flex-col ${
            reverse ? "md:flex-row-reverse" : "md:flex-row"
          } gap-0 rounded-2xl overflow-hidden bg-sage-50 border border-sage-100 min-h-[380px] md:min-h-[420px]`}
        >
          {/* Image side */}
          <div className="relative w-full md:w-1/2 h-56 md:h-auto min-h-[220px]">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-sage-200 to-sage-300" />
            )}
          </div>

          {/* Text side */}
          <div className="flex flex-col justify-center w-full md:w-1/2 px-8 py-10 md:px-12">
            {subtitle && (
              <p className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-3">
                {subtitle}
              </p>
            )}
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
              {title}
            </h2>
            {content && (
              <p className="text-gray-600 leading-relaxed mb-6 max-w-md">{content}</p>
            )}
            {buttonText && buttonUrl && (
              <div>
                <Link
                  href={buttonUrl}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors text-sm"
                >
                  {buttonText}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
