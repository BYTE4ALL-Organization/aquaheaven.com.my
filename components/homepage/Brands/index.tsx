"use client";

import Image from "next/image";
import React, { useState } from "react";

const brandsData: { id: string; srcUrl: string }[] = [
  { id: "Kiwi", srcUrl: "/products/brands/kiwi-svg.svg" },
  { id: "Le Petit Marseillais", srcUrl: "/products/brands/le-petit-marseillais.svg" },
  { id: "Garnier", srcUrl: "/products/brands/garnier.svg" },
  { id: "Mixa Bebe", srcUrl: "/products/brands/mixa-bebe.svg" },
  { id: "Dop", srcUrl: "/products/brands/dop.svg" },
  { id: "Diadermine", srcUrl: "/products/brands/diadermine.svg" },
  { id: "LABELL", srcUrl: "/products/brands/labell.svg" },
  { id: "Pomette", srcUrl: "/products/brands/pomette.svg" },
];

const Brands = () => {
  const [tappedName, setTappedName] = useState<string | null>(null);

  const handleTap = (name: string) => {
    setTappedName(name);
    setTimeout(() => setTappedName(null), 1500);
  };

  return (
    <div className="bg-black relative">
      {tappedName && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-white/95 text-black text-sm font-medium px-3 py-1.5 rounded-full shadow-lg">
          {tappedName}
        </div>
      )}
      <div className="max-w-frame mx-auto flex flex-wrap items-center justify-center md:justify-between gap-3 md:gap-4 py-8 md:py-10 sm:px-4 xl:px-0">
        {brandsData.map((brand) => (
          <button
            key={brand.id}
            type="button"
            title={brand.id}
            onClick={() => handleTap(brand.id)}
            className="rounded-lg flex items-center justify-center w-[100px] h-[40px] sm:w-[120px] sm:h-[48px] md:w-[140px] md:h-[56px] lg:w-[160px] lg:h-[64px] p-2 shrink-0 bg-white border border-white/50 hover:border-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <Image
              priority
              src={brand.srcUrl}
              width={160}
              height={64}
              alt={brand.id}
              className="max-w-full max-h-full w-auto h-auto object-contain pointer-events-none"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Brands;
