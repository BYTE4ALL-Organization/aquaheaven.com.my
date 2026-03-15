import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type DressStyleCardProps = {
  title: string;
  url: string;
  imageSrc: string;
  imageSizes?: string;
  className?: string;
};

const DressStyleCard = ({
  title,
  url,
  imageSrc,
  imageSizes,
  className,
}: DressStyleCardProps) => {
  return (
    <Link
      href={url}
      className={cn([
        "relative isolate w-full md:h-full rounded-[20px] text-2xl md:text-4xl font-bold text-left py-4 md:py-[25px] px-6 md:px-9 text-white hover:shadow-lg transition-shadow overflow-hidden",
        className,
      ])}
    >
      <Image
        src={imageSrc}
        alt={title}
        fill
        quality={70}
        sizes={
          imageSizes ??
          "(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 684px"
        }
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/35" />
      <span className="relative z-10 [text-shadow:_-1px_-1px_0_rgb(0,0,0),_1px_-1px_0_rgb(0,0,0),_-1px_1px_0_rgb(0,0,0),_1px_1px_0_rgb(0,0,0),_2px_2px_4px_rgba(0,0,0,0.9)]">
        {title}
      </span>
    </Link>
  );
};

export default DressStyleCard;
