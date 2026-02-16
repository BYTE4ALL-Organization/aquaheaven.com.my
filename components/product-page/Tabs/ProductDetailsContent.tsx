"use client";

import React from "react";
import ProductDetails from "./ProductDetails";

type ProductDetailsContentProps = {
  categorySlugs?: string[];
};

const ProductDetailsContent = ({ categorySlugs = [] }: ProductDetailsContentProps) => {
  return (
    <section>
      <h3 className="text-xl sm:text-2xl font-bold text-black mb-5 sm:mb-6">
        Product specifications
      </h3>
      <ProductDetails categorySlugs={categorySlugs} />
    </section>
  );
};

export default ProductDetailsContent;
