import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

type DressStyleCardProps = {
  title: string;
  url: string;
  className?: string;
};

const DressStyleCard = ({ title, url, className }: DressStyleCardProps) => {
  return (
    <Link
      href={url}
      className={cn([
        "w-full md:h-full rounded-[20px] bg-white bg-top text-2xl md:text-4xl font-bold text-left py-4 md:py-[25px] px-6 md:px-9 bg-no-repeat bg-cover text-white hover:shadow-lg transition-shadow",
        "[text-shadow:_-1px_-1px_0_rgb(0,0,0),_1px_-1px_0_rgb(0,0,0),_-1px_1px_0_rgb(0,0,0),_1px_1px_0_rgb(0,0,0),_2px_2px_4px_rgba(0,0,0,0.9)]",
        className,
      ])}
    >
      {title}
    </Link>
  );
};

export default DressStyleCard;
