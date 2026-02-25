import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

type BreadcrumbShopProps = {
  /** Display name of the current category (e.g. "Body Wash") when filtering by category */
  categoryName?: string;
  /** When true, show "Best Sellers" as the current segment */
  bestSellers?: boolean;
  /** When true, show "Brands" as the current segment */
  viewBrands?: boolean;
};

const BreadcrumbShop = ({ categoryName, bestSellers, viewBrands }: BreadcrumbShopProps) => {
  const currentSegment = viewBrands ? "Brands" : bestSellers ? "Best Sellers" : categoryName;

  return (
    <Breadcrumb className="mb-5 sm:mb-9">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          {currentSegment ? (
            <BreadcrumbLink asChild>
              <Link href="/shop">Shop</Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage>Shop</BreadcrumbPage>
          )}
        </BreadcrumbItem>
        {currentSegment && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentSegment}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadcrumbShop;
