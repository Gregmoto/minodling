import { cn } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  fallback?: string;
  className?: string;
}

const sizes = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
  xl: "h-16 w-16 text-xl",
};

const pixelSizes = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64 };

export function Avatar({ src, alt = "", size = "md", fallback, className }: AvatarProps) {
  const initials = fallback
    ? fallback
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full bg-sage-200",
        sizes[size],
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={pixelSizes[size]}
          height={pixelSizes[size]}
          className="object-cover w-full h-full"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-medium text-sage-600">
          {initials}
        </span>
      )}
    </div>
  );
}
