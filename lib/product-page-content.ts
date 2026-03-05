/**
 * Category-specific FAQ and Product Details (specs) for the product page.
 * Used to show relevant FAQs and specifications per category (towels, shampoo, etc.).
 */

export type FaqItem = { question: string; answer: string };
export type SpecItem = { label: string; value: string };

/** Category key: derived from product categories (e.g. towel, shampoo, conditioner, body-wash, soap). */
export type CategoryKey =
  | "towel"
  | "shampoo"
  | "shampoo-colored"
  | "shampoo-normal"
  | "shampoo-soft"
  | "shampoo-dandruff"
  | "shampoo-kids"
  | "conditioner"
  | "body-wash"
  | "body-soft-skin"
  | "body-kids"
  | "mixa-bebe"
  | "soap"
  | "default";

/** Options for admin dropdown: value is CategoryKey; empty string = Auto (from category). */
export const TEMPLATE_OPTIONS: { value: CategoryKey | ""; label: string }[] = [
  { value: "", label: "Auto (from category)" },
  { value: "towel", label: "Towel" },
  { value: "shampoo", label: "Shampoo" },
  { value: "shampoo-colored", label: "Shampoo (colored hair)" },
  { value: "shampoo-normal", label: "Shampoo (normal hair)" },
  { value: "shampoo-soft", label: "Shampoo (soft & gentle)" },
  { value: "shampoo-dandruff", label: "Shampoo (dandruff care)" },
  { value: "shampoo-kids", label: "Shampoo (kids)" },
  { value: "conditioner", label: "Conditioner" },
  { value: "body-wash", label: "Body wash" },
  { value: "body-soft-skin", label: "Body wash – Body Soft Skin" },
  { value: "body-kids", label: "Body wash – Kids" },
  { value: "mixa-bebe", label: "Mixa Bebe (2-in-1 body & shampoo)" },
  { value: "soap", label: "Soap" },
  { value: "default", label: "Default" },
];

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
  "shampoo-soft": [
    { question: "What hair types is this shampoo suitable for?", answer: "This soft shampoo is formulated to be very gentle, suitable for everyday use on normal to sensitive hair and scalp." },
    { question: "Is this shampoo gentle on the scalp?", answer: "Yes. It is designed to cleanse softly while respecting the scalp and hair, helping to avoid a tight or dry feeling after washing." },
    { question: "How often can I use this shampoo?", answer: "You can use it daily or as often as your hair needs washing, thanks to its soft and mild formula." },
    { question: "What is your return policy?", answer: "No return once bought. No return is available." },
  ],
  "shampoo-normal": [
    { question: "What hair types is this shampoo suitable for?", answer: "This normal shampoo is formulated for everyday cleansing of normal hair, leaving it clean and comfortable without dryness." },
    { question: "How often should I use this shampoo?", answer: "It is gentle enough for daily use. Adjust frequency based on how often your hair needs washing." },
    { question: "Does it work with color-treated hair?", answer: "Yes. It is mild and suitable for most hair types, including many color-treated hair types. Always check the full product description for any specific notes." },
    { question: "What is your return policy?", answer: "No return once bought. No return is available." },
  ],
  "shampoo-dandruff": [
    { question: "Is this shampoo suitable for dandruff or flaky scalp?", answer: "Yes. This anti-dandruff shampoo is formulated to help reduce visible flakes and ease scalp discomfort with regular use." },
    { question: "How often should I use this shampoo?", answer: "Use 2–3 times per week or as needed. For best results, massage into the scalp, leave on for a short time, then rinse thoroughly." },
    { question: "Can I use it on all hair types?", answer: "Yes. It is suitable for most hair types. If you have very sensitive scalp or a medical condition, consult a healthcare professional before use." },
    { question: "What is your return policy?", answer: "No return once bought. No return is available." },
  ],
  "shampoo-kids": [
    { question: "Who is this shampoo designed for?", answer: "This shampoo is specially created for kids’ delicate hair and scalp. It is gentle, soft, and respects the natural balance of the hair." },
    { question: "Is this shampoo safe for young children?", answer: "Yes. It is gentle enough for young children and can be used for kids under 3 years old. As with any product, avoid contact with eyes and rinse immediately if it occurs." },
    { question: "How should I use this shampoo on kids?", answer: "Wet the child’s hair, apply a small amount of shampoo, gently massage into the scalp, then rinse thoroughly. Repeat if needed." },
    { question: "What is your return policy?", answer: "No return once bought. No return is available." },
  ],
  "shampoo-colored": [
    { question: "What hair types is this shampoo suitable for?", answer: "This shampoo is formulated specifically for color-treated or colored hair. It helps protect and extend the life of your color while keeping hair healthy." },
    { question: "How often should I use this shampoo?", answer: "Most of our shampoos are safe for daily use. For best results, follow the usage instructions on the bottle." },
    { question: "Does it work with color-treated hair?", answer: "Yes. This shampoo is designed for color-treated hair and is gentle enough for regular use." },
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
  "body-soft-skin": [
    { question: "What skin types is this body wash suitable for?", answer: "This Body Soft Skin body wash is especially suitable for sensitive skin, helping to cleanse gently while respecting the skin barrier." },
    { question: "How do I use it?", answer: "Apply to wet skin with a loofah or hands, gently massage to lather, then rinse thoroughly. Avoid contact with eyes." },
    { question: "Is it suitable for kids?", answer: "Yes. This body wash is suitable for the family and can be used for children from 3 years old." },
    { question: "What is your return policy?", answer: "No return once bought. No return is available." },
  ],
  "body-kids": [
    { question: "Who is this body wash designed for?", answer: "This kids body wash is specially created for children’s delicate skin, with a gentle formula that respects the skin barrier." },
    { question: "Is it suitable for young children?", answer: "Yes. It is suitable for kids and can be used from 3 years old. For children under 3, please consult your healthcare professional before use." },
    { question: "How should I use this body wash on kids?", answer: "Apply a small amount to wet skin, gently lather with your hands or a soft washcloth, then rinse thoroughly. Avoid contact with eyes." },
    { question: "What is your return policy?", answer: "No return once bought. No return is available." },
  ],
  "mixa-bebe": [
    { question: "What is this product designed for?", answer: "This 2-in-1 Mixa Bebe wash is made to gently cleanse both hair and body in one step, for babies, kids, and adults with delicate skin." },
    { question: "From what age can it be used?", answer: "It is suitable for daily use on babies and children, and also comfortable for adults with sensitive skin. As with any baby product, avoid direct contact with the eyes and rinse well." },
    { question: "Does it contain soap?", answer: "No. The formula is soap-free and designed to clean hair and skin very delicately without stripping natural moisture." },
    { question: "What happens if it gets in the eyes?", answer: "The formula is developed to be gentle and not make the eyes hurt if some product gets inside. Still, rinse the eyes immediately with plenty of clean water." },
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
  "shampoo-soft": [
    { label: "Volume", value: "See bottle size" },
    { label: "Hair type", value: "Normal to sensitive hair and scalp" },
    { label: "Key benefits", value: "Soft, gentle cleansing that respects the scalp and helps keep hair comfortable and smooth" },
    { label: "Usage", value: "Apply to wet hair, massage gently into scalp and hair, then rinse thoroughly" },
  ],
  "shampoo-normal": [
    { label: "Volume", value: "See bottle size" },
    { label: "Hair type", value: "Normal hair" },
    { label: "Key benefits", value: "Daily cleansing for normal hair, helps keep hair fresh without over-drying" },
    { label: "Usage", value: "Apply to wet hair, gently massage into scalp and hair, then rinse thoroughly" },
  ],
  "shampoo-dandruff": [
    { label: "Volume", value: "See bottle size" },
    { label: "Hair type", value: "Most hair types, especially those with dandruff-prone scalp" },
    { label: "Key benefits", value: "Helps reduce visible dandruff flakes and relieve scalp discomfort with regular use" },
    { label: "Usage", value: "Apply to wet hair, massage into scalp, leave for a short time, then rinse well" },
  ],
  "shampoo-kids": [
    { label: "Volume", value: "See bottle size" },
    { label: "Hair type", value: "Kids’ delicate hair and scalp" },
    { label: "Key benefits", value: "Gentle and soft shampoo that respects kids’ hair and scalp, suitable even for kids under 3 years old" },
    { label: "Usage", value: "Apply a small amount to wet hair, gently massage, then rinse carefully" },
  ],
  "shampoo-colored": [
    { label: "Volume", value: "See bottle size" },
    { label: "Hair type", value: "Colored / color-treated hair only" },
    { label: "Key benefits", value: "Color protection, cleansing, care as described" },
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
  "body-soft-skin": [
    { label: "Volume", value: "See bottle size" },
    { label: "Skin type", value: "Sensitive and dry skin, suitable for family use from 3 years old" },
    { label: "Scent", value: "As per Body Soft Skin variant" },
    { label: "Usage", value: "Apply to wet skin, lather gently, then rinse. Ideal for daily use on sensitive and dry skin." },
  ],
  "body-kids": [
    { label: "Volume", value: "See bottle size" },
    { label: "Skin type", value: "Kids’ delicate skin, suitable from 3 years old" },
    { label: "Scent", value: "As per kids body wash variant" },
    { label: "Usage", value: "Apply a small amount to wet skin, lather gently, then rinse. Ideal for daily use on children’s skin." },
  ],
  "mixa-bebe": [
    { label: "Volume", value: "See bottle size" },
    { label: "Skin type", value: "Delicate and sensitive skin for babies, kids, and adults" },
    { label: "Hair type", value: "Fine and delicate hair, suitable for the whole family" },
    { label: "Key benefits", value: "2-in-1 soap-free formula that gently cleans hair and body in one motion, developed not to sting eyes" },
    { label: "Usage", value: "Apply to wet hair and body, lather gently, then rinse thoroughly. Suitable for everyday cleansing." },
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
