/**
 * Category-specific FAQ and Product Details (specs) for the product page.
 * Used to show relevant FAQs and specifications per category (towels, shampoo, etc.).
 */

export type FaqItem = { question: string; answer: string };
export type SpecItem = { label: string; value: string };

/** Category key: derived from product categories (e.g. towel, shampoo, conditioner, body-wash, soap). */
export type CategoryKey = "towel" | "shampoo" | "conditioner" | "body-wash" | "soap" | "default";

/** Resolve category key from category slugs (e.g. from product.productCategories). */
export function getCategoryKey(categorySlugs: string[]): CategoryKey {
  const lower = categorySlugs.map((s) => s.toLowerCase());
  if (lower.some((s) => s.includes("towel"))) return "towel";
  if (lower.some((s) => s.includes("shampoo"))) return "shampoo";
  if (lower.some((s) => s.includes("conditioner"))) return "conditioner";
  if (lower.some((s) => s.includes("body-wash") || s.includes("body wash"))) return "body-wash";
  if (lower.some((s) => s.includes("soap"))) return "soap";
  return "default";
}

const FAQ_BY_CATEGORY: Record<CategoryKey, FaqItem[]> = {
  towel: [
    { question: "What material are these towels made of?", answer: "Our towels are made from high-quality cotton or cotton blends for softness and absorbency. Specific composition is listed in the product description." },
    { question: "How should I care for my towel?", answer: "Machine wash in warm water with like colors. Tumble dry low or hang dry. Avoid bleach to preserve color and softness." },
    { question: "What sizes do you offer?", answer: "We offer bath towels, hand towels, and face towels. Dimensions are listed in the product specifications." },
    { question: "Are these towels suitable for sensitive skin?", answer: "Yes. Our towels are gentle and suitable for daily use. We recommend washing before first use." },
    { question: "What is your return policy for towels?", answer: "No return once bought. No return is available." },
  ],
  shampoo: [
    { question: "What hair types is this shampoo suitable for?", answer: "This shampoo is formulated to suit a range of hair types." },
    { question: "How often should I use this shampoo?", answer: "Most of our shampoos are safe for daily use. For best results, follow the usage instructions on the bottle." },
    { question: "Does it work with color-treated hair?", answer: "Yes ! Many of our shampoos are gentle enough for color-treated hair." },
    { question: "What is your return policy?", answer: "No return once bought. No return is available." },
  ],
  conditioner: [
    { question: "What hair types is this conditioner for?", answer: "This conditioner is designed to work with any variety of hair types." },
    { question: "How do I use it for best results?", answer: "Apply after shampooing to damp hair, focus on mid-lengths to ends, leave on for 1–2 minutes, then rinse thoroughly." },
    { question: "Can I use it with the matching shampoo?", answer: "Yes. Using the same line of shampoo and conditioner often gives the best results and consistent scent." },
    { question: "Is it suitable for fine or oily hair?", answer: "Yes ! Many of our conditioners are lightweight and won’t weigh hair down." },
    { question: "What is your return policy?", answer: "No return once bought. No return is available." },
  ],
  "body-wash": [
    { question: "What skin types is this body wash suitable for?", answer: "Our body washes are formulated to be gentle for most skin types. Check the product description for sensitive or dry skin options." },
    { question: "How do I use it?", answer: "Apply to wet skin with a loofah or hands, lather, then rinse. Avoid contact with eyes." },
    { question: "Is it soap-free or moisturizing?", answer: "Formula details (e.g. soap-free, moisturizing) are listed in the product description and specifications." },
    { question: "Does the scent last after showering?", answer: "Scent is designed to be noticeable in the shower and may leave a light fragrance on skin. Strength varies by variant." },
    { question: "What is your return policy?", answer: "No return once bought. No return is available." },
  ],
  soap: [
    { question: "What is this soap made of?", answer: "Our bar soaps are made with quality ingredients for cleansing and mildness. Exact ingredients and claims are in the product description." },
    { question: "How should I store the soap?", answer: "Keep the bar in a dry soap holder between uses so it lasts longer." },
    { question: "Is it suitable for face and body?", answer: "Yes ! Many of our soaps are gentle enough for face and body." },
    { question: "How long does one bar typically last?", answer: "Usage varies by person. With normal use, a single bar often lasts several weeks." },
    { question: "What is your return policy?", answer: "No return once bought. No return is available." },
  ],
  default: [
    { question: "What are the main features of this product?", answer: "Key features and benefits are described in the product description and specifications above." },
    { question: "How should I use or care for this product?", answer: "Follow the usage and care instructions on the product packaging or in the product description." },
    { question: "What is your shipping and delivery policy?", answer: "We offer standard and express shipping. Delivery times and costs are shown at checkout." },
    { question: "What is your return policy?", answer: "No return once bought. No return is available." },
  ],
};

const SPECS_BY_CATEGORY: Record<CategoryKey, SpecItem[]> = {
  towel: [
    { label: "Material", value: "Cotton or cotton blend" },
    { label: "Care", value: "Machine wash warm, tumble dry low" },
    { label: "Weight", value: "See product description" },
    { label: "Size", value: "See product dimensions" },
  ],
  shampoo: [
    { label: "Volume", value: "See bottle size" },
    { label: "Hair type", value: "See product description" },
    { label: "Key benefits", value: "Cleansing, care as described" },
    { label: "Usage", value: "Apply to wet hair, lather, rinse" },
  ],
  conditioner: [
    { label: "Volume", value: "See bottle size" },
    { label: "Hair type", value: "See product description" },
    { label: "Key benefits", value: "Conditioning, detangling" },
    { label: "Usage", value: "After shampoo, apply to lengths, rinse" },
  ],
  "body-wash": [
    { label: "Volume", value: "See bottle size" },
    { label: "Skin type", value: "See product description" },
    { label: "Scent", value: "As per variant" },
    { label: "Usage", value: "Apply to wet skin, lather, rinse" },
  ],
  soap: [
    { label: "Weight", value: "See bar weight" },
    { label: "Skin type", value: "See product description" },
    { label: "Scent", value: "As per variant" },
    { label: "Usage", value: "Apply to wet skin, lather, rinse" },
  ],
  default: [
    { label: "Details", value: "See product description" },
    { label: "Care / usage", value: "Follow packaging instructions" },
    { label: "Shipping", value: "See checkout for options" },
  ],
};

export function getFaqsForCategory(categoryKey: CategoryKey): FaqItem[] {
  return FAQ_BY_CATEGORY[categoryKey] ?? FAQ_BY_CATEGORY.default;
}

export function getSpecsForCategory(categoryKey: CategoryKey): SpecItem[] {
  return SPECS_BY_CATEGORY[categoryKey] ?? SPECS_BY_CATEGORY.default;
}
