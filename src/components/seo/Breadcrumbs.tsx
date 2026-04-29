import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { JsonLd } from "./JsonLd";
import { breadcrumbSchema } from "@/lib/seo";

export interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  seoCanonical?: string;
  className?: string;
}

export function Breadcrumbs({ items, seoCanonical = "https://minodling.se", className }: BreadcrumbsProps) {
  const all = [{ name: "Hem", href: "/" }, ...items];

  return (
    <>
      <JsonLd data={breadcrumbSchema(all.map((i) => ({ name: i.name, url: i.href })), seoCanonical)} />
      <nav
        aria-label="Brödsmulor"
        className={`flex items-center gap-1 text-sm text-gray-500 flex-wrap ${className ?? ""}`}
      >
        {all.map((item, i) => {
          const isLast = i === all.length - 1;
          return (
            <span key={item.href} className="flex items-center gap-1">
              {i === 0 && <Home className="h-3.5 w-3.5 shrink-0" />}
              {isLast ? (
                <span className="text-gray-700 font-medium" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-green-700 transition-colors">
                  {item.name}
                </Link>
              )}
              {!isLast && <ChevronRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />}
            </span>
          );
        })}
      </nav>
    </>
  );
}
